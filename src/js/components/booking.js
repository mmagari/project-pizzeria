import {select, templates, settings, classNames} from '../settings.js';
import AmountWidget from './amountwidget.js';
import HourPicker from './HourPicker.js';
import DatePicker from './DatePicker.js';
import utils from '../utils.js';

class Booking {
  constructor(element) {
    const thisBooking = this;
    thisBooking.render(element);
    thisBooking.initWidgets();
    thisBooking.getData();
    thisBooking.initTables();
  }

  getData(){
    const thisBooking = this;
    const startDateParam = settings.db.dateStartParamKey + '=' + utils.dateToStr(thisBooking.dom.datePicker.minDate);
    const endDateParam = settings.db.dateEndParamKey + '=' + utils.dateToStr(thisBooking.dom.datePicker.maxDate);
    const params = {
      booking: [
        startDateParam,
        endDateParam,
      ],
      eventsCurrent: [
        settings.db.notRepeatParam,
        startDateParam,
        endDateParam,
      ],
      eventsRepeat: [
        settings.db.repeatParam,
        endDateParam,
      ],
    };
    //console.log('getData params: ', params);
    const urls = {
      booking:       settings.db.url + '/' + settings.db.bookings
                                     + '?' + params.booking.join('&'),
      eventsCurrent: settings.db.url + '/' + settings.db.events 
                                     + '?' + params.eventsCurrent.join('&'),
      eventsRepeat:  settings.db.url + '/' + settings.db.events
                                     + '?' + params.eventsRepeat.join('&'),
    };
    //console.log(urls);
    Promise.all([
      fetch(urls.booking),
      fetch(urls.eventsCurrent),
      fetch(urls.eventsRepeat),
    ])
    .then(function(allResponses){
      const bookingsResponse = allResponses[0];
      const eventsCurrentResponse = allResponses[1];
      const eventsRepeatResponse = allResponses[2];
      return Promise.all([
        bookingsResponse.json(),
        eventsCurrentResponse.json(),
        eventsRepeatResponse.json(),
      ]);
    })
    .then(function([bookings, eventsCurrent, eventsRepeat]){
      //console.log(bookings);
      //console.log(eventsCurrent);
      //console.log(eventsRepeat);
      thisBooking.parseData(bookings, eventsCurrent, eventsRepeat);
    })
    .catch(function (error) {
      console.error('Error:', error);
    });
  }

  parseData(bookings, eventsCurrent, eventsRepeat){
    const thisBooking = this;
    thisBooking.booked = {};

    for(let item of bookings){
      thisBooking.makeBooked(item.date, item.hour, item.duration, item.table);
    }

    for(let item of eventsCurrent){
       thisBooking.makeBooked(item.date, item.hour, item.duration, item.table);
    }

    const minDate = thisBooking.dom.datePicker.minDate;
    const maxDate = thisBooking.dom.datePicker.maxDate;

    for(let item of eventsRepeat){
      if(item.repeat == 'daily'){
        for(let loopDate = minDate; loopDate <= maxDate; loopDate = utils.addDays(loopDate, 1))
      thisBooking.makeBooked(utils.dateToStr(loopDate), item.hour, item.duration, item.table);
      }
    }
    //console.log('this Booked: ', thisBooking.booked);
    thisBooking.updateDom();
  }

  updateDom(){
    const thisBooking = this;

    thisBooking.date = thisBooking.dom.datePicker.value;
    thisBooking.hour = utils.hourToNumber(thisBooking.dom.hourPicker.value);

    let allAvailable = false;

    if(
        typeof thisBooking.booked[thisBooking.date] == 'undefined'
        ||
        typeof thisBooking.booked[thisBooking.date][thisBooking.hour] == 'undefined'
      ){
        allAvailable = true;
      }
      for(let table of thisBooking.dom.tables){
        //console.log(': ', thisBooking.dom.tables);
        let tableId = table.getAttribute(settings.booking.tableIdAttribute);
        if(!isNaN(tableId)){
          tableId = parseInt(tableId);
        }
        if(
          !allAvailable
          &&
          thisBooking.booked[thisBooking.date][thisBooking.hour].includes(tableId) > 0
        ){
          table.classList.add(classNames.booking.tableBooked);
          //console.log('this Booked: ', thisBooking.booked);
        } else {
          table.classList.remove(classNames.booking.tableBooked);
        }
      }
  }

  makeBooked(date, hour, duration, table){
    const thisBooking = this;
    
    if(typeof thisBooking.booked[date] == 'undefined'){
      thisBooking.booked[date] = {};
    }

    const startHour = utils.hourToNumber(hour);

    for(let hourBlock = startHour; hourBlock < startHour + duration; hourBlock+= 0.5){
      if (typeof thisBooking.booked[date][hourBlock] == 'undefined'){
        thisBooking.booked[date][hourBlock] = [];
      }
      
      thisBooking.booked[date][hourBlock].push(table);
    }
  }
  reserveTable(table) {
    const thisBooking = this;
    //console.log(table);

    if (table.classList.contains(classNames.booking.tableClicked)) {
      table.classList.remove(classNames.booking.tableClicked);
      thisBooking.selectedTable = null;
    } else {
      const clickedTables = thisBooking.dom.wrapper.querySelectorAll(
        select.booking.tables + ('.clicked')
      );
      for (let clickedTable of clickedTables) {
        clickedTable.classList.remove(classNames.booking.tableClicked);
      }
      if (!table.classList.contains(classNames.booking.tableBooked)) {
      table.classList.add(classNames.booking.tableClicked);
      thisBooking.selectedTable = table.getAttribute('data-table');
      }else {
        window.alert('This table is already booked and unavailable for reservation.');
      }
    }
  }

  render(element) {
    const thisBooking = this;
    thisBooking.dom = {};
    thisBooking.dom.wrapper = element;
    thisBooking.dom.peopleAmount = thisBooking.dom.wrapper.querySelector(select.booking.peopleAmount);
    thisBooking.dom.hoursAmount = thisBooking.dom.wrapper.querySelector(select.booking.hoursAmount);
    thisBooking.dom.datePicker = thisBooking.dom.wrapper.querySelector(select.widgets.datePicker.wrapper);
    thisBooking.dom.hourPicker = thisBooking.dom.wrapper.querySelector(select.widgets.hourPicker.wrapper);
    /* generate HTML based on template */
    const generatedHTML = templates.bookingWidget();
    /* add HTML using utils.createElementFromHTML */
    thisBooking.dom.wrapper = utils.createDOMFromHTML(generatedHTML);
    /* find booking container */
    const bookingContainer = document.querySelector(select.containerOf.booking);
    /* add element to container */
    bookingContainer.appendChild(thisBooking.dom.wrapper);
    thisBooking.dom.tables = thisBooking.dom.wrapper.querySelectorAll(select.booking.tables);
    thisBooking.dom.form = thisBooking.dom.wrapper.querySelector(select.booking.form);
    thisBooking.dom.phone = thisBooking.dom.form.querySelector(select.booking.phone);
    thisBooking.dom.address = thisBooking.dom.form.querySelector(select.booking.address);
  }

  initTables() {
    const thisBooking = this;
    const tables = thisBooking.dom.wrapper;
  
    tables.addEventListener('click', function (event) {
      const clickedElement = event.target.closest(select.booking.tables);
  
      if (clickedElement) {
        thisBooking.reserveTable(clickedElement);
      }
    });
  }

  resetTableSettings() {
    const thisBooking = this;
  
    const clickedTables = thisBooking.dom.wrapper.querySelectorAll(select.booking.tables + '.clicked');
    clickedTables.forEach(function (table) {
      table.classList.remove(classNames.booking.tableClicked);
    });
  }

  initWidgets() {
    const thisBooking = this;
    // create widgets for reservations

    const amountPeopleElement = thisBooking.dom.wrapper.querySelector(select.booking.peopleAmount);
    thisBooking.dom.peopleAmount = new AmountWidget(amountPeopleElement);
    amountPeopleElement.addEventListener('updated', function (event) {
      event.preventDefault();
    });

    const amountHoursElement = thisBooking.dom.wrapper.querySelector(select.booking.hoursAmount);
    thisBooking.dom.hoursAmount = new AmountWidget(amountHoursElement);
    amountHoursElement.addEventListener('updated', function (event) {
      event.preventDefault();
      thisBooking.resetTableSettings();
    });

    const datePickerElement = thisBooking.dom.wrapper.querySelector(select.widgets.datePicker.wrapper);
    thisBooking.dom.datePicker = new DatePicker(datePickerElement);
    datePickerElement.addEventListener('updated', function (event) {
      event.preventDefault();
      thisBooking.resetTableSettings();
    });

    const hourPickerElement = thisBooking.dom.wrapper.querySelector(select.widgets.hourPicker.wrapper);
    thisBooking.dom.hourPicker = new HourPicker(hourPickerElement);
    hourPickerElement.addEventListener('updated', function (event) {
      event.preventDefault();
      thisBooking.resetTableSettings();
    });
  
    thisBooking.dom.wrapper.addEventListener('updated', function(){
      thisBooking.updateDom();
    });
    
    thisBooking.dom.wrapper.addEventListener('submit', function(event){
      /* Send booking when the form is submitted */
      event.preventDefault();
      thisBooking.sendBooking();
    });

  }

  sendBooking() {
    const thisBooking = this;
    if (typeof thisBooking.selectedTable === 'undefined') {
      window.alert('Please choose a table.');
    } else {


      const waterCheckbox = thisBooking.dom.wrapper.querySelector(select.booking.starters.water);
      const breadCheckbox = thisBooking.dom.wrapper.querySelector(select.booking.starters.bread);
      const url = settings.db.url + '/' + settings.db.bookings;
      // Create a new object with selected order data
      const bookload = {
        date: thisBooking.dom.datePicker.value,
        hour: thisBooking.dom.hourPicker.value, 
        table: thisBooking.selectedTable,
        duration: thisBooking.dom.hoursAmount.value,
        ppl: thisBooking.dom.peopleAmount.value,
        starters: [],
        phone: thisBooking.dom.phone.value,
        address: thisBooking.dom.address.value,
      };
      // Check if bread checkbox is checked
      if (waterCheckbox.checked) {
        bookload.starters.push('water');
      }
      if (breadCheckbox.checked) {
        bookload.starters.push('bread');
      }
      //console.log(bookload);
      const options = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(bookload),
      };
      
      fetch(url, options)
      .then(function () {
        thisBooking.makeBooked(bookload.date, bookload.hour, parseFloat(bookload.duration), parseInt(bookload.table));
        // End of sending order
        console.log('Booking sent');
        window.alert('Table is booked. Thank You for your reservation.');
        thisBooking.resetTableSettings();
      })
      .catch(function (error) {
        console.error('Error:', error);
        // checking if there is any error
      });
    }
  }
}

export default Booking;
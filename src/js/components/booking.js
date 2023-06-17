import {select, templates} from '../settings.js';
import AmountWidget from './amountwidget.js';
import utils from '../utils.js';

class Booking {
  constructor(element) {
    const thisBooking = this;
    thisBooking.render(element);
    thisBooking.initWidgets();
  }

  render(element) {
    const thisBooking = this;
    thisBooking.dom = {};
    thisBooking.dom.wrapper = element;
    thisBooking.dom.peopleAmount = thisBooking.dom.wrapper.querySelector(select.booking.peopleAmount);
    thisBooking.dom.hoursAmount = thisBooking.dom.wrapper.querySelector(select.booking.hoursAmount);
    /* generate HTML based on template */
    const generatedHTML = templates.bookingWidget();
    /* add HTML using utils.createElementFromHTML */
    thisBooking.dom.wrapper = utils.createDOMFromHTML(generatedHTML);
    /* find booking container */
    const bookingContainer = document.querySelector(select.containerOf.booking);
    /* add element to container */
    bookingContainer.appendChild(thisBooking.dom.wrapper);

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
    thisBooking.dom.peopleAmount = new AmountWidget(amountHoursElement);
    amountHoursElement.addEventListener('updated', function (event) {
      event.preventDefault();
    });
  
  }

}

export default Booking;
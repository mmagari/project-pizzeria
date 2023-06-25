import {settings, select} from '../settings.js';
import BaseWidget from './basewidget.js';

class AmountWidget extends BaseWidget {
  constructor(element) {
    super(element, settings.amountWidget.defaultValue);
    const thisWidget = this;
    // Initialize AmountWIdget actions
    thisWidget.getElements(element);
    thisWidget.initActions();
    //console.log('AmountWidget: ', thisWidget);
    //console.log('constructor arguments: ', element);
    thisWidget.value = settings.amountWidget.defaultValue;
  }
  getElements() {
    const thisWidget = this;
    // Find references to specific elements inside the widget element
    thisWidget.dom.input = thisWidget.dom.wrapper.querySelector(select.widgets.amount.input);
    //console.log('value:',thisWidget.dom.input.value);
    thisWidget.dom.linkDecrease = thisWidget.dom.wrapper.querySelector(select.widgets.amount.linkDecrease);
    thisWidget.dom.linkIncrease = thisWidget.dom.wrapper.querySelector(select.widgets.amount.linkIncrease);
  }
  initActions() {
    const thisWidget = this;
    thisWidget.dom.input.addEventListener('change', function (event) {
      event.preventDefault();
      thisWidget.setValue(thisWidget.dom.input.value);
    });
    thisWidget.dom.linkDecrease.addEventListener('click', function (event) {
      event.preventDefault(); 
      const newValue = parseInt(thisWidget.dom.input.value) - 1;
      // Update value when input value change
      thisWidget.setValue(newValue);
    });
    thisWidget.dom.linkIncrease.addEventListener('click', function (event) {
      event.preventDefault();
      const newValue = parseInt(thisWidget.dom.input.value) + 1;
      // Update value when input value change
      thisWidget.setValue(newValue);
    });
  }
  
  isValid(value){
   return !isNaN(value)
   && value >= settings.amountWidget.defaultMin 
   && value <= settings.amountWidget.defaultMax + 1;
  }

  renderValue(){
    const thisWidget = this;
    thisWidget.dom.input.value = thisWidget.value;
  }
}

export default AmountWidget;
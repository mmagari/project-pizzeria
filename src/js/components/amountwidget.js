import {settings, select} from '../settings.js';


class AmountWidget {
  constructor(element) {
    const thisWidget = this;
    thisWidget.value = settings.amountWidget.defaultValue;
    // Initialize AmountWIdget actions
    thisWidget.getElements(element);
    thisWidget.setValue(thisWidget.input.value);
    thisWidget.initActions();
    //console.log('AmountWidget: ', thisWidget);
    //console.log('constructor arguments: ', element);
  }
  getElements(element) {
    const thisWidget = this;
    // Find references to specific elements inside the widget element
    thisWidget.element = element;
    thisWidget.input = thisWidget.element.querySelector(select.widgets.amount.input);
    thisWidget.linkDecrease = thisWidget.element.querySelector(select.widgets.amount.linkDecrease);
    thisWidget.linkIncrease = thisWidget.element.querySelector(select.widgets.amount.linkIncrease);
  }
  initActions() {
    const thisWidget = this;
    thisWidget.input.addEventListener('change', function (event) {
      event.preventDefault();
      thisWidget.setValue(thisWidget.input.value);
    });
    thisWidget.linkDecrease.addEventListener('click', function (event) {
      event.preventDefault(); 
      const newValue = parseInt(thisWidget.input.value) - 1;
      // Update value when input value change
      thisWidget.setValue(newValue);
    });
    thisWidget.linkIncrease.addEventListener('click', function (event) {
      event.preventDefault();
      const newValue = parseInt(thisWidget.input.value) + 1;
      // Update value when input value change
      thisWidget.setValue(newValue);
    });
  }
  setValue(value) {
    const thisWidget = this;

    const newValue = parseInt(value);
    //console.log('nowa wartość', newValue);
    if (thisWidget.value !== newValue && !isNaN(newValue) && newValue >= settings.amountWidget.defaultMin && newValue <= settings.amountWidget.defaultMax + 1) {
      /* TODO: Add validation */
      thisWidget.value = newValue;
      /* Update */
      thisWidget.annouce();
    }
    /* Update the input value */
    thisWidget.input.value = thisWidget.value;
  }
  annouce() {
    const thisWidget = this;

    const event = new CustomEvent('updated', {
      bubbles: true
    });
    thisWidget.element.dispatchEvent(event);
  }
}

export default AmountWidget;
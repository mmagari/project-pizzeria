
class BaseWidget{
  constructor(wrapperElement, initialValue){
    const thisWidget = this;
    thisWidget.dom = {};
    thisWidget.dom.wrapper = wrapperElement;
    thisWidget.correctValue = initialValue;
  }
  get value(){
    const thisWidget = this;
    return thisWidget.correctValue;
  }
  set value(value){
    const thisWidget = this;
    
    const newValue = thisWidget.parseValue(value);
    //console.log('nowa wartość', newValue);
    if (thisWidget.correctValue !== newValue && thisWidget.isValid(newValue)) {
      /* TODO: Add validation */
      thisWidget.correctValue = newValue;
      /* Update */
      thisWidget.annouce();
    }
    /* Update the input value */
    thisWidget.renderValue();
  }
  parseValue(value){
    return parseInt(value);
  }
  isValid(value){
   return !isNaN(value);
  }
  renderValue(){
    const thisWidget = this;
    thisWidget.dom.wrapper.innerHTML = this.value;
  }
  annouce() {
    const thisWidget = this;

    const event = new CustomEvent('updated', {
      bubbles: true
    });
    thisWidget.dom.wrapper.dispatchEvent(event);
  }
  setValue(value){
    const thisWidget = this;
    thisWidget.value = value;
  }
}


export default BaseWidget;
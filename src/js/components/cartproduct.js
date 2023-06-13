import {select} from '../settings.js';
import AmountWidget from './amountwidget.js';


class CartProduct {
  constructor(menuProduct, element) {
    const thisCartProduct = this;
    // Initialize cartproduct actions
    thisCartProduct.getElements(element);
    thisCartProduct.initAmountWidget();
    thisCartProduct.initActions();
    thisCartProduct.id = menuProduct.id;
    thisCartProduct.name = menuProduct.name;
    thisCartProduct.amount = menuProduct.amount;
    thisCartProduct.priceSingle = menuProduct.priceSingle;
    thisCartProduct.price = menuProduct.price;
    thisCartProduct.params = menuProduct.params;

    console.log('new CartProduct!!: ', thisCartProduct);
  }
  getElements(element) {
    const thisCartProduct = this;
    // Find references to specific elements inside the cartproduct element
    thisCartProduct.dom = {};
    thisCartProduct.dom.wrapper = element;
    thisCartProduct.dom.amountWidget = thisCartProduct.dom.wrapper.querySelector(select.cartProduct.amountWidget);
    thisCartProduct.dom.price = thisCartProduct.dom.wrapper.querySelector(select.cartProduct.price);
    thisCartProduct.dom.edit = thisCartProduct.dom.wrapper.querySelector(select.cartProduct.edit);
    thisCartProduct.dom.remove = thisCartProduct.dom.wrapper.querySelector(select.cartProduct.remove);
    //thisCartProduct.dom.amountWidgetElem = thisCartProduct.dom.wrapper.querySelector(select.cartProduct.amountWidget);
  }
  initAmountWidget() {
    const thisCartProduct = this;
    const amountWidgetElement = thisCartProduct.dom.wrapper.querySelector(select.cartProduct.amountWidget);
    /* Create a new instance of the AmountWidget and assign it to the cart product's amountWidget */
    thisCartProduct.amountWidget = new AmountWidget(amountWidgetElement);
    /* Listen for the 'updated' event on the amount widget element */
    amountWidgetElement.addEventListener('updated', function (event) {
      event.preventDefault();
      /* Update the cart product's amount and price based on the new value from the amount widget */
      thisCartProduct.amount = thisCartProduct.amountWidget.value;
      thisCartProduct.price = thisCartProduct.amount * thisCartProduct.priceSingle;
      /* Update the cart product's price */
      thisCartProduct.dom.price.innerHTML = thisCartProduct.price;
    });
  }
  initActions(){
    const thisCartProduct = this;
    thisCartProduct.dom.edit.addEventListener('click', function (event) {
      event.preventDefault();
    });
    /* listen for click event on the remove button */
    thisCartProduct.dom.remove.addEventListener('click', function (event) {
      event.preventDefault();
      /* Remove the cart product from the cart */
      thisCartProduct.remove();
    });
  }
  remove(){
    const thisCartProduct = this;
    const event = new CustomEvent('remove', {
      bubbles: true,
      detail: {
        cartProduct: thisCartProduct,
      },
    })
    thisCartProduct.dom.wrapper.dispatchEvent(event);
  }
  getData(){  
    const thisCartProduct = this;
   /* Return an object containing the relevant data of the cart product */
  return {
    id: thisCartProduct.id,
    amount: thisCartProduct.amount,
    price: thisCartProduct.price,
    priceSingle: thisCartProduct.priceSingle,
    name: thisCartProduct.name,
    params: thisCartProduct.params,
  };
  }
}

export default CartProduct;
import {settings, classNames, templates, select} from '../settings.js';
import CartProduct from './cartproduct.js';
import utils from '../utils.js';

class Cart {
  constructor(element) {
    const thisCart = this;
    thisCart.products = [];
    // Initialize cart actions
    thisCart.getElements(element);
    thisCart.initActions();
    //console.log('new Cart', thisCart);
  }
  getElements(element) {
    const thisCart = this;
    // Find references to specific elements inside the cart element
    thisCart.dom = {};
    thisCart.dom.wrapper = element;
    thisCart.dom.toggleTrigger = thisCart.dom.wrapper.querySelector(select.cart.toggleTrigger);
    thisCart.dom.productList = thisCart.dom.wrapper.querySelector(select.cart.productList);
    thisCart.dom.deliveryFee = thisCart.dom.wrapper.querySelector(select.cart.deliveryFee);
    thisCart.dom.subtotalPrice = thisCart.dom.wrapper.querySelector(select.cart.subtotalPrice);
    thisCart.dom.totalPrice = thisCart.dom.wrapper.querySelectorAll(select.cart.totalPrice);
    thisCart.dom.totalNumber = thisCart.dom.wrapper.querySelector(select.cart.totalNumber);
    thisCart.dom.form = thisCart.dom.wrapper.querySelector(select.cart.form);
    thisCart.dom.phone = thisCart.dom.form.querySelector(select.cart.phone);
    thisCart.dom.address = thisCart.dom.form.querySelector(select.cart.address);
  }
  initActions() {
    const thisCart = this;
    thisCart.dom.toggleTrigger.addEventListener('click', function (event) {
      event.preventDefault();
      /* Toggle active class on the cart wrapper */
      thisCart.dom.wrapper.classList.toggle(classNames.cart.wrapperActive);
    });
    thisCart.dom.productList.addEventListener('updated', function(){
      /* Update cart when product is updated */
      thisCart.update();
    });
    thisCart.dom.productList.addEventListener('remove', function(event){
      /*  Remove product from cart */
      thisCart.remove(event.detail.cartProduct);
    });
    thisCart.dom.form.addEventListener('submit', function(event){
      /* Send order when the form is submitted */
      event.preventDefault();
      thisCart.sendOrder();
    });
  }
  add(menuProduct) {
    const thisCart = this;
    //console.log('adding product1', menuProduct);
    /* generate HTML based on template */
    const generatedHTML = templates.cartProduct(menuProduct);
    /* create element using utils.createElementFromHTML */
    const generatedDOM = utils.createDOMFromHTML(generatedHTML);
    /* add element to menu */
    thisCart.dom.productList.appendChild(generatedDOM);
    thisCart.products.push(new CartProduct(menuProduct, generatedDOM));
    //new CartProduct(menuProduct, thisCart.element);
    thisCart.update();
  }

  update() {
    const thisCart = this;
    const deliveryFee = settings.cart.defaultDeliveryFee;
    thisCart.totalNumber = 0;
    thisCart.subtotalPrice = 0;
    /* Calculate total number and subtotal price based on the products in the cart */
    for (const product of thisCart.products) {
      thisCart.totalNumber += product.amount;
     // console.log('tot ', totalNumber);
      thisCart.subtotalPrice += product.price;
     // console.log('subtot', subtotalPrice);
    }
  
    if (thisCart.totalNumber > 0) {
      thisCart.totalPrice = thisCart.subtotalPrice + deliveryFee;
      thisCart.dom.deliveryFee.textContent = deliveryFee;
    } else {
      thisCart.totalPrice = thisCart.subtotalPrice;
      thisCart.dom.deliveryFee.textContent = 0;
    }
    /* Update the total number, subtotal price, and total price */
    thisCart.dom.totalNumber.textContent = thisCart.totalNumber;
   // console.log('this totN ', thisCart.dom.totalNumber);
    thisCart.dom.subtotalPrice.textContent = thisCart.subtotalPrice;
   // console.log('this SP ', thisCart.dom.subtotalPrice);
    thisCart.dom.totalPrice.forEach(element => {
    element.textContent = thisCart.totalPrice;
    });
    //thisCart.dom.totalPrice.textContent = thisCart.totalPrice;
   // console.log('this totP',thisCart.dom.totalPrice);
    //console.log(deliveryFee);
  }
  remove(cartProduct) {
    const thisCart = this;
    /* Find the index of the cart product in the products array */
    const index = thisCart.products.indexOf(cartProduct);
    /* Remove the cart product from the products array */
    if (index !== -1) {
      thisCart.products.splice(index, 1);
    }
    /* Remove the cart product's from the cart  */
    cartProduct.dom.wrapper.remove();
    /* Update the cart after removing the product */
    thisCart.update();
  }
  sendOrder() {
    const thisCart = this;
    const url = settings.db.url + '/' + settings.db.orders;
    // Create a new object with selected order data
    const payload = {
      address: thisCart.dom.address.value,
      phone: thisCart.dom.phone.value,
      totalPrice: thisCart.totalPrice,
      subtotalPrice: thisCart.subtotalPrice,
      totalNumber: thisCart.totalNumber,
      deliveryFee: thisCart.dom.deliveryFee.textContent,
      products: [],
    };

    //console.log(payload);
    // Send information to the server
    for(let prod of thisCart.products) {
      payload.products.push(prod.getData());
    }
    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    };
    
    fetch(url, options)
    .then(function () {
      // End of sending order
      console.log('Order sent');
    })
    .catch(function (error) {
      console.error('Error:', error);
      // checking if there is any error
    });
  }
}

export default Cart;
/* global Handlebars, utils, dataSource */ // eslint-disable-line no-unused-vars

{
  'use strict';

  const select = {
    templateOf: {
      menuProduct: "#template-menu-product",
      cartProduct: '#template-cart-product',
    },
    containerOf: {
      menu: '#product-list',
      cart: '#cart',
    },
    all: {
      menuProducts: '#product-list > .product',
      menuProductsActive: '#product-list > .product.active',
      formInputs: 'input, select',
    },
    menuProduct: {
      clickable: '.product__header',
      form: '.product__order',
      priceElem: '.product__total-price .price',
      imageWrapper: '.product__images',
      amountWidget: '.widget-amount',
      cartButton: '[href="#add-to-cart"]',
    },
    widgets: {
      amount: {
        input: 'input.amount',
        linkDecrease: 'a[href="#less"]',
        linkIncrease: 'a[href="#more"]',
      },
    },
    cart: {
      productList: '.cart__order-summary',
      toggleTrigger: '.cart__summary',
      totalNumber: `.cart__total-number`,
      totalPrice: '.cart__total-price strong, .cart__order-total .cart__order-price-sum strong',
      subtotalPrice: '.cart__order-subtotal .cart__order-price-sum strong',
      deliveryFee: '.cart__order-delivery .cart__order-price-sum strong',
      form: '.cart__order',
      formSubmit: '.cart__order [type="submit"]',
      phone: '[name="phone"]',
      address: '[name="address"]',
    },
    cartProduct: {
      amountWidget: '.widget-amount',
      price: '.cart__product-price',
      edit: '[href="#edit"]',
      remove: '[href="#remove"]',
    },
  };

  const classNames = {
    menuProduct: {
      wrapperActive: 'active',
      imageVisible: 'active',
    },
    cart: {
      wrapperActive: 'active',
    },
  };

  const settings = {
    amountWidget: {
      defaultValue: 1,
      defaultMin: 1,
      defaultMax: 9,
    },
    cart: {
      defaultDeliveryFee: 20
    },
    db: {
      url: '//localhost:3131',
      products: 'products',
      orders: 'orders',
    },
  };

  const templates = {
    menuProduct: Handlebars.compile(document.querySelector(select.templateOf.menuProduct).innerHTML),
    cartProduct: Handlebars.compile(document.querySelector(select.templateOf.cartProduct).innerHTML),
  };

  class Product {
    constructor(id, data) {
      const thisProduct = this;
      thisProduct.id = id;
      thisProduct.data = data;
      // Initialize product actions
      thisProduct.renderInMenu();
      thisProduct.getElements();
      //console.log('new Product: ', thisProduct);
      thisProduct.initAccordion();
      thisProduct.initOrderForm();
      thisProduct.initAmountWidget();
      thisProduct.processOrder();
    }

    renderInMenu() {
      const thisProduct = this;
      /* generate HTML based on template */
      const generatedHTML = templates.menuProduct(thisProduct.data);
      /* create element using utils.createElementFromHTML */
      thisProduct.element = utils.createDOMFromHTML(generatedHTML);
      /* find menu container */
      const menuContainer = document.querySelector(select.containerOf.menu);
      /* add element to menu */
      menuContainer.appendChild(thisProduct.element);
    }
    getElements() {
      const thisProduct = this;
      // Find references to specific elements inside the product element
      thisProduct.accordionTrigger = thisProduct.element.querySelector(select.menuProduct.clickable);
      thisProduct.form = thisProduct.element.querySelector(select.menuProduct.form);
      thisProduct.formInputs = thisProduct.form.querySelectorAll(select.all.formInputs);
      thisProduct.cartButton = thisProduct.element.querySelector(select.menuProduct.cartButton);
      thisProduct.priceElem = thisProduct.element.querySelector(select.menuProduct.priceElem);
      thisProduct.imageWrapper = thisProduct.element.querySelector(select.menuProduct.imageWrapper);
      thisProduct.amountWidgetElem = thisProduct.element.querySelector(select.menuProduct.amountWidget);
    }

    initAccordion() {
      const thisProduct = this;
      /* find the clickable trigger (the element that should react to clicking) */
      const clickableTrigger = document.querySelectorAll(select.menuProduct.clickable);
      /* START: add event listener to clickable trigger on event click */
      function handleClick(event) {
        /* prevent default action for event */
        event.preventDefault();
        /* find active product (product that has active class) */
        const activeProduct = document.querySelector('article.active');
        /* if there is active product and it's not thisProduct.element, remove class active from it */
        if (activeProduct != null && activeProduct != thisProduct.element) {
          activeProduct.classList.remove(classNames.menuProduct.wrapperActive);
          thisProduct.element.classList.add(classNames.menuProduct.wrapperActive);
          event.stopImmediatePropagation();
        } else {
          /* toggle active class on thisProduct.element */
          thisProduct.element.classList.toggle(classNames.menuProduct.wrapperActive);
          event.stopImmediatePropagation();
        }
      }
      clickableTrigger.forEach(function (element) {
        element.addEventListener('click', handleClick);
      });
    }

    initOrderForm() {
      const thisProduct = this;
      //console.log('initOrderForm:');
      /* Listen for submit event on the form element */
      thisProduct.form.addEventListener('submit', function (event) {
        event.preventDefault();
        thisProduct.processOrder();
      });
      /* Listen for change event on each input product element */
      for (let input of thisProduct.formInputs) {
        input.addEventListener('change', function () {
          thisProduct.processOrder();
        });
      }
      /* Listen for click event on the cart button */
      thisProduct.cartButton.addEventListener('click', function (event) {
        event.preventDefault();
        /* Process the order for the product */
        thisProduct.processOrder();
        /* Add the product to the cart */
        thisProduct.addToCart();
      });
    }
    processOrder() {
      const thisProduct = this;
      // convert form to object structure
      const formData = utils.serializeFormToObject(thisProduct.form);
      // set price to default price
      let price = thisProduct.data.price;
      let image = thisProduct.imageWrapper;
      // for every category (param)...
      for (let paramId in thisProduct.data.params) {
        //determine param value, e.g. paramId ='toppings' param = {label: 'Toppings', type: 'checkboxes'}
        const param = thisProduct.data.params[paramId];
        // for every option in this category
        for (let optionId in param.options) {
          //determine option value e.g. optionId = 'olives', option = { label: 'Olives', price: 2, default: true }
          const option = param.options[optionId];
          //create slector for images e.g 'topping-salami'
          const optionImageClass = ('.' + paramId + '-' + optionId);
          const optionImage = image.querySelector(optionImageClass);
          const optionSelected = formData[paramId] && formData[paramId].includes(optionId);
          /* Check if the option is selected in the form */
          if (optionSelected) {
            /* Check if the option is not default */
            if (option.default != true) {
              price += option.price;
            }
          }
          /* Check if the option is default and not selected */
          if (option.default && !formData[paramId].includes(optionId)) {
            price -= option.price;
          }
          if (optionSelected) {
            if (optionImage) {
              /* Add the active class to the selected element*/
              optionImage.classList.add(classNames.menuProduct.imageVisible);
            }
          }
          if (!formData[paramId].includes(optionId)) {
            if (optionImage) {
              /*Remove the active class from the selected element */
              optionImage.classList.remove(classNames.menuProduct.imageVisible);
            }
          }
        }
      }
      //update if products amount is changed
      thisProduct.priceSingle = price;
      price *= thisProduct.amountWidget.value;
      //console.log('price single: ', thisProduct.priceSingle);
      // update calculated price in the HTML
      thisProduct.priceElem.innerHTML = price;
    }
    initAmountWidget() {
      const thisProduct = this;
      /* Create a new instance of the AmountWidget class */
      thisProduct.amountWidget = new AmountWidget(thisProduct.amountWidgetElem);
      /* Listen for an updated event on the amount widget */
      thisProduct.amountWidgetElem.addEventListener('updated', function (event) {
        event.preventDefault();
        thisProduct.processOrder();
      });
    }
    addToCart() {
      const thisProduct = this;
      app.cart.add(thisProduct.prepareCartProduct());
    }
    prepareCartProduct() {
      const thisProduct = this;
      /* Create new object with selected product data */
      const productSummary = {};
      //const params = {};
      productSummary.id = thisProduct.id;
      //console.log('amount:: ', thisProduct.amountWidget.value);
      productSummary.name = thisProduct.data.name;
      productSummary.amount = thisProduct.amountWidget.value;
      productSummary.priceSingle = thisProduct.priceSingle;
      productSummary.price = parseInt(thisProduct.priceSingle) * parseInt(thisProduct.amountWidget.value);
      productSummary.params = thisProduct.prepareCartProductParams();
      return productSummary;

    }
    prepareCartProductParams() {
      const thisProduct = this;
      // convert form to object structure
      const formData = utils.serializeFormToObject(thisProduct.form);
      const paramSummary = {};
      // for every category (param)...
      for (let paramId in thisProduct.data.params) {
        //determine param value, e.g. paramId ='toppings' param = {label: 'Toppings', type: 'checkboxes'}
        // console.log('paramId: ',paramId);
        const param = thisProduct.data.params[paramId];
        //create category param in params const eg. params = { ingredients: { name: 'Ingredients', options: {}}}
        // console.log('param: ',param);
        paramSummary[paramId] = {
          label: param.label,
          options: {}
        }
        // for every option in this category
        for (let optionId in param.options) {
          //determine option value e.g. optionId = 'olives', option = { label: 'Olives', price: 2, default: true }
          const option = param.options[optionId];
          const optionSelected = formData[paramId] && formData[paramId].includes(optionId);
          if (optionSelected) {
            // Add the option label to the group 
            paramSummary[paramId].options[optionId] = option.label;
          }
        }
      }
      return paramSummary;
    }
  }

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
      console.log('adding product1', menuProduct);
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

      console.log('new CartProduct: ', thisCartProduct);
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

  const app = {
    initMenu: function () {
      const thisApp = this;
      //console.log('thisApp.data: ', thisApp.data);
      for (let productData in thisApp.data.products) {
        new Product(thisApp.data.products[productData].id, thisApp.data.products[productData]);
        //new Product(productData, thisApp.data.products[productData]);
      }
    },

    initData: function () {
      const thisApp = this;

      thisApp.data = {};
      const url = settings.db.url + '/' + settings.db.products;
      fetch(url)
      .then(function(rawResponse){
        return rawResponse.json();
      })
      .then(function(parsedResponse){
        console.log('parseResponse: ', parsedResponse);
        /*save parsedResponse as thisApp.data.products */
        thisApp.data.products = parsedResponse;
        /*execute initMenu method */
        thisApp.initMenu();

      })
      console.log('thisApp.data', JSON.stringify(thisApp.data));
    },

    initCart: function () {
      const thisApp = this;

      const cartElem = document.querySelector(select.containerOf.cart);
      thisApp.cart = new Cart(cartElem);
    },

    init: function () {
      const thisApp = this;
      console.log('*** App starting ***');
      console.log('thisApp:', thisApp);
      console.log('classNames:', classNames);
      console.log('settings:', settings);
      console.log('templates:', templates);
      thisApp.initData();
      thisApp.initCart();
    },

  };
  app.init();
}

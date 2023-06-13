import {select, classNames, templates} from '../settings.js';
import utils from '../utils.js';
import AmountWidget from './amountwidget.js';

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
    thisProduct.name = thisProduct.data.name;
    thisProduct.amount = thisProduct.amountWidget.value;
    thisProduct.price = parseInt(thisProduct.priceSingle) * parseInt(thisProduct.amountWidget.value);
    thisProduct.params = thisProduct.prepareCartProductParams();
    //app.cart.add(thisProduct.prepareCartProduct());
    const event = new CustomEvent('add-to-cart', {
      bubbles: true,
      detail: {
        product: thisProduct,
      },
    });
    thisProduct.element.dispatchEvent(event);
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

export default Product;

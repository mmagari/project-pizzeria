import {templates, select, classNames} from '../settings.js';
import utils from '../utils.js';

class Home {
  constructor(homeContainer) {
    const thisHome = this;
    // Initialize Home actions
    thisHome.renderHome(homeContainer);
    thisHome.activatePage();
  }
  renderHome(homeContainer){
    const thisHome = this;
    thisHome.dom = {};
    //thisHome.homeContainer = homeContainer;
    thisHome.dom.wrapper = homeContainer;
    /* generate HTML based on template */
    const generatedHTML = templates.homeContainer();
    /* add HTML using utils.createElementFromHTML */
    thisHome.dom.wrapper = utils.createDOMFromHTML(generatedHTML);
    /* find booking container */
    const bookingContainer = document.querySelector(select.containerOf.home);
    /* add element to container */
    bookingContainer.appendChild(thisHome.dom.wrapper);
  }
  activatePage() {
    const thisHome = this;
    thisHome.pages = document.querySelector(select.containerOf.pages).children;
    const image1 = document.querySelector('.img-1');
    const image2 = document.querySelector('.img-2');
    const homeBar = document.querySelector(select.nav.links);
    const orderBar = document.querySelector(select.nav.order);
    const bookingBar = document.querySelector(select.nav.booking);
    const cart = document.querySelector(select.containerOf.cart);
    image1.addEventListener('click', function() {
      thisHome.pages.home.classList.remove(classNames.pages.active);
      homeBar.classList.remove(classNames.pages.active);
      thisHome.pages.order.classList.add(classNames.pages.active);
      orderBar.classList.add(classNames.pages.active);
      cart.classList.add(classNames.pages.active);
    });
    image2.addEventListener('click', function() {
      thisHome.pages.home.classList.remove(classNames.pages.active);
      homeBar.classList.remove(classNames.pages.active);
      thisHome.pages.booking.classList.add(classNames.pages.active);
      bookingBar.classList.add(classNames.pages.active);
    });

  }
}

export default Home;
// wrapper for querySelector...returns matching element
export function qs(selector, parent = document) {
  return parent.querySelector(selector);
}
// or a more concise version if you are into that sort of thing:
// export const qs = (selector, parent = document) => parent.querySelector(selector);

// retrieve data from localstorage
export function getLocalStorage(key) {
  return JSON.parse(localStorage.getItem(key));
}
// save data to local storage
export function setLocalStorage(key, data) {
  localStorage.setItem(key, JSON.stringify(data));
}
// set a listener for both touchend and click
export function setClick(selector, callback) {
  qs(selector).addEventListener("touchend", (event) => {
    event.preventDefault();
    callback();
  });
  qs(selector).addEventListener("click", callback);
}

// get the product id from the query string
export function getParam(param) {
  const queryString = window.location.search;
  const urlParams = new URLSearchParams(queryString);
  const product = urlParams.get(param);
  return product
}

export function renderListWithTemplate(template, parentElement, list, position = "afterbegin", clear = false) {
  const htmlStrings = list.map(template);
  // if clear is true we need to clear out the contents of the parent.
  if (clear) {
    parentElement.innerHTML = "";
  }
  parentElement.insertAdjacentHTML(position, htmlStrings.join(""));
}

export async function loadHeaderFooter() {
  const header = document.querySelector("header");
  const footer = document.querySelector("footer");

  try {
    const headerResponse = await fetch("header.html");
    const headerHTML = await headerResponse.text();
    header.innerHTML = headerHTML;

    const footerResponse = await fetch("footer.html");
    const footerHTML = await footerResponse.text();
    footer.innerHTML = footerHTML;
  } catch (error) {
    console.error("Error loading header or footer:", error);
  }
}

export function addToCart(product) {
  // Get current cart from localStorage or start with an empty array
  let cart = getLocalStorage("so-cart") || [];

  // Check if the product is already in the cart
  const existingItem = cart.find(item => item.Id === product.Id);

  if (existingItem) {
    // Optional: You can add quantity handling here later
    alert("This item is already in your cart!");
    return;
  }

  // Add the new product
  cart.push(product);

  // Save updated cart to localStorage
  setLocalStorage("so-cart", cart);

  // Optional: Confirmation feedback
  alert(`${product.Name} added to cart!`);
}

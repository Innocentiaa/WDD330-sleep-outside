import { getLocalStorage } from "./utils.mjs";
import ProductData from "./ProductData.mjs";

function renderCartContents() {
  const cartItems = getLocalStorage("so-cart");
  const htmlItems = cartItems.map((item) => cartItemTemplate(item));
  document.querySelector(".product-list").innerHTML = htmlItems.join("");
}

function cartItemTemplate(item) {
  const newItem = `<li class="cart-card divider">
  <a href="#" class="cart-card__image">
    <img
      src="${item.Image}"
      alt="${item.Name}"
    />
  </a>
  <a href="#">
    <h2 class="card__name">${item.Name}</h2>
  </a>
  <p class="cart-card__color">${item.Colors[0].ColorName}</p>
  <p class="cart-card__quantity">qty: 1</p>
  <p class="cart-card__price">$${item.FinalPrice}</p>
</li>`;

  return newItem;
}

renderCartContents();

function cartItemTemplate(item) {
  return `
  <li class="cart-card divider">
    <span class="remove-item" data-id="${item.Id}">X</span>
    <a href="#" class="cart-card__image">
      <img src="${item.Image}" alt="${item.Name}" />
    </a>
    <a href="#">
      <h2 class="card__name">${item.Name}</h2>
    </a>
    <p class="cart-card__color">${item.Colors[0].ColorName}</p>
    <p class="cart-card__quantity">qty: 1</p>
    <p class="cart-card__price">$${item.FinalPrice}</p>
  </li>`;
}

function handleRemoveItem(e) {
  if (!e.target.classList.contains("remove-item")) return;

  const id = e.target.dataset.id;
  let cartItems = getLocalStorage("so-cart") || [];

  cartItems = cartItems.filter(item => item.Id !== id);

  setLocalStorage("so-cart", cartItems);

  renderCartContents();
}

function renderCartContents() {
  const cartItems = getLocalStorage("so-cart") || [];
  const htmlItems = cartItems.map(item => cartItemTemplate(item));
  const productListEl = document.querySelector(".product-list");
  productListEl.innerHTML = htmlItems.join("");

  // Event delegation for remove buttons
  productListEl.addEventListener("click", handleRemoveItem);
}

function renderCartContents() {
  const cartItems = JSON.parse(localStorage.getItem("so-cart")) || [];
  const productList = document.querySelector(".product-list");
  productList.innerHTML = ""; // clear old list

  cartItems.forEach((item) => {
    const li = document.createElement("li");
    li.classList.add("product-card");

    li.innerHTML = `
      <img src="src/images/${item.Image}" alt="${item.Name}" />
      <h3>${item.Name}</h3>
      <p>$${item.FinalPrice}</p>
      <button class="remove-btn" data-id="${item.Id}">X</button>
    `;

    productList.appendChild(li);
  });

  // attach listeners to each remove button
  document.querySelectorAll(".remove-btn").forEach((btn) => {
    btn.addEventListener("click", removeFromCart);
  });
}

function removeFromCart(event) {
  const id = event.target.dataset.id;
  let cartItems = JSON.parse(localStorage.getItem("so-cart")) || [];

  // filter out the clicked item
  cartItems = cartItems.filter((item) => item.Id !== id);

  // update localStorage
  localStorage.setItem("so-cart", JSON.stringify(cartItems));

  // re-render cart
  renderCartContents();
}

// initial render
renderCartContents();

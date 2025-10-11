import { getLocalStorage, setLocalStorage, loadHeaderFooter } from "./utils.mjs";

loadHeaderFooter();

function renderCartContents() {
  const cartItems = getLocalStorage("so-cart") || [];
  const productList = document.querySelector(".product-list");
  const footer = document.querySelector(".cart-footer");
  const totalDisplay = document.querySelector(".cart-total");

  if (cartItems.length === 0) {
    productList.innerHTML = "<p>Your cart is empty.</p>";
    footer.classList.add("hide"); // hide footer if cart empty
    return;
  }

  // Generate HTML for cart items
  const htmlItems = cartItems.map((item) => cartItemTemplate(item));
  productList.innerHTML = htmlItems.join("");

  // Attach remove button listeners
  document.querySelectorAll(".remove-btn").forEach((btn) => {
    btn.addEventListener("click", removeFromCart);
  });

  // Calculate total
  const total = cartItems.reduce((sum, item) => sum + item.FinalPrice, 0);
  totalDisplay.textContent = `Total: $${total.toFixed(2)}`;

  // Show footer
  footer.classList.remove("hide");
}

function cartItemTemplate(item) {
  return `
    <li class="cart-card divider">
      <a href="#" class="cart-card__image">
        <img src="${item.Image}" alt="${item.Name}" />
      </a>
      <a href="#">
        <h2 class="card__name">${item.Name}</h2>
      </a>
      <p class="cart-card__color">${item.Colors?.[0]?.ColorName || ""}</p>
      <p class="cart-card__quantity">qty: 1</p>
      <p class="cart-card__price">$${item.FinalPrice}</p>
      <button class="remove-btn" data-id="${item.Id}">Remove</button>
    </li>
  `;
}

function removeFromCart(event) {
  const id = event.target.dataset.id;
  let cartItems = getLocalStorage("so-cart") || [];

  // Remove the clicked item
  cartItems = cartItems.filter((item) => item.Id !== id);

  // Update localStorage
  setLocalStorage("so-cart", cartItems);

  // Re-render the cart
  renderCartContents();
}

// Initial render
renderCartContents();

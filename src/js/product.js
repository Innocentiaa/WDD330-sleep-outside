import { getParam, addToCart } from "./utils.mjs";
import ProductData from "./productData.mjs";
import ProductDetails from "./productDetails.mjs";
const dataSource = new ProductData("tents");
const productID = getParam("product");

const product = new ProductDetails(productID, dataSource);
product.init();

// Add to Cart button event handler
async function addToCartHandler() {
    const productItem = await dataSource.findProductById(productID);
    if (productItem) {
        addToCart(productItem);
        alert(`${productItem.Name} added to cart!`);
    }
}

// Attach listener to Add to Cart button
const addToCartButton = document.getElementById("addToCart");
if (addToCartButton) {
    addToCartButton.addEventListener("click", addToCartHandler);
}

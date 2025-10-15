import { loadHeaderFooter, getParam } from "./utils.mjs";
import ProductData from "./productData.mjs";
import ProductList from "./productList.mjs";
import Alert from "./alerts.js";

const alerts = new Alert("/json/alerts.json", "main");
alerts.init();

loadHeaderFooter();

const category = getParam("category");
const dataSource = new ProductData();
const element = document.querySelector(".product-list");
const listing = new ProductList(category, dataSource, element);

listing.init();
import { resolve } from "path";
import { defineConfig } from "vite";

export default defineConfig({
  // Setting the root to the project folder
  root: "src",

  build: {
    outDir: "dist",
    rollupOptions: {
      input: {
        // *** ONLY INCLUDE YOUR PROJECT FOR NOW ***
        main: resolve(__dirname, "src/daily-wellness-hub/index.html"),
        // The following lines are commented out so they don't block your build:
        // cart: resolve(__dirname, "src/cart/index.html"),
        // checkout: resolve(__dirname, "src/checkout/index.html"),
        // product: resolve(__dirname, "src/product_pages/index.html"),
        // product_listing: resolve(__dirname, "src/product_listing/index.html"),

        wellness_hub: resolve(__dirname, "src/daily-wellness-hub/index.html"),
      },
    },
  },
});

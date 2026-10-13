"use strict";

const $ = (id) => document.getElementById(id);

const STORAGE_KEYS = {
products: "shopsmart_products_v1",
cart: "shopsmart_cart_v1"
};

const starterProducts = [
{
id: 1,
name: "Wireless Headphones",
price: 1499,
category: "Electronics",
description: "Enjoy clear sound and wireless convenience."
},
{
id: 2,
name: "Smart Watch",
price: 2299,
category: "Electronics",
description: "Track your daily activities in style."
},
{
id: 3,
name: "Casual T-Shirt",
price: 599,
category: "Fashion",
description: "A comfortable T-shirt for everyday wear."
},
{
id: 4,
name: "Travel Backpack",
price: 999,
category: "Accessories",
description: "Carry your everyday essentials with ease."
},
{
id: 5,
name: "Desk Lamp",
price: 799,
category: "Home",
description: "A useful lamp for your study desk."
},
{
id: 6,
name: "Bluetooth Speaker",
price: 1299,
category: "Electronics",
description: "Enjoy your favorite music anywhere."
},
{
id: 7,
name: "Sports Shoes",
price: 1799,
category: "Fashion",
description: "Comfortable shoes for everyday activities."
},
{
id: 8,
name: "Water Bottle",
price: 399,
category: "Accessories",
description: "A reusable bottle for daily hydration."
}
];

function loadData(key, fallback) {
try {
const raw = localStorage.getItem(key);
if (raw === null) return fallback;

    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : fallback;
} catch (error) {
    console.error("Unable to load saved data:", error);
    return fallback;
}

}

let products = loadData(STORAGE_KEYS.products, starterProducts);
let cart = loadData(STORAGE_KEYS.cart, []);

function saveProducts() {
try {
localStorage.setItem(STORAGE_KEYS.products, JSON.stringify(products));
return true;
} catch (error) {
console.error("Unable to save products:", error);
$("form-message").textContent = "Could not save data. Check browser storage.";
return false;
}
}

function saveCart() {
try {
localStorage.setItem(STORAGE_KEYS.cart, JSON.stringify(cart));
return true;
} catch (error) {
console.error("Unable to save cart:", error);
$("cart-message").textContent = "Could not save cart data.";
return false;
}
}

function money(value) {
return new Intl.NumberFormat("en-IN", {
style: "currency",
currency: "INR"
}).format(value);
}

function makeElement(tag, className, text) {
const element = document.createElement(tag);

if (className) element.className = className;
if (text !== undefined) element.textContent = text;

return element;

}

function createButton(text, className, action) {
const button = makeElement("button", "button " + (className || ""), text);
button.type = "button";
button.addEventListener("click", action);
return button;
}

function renderProducts() {
const list = $("product-list");
const query = $("search").value.trim().toLowerCase();
const category = $("category-filter").value;

list.replaceChildren();

const filtered = products.filter((product) => {
    const matchesSearch =
        product.name.toLowerCase().includes(query) ||
        product.description.toLowerCase().includes(query);

    const matchesCategory =
        category === "all" || product.category === category;

    return matchesSearch && matchesCategory;
});

$("product-message").textContent =
    filtered.length + (filtered.length === 1 ? " product found." : " products found.");

if (filtered.length === 0) {
    list.append(makeElement("p", "empty-state", "No products found. Try another search."));
    return;
}

filtered.forEach((product) => {
    const card = makeElement("article", "product-card");

    card.append(makeElement("p", "badge", product.category));
    card.append(makeElement("h3", "", product.name));
    card.append(makeElement("p", "", product.description));
    card.append(makeElement("p", "price", money(product.price)));

    const actions = makeElement("div", "product-actions");

    actions.append(createButton("Add to Cart", "", () => {
        addToCart(product.id);
    }));

    actions.append(createButton("Edit", "secondary", () => {
        editProduct(product.id);
    }));

    actions.append(createButton("Delete", "danger", () => {
        deleteProduct(product.id);
    }));

    card.append(actions);
    list.append(card);
});

}

function resetProductForm() {
$("product-form").reset();
$("product-id").value = "";
$("cancel-edit").hidden = true;
}

function editProduct(id) {
const product = products.find((item) => item.id === id);
if (!product) return;

$("product-id").value = product.id;
$("product-name").value = product.name;
$("product-price").value = product.price;
$("product-category").value = product.category;
$("product-description").value = product.description;
$("cancel-edit").hidden = false;
$("form-message").textContent = "Editing: " + product.name;

$("manage").scrollIntoView({ behavior: "smooth" });
$("product-name").focus();

}

function deleteProduct(id) {
const product = products.find((item) => item.id === id);
if (!product) return;

if (!window.confirm("Delete " + product.name + "?")) return;

const previousProducts = products;
const previousCart = cart;

products = products.filter((item) => item.id !== id);
cart = cart.filter((item) => item.productId !== id);

if (!saveProducts()) {
    products = previousProducts;
    cart = previousCart;
    return;
}

saveCart();
renderProducts();
renderCart();

$("form-message").textContent = "Product deleted successfully.";

}

$("product-form").addEventListener("submit", (event) => {
event.preventDefault();

const name = $("product-name").value.trim();
const price = Number($("product-price").value);
const category = $("product-category").value;
const description = $("product-description").value.trim();
const existingId = $("product-id").value;

const allowedCategories = [
    "Electronics",
    "Fashion",
    "Accessories",
    "Home"
];

if (
    !name ||
    !description ||
    !Number.isFinite(price) ||
    price <= 0 ||
    !allowedCategories.includes(category)
) {
    $("form-message").textContent = "Please enter valid product details.";
    return;
}

const previousProducts = products;

if (existingId) {
    products = products.map((product) =>
        product.id === Number(existingId)
            ? { ...product, name, price, category, description }
            : product
    );

    cart = cart.map((item) => {
        if (item.productId !== Number(existingId)) return item;
        return item;
    });

    $("form-message").textContent = "Product updated successfully.";
} else {
    const newId = products.reduce(
        (max, product) => Math.max(max, Number(product.id) || 0),
        0
    ) + 1;

    products.push({
        id: newId,
        name,
        price,
        category,
        description
    });

    $("form-message").textContent = "Product added successfully.";
}

if (!saveProducts()) {
    products = previousProducts;
    return;
}

resetProductForm();
renderProducts();

});

$("cancel-edit").addEventListener("click", () => {
resetProductForm();
$("form-message").textContent = "Editing cancelled.";
});

function addToCart(productId) {
const product = products.find((item) => item.id === productId);
if (!product) return;

const existing = cart.find((item) => item.productId === productId);

if (existing) {
    existing.quantity += 1;
} else {
    cart.push({
        productId,
        quantity: 1
    });
}

saveCart();
renderCart();

$("cart-message").textContent = product.name + " added to cart.";

}

function changeQuantity(productId, amount) {
const item = cart.find((entry) => entry.productId === productId);
if (!item) return;

item.quantity += amount;

if (item.quantity <= 0) {
    cart = cart.filter((entry) => entry.productId !== productId);
}

saveCart();
renderCart();

}

function renderCart() {
const container = $("cart-items");
container.replaceChildren();

cart = cart.filter((item) =>
    products.some((product) => product.id === item.productId) &&
    Number.isInteger(item.quantity) &&
    item.quantity > 0
);

let total = 0;
let count = 0;

cart.forEach((item) => {
    const product = products.find((entry) => entry.id === item.productId);
    if (!product) return;

    total += product.price * item.quantity;
    count += item.quantity;

    const row = makeElement("article", "cart-item");
    const details = makeElement("div");

    details.append(makeElement("h3", "", product.name));
    details.append(makeElement("p", "", money(product.price) + " each"));
    details.append(
        makeElement("p", "", "Subtotal: " + money(product.price * item.quantity))
    );

    const controls = makeElement("div", "quantity-controls");

    controls.append(createButton("−", "secondary", () => {
        changeQuantity(product.id, -1);
    }));

    controls.append(makeElement("span", "", "Quantity: " + item.quantity));

    controls.append(createButton("+", "secondary", () => {
        changeQuantity(product.id, 1);
    }));

    row.append(details, controls);
    container.append(row);
});

if (cart.length === 0) {
    container.append(
        makeElement("p", "empty-state", "Your cart is empty. Add a product to begin.")
    );
}

$("cart-count").textContent = count;
$("cart-total").textContent = money(total);

saveCart();

}

$("clear-cart").addEventListener("click", () => {
cart = [];
saveCart();
renderCart();
$("cart-message").textContent = "Cart cleared.";
});

$("checkout").addEventListener("click", () => {
if (cart.length === 0) {
$("cart-message").textContent = "Your cart is empty.";
return;
}

$("cart-message").textContent =
    "Demo checkout successful! No payment was processed.";

cart = [];
saveCart();
renderCart();

});

$("search").addEventListener("input", renderProducts);
$("category-filter").addEventListener("change", renderProducts);

$("login-form").addEventListener("submit", (event) => {
event.preventDefault();

const username = $("username").value.trim();

if (!username) {
    $("login-message").textContent = "Please enter a username.";
    return;
}

$("login-message").textContent =
    "Welcome, " + username + "! Demo login successful. No real account was created.";

});

if (localStorage.getItem(STORAGE_KEYS.products) === null) {
saveProducts();
}

renderProducts();
renderCart();

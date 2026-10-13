const defaultProducts = [
    { id: 1, name: "Wireless Headphones", price: 1499, category: "Electronics" },
    { id: 2, name: "Smart Watch", price: 1999, category: "Electronics" },
    { id: 3, name: "Casual T-Shirt", price: 599, category: "Fashion" },
    { id: 4, name: "Backpack", price: 899, category: "Accessories" },
    { id: 5, name: "Sunglasses", price: 499, category: "Accessories" },
    { id: 6, name: "Running Shoes", price: 1299, category: "Fashion" }
];

function loadData(key, fallback) {
    try {
        const saved = localStorage.getItem(key);
        return saved ? JSON.parse(saved) : fallback;
    } catch {
        return fallback;
    }
}

let products = loadData("capstoneProducts", defaultProducts);
let cart = loadData("capstoneCart", []);
let loggedIn = false;

function saveData() {
    localStorage.setItem("capstoneProducts", JSON.stringify(products));
    localStorage.setItem("capstoneCart", JSON.stringify(cart));
}

function renderProducts() {
    const list = document.getElementById("productList");
    const search = document.getElementById("searchInput").value.toLowerCase();
    const category = document.getElementById("categoryFilter").value;

    list.replaceChildren();

    const filtered = products.filter(product =>
        product.name.toLowerCase().includes(search) &&
        (category === "all" || product.category === category)
    );

    if (filtered.length === 0) {
        list.textContent = "No products found.";
        return;
    }

    filtered.forEach(product => {
        const card = document.createElement("article");
        card.className = "product-card";

        const name = document.createElement("h3");
        name.textContent = product.name;

        const price = document.createElement("p");
        price.textContent = `Price: ₹${product.price}`;

        const type = document.createElement("p");
        type.textContent = `Category: ${product.category}`;

        const addButton = document.createElement("button");
        addButton.textContent = "Add to Cart";
        addButton.addEventListener("click", () => addToCart(product.id));

        const editButton = document.createElement("button");
        editButton.textContent = "Edit Product";
        editButton.addEventListener("click", () => editProduct(product.id));

        const deleteButton = document.createElement("button");
        deleteButton.textContent = "Delete Product";
        deleteButton.addEventListener("click", () => deleteProduct(product.id));

        card.append(name, price, type, addButton, editButton, deleteButton);
        list.appendChild(card);
    });
}

function addToCart(id) {
    const product = products.find(item => item.id === id);
    if (!product) return;

    cart.push({ ...product });
    saveData();
    renderCart();
}

function renderCart() {
    const list = document.getElementById("cartList");
    list.replaceChildren();

    let total = 0;

    cart.forEach((item, index) => {
        total += item.price;

        const row = document.createElement("li");
        row.textContent = `${item.name} - ₹${item.price} `;

        const removeButton = document.createElement("button");
        removeButton.textContent = "Remove";
        removeButton.setAttribute("aria-label", `Remove ${item.name} from cart`);

        removeButton.addEventListener("click", () => {
            cart.splice(index, 1);
            saveData();
            renderCart();
        });

        row.appendChild(removeButton);
        list.appendChild(row);
    });

    document.getElementById("cartTotal").textContent = `Total: ₹${total}`;
}

function editProduct(id) {
    const product = products.find(item => item.id === id);
    if (!product) return;

    const name = prompt("Enter product name:", product.name);
    if (name === null || !name.trim()) return;

    const priceInput = prompt("Enter product price:", product.price);
    if (priceInput === null) return;

    const price = Number(priceInput);
    if (!Number.isFinite(price) || price <= 0) {
        alert("Please enter a valid price.");
        return;
    }

    product.name = name.trim();
    product.price = price;

    saveData();
    renderProducts();
    renderCart();
}

function deleteProduct(id) {
    if (!confirm("Are you sure you want to delete this product?")) return;

    products = products.filter(product => product.id !== id);
    saveData();
    renderProducts();
}

document.getElementById("loginBtn").addEventListener("click", () => {
    const username = document.getElementById("username").value.trim();
    const message = document.getElementById("loginMessage");

    if (!username) {
        message.textContent = "Please enter a username.";
        loggedIn = false;
        return;
    }

    loggedIn = true;
    message.textContent = `Welcome, ${username}! Login simulation successful.`;
});

document.getElementById("productForm").addEventListener("submit", event => {
    event.preventDefault();

    const name = document.getElementById("productName").value.trim();
    const price = Number(document.getElementById("productPrice").value);
    const category = document.getElementById("productCategory").value;

    if (!name || !Number.isFinite(price) || price <= 0) {
        alert("Please enter valid product details.");
        return;
    }

    products.push({
        id: Date.now(),
        name,
        price,
        category
    });

    saveData();
    renderProducts();
    event.target.reset();
});

document.getElementById("searchInput").addEventListener("input", renderProducts);
document.getElementById("categoryFilter").addEventListener("change", renderProducts);

document.getElementById("clearCartBtn").addEventListener("click", () => {
    cart = [];
    saveData();
    renderCart();
});

renderProducts();
renderCart();
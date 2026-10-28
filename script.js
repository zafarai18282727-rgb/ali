const cart = new Map();
const cartTrigger = document.querySelector(".cart-trigger");
const cartDrawer = document.querySelector(".cart-drawer");
const drawerBackdrop = document.querySelector(".drawer-backdrop");
const drawerClose = document.querySelector(".drawer-close");
const cartItems = document.querySelector(".cart-items");
const cartEmpty = document.querySelector(".cart-empty");
const cartFooter = document.querySelector(".cart-footer");
const toast = document.querySelector(".toast");
let toastTimeout;

function formatPrice(price) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0
  }).format(price);
}

function openCart() {
  drawerBackdrop.hidden = false;
  requestAnimationFrame(() => drawerBackdrop.classList.add("is-open"));
  cartDrawer.classList.add("is-open");
  cartDrawer.setAttribute("aria-hidden", "false");
  cartTrigger.setAttribute("aria-expanded", "true");
  document.body.classList.add("drawer-open");
  drawerClose.focus();
}

function closeCart() {
  cartDrawer.classList.remove("is-open");
  drawerBackdrop.classList.remove("is-open");
  cartDrawer.setAttribute("aria-hidden", "true");
  cartTrigger.setAttribute("aria-expanded", "false");
  document.body.classList.remove("drawer-open");
  cartTrigger.focus();
  window.setTimeout(() => {
    if (!cartDrawer.classList.contains("is-open")) drawerBackdrop.hidden = true;
  }, 400);
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("is-visible");
  window.clearTimeout(toastTimeout);
  toastTimeout = window.setTimeout(() => toast.classList.remove("is-visible"), 2400);
}

function updateCart() {
  const entries = [...cart.entries()];
  const itemCount = entries.reduce((total, [, item]) => total + item.quantity, 0);
  const subtotal = entries.reduce((total, [, item]) => total + item.price * item.quantity, 0);

  document.querySelector(".cart-count").textContent = itemCount;
  cartTrigger.setAttribute("aria-label", `Open shopping bag, ${itemCount} ${itemCount === 1 ? "item" : "items"}`);
  document.querySelector(".drawer-count").textContent = `(${itemCount})`;
  document.querySelector(".subtotal-value").textContent = formatPrice(subtotal);
  cartItems.replaceChildren();
  cartEmpty.classList.toggle("is-visible", entries.length === 0);
  cartFooter.classList.toggle("is-empty", entries.length === 0);
  document.querySelector(".checkout-button").disabled = entries.length === 0;

  for (const [name, item] of entries) {
    const row = document.createElement("article");
    row.className = "cart-item";

    const mark = document.createElement("span");
    mark.className = "cart-item-swatch";
    mark.setAttribute("aria-hidden", "true");
    mark.textContent = "AE";

    const details = document.createElement("div");
    const title = document.createElement("p");
    title.className = "cart-item-name";
    title.textContent = name;
    const price = document.createElement("p");
    price.className = "cart-item-price";
    price.textContent = `${formatPrice(item.price)} · 50 ml`;
    const controls = document.createElement("div");
    controls.className = "quantity-controls";

    const decrease = document.createElement("button");
    decrease.type = "button";
    decrease.dataset.action = "decrease";
    decrease.dataset.product = name;
    decrease.setAttribute("aria-label", `Remove one ${name}`);
    decrease.textContent = "−";
    const quantity = document.createElement("span");
    quantity.textContent = item.quantity;
    const increase = document.createElement("button");
    increase.type = "button";
    increase.dataset.action = "increase";
    increase.dataset.product = name;
    increase.setAttribute("aria-label", `Add one ${name}`);
    increase.textContent = "+";

    controls.append(decrease, quantity, increase);
    details.append(title, price, controls);

    const total = document.createElement("span");
    total.className = "cart-item-total";
    total.textContent = formatPrice(item.price * item.quantity);
    row.append(mark, details, total);
    cartItems.append(row);
  }
}

document.querySelectorAll(".add-button").forEach((button) => {
  button.addEventListener("click", () => {
    const { product, price } = button.dataset;
    const current = cart.get(product);
    cart.set(product, {
      price: Number(price),
      quantity: current ? current.quantity + 1 : 1
    });
    updateCart();
    showToast(`${product} added to your bag`);
  });
});

cartTrigger.addEventListener("click", openCart);
drawerClose.addEventListener("click", closeCart);
drawerBackdrop.addEventListener("click", closeCart);
document.querySelector(".continue-shopping").addEventListener("click", closeCart);

cartItems.addEventListener("click", (event) => {
  const button = event.target.closest("button[data-action]");
  if (!button) return;

  const item = cart.get(button.dataset.product);
  if (!item) return;
  if (button.dataset.action === "increase") {
    item.quantity += 1;
  } else if (item.quantity > 1) {
    item.quantity -= 1;
  } else {
    cart.delete(button.dataset.product);
  }
  updateCart();
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && cartDrawer.classList.contains("is-open")) closeCart();
});

const menuToggle = document.querySelector(".menu-toggle");
const primaryNav = document.querySelector(".primary-nav");
menuToggle.addEventListener("click", () => {
  const isOpen = menuToggle.getAttribute("aria-expanded") !== "true";
  menuToggle.setAttribute("aria-expanded", String(isOpen));
  menuToggle.setAttribute("aria-label", isOpen ? "Close navigation" : "Open navigation");
  primaryNav.classList.toggle("is-open", isOpen);
});

primaryNav.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", () => {
    primaryNav.classList.remove("is-open");
    menuToggle.setAttribute("aria-expanded", "false");
    menuToggle.setAttribute("aria-label", "Open navigation");
  });
});

document.querySelector(".newsletter-form").addEventListener("submit", (event) => {
  event.preventDefault();
  const form = event.currentTarget;
  const email = new FormData(form).get("email");
  document.querySelector(".newsletter-status").textContent = `Thank you — ${email} is on the list.`;
  form.reset();
});

document.querySelector(".checkout-button").addEventListener("click", () => {
  if (cart.size > 0) showToast("Thank you for your interest. Checkout is coming soon.");
});

document.querySelector("#year").textContent = new Date().getFullYear();

if ("IntersectionObserver" in window && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
  const observer = new IntersectionObserver((entries, currentObserver) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        currentObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.13 });

  document.querySelectorAll(".reveal").forEach((card) => observer.observe(card));
} else {
  document.querySelectorAll(".reveal").forEach((card) => card.classList.add("is-visible"));
}

updateCart();

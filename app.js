
const API_BASE = "";

const productsEl = document.getElementById("products");
const filtersEl = document.getElementById("filters");
const searchEl = document.getElementById("search");
const dialog = document.getElementById("reserve-dialog");
const form = document.getElementById("reserve-form");
const wishlistPage = document.getElementById("liste");
const detailPage = document.getElementById("product-detail");

let activeCategory = "Alle";
let reservations = {};
let selectedProduct = null;

const categories = ["Alle", ...new Set(window.WISHLIST_PRODUCTS.map(p => p.category))];

categories.forEach(category => {
  const button = document.createElement("button");
  button.className = "filter" + (category === "Alle" ? " active" : "");
  button.textContent = category;

  button.addEventListener("click", () => {
    activeCategory = category;
    document.querySelectorAll(".filter").forEach(b =>
      b.classList.toggle("active", b.textContent === category)
    );
    renderWishlist();
  });

  filtersEl.appendChild(button);
});

function openProduct(product) {
  const url = new URL(window.location.href);
  url.searchParams.set("produkt", product.id);
  history.pushState({}, "", url);
  renderRoute();
}

function backToWishlist() {
  const url = new URL(window.location.href);
  url.searchParams.delete("produkt");
  history.pushState({}, "", url);
  renderRoute();
}

function renderRoute() {
  const productId = new URLSearchParams(window.location.search).get("produkt");

  if (productId) {
    const product = window.WISHLIST_PRODUCTS.find(p => p.id === productId);

    if (product) {
      wishlistPage.hidden = true;
      detailPage.hidden = false;
      renderDetail(product);
      window.scrollTo(0, 0);
      return;
    }
  }

  wishlistPage.hidden = false;
  detailPage.hidden = true;
  renderWishlist();
}

function renderDetail(product) {
  detailPage.innerHTML = "";

  const card = document.createElement("article");
  card.className = "product";

  const image = document.createElement("div");
  image.className = "product-image";

  if (product.image) {
    const img = document.createElement("img");
    img.src = product.image;
    img.alt = product.name;
    image.appendChild(img);
  } else {
    image.textContent = "Produktbild ergänzen";
  }

  const body = document.createElement("div");
  body.className = "product-body";

  const category = document.createElement("div");
  category.className = "category";
  category.textContent = product.category;

  const title = document.createElement("h2");
  title.textContent = product.name;

  const description = document.createElement("p");
  description.textContent = product.description;

  const brand = document.createElement("div");
  brand.className = "brand-line";
  brand.textContent = product.brand
    ? `Marke / Modell: ${product.brand}`
    : "Marke / Modell noch offen";

  body.append(category, title, description, brand);

  if (product.details) {
    const details = document.createElement("p");
    details.textContent = product.details;
    body.appendChild(details);
  }

  if (product.price) {
    const price = document.createElement("p");
    price.textContent = `Preis: ${product.price}`;
    body.appendChild(price);
  }

  const actions = document.createElement("div");
  actions.className = "product-actions";

  (product.links || []).forEach(link => {
    const a = document.createElement("a");
    a.className = "secondary";
    a.href = link.url;
    a.target = "_blank";
    a.rel = "noopener noreferrer";
    a.textContent = link.label || "Zum Produkt";
    actions.appendChild(a);
  });

  const reservation = reservations[product.id];

  const reserve = document.createElement("button");
  reserve.className = "primary";
  reserve.textContent = reservation ? "Bereits reserviert" : "Wunsch reservieren";
  reserve.disabled = Boolean(reservation);
  reserve.style.opacity = reservation ? ".55" : "1";
  reserve.addEventListener("click", () => openReservation(product));

  actions.appendChild(reserve);

  const status = document.createElement("div");
  status.className = "status" + (reservation ? " reserved" : "");
  status.textContent = reservation
    ? `Reserviert von ${reservation.name}`
    : "Noch verfügbar";

  body.append(actions, status);

  card.append(image, body);
  detailPage.appendChild(card);

  const back = document.createElement("button");
  back.className = "secondary";
  back.textContent = "← Zurück zur Wunschliste";
  back.addEventListener("click", backToWishlist);

  detailPage.appendChild(back);
}

function renderWishlist() {
  const query = searchEl.value.trim().toLocaleLowerCase("de");

  const shown = window.WISHLIST_PRODUCTS.filter(p =>
    (activeCategory === "Alle" || p.category === activeCategory) &&
    [p.name, p.brand, p.description, p.category]
      .join(" ")
      .toLocaleLowerCase("de")
      .includes(query)
  );

  document.getElementById("count").textContent =
    `${shown.length} ${shown.length === 1 ? "Wunsch" : "Wünsche"}`;

  productsEl.innerHTML = "";

  shown.forEach(p => {
    const reservation = reservations[p.id];

    const card = document.createElement("article");
    card.className = "product";
    card.tabIndex = 0;
    card.setAttribute("role", "link");
    card.setAttribute("aria-label", `${p.name} – Details ansehen`);

    card.addEventListener("click", event => {
      if (event.target.closest("a, button")) return;
      openProduct(p);
    });

    card.addEventListener("keydown", event => {
      if (event.target !== card) return;

      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        openProduct(p);
      }
    });

    const image = document.createElement("div");
    image.className = "product-image";

    if (p.image) {
      const img = document.createElement("img");
      img.src = p.image;
      img.alt = p.name;
      image.appendChild(img);
    } else {
      image.textContent = "Produktbild ergänzen";
    }

    const body = document.createElement("div");
    body.className = "product-body";

    const category = document.createElement("div");
    category.className = "category";
    category.textContent = p.category;

    const title = document.createElement("h3");
    title.textContent = p.name;

    const desc = document.createElement("p");
    desc.textContent = p.description;

    const brand = document.createElement("div");
    brand.className = "brand-line";
    brand.textContent = p.brand
      ? `Marke / Vorschlag: ${p.brand}`
      : "Marke / Modell noch offen";

    const actions = document.createElement("div");
    actions.className = "product-actions";

    (p.links || []).forEach(link => {
      const a = document.createElement("a");
      a.className = "secondary";
      a.href = link.url;
      a.target = "_blank";
      a.rel = "noopener noreferrer";
      a.textContent = link.label || "Zum Produkt";
      actions.appendChild(a);
    });

    const reserve = document.createElement("button");
    reserve.className = "primary";
    reserve.textContent = reservation
      ? "Bereits reserviert"
      : "Wunsch reservieren";

    reserve.disabled = Boolean(reservation);
    reserve.style.opacity = reservation ? ".55" : "1";
    reserve.addEventListener("click", () => openReservation(p));

    actions.appendChild(reserve);

    const status = document.createElement("div");
    status.className = "status" + (reservation ? " reserved" : "");
    status.textContent = reservation
      ? `Reserviert von ${reservation.name}`
      : "Noch verfügbar";

    body.append(category, title, desc, brand, actions, status);
    card.append(image, body);
    productsEl.appendChild(card);
  });

  if (!shown.length) {
    productsEl.textContent = "Keine passenden Wünsche gefunden.";
  }
}

function openReservation(product) {
  if (!API_BASE) {
    alert("Die Reservierungsfunktion ist noch nicht aktiviert. Bitte zuerst den Cloudflare-Worker einrichten (Anleitung in README).");
    return;
  }

  selectedProduct = product;
  document.getElementById("dialog-title").textContent = product.name;
  document.getElementById("reserve-error").textContent = "";

  form.reset();
  dialog.showModal();
}

document.getElementById("close-dialog").addEventListener("click", () => {
  dialog.close();
});

searchEl.addEventListener("input", renderWishlist);

window.addEventListener("popstate", renderRoute);

form.addEventListener("submit", async event => {
  event.preventDefault();

  if (!selectedProduct) return;

  const button = document.getElementById("reserve-submit");
  button.disabled = true;
  button.textContent = "Wird gespeichert …";

  try {
    const response = await fetch(`${API_BASE}/reservations`, {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({
        productId: selectedProduct.id,
        name: document.getElementById("reserve-name").value.trim(),
        note: document.getElementById("reserve-note").value.trim()
      })
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || "Reservierung fehlgeschlagen.");
    }

    reservations[selectedProduct.id] = {
      name: document.getElementById("reserve-name").value.trim()
    };

    dialog.close();
    renderRoute();

  } catch (error) {
    document.getElementById("reserve-error").textContent = error.message;

  } finally {
    button.disabled = false;
    button.textContent = "Verbindlich reservieren";
  }
});

async function loadReservations() {
  if (!API_BASE) {
    renderRoute();
    return;
  }

  try {
    const response = await fetch(`${API_BASE}/reservations`);

    if (response.ok) {
      reservations = await response.json();
    }
  } catch (error) {
    console.warn("Reservierungen konnten nicht geladen werden.", error);
  }

  renderRoute();
}

loadReservations();

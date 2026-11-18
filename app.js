const API_BASE = ""; // Nach dem Deployment die URL des Cloudflare Workers hier eintragen, z. B. https://wunschliste-api.DEINNAME.workers.dev
const productsEl = document.getElementById("products");
const filtersEl = document.getElementById("filters");
const searchEl = document.getElementById("search");
const dialog = document.getElementById("reserve-dialog");
const form = document.getElementById("reserve-form");
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
    document.querySelectorAll(".filter").forEach(b => b.classList.toggle("active", b.textContent === category));
    render();
  });
  filtersEl.appendChild(button);
});

async function loadReservations() {
  if (!API_BASE) { render(); return; }
  try {
    const response = await fetch(`${API_BASE}/reservations`);
    if (response.ok) reservations = await response.json();
  } catch (error) { console.warn("Reservierungen konnten nicht geladen werden.", error); }
  render();
}

function render() {
  const query = searchEl.value.trim().toLocaleLowerCase("de");
  const shown = window.WISHLIST_PRODUCTS.filter(p =>
    (activeCategory === "Alle" || p.category === activeCategory) &&
    [p.name,p.brand,p.description,p.category].join(" ").toLocaleLowerCase("de").includes(query)
  );
  document.getElementById("count").textContent = `${shown.length} ${shown.length === 1 ? "Wunsch" : "Wünsche"}`;
  productsEl.innerHTML = "";
  shown.forEach(p => {
    const reservation = reservations[p.id];
    const card = document.createElement("article");
    card.className = "product";
    const image = document.createElement("div");
    image.className = "product-image";
    if (p.image) {
      const img = document.createElement("img"); img.src = p.image; img.alt = p.name; image.appendChild(img);
    } else image.textContent = "Produktbild ergänzen";
    const body = document.createElement("div"); body.className = "product-body";
    const category = document.createElement("div"); category.className = "category"; category.textContent = p.category;
    const title = document.createElement("h3"); title.textContent = p.name;
    const desc = document.createElement("p"); desc.textContent = p.description;
    const brand = document.createElement("div"); brand.className = "brand-line"; brand.textContent = p.brand ? `Marke / Vorschlag: ${p.brand}` : "Marke / Modell noch offen";
    const actions = document.createElement("div"); actions.className = "product-actions";
    (p.links || []).forEach(link => {
      const a = document.createElement("a"); a.className = "secondary"; a.href = link.url; a.target = "_blank"; a.rel = "noopener noreferrer"; a.textContent = link.label || "Zum Produkt"; actions.appendChild(a);
    });
    const reserve = document.createElement("button"); reserve.className = "primary"; reserve.textContent = reservation ? "Bereits reserviert" : "Wunsch reservieren";
    reserve.disabled = Boolean(reservation); reserve.style.opacity = reservation ? ".55" : "1";
    reserve.addEventListener("click", () => openReservation(p));
    actions.appendChild(reserve);
    const status = document.createElement("div"); status.className = "status" + (reservation ? " reserved" : "");
    status.textContent = reservation ? `Reserviert von ${reservation.name}` : "Noch verfügbar";
    body.append(category,title,desc,brand,actions,status); card.append(image,body); productsEl.appendChild(card);
  });
  if (!shown.length) productsEl.textContent = "Keine passenden Wünsche gefunden.";
}

function openReservation(product) {
  if (!API_BASE) { alert("Die Reservierungsfunktion ist noch nicht aktiviert. Bitte zuerst den Cloudflare-Worker einrichten (Anleitung in README)."); return; }
  selectedProduct = product;
  document.getElementById("dialog-title").textContent = product.name;
  document.getElementById("reserve-error").textContent = "";
  form.reset(); dialog.showModal();
}
document.getElementById("close-dialog").addEventListener("click", () => dialog.close());
searchEl.addEventListener("input", render);

form.addEventListener("submit", async event => {
  event.preventDefault();
  if (!selectedProduct) return;
  const button = document.getElementById("reserve-submit");
  button.disabled = true; button.textContent = "Wird gespeichert …";
  try {
    const response = await fetch(`${API_BASE}/reservations`, {
      method:"POST", headers:{"Content-Type":"application/json"},
      body:JSON.stringify({productId:selectedProduct.id,name:document.getElementById("reserve-name").value.trim(),note:document.getElementById("reserve-note").value.trim()})
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || "Reservierung fehlgeschlagen.");
    reservations[selectedProduct.id] = {name:document.getElementById("reserve-name").value.trim()};
    dialog.close(); render();
  } catch (error) {
    document.getElementById("reserve-error").textContent = error.message;
  } finally { button.disabled = false; button.textContent = "Verbindlich reservieren"; }
});

loadReservations();

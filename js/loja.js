const products = JSON.parse(document.getElementById("vt-data").textContent);
const byId = (id) => products.find((p) => p.id === id);
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const brl = (n) => n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
const FREE = 299, SHIP = 24.9;
const ico = {
  minus: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="5" y1="12" x2="19" y2="12"/></svg>',
  plus: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>',
  trash: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>'
};
let cart = [];
try {
  cart = JSON.parse(localStorage.getItem("vt-cart") || "[]").filter((i) => products.some((p) => p.id === i.id));
} catch (e) {
}
const save = () => {
  try {
    localStorage.setItem("vt-cart", JSON.stringify(cart));
  } catch (e) {
  }
};
const subtotal = () => cart.reduce((s, i) => s + byId(i.id).price * i.qty, 0);
const count = () => cart.reduce((s, i) => s + i.qty, 0);
const toast = (msg) => {
  const t = $("#vt-toast");
  t.textContent = msg;
  t.classList.add("show");
  clearTimeout(t._t);
  t._t = setTimeout(() => t.classList.remove("show"), 2200);
};
const sizeOf = (id) => $(`.vt-card[data-id="${id}"] .vt-sizes .active`)?.dataset.size || "M";
const add = (id, size = sizeOf(id)) => {
  const ex = cart.find((i) => i.id === id && i.size === size);
  ex ? ex.qty++ : cart.push({ id, size, qty: 1 });
  save();
  renderCart();
};
function renderCart() {
  const n = count(), sub = subtotal();
  const badge = $("#vt-count");
  badge.hidden = n === 0;
  badge.textContent = String(n);
  $("#vt-drawer-count").textContent = n ? `(${n})` : "";
  $("#vt-items").innerHTML = cart.map((i, idx) => {
    const p = byId(i.id);
    return `<li><img src="${p.thumb}" alt="" /><div class="vt-item-info"><b>${p.name}</b><span>Tamanho ${i.size}</span>
            <div class="vt-qty"><button aria-label="Diminuir" data-dec="${idx}">${ico.minus}</button><span>${i.qty}</span><button aria-label="Aumentar" data-inc="${idx}">${ico.plus}</button></div></div>
            <div class="vt-item-right"><b>${brl(p.price * i.qty)}</b><button class="vt-icon" aria-label="Remover ${p.name}" data-rm="${idx}">${ico.trash}</button></div></li>`;
  }).join("");
  $("#vt-empty").hidden = n > 0;
  $("#vt-drawer-foot").hidden = n === 0;
  const missing = FREE - sub;
  $("#vt-ship-bar").innerHTML = n === 0 ? "" : missing > 0 ? `<p>Faltam <b>${brl(missing)}</b> para o <b>frete grátis</b></p><div><span style="width:${sub / FREE * 100}%"></span></div>` : `<p>🎉 Você ganhou <b>frete grátis</b>!</p><div><span style="width:100%"></span></div>`;
  $("#vt-sub").textContent = brl(sub);
  $("#vt-ship").textContent = sub >= FREE ? "Grátis" : brl(SHIP);
  $("#vt-total").textContent = brl(sub + (sub >= FREE ? 0 : SHIP));
}
$("#vt-items").addEventListener("click", (e) => {
  const b = e.target.closest("button");
  if (!b) return;
  const { inc, dec, rm } = b.dataset;
  if (inc) cart[+inc].qty++;
  if (dec) {
    cart[+dec].qty--;
    if (cart[+dec].qty < 1) cart.splice(+dec, 1);
  }
  if (rm) cart.splice(+rm, 1);
  save();
  renderCart();
});
const drawer = $("#vt-drawer"), scrim = $("#vt-scrim");
const openCart = () => {
  drawer.classList.add("open");
  scrim.classList.add("show");
  drawer.setAttribute("aria-hidden", "false");
  document.body.classList.add("lock");
};
const closeCart = () => {
  drawer.classList.remove("open");
  scrim.classList.remove("show");
  drawer.setAttribute("aria-hidden", "true");
  document.body.classList.remove("lock");
};
$("#vt-cart-open").addEventListener("click", openCart);
$("#vt-cart-close").addEventListener("click", closeCart);
scrim.addEventListener("click", closeCart);
$("#vt-empty-go").addEventListener("click", () => {
  closeCart();
  $("#colecao").scrollIntoView({ behavior: "smooth" });
});
$$(".vt-sizes").forEach((g) => g.addEventListener("click", (e) => {
  const b = e.target.closest("button");
  if (!b) return;
  $$("button", g).forEach((x) => {
    x.classList.toggle("active", x === b);
    x.setAttribute("aria-checked", String(x === b));
  });
}));
$$("[data-add]").forEach((b) => b.addEventListener("click", () => {
  const id = b.dataset.add;
  add(id);
  toast(`${byId(id).name} (${sizeOf(id)}) adicionado ao carrinho`);
}));
$$("[data-buy]").forEach((b) => b.addEventListener("click", () => {
  add(b.dataset.buy);
  openCart();
}));
const filter = (cat) => {
  $$(".vt-filters button").forEach((x) => x.classList.toggle("active", x.dataset.cat === cat));
  $$(".vt-card").forEach((c) => c.hidden = cat !== "Todos" && c.dataset.cat !== cat);
};
$$(".vt-filters button").forEach((b) => b.addEventListener("click", () => filter(b.dataset.cat)));
$$("[data-filter-go]").forEach((b) => b.addEventListener("click", () => {
  filter(b.dataset.filterGo);
  $("#colecao").scrollIntoView({ behavior: "smooth" });
}));
const end = /* @__PURE__ */ new Date();
end.setDate(end.getDate() + (7 - end.getDay()) % 7);
end.setHours(23, 59, 59, 0);
const tick = () => {
  let s = Math.max(0, Math.floor((end.getTime() - Date.now()) / 1e3));
  const u = { d: Math.floor(s / 86400), h: Math.floor(s % 86400 / 3600), m: Math.floor(s % 3600 / 60), s: s % 60 };
  Object.keys(u).forEach((k) => $(`[data-u="${k}"]`).textContent = String(u[k]).padStart(2, "0"));
};
tick();
setInterval(tick, 1e3);
$("#vt-checkout-open").addEventListener("click", () => {
  if (!cart.length) return;
  const sub = subtotal(), ship = sub >= FREE ? 0 : SHIP;
  const lines = cart.map((i) => {
    const p = byId(i.id);
    return `• ${i.qty}x ${p.name} (${i.size}) - ${brl(p.price * i.qty)}`;
  });
  const text = [
    "Olá! Quero fazer este pedido na Vértice:",
    "",
    ...lines,
    "",
    `Subtotal: ${brl(sub)}`,
    `Frete: ${ship ? brl(ship) : "Grátis"}`,
    `Total: ${brl(sub + ship)}`
  ].join("\n");
  window.open(`https://wa.me/5511948619558?text=${encodeURIComponent(text)}`, "_blank", "noopener");
});
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") closeCart();
});
renderCart();

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const brl = (n) => n.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: n >= 1e3 ? 0 : 2 });
let seed = 42;
const rnd = () => (seed = seed * 16807 % 2147483647) / 2147483647;
const pick = (a) => a[Math.floor(rnd() * a.length)];
const products = [
  { name: "Jaqueta Corta-Vento", cat: "Jaquetas", price: 289.9, stock: 3 },
  { name: "Moletom Oversized", cat: "Moletons", price: 219.9, stock: 42 },
  { name: "Camiseta Básica Pima", cat: "Camisetas", price: 89.9, stock: 120 },
  { name: "Calça Cargo", cat: "Calças", price: 199.9, stock: 28 },
  { name: "Boné Dad Hat", cat: "Acessórios", price: 79.9, stock: 64 },
  { name: "Camisa Linho", cat: "Camisetas", price: 169.9, stock: 17 },
  { name: "Bermuda Moletom", cat: "Calças", price: 139.9, stock: 9 },
  { name: "Gorro Canelado", cat: "Acessórios", price: 59.9, stock: 51 }
];
const names = ["Mariana Costa", "Pedro Henrique", "Juliana Alves", "Rafael Souza", "Camila Rocha", "Lucas Martins", "Beatriz Lima", "Gabriel Santos", "Larissa Melo", "Thiago Ferreira", "Fernanda Dias", "Bruno Carvalho", "Aline Ribeiro", "Diego Araújo"];
const cities = ["São Paulo - SP", "Campinas - SP", "Rio de Janeiro - RJ", "Belo Horizonte - MG", "Curitiba - PR", "Porto Alegre - RS", "Salvador - BA"];
const statuses = ["Entregue", "Entregue", "Entregue", "Entregue", "Enviado", "Cancelado"];
const pays = ["Cartão de crédito", "Pix", "Pix", "Boleto"];
const now = /* @__PURE__ */ new Date();
const orders = [];
for (let i = 0; i < 1600; i++) {
  const daysAgo = Math.floor(Math.pow(rnd(), 1.3) * 400);
  const date = new Date(now.getTime() - daysAgo * 864e5 - rnd() * 864e5 * 0.9);
  const items = Array.from({ length: 1 + Math.floor(rnd() * 3) }, () => ({ p: pick(products), q: 1 + Math.floor(rnd() * 2) }));
  orders.push({
    id: 0,
    customer: pick(names),
    city: pick(cities),
    date,
    items,
    total: items.reduce((s, it) => s + it.p.price * it.q, 0),
    status: daysAgo < 2 ? pick(["Pago", "Pendente", "Pendente"]) : daysAgo < 7 ? pick(["Pago", "Enviado", "Enviado"]) : pick(statuses),
    pay: pick(pays)
  });
}
orders.sort((a, b) => b.date.getTime() - a.date.getTime());
orders.forEach((o, i) => o.id = 4821 - i);
const inRange = (from, to) => orders.filter((o) => {
  const d = (now.getTime() - o.date.getTime()) / 864e5;
  return d >= from && d < to;
});
const valid = (list) => list.filter((o) => o.status !== "Cancelado");
let period = 7;
const statusClass = (s) => ({ Pago: "paid", Entregue: "ok", Enviado: "info", Pendente: "warn", Cancelado: "bad" })[s];
const fmtDate = (d) => d.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" }).replace(".", "");
function kpis() {
  const cur = valid(inRange(0, period)), prev = valid(inRange(period, period * 2));
  const sum = (l) => l.reduce((s, o) => s + o.total, 0);
  const cust = (l) => new Set(l.map((o) => o.customer)).size;
  const delta = (a, b) => b ? (a - b) / b * 100 : 100;
  const cards = [
    { label: "Receita", icon: "dollar", v: brl(sum(cur)), d: delta(sum(cur), sum(prev)) },
    { label: "Pedidos", icon: "cart", v: cur.length.toString(), d: delta(cur.length, prev.length) },
    { label: "Ticket médio", icon: "chart", v: brl(cur.length ? sum(cur) / cur.length : 0), d: delta(cur.length ? sum(cur) / cur.length : 0, prev.length ? sum(prev) / prev.length : 0) },
    { label: "Clientes ativos", icon: "users", v: cust(cur).toString(), d: delta(cust(cur), cust(prev)) }
  ];
  const icons = {
    dollar: '<line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>',
    cart: '<circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>',
    chart: '<line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/>',
    users: '<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>'
  };
  $("#fx-kpis").innerHTML = cards.map((c) => `
          <article class="fx-card fx-kpi">
            <span class="fx-kpi-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${icons[c.icon]}</svg></span>
            <p>${c.label}</p><strong>${c.v}</strong>
            <span class="fx-delta ${c.d >= 0 ? "up" : "down"}">${c.d >= 0 ? "▲" : "▼"} ${Math.abs(c.d).toFixed(1)}% <small>vs. período anterior</small></span>
          </article>`).join("");
}
function buckets(offset) {
  const n = period === 365 ? 12 : period;
  const out = new Array(n).fill(0);
  valid(orders).forEach((o) => {
    const d = (now.getTime() - o.date.getTime()) / 864e5 - offset;
    if (d < 0 || d >= period) return;
    const idx = period === 365 ? 11 - Math.floor(d / (365 / 12)) : n - 1 - Math.floor(d);
    if (idx >= 0 && idx < n) out[idx] += o.total;
  });
  return out;
}
function labels() {
  if (period === 365) return Array.from({ length: 12 }, (_, i) => new Date(now.getFullYear(), now.getMonth() - 11 + i, 1).toLocaleDateString("pt-BR", { month: "short" }).replace(".", ""));
  return Array.from({ length: period }, (_, i) => {
    const d = new Date(now.getTime() - (period - 1 - i) * 864e5);
    return period === 7 ? d.toLocaleDateString("pt-BR", { weekday: "short" }).replace(".", "") : String(d.getDate());
  });
}
function chart() {
  const cur = buckets(0), prev = buckets(period), lab = labels();
  const W = 640, H = 240, P = { l: 48, r: 12, t: 12, b: 28 };
  const max = Math.max(...cur, ...prev, 1) * 1.15;
  const x = (i) => P.l + i * (W - P.l - P.r) / Math.max(cur.length - 1, 1);
  const y = (v) => P.t + (H - P.t - P.b) * (1 - v / max);
  const line = (a) => a.map((v, i) => `${i ? "L" : "M"}${x(i).toFixed(1)},${y(v).toFixed(1)}`).join(" ");
  const grid = [0, 0.25, 0.5, 0.75, 1].map((f) => {
    const v = max * f;
    const yy = y(v);
    return `<line x1="${P.l}" x2="${W - P.r}" y1="${yy}" y2="${yy}" class="g"/><text x="${P.l - 8}" y="${yy + 4}" text-anchor="end">${v >= 1e3 ? (v / 1e3).toLocaleString("pt-BR", { maximumFractionDigits: 1 }) + "k" : v.toFixed(0)}</text>`;
  }).join("");
  const step = Math.ceil(lab.length / 10);
  const xl = lab.map((l, i) => i % step === 0 || i === lab.length - 1 ? `<text x="${x(i)}" y="${H - 8}" text-anchor="middle">${l}</text>` : "").join("");
  const dots = cur.map((v, i) => `<circle cx="${x(i)}" cy="${y(v)}" r="10" class="hit" data-i="${i}"/>`).join("");
  $("#fx-chart").innerHTML = `
          <svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Gráfico de receita">
            <defs><linearGradient id="fxg" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#6366f1" stop-opacity=".35"/><stop offset="1" stop-color="#6366f1" stop-opacity="0"/></linearGradient></defs>
            ${grid}${xl}
            <path d="${line(cur)} L${x(cur.length - 1)},${H - P.b} L${x(0)},${H - P.b} Z" fill="url(#fxg)"/>
            <path d="${line(prev)}" class="prev"/>
            <path d="${line(cur)}" class="cur"/>
            <line class="cursor" y1="${P.t}" y2="${H - P.b}" x1="0" x2="0" style="display:none"/>
            <circle class="cursor-dot" r="5" style="display:none"/>
            ${dots}
          </svg>
          <div class="fx-tip" hidden></div>`;
  $("#fx-chart-sub").textContent = period === 365 ? "Últimos 12 meses" : `Últimos ${period} dias`;
  const svg = $("#fx-chart svg"), tip = $("#fx-chart .fx-tip");
  const cursor = $(".cursor", svg), cdot = $(".cursor-dot", svg);
  $$(".hit", svg).forEach((c) => {
    const show = () => {
      const i = Number(c.getAttribute("data-i"));
      cursor.setAttribute("x1", String(x(i)));
      cursor.setAttribute("x2", String(x(i)));
      cursor.style.display = "";
      cdot.setAttribute("cx", String(x(i)));
      cdot.setAttribute("cy", String(y(cur[i])));
      cdot.style.display = "";
      tip.hidden = false;
      tip.innerHTML = `<strong>${lab[i]}</strong>${brl(cur[i])}<small>Anterior: ${brl(prev[i])}</small>`;
      tip.style.left = `${x(i) / W * 100}%`;
      tip.style.top = `${y(cur[i]) / H * 100}%`;
    };
    c.addEventListener("mouseenter", show);
    c.addEventListener("click", show);
  });
  svg.addEventListener("mouseleave", () => {
    tip.hidden = true;
    cursor.style.display = "none";
    cdot.style.display = "none";
  });
}
const catColors = { Jaquetas: "#6366f1", Moletons: "#22c55e", Camisetas: "#f59e0b", Calças: "#ec4899", Acessórios: "#06b6d4" };
function donut() {
  const list = valid(inRange(0, period));
  const by = {};
  list.forEach((o) => o.items.forEach((it) => by[it.p.cat] = (by[it.p.cat] || 0) + it.p.price * it.q));
  const total = Object.values(by).reduce((a, b) => a + b, 0) || 1;
  const entries = Object.entries(by).sort((a, b) => b[1] - a[1]);
  let acc = 0;
  const C = 2 * Math.PI * 46;
  $("#fx-donut").innerHTML = `<circle cx="60" cy="60" r="46" fill="none" stroke="var(--fx-line)" stroke-width="14"/>` + entries.map(([k, v]) => {
    const len = v / total * C;
    const s = `<circle cx="60" cy="60" r="46" fill="none" stroke="${catColors[k]}" stroke-width="14" stroke-dasharray="${len} ${C - len}" stroke-dashoffset="${-acc}" transform="rotate(-90 60 60)"/>`;
    acc += len;
    return s;
  }).join("");
  $("#fx-donut-total").textContent = String(list.length);
  $("#fx-cats").innerHTML = entries.map(([k, v]) => `<li><span style="background:${catColors[k]}"></span>${k}<b>${(v / total * 100).toFixed(0)}%</b></li>`).join("");
}
const row = (o) => `<tr data-id="${o.id}" tabindex="0"><td><b>#${o.id}</b></td><td><div class="fx-cust"><span>${o.customer.split(" ").map((p) => p[0]).join("")}</span>${o.customer}</div></td><td>${fmtDate(o.date)}</td><td>${brl(o.total)}</td><td><span class="fx-status ${statusClass(o.status)}">${o.status}</span></td></tr>`;
const head = "<thead><tr><th>Pedido</th><th>Cliente</th><th>Data</th><th>Total</th><th>Status</th></tr></thead>";
function recent() {
  $("#fx-recent").innerHTML = head + "<tbody>" + orders.slice(0, 6).map(row).join("") + "</tbody>";
}
function topProducts() {
  const by = {};
  valid(inRange(0, period)).forEach((o) => o.items.forEach((it) => by[it.p.name] = (by[it.p.name] || 0) + it.q));
  const e = Object.entries(by).sort((a, b) => b[1] - a[1]).slice(0, 5);
  const max = e[0]?.[1] || 1;
  $("#fx-top-products").innerHTML = e.map(([n, q]) => `<li><div><span>${n}</span><b>${q} un.</b></div><div class="fx-bar"><span style="width:${q / max * 100}%"></span></div></li>`).join("");
}
function goal() {
  const m = valid(orders).filter((o) => o.date.getMonth() === now.getMonth() && o.date.getFullYear() === now.getFullYear()).reduce((s, o) => s + o.total, 0);
  const g = 1e5, pct = Math.min(100, m / g * 100);
  $("#fx-goal-text").textContent = `${brl(m)} de R$ 100 mil (${pct.toFixed(0)}%)`;
  $("#fx-goal-bar").style.width = pct + "%";
  $("#fx-note-goal").innerHTML = `<b>Meta do mês</b> Você já atingiu ${pct.toFixed(0)}% da meta`;
  $("#fx-note-order").innerHTML = `<b>Novo pedido</b> #${orders[0].id} de ${orders[0].customer} · ${brl(orders[0].total)}`;
}
const renderOverview = () => {
  kpis();
  chart();
  donut();
  topProducts();
};
$$("[data-period]").forEach((b) => b.addEventListener("click", () => {
  period = Number(b.dataset.period);
  $$("[data-period]").forEach((x) => x.classList.toggle("active", x === b));
  renderOverview();
}));
let statusFilter = "all", query = "";
function renderOrders() {
  const q = query.toLowerCase();
  const list = orders.filter((o) => (statusFilter === "all" || o.status === statusFilter) && (!q || `#${o.id} ${o.customer} ${o.city} ${o.items.map((i) => i.p.name).join(" ")}`.toLowerCase().includes(q)));
  $("#fx-orders").innerHTML = head + "<tbody>" + list.slice(0, 60).map(row).join("") + "</tbody>";
  $("#fx-orders-empty").hidden = list.length > 0;
  $("#fx-orders-count").textContent = `${list.length} pedido${list.length === 1 ? "" : "s"}${list.length > 60 ? " · mostrando os 60 mais recentes" : ""}`;
}
$$("#fx-status-filter button").forEach((b) => b.addEventListener("click", () => {
  statusFilter = b.dataset.status;
  $$("#fx-status-filter button").forEach((x) => x.classList.toggle("active", x === b));
  renderOrders();
}));
$("#fx-pending-badge").textContent = String(orders.filter((o) => o.status === "Pendente").length);
function renderProducts() {
  const sold = {};
  valid(inRange(0, 30)).forEach((o) => o.items.forEach((it) => sold[it.p.name] = (sold[it.p.name] || 0) + it.q));
  $("#fx-products").innerHTML = products.map((p) => `
          <article class="fx-card fx-product">
            <span class="fx-cat" style="--c:${catColors[p.cat]}">${p.cat}</span>
            <h3>${p.name}</h3>
            <strong>${brl(p.price)}</strong>
            <div class="fx-product-meta"><span>Estoque <b class="${p.stock < 10 ? "low" : ""}">${p.stock} un.</b></span><span>Vendidos (30d) <b>${sold[p.name] || 0}</b></span></div>
            ${p.stock < 10 ? '<p class="fx-alert">Estoque baixo: reponha em breve</p>' : ""}
          </article>`).join("");
}
function renderCustomers() {
  const by = {};
  valid(orders).forEach((o) => {
    const c = by[o.customer] ||= { n: 0, t: 0, city: o.city, last: o.date };
    c.n++;
    c.t += o.total;
    if (o.date > c.last) c.last = o.date;
  });
  $("#fx-customers").innerHTML = "<thead><tr><th>Cliente</th><th>Cidade</th><th>Pedidos</th><th>Total gasto</th><th>Última compra</th></tr></thead><tbody>" + Object.entries(by).sort((a, b) => b[1].t - a[1].t).map(([n, c]) => `<tr><td><div class="fx-cust"><span>${n.split(" ").map((p) => p[0]).join("")}</span>${n}</div></td><td>${c.city}</td><td>${c.n}</td><td><b>${brl(c.t)}</b></td><td>${fmtDate(c.last)}</td></tr>`).join("") + "</tbody>";
}
const side = $("#fx-side"), overlay = $("#fx-overlay");
const go = (view) => {
  $$(".fx-view").forEach((v) => v.classList.toggle("active", v.dataset.view === view));
  $$(".fx-menu-item").forEach((m) => m.classList.toggle("active", m.dataset.view === view));
  side.classList.remove("open");
  overlay.classList.remove("show");
  scrollTo({ top: 0 });
};
$$(".fx-menu-item").forEach((m) => m.addEventListener("click", () => go(m.dataset.view)));
$$("[data-goto]").forEach((b) => b.addEventListener("click", () => go(b.dataset.goto)));
$("#fx-burger").addEventListener("click", () => {
  side.classList.add("open");
  overlay.classList.add("show");
});
overlay.addEventListener("click", () => {
  side.classList.remove("open");
  overlay.classList.remove("show");
});
$("#fx-search").addEventListener("input", (e) => {
  query = e.target.value.trim();
  if (query && !$('[data-view="orders"].fx-view').classList.contains("active")) go("orders");
  renderOrders();
});
const bell = $("#fx-bell"), notes = $("#fx-notes");
bell.addEventListener("click", (e) => {
  e.stopPropagation();
  notes.hidden = !notes.hidden;
  bell.classList.add("seen");
});
document.addEventListener("click", (e) => {
  if (!notes.contains(e.target)) notes.hidden = true;
});
const modal = $("#fx-modal");
document.addEventListener("click", (e) => {
  const tr = e.target.closest("tr[data-id]");
  if (tr) openOrder(Number(tr.dataset.id));
});
document.addEventListener("keydown", (e) => {
  const tr = e.target.closest?.("tr[data-id]");
  if (tr && e.key === "Enter") openOrder(Number(tr.dataset.id));
  if (e.key === "Escape") modal.hidden = true;
});
function openOrder(id) {
  const o = orders.find((x) => x.id === id);
  $("#fx-modal-body").innerHTML = `
          <p class="fx-muted">Pedido</p>
          <h2 id="fx-modal-title">#${o.id} <span class="fx-status ${statusClass(o.status)}">${o.status}</span></h2>
          <div class="fx-modal-info">
            <div><span>Cliente</span><b>${o.customer}</b></div>
            <div><span>Cidade</span><b>${o.city}</b></div>
            <div><span>Data</span><b>${o.date.toLocaleDateString("pt-BR")} às ${o.date.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}</b></div>
            <div><span>Pagamento</span><b>${o.pay}</b></div>
          </div>
          <ul class="fx-modal-items">${o.items.map((it) => `<li><span>${it.q}× ${it.p.name}</span><b>${brl(it.p.price * it.q)}</b></li>`).join("")}</ul>
          <div class="fx-modal-total"><span>Total</span><b>${brl(o.total)}</b></div>`;
  modal.hidden = false;
  $("#fx-modal-close").focus();
}
$("#fx-modal-close").addEventListener("click", () => modal.hidden = true);
modal.addEventListener("click", (e) => {
  if (e.target === modal) modal.hidden = true;
});
renderOverview();
recent();
goal();
renderOrders();
renderProducts();
renderCustomers();
addEventListener("resize", () => chart());

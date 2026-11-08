const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const header = $("#nc-header");
addEventListener("scroll", () => header.classList.toggle("solid", scrollY > 40), { passive: true });
const menu = $("#nc-menu");
menu.addEventListener("click", () => {
  const open = header.classList.toggle("open");
  menu.setAttribute("aria-expanded", String(open));
});
$$("#nc-nav a").forEach((a) => a.addEventListener("click", () => header.classList.remove("open")));
const state = {};
let step = 1;
const panes = $$(".nc-pane");
const stepsEl = $$("#nc-steps li");
const next = $("#nc-next");
const back = $("#nc-back");
const nav = $("#nc-book-nav");
const valid = () => step === 1 ? !!state.service : step === 2 ? !!state.barber : step === 3 ? !!state.time : true;
const render = () => {
  panes.forEach((p) => p.classList.toggle("active", Number(p.dataset.step) === step));
  stepsEl.forEach((li, i) => {
    li.classList.toggle("active", i + 1 === step);
    li.classList.toggle("done", i + 1 < step);
  });
  nav.hidden = step === 5;
  back.disabled = step === 1;
  next.disabled = !valid();
  next.innerHTML = step === 4 ? "Confirmar agendamento" : 'Continuar <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>';
  if (step === 3) buildTimes();
  if (step === 4) $("#nc-summary").innerHTML = summary();
};
const summary = () => `
        <div><span>Serviço</span><strong>${state.service?.label}</strong></div>
        <div><span>Barbeiro</span><strong>${state.barber?.label}</strong></div>
        <div><span>Quando</span><strong>${state.dayLabel}, às ${state.time}</strong></div>
        <div><span>Duração</span><strong>${state.service?.time} min</strong></div>
        <div class="total"><span>Total no local</span><strong>R$ ${state.service?.price},00</strong></div>`;
$$(".nc-options").forEach((group) => {
  group.addEventListener("click", (e) => {
    const btn = e.target.closest(".nc-opt");
    if (!btn) return;
    $$(".nc-opt", group).forEach((b) => b.classList.toggle("selected", b === btn));
    if (group.dataset.group === "service") state.service = { ...btn.dataset };
    else {
      state.barber = { ...btn.dataset };
      state.time = void 0;
    }
    next.disabled = !valid();
  });
});
const select = (group, value) => {
  const btn = $(`[data-group="${group}"] [data-value="${value}"]`);
  btn?.click();
};
$$("[data-pick-service]").forEach((a) => a.addEventListener("click", () => {
  select("service", a.dataset.pickService);
  step = 1;
  render();
}));
$$("[data-pick-barber]").forEach((a) => a.addEventListener("click", () => {
  select("barber", a.dataset.pickBarber);
  step = state.service ? 2 : 1;
  render();
}));
const daysEl = $("#nc-days");
const timesEl = $("#nc-times");
const wd = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
const full = ["domingo", "segunda", "terça", "quarta", "quinta", "sexta", "sábado"];
const days = [];
for (let d = /* @__PURE__ */ new Date(), n = 0; days.length < 8 && n < 14; n++) {
  const date = new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);
  if (date.getDay() === 0 || date.getDay() === 1) continue;
  days.push({ key: date.toISOString().slice(0, 10), date });
}
daysEl.innerHTML = days.map((d, i) => `<button type="button" class="nc-day${i === 0 ? " selected" : ""}" data-key="${d.key}" data-i="${i}">
          <small>${i === 0 && d.date.toDateString() === (/* @__PURE__ */ new Date()).toDateString() ? "Hoje" : wd[d.date.getDay()]}</small>
          <strong>${String(d.date.getDate()).padStart(2, "0")}</strong>
          <small>${d.date.toLocaleDateString("pt-BR", { month: "short" }).replace(".", "")}</small></button>`).join("");
const setDay = (i) => {
  const d = days[i];
  state.day = d.key;
  state.dayLabel = `${full[d.date.getDay()]}, ${d.date.toLocaleDateString("pt-BR", { day: "2-digit", month: "long" })}`;
  state.time = void 0;
  $$(".nc-day", daysEl).forEach((b, j) => b.classList.toggle("selected", j === i));
  buildTimes();
  next.disabled = !valid();
};
daysEl.addEventListener("click", (e) => {
  const b = e.target.closest(".nc-day");
  if (b) setDay(Number(b.dataset.i));
});
function freeCount() {
  buildTimesRaw();
  return timesEl.querySelectorAll(".nc-time:not(.taken)").length;
}
const hash = (s) => [...s].reduce((h, c) => h * 31 + c.charCodeAt(0) >>> 0, 7);
function buildTimes() {
  if (!state.day) {
    const first = days.findIndex((x) => {
      state.day = x.key;
      return freeCount() > 0;
    });
    state.day = void 0;
    return setDay(Math.max(0, first));
  }
  buildTimesRaw();
}
function buildTimesRaw() {
  const d = days.find((x) => x.key === state.day).date;
  const sat = d.getDay() === 6;
  const [start, end] = sat ? [9, 18] : [10, 20];
  const now = /* @__PURE__ */ new Date();
  const slots = [];
  for (let h = start; h < end; h++) for (const m of [0, 30]) slots.push(`${String(h).padStart(2, "0")}:${m ? "30" : "00"}`);
  const seed = hash(state.day + (state.barber?.value ?? ""));
  timesEl.innerHTML = slots.map((t, i) => {
    const [h, m] = t.split(":").map(Number);
    const past = d.toDateString() === now.toDateString() && (h < now.getHours() + 1 || h === now.getHours() + 1 && m < now.getMinutes());
    const taken = past || (seed >> i % 24) % 3 === 0;
    return `<button type="button" class="nc-time${taken ? " taken" : ""}${state.time === t ? " selected" : ""}" ${taken ? 'disabled aria-label="' + t + ' ocupado"' : ""} data-t="${t}">${t}</button>`;
  }).join("");
  if (!timesEl.querySelector(".nc-time:not(.taken)")) timesEl.innerHTML = '<p class="nc-muted nc-empty">Sem horários livres neste dia. Escolha outra data.</p>';
}
timesEl.addEventListener("click", (e) => {
  const b = e.target.closest(".nc-time");
  if (!b || b.disabled) return;
  state.time = b.dataset.t;
  $$(".nc-time", timesEl).forEach((x) => x.classList.toggle("selected", x === b));
  next.disabled = !valid();
});
const form = $("#nc-form");
const phone = $('[name="phone"]', form);
phone.addEventListener("input", () => {
  const v = phone.value.replace(/\D/g, "").slice(0, 11);
  phone.value = v.length > 6 ? `(${v.slice(0, 2)}) ${v.slice(2, v.length - 4)}-${v.slice(-4)}` : v.length > 2 ? `(${v.slice(0, 2)}) ${v.slice(2)}` : v;
});
$$("input", form).forEach((i) => i.addEventListener("input", () => i.parentElement.classList.remove("invalid")));
const confirm = () => {
  const name = $('[name="name"]', form);
  const okName = name.value.trim().length >= 2;
  const okPhone = phone.value.replace(/\D/g, "").length >= 10;
  name.parentElement.classList.toggle("invalid", !okName);
  phone.parentElement.classList.toggle("invalid", !okPhone);
  if (!okName) return name.focus();
  if (!okPhone) return phone.focus();
  next.disabled = true;
  next.innerHTML = '<span class="nc-spin"></span> Confirmando...';
  setTimeout(() => {
    $("#nc-done-text").textContent = `${name.value.trim().split(" ")[0]}, te esperamos! Enviamos a confirmação para ${phone.value}.`;
    $("#nc-done-summary").innerHTML = summary();
    step = 5;
    render();
    $("#agendar").scrollIntoView({ behavior: "smooth" });
  }, 1200);
};
next.addEventListener("click", () => {
  if (!valid()) return;
  if (step === 4) return confirm();
  step++;
  render();
});
back.addEventListener("click", () => {
  if (step > 1) {
    step--;
    render();
  }
});
$("#nc-again").addEventListener("click", () => {
  Object.keys(state).forEach((k) => delete state[k]);
  $$(".nc-opt").forEach((b) => b.classList.remove("selected"));
  form.reset();
  step = 1;
  render();
});
render();

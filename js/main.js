const contact = {
  whatsapp: "5511948619558"};

const root = document.documentElement;
document.getElementById("theme-toggle")?.addEventListener("click", () => {
  const next = root.dataset.theme === "light" ? "dark" : "light";
  root.dataset.theme = next;
  try {
    localStorage.setItem("theme", next);
  } catch (e) {
  }
});
const menuBtn = document.getElementById("menu-btn");
const setMenu = (open) => {
  document.body.classList.toggle("menu-open", open);
  menuBtn.setAttribute("aria-expanded", String(open));
  menuBtn.setAttribute("aria-label", open ? "Fechar menu" : "Abrir menu");
};
menuBtn.addEventListener("click", () => setMenu(!document.body.classList.contains("menu-open")));
document.querySelectorAll("#nav a").forEach((a) => a.addEventListener("click", () => setMenu(false)));
window.addEventListener("keydown", (e) => e.key === "Escape" && setMenu(false));
const header = document.getElementById("header");
const toTop = document.getElementById("to-top");
const links = [...document.querySelectorAll(".nav-link")];
const sections = links.map((l) => document.querySelector(l.hash)).filter(Boolean);
const onScroll = () => {
  const y = window.scrollY;
  header.classList.toggle("scrolled", y > 10);
  toTop.classList.toggle("show", y > 600);
  let current = sections[0]?.id;
  for (const s of sections) if (s.offsetTop - 140 <= y) current = s.id;
  links.forEach((l) => l.classList.toggle("active", l.hash === `#${current}`));
};
window.addEventListener("scroll", onScroll, { passive: true });
onScroll();
const typed = document.getElementById("typed");
const words = ["sites", "landing pages", "sistemas web", "suas ideias"];
if (typed && !matchMedia("(prefers-reduced-motion: reduce)").matches) {
  let w = 0, c = words[0].length, del = true;
  const tick = () => {
    const word = words[w];
    c += del ? -1 : 1;
    typed.textContent = word.slice(0, c);
    let wait = del ? 45 : 90;
    if (!del && c === word.length) {
      del = true;
      wait = 1800;
    } else if (del && c === 0) {
      del = false;
      w = (w + 1) % words.length;
      wait = 300;
    }
    setTimeout(tick, wait);
  };
  setTimeout(tick, 1800);
}
const io = new IntersectionObserver(
  (entries) => entries.forEach((e) => {
    if (e.isIntersecting) {
      e.target.classList.add("in");
      io.unobserve(e.target);
    }
  }),
  { threshold: 0.12 }
);
document.querySelectorAll(".reveal").forEach((el) => io.observe(el));
const cio = new IntersectionObserver((entries) => entries.forEach((e) => {
  if (!e.isIntersecting) return;
  const el = e.target;
  const end = Number(el.dataset.count);
  const suf = el.dataset.suffix ?? "";
  const t0 = performance.now();
  const step = (t) => {
    const p = Math.min((t - t0) / 1200, 1);
    el.textContent = Math.round(end * (1 - Math.pow(1 - p, 3))) + suf;
    if (p < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
  cio.unobserve(el);
}), { threshold: 0.6 });
document.querySelectorAll("[data-count]").forEach((el) => cio.observe(el));
document.querySelectorAll("[data-carousel]").forEach((car) => {
  const track = car.querySelector("[data-track]");
  const slides = [...car.querySelectorAll("[data-slide]")];
  const dots = [...car.querySelectorAll("[data-dot]")];
  const prev = car.querySelector("[data-prev]");
  const next = car.querySelector("[data-next]");
  const index = () => {
    const x = track.scrollLeft;
    let best = 0, dist = Infinity;
    slides.forEach((s, i) => {
      const d = Math.abs(s.offsetLeft - track.offsetLeft - x);
      if (d < dist) {
        dist = d;
        best = i;
      }
    });
    return best;
  };
  const go = (i) => {
    const s = slides[Math.max(0, Math.min(slides.length - 1, i))];
    track.scrollTo({ left: s.offsetLeft - track.offsetLeft, behavior: "smooth" });
  };
  const update = () => {
    const max = track.scrollWidth - track.clientWidth - 4;
    const i = track.scrollLeft >= max ? slides.length - 1 : index();
    dots.forEach((d, j) => d.classList.toggle("active", j === i));
    prev.disabled = track.scrollLeft <= 4;
    next.disabled = track.scrollLeft >= max;
  };
  prev.addEventListener("click", () => go(index() - 1));
  next.addEventListener("click", () => go(index() + 1));
  dots.forEach((d) => d.addEventListener("click", () => go(Number(d.dataset.dot))));
  track.addEventListener("scroll", () => requestAnimationFrame(update), { passive: true });
  window.addEventListener("resize", update);
  update();
  let down = false, startX = 0, startLeft = 0, moved = false;
  track.addEventListener("pointerdown", (e) => {
    if (e.pointerType !== "mouse") return;
    down = true;
    moved = false;
    startX = e.clientX;
    startLeft = track.scrollLeft;
    track.classList.add("dragging");
  });
  window.addEventListener("pointermove", (e) => {
    if (!down) return;
    const dx = e.clientX - startX;
    if (Math.abs(dx) > 5) moved = true;
    track.scrollLeft = startLeft - dx;
  });
  window.addEventListener("pointerup", () => {
    if (!down) return;
    down = false;
    track.classList.remove("dragging");
    go(index());
  });
  track.addEventListener("click", (e) => {
    if (moved) {
      e.preventDefault();
      e.stopPropagation();
      moved = false;
    }
  }, true);
  track.addEventListener("dragstart", (e) => e.preventDefault());
});
document.querySelectorAll(".skill").forEach(
  (b) => b.addEventListener("click", () => b.classList.toggle("flipped"))
);
const form = document.getElementById("contact-form");
const note = document.getElementById("form-note");
form.addEventListener("submit", (e) => {
  e.preventDefault();
  let ok = true;
  form.querySelectorAll("input, textarea").forEach((f) => {
    const valid = f.value.trim() !== "" && f.checkValidity();
    f.closest(".field").classList.toggle("invalid", !valid);
    if (!valid && ok) {
      f.focus();
      ok = false;
    }
  });
  if (!ok) {
    note.textContent = "";
    return;
  }
  const d = new FormData(form);
  const text = `Olá, Isa! Vim pelo seu portfólio.

*Nome:* ${d.get("name")}
*E-mail:* ${d.get("email")}
*Serviço:* ${d.get("service")}

${d.get("message")}`;
  window.open(`https://wa.me/${contact.whatsapp}?text=${encodeURIComponent(text)}`, "_blank", "noopener");
  note.textContent = "Tudo certo! Abrimos o WhatsApp com sua mensagem pronta para enviar.";
  form.reset();
});
form.querySelectorAll("input, textarea").forEach(
  (f) => f.addEventListener("input", () => f.closest(".field").classList.remove("invalid"))
);

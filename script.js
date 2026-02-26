const WHATSAPP_NUMBER_E164 = "919876543210"; // replace with your number (no +)

function $(sel, root = document) {
  return root.querySelector(sel);
}

function $all(sel, root = document) {
  return Array.from(root.querySelectorAll(sel));
}

function formatReservationMessage({ name, phone, date, time, guests, notes }) {
  const lines = [
    "Hi La Dolce Brew!",
    "",
    "I'd like to reserve a table:",
    `- Name: ${name}`,
    `- Phone: ${phone}`,
    `- Date: ${date}`,
    `- Time: ${time}`,
    `- Guests: ${guests}`,
  ];

  const trimmedNotes = (notes ?? "").trim();
  if (trimmedNotes) lines.push(`- Notes: ${trimmedNotes}`);

  lines.push("", "Thanks!");
  return lines.join("\n");
}

function toWhatsAppUrl(message) {
  const encoded = encodeURIComponent(message);
  return `https://wa.me/${WHATSAPP_NUMBER_E164}?text=${encoded}`;
}

function wireMobileNav() {
  const toggle = $("[data-nav-toggle]");
  const menu = $("[data-nav-menu]");
  if (!toggle || !menu) return;

  const close = () => {
    menu.classList.remove("is-open");
    toggle.setAttribute("aria-expanded", "false");
  };

  const open = () => {
    menu.classList.add("is-open");
    toggle.setAttribute("aria-expanded", "true");
  };

  toggle.addEventListener("click", () => {
    const isOpen = menu.classList.contains("is-open");
    if (isOpen) close();
    else open();
  });

  document.addEventListener("click", (e) => {
    if (!menu.classList.contains("is-open")) return;
    const t = e.target;
    if (t instanceof Element && (menu.contains(t) || toggle.contains(t))) return;
    close();
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") close();
  });

  $all('a[href^="#"]', menu).forEach((a) => {
    a.addEventListener("click", () => close());
  });
}

function wireGalleryDialog() {
  const dialog = $("[data-gallery-dialog]");
  const closeBtn = $("[data-dialog-close]");
  const titleEl = $("[data-dialog-title]");
  const media = $("[data-dialog-media]");
  const tiles = $all("[data-gallery-item]");

  if (!(dialog instanceof HTMLDialogElement) || !titleEl || !media || tiles.length === 0) return;

  const setVariant = (variant) => {
    media.className = "dialog-media";
    if (variant) media.classList.add(variant);
  };

  tiles.forEach((tile) => {
    tile.addEventListener("click", () => {
      const title = tile.getAttribute("data-title") || "Preview";
      titleEl.textContent = title;

      const art = $(".gallery-art", tile);
      const variant = art?.classList ? Array.from(art.classList).find((c) => /^g[1-4]$/.test(c)) : null;
      setVariant(variant);

      dialog.showModal();
    });
  });

  closeBtn?.addEventListener("click", () => dialog.close());

  dialog.addEventListener("click", (e) => {
    const rect = dialog.getBoundingClientRect();
    const inDialog =
      rect.top <= e.clientY && e.clientY <= rect.bottom && rect.left <= e.clientX && e.clientX <= rect.right;
    if (!inDialog) dialog.close();
  });
}

function wireReservationForm() {
  const form = $("[data-reserve-form]");
  const copyBtn = $("[data-copy-message]");
  if (!(form instanceof HTMLFormElement)) return;

  const build = () => {
    const fd = new FormData(form);
    const payload = {
      name: String(fd.get("name") || "").trim(),
      phone: String(fd.get("phone") || "").trim(),
      date: String(fd.get("date") || ""),
      time: String(fd.get("time") || ""),
      guests: String(fd.get("guests") || ""),
      notes: String(fd.get("notes") || ""),
    };
    return formatReservationMessage(payload);
  };

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const message = build();
    window.open(toWhatsAppUrl(message), "_blank", "noopener,noreferrer");
  });

  copyBtn?.addEventListener("click", async () => {
    const message = build();
    try {
      await navigator.clipboard.writeText(message);
      copyBtn.textContent = "Copied!";
      window.setTimeout(() => (copyBtn.textContent = "Copy message"), 1200);
    } catch {
      // Clipboard might be blocked in some browsers for file:// pages
      alert(message);
    }
  });
}

function setYear() {
  const y = new Date().getFullYear();
  $all("[data-year]").forEach((el) => (el.textContent = String(y)));
}

setYear();
wireMobileNav();
wireGalleryDialog();
wireReservationForm();

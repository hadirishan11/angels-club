(function () {
  const S = window.STORE;
  const $ = s => document.querySelector(s);
  const money = n => S.currencySymbol + n.toLocaleString("en-US");
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const byId = id => S.products.find(p => p.id === id);

  // ── Static content ────────────────────────────────────────
  $("#announce").textContent = `Complimentary shipping on orders over ${money(S.freeShippingOver)}`;
  $("#heroArt").innerHTML = frameArt("boss", "Black");
  $("#bespokeArt").innerHTML = frameArt("legacy", "Gold", "A. Morgan");
  $("#year").textContent = new Date().getFullYear();
  $("#igLink").href = `https://instagram.com/${S.instagram}`;
  $("#ttLink").href = `https://tiktok.com/@${S.tiktok}`;
  $("#footerContact").innerHTML = `<a href="mailto:${esc(S.email)}">${esc(S.email)}</a> · @${esc(S.instagram)}`;

  $("#productGrid").innerHTML = S.products.map(p => `
    <article class="card">
      <button class="card-art" data-open="${p.id}" aria-label="View ${esc(p.name)}">
        ${p.badge ? `<span class="badge">${esc(p.badge)}</span>` : ""}
        ${frameArt(p.art, "Black")}
      </button>
      <div class="card-body">
        <h3>${esc(p.name)}</h3>
        <p class="muted">${esc(p.tagline)}</p>
        <div class="card-foot">
          <span class="price">${money(p.price)}</span>
          <button class="btn btn-ghost sm" data-open="${p.id}">View</button>
        </div>
      </div>
    </article>`).join("");

  $("#faqList").innerHTML = S.faq.map(([q, a]) => `
    <details><summary>${esc(q)}</summary><p>${esc(a)}</p></details>`).join("");

  // ── Cart state ────────────────────────────────────────────
  let cart = [];
  try { cart = JSON.parse(localStorage.getItem("pv-cart")) || []; } catch (e) {}
  const save = () => { try { localStorage.setItem("pv-cart", JSON.stringify(cart)); } catch (e) {} };
  const total = () => cart.reduce((s, i) => s + byId(i.id).price * i.qty, 0);

  function renderCart() {
    cart = cart.filter(i => byId(i.id));
    $("#cartCount").textContent = cart.reduce((s, i) => s + i.qty, 0);
    $("#cartItems").innerHTML = cart.length ? cart.map((i, idx) => {
      const p = byId(i.id);
      return `
      <div class="line">
        <div class="line-art">${frameArt(p.art, i.frame, i.personal)}</div>
        <div class="line-info">
          <h4>${esc(p.name)}</h4>
          <p class="muted small">${esc(i.frame)} frame${i.personal ? ` · “${esc(i.personal)}”` : ""}</p>
          <div class="qty sm">
            <button data-dec="${idx}" aria-label="Decrease">−</button><span>${i.qty}</span><button data-inc="${idx}" aria-label="Increase">+</button>
          </div>
        </div>
        <div class="line-price">${money(p.price * i.qty)}<button class="link" data-rm="${idx}">Remove</button></div>
      </div>`;
    }).join("") : `<div class="empty"><img src="assets/crest.svg" alt="" width="44"><p>Your vault is empty.</p></div>`;

    const t = total();
    $("#cartTotal").textContent = money(t);
    const left = S.freeShippingOver - t;
    $("#shipProgress").textContent = !cart.length ? "" :
      left > 0 ? `You're ${money(left)} away from complimentary shipping.` : "Complimentary shipping unlocked.";
    $("#checkout").disabled = !cart.length;
    $("#checkoutNote").textContent = cart.length ? S.shippingNote : "";
    save();
  }

  // ── Product modal ─────────────────────────────────────────
  const modal = $("#productModal");
  let current = null, qty = 1, frame = S.frames[0];

  function drawModalArt() {
    $("#pmArt").innerHTML = frameArt(current.art, frame, $("#pmPersonal").value.trim());
  }

  function openProduct(id) {
    current = byId(id); qty = 1; frame = S.frames[0];
    $("#pmName").textContent = current.name;
    $("#pmTagline").textContent = current.tagline;
    $("#pmPrice").textContent = money(current.price);
    $("#pmDesc").textContent = current.description;
    $("#pmIncludes").innerHTML = current.includes.map(x => `<li>${esc(x)}</li>`).join("");
    $("#pmQty").textContent = qty;
    $("#pmPersonal").value = "";
    $("#pmPersonal").required = current.personalize;
    $("#pmPersonalWrap").hidden = !current.personalize;
    $("#pmShip").textContent = S.shippingNote;
    $("#pmFrames").innerHTML = S.frames.map(f => `
      <label class="swatch"><input type="radio" name="frame" value="${f}" ${f === frame ? "checked" : ""}>
      <span class="dot ${f.toLowerCase()}"></span>${f}</label>`).join("");
    drawModalArt();
    modal.showModal();
  }

  $("#pmFrames").addEventListener("change", e => { frame = e.target.value; drawModalArt(); });
  $("#pmPersonal").addEventListener("input", drawModalArt);
  $("#pmMinus").onclick = () => { qty = Math.max(1, qty - 1); $("#pmQty").textContent = qty; };
  $("#pmPlus").onclick = () => { qty = Math.min(10, qty + 1); $("#pmQty").textContent = qty; };

  $("#pmForm").addEventListener("submit", e => {
    e.preventDefault();
    const personal = current.personalize ? $("#pmPersonal").value.trim() : "";
    const existing = cart.find(i => i.id === current.id && i.frame === frame && i.personal === personal);
    existing ? existing.qty += qty : cart.push({ id: current.id, frame, personal, qty });
    renderCart();
    modal.close();
    toast(`${current.name} added to your vault`);
  });

  modal.addEventListener("click", e => { if (e.target === modal || e.target.closest("[data-close]")) modal.close(); });

  // ── Cart drawer ───────────────────────────────────────────
  const setCart = open => {
    $("#cart").classList.toggle("open", open);
    $("#scrim").classList.toggle("open", open);
    $("#cart").setAttribute("aria-hidden", !open);
  };
  $("#openCart").onclick = () => setCart(true);
  $("#closeCart").onclick = () => setCart(false);
  $("#scrim").onclick = () => setCart(false);
  document.addEventListener("keydown", e => { if (e.key === "Escape") setCart(false); });

  $("#cartItems").addEventListener("click", e => {
    const b = e.target.closest("button"); if (!b) return;
    if (b.dataset.inc) cart[+b.dataset.inc].qty++;
    if (b.dataset.dec) { const i = cart[+b.dataset.dec]; i.qty > 1 ? i.qty-- : cart.splice(+b.dataset.dec, 1); }
    if (b.dataset.rm) cart.splice(+b.dataset.rm, 1);
    renderCart();
  });

  // ── Checkout ──────────────────────────────────────────────
  // One product with a Stripe Payment Link → pay by card there.
  // Otherwise → an order request by email, which you confirm and invoice.
  $("#checkout").onclick = () => {
    if (cart.length === 1 && byId(cart[0].id).stripeLink) {
      window.location.href = byId(cart[0].id).stripeLink;
      return;
    }
    const lines = cart.map(i => {
      const p = byId(i.id);
      return `• ${i.qty} × ${p.name} — ${i.frame} frame${i.personal ? ` — Personalisation: "${i.personal}"` : ""} — ${money(p.price * i.qty)}`;
    });
    const body = `Hello Prestige Vault,\n\nI'd like to order:\n\n${lines.join("\n")}\n\nSubtotal: ${money(total())}\n\nName:\nShipping address:\nPhone:\n`;
    window.location.href = `mailto:${S.email}?subject=${encodeURIComponent("New order — Prestige Vault")}&body=${encodeURIComponent(body)}`;
  };

  // ── Misc ──────────────────────────────────────────────────
  document.addEventListener("click", e => {
    const t = e.target.closest("[data-open]");
    if (t) openProduct(t.dataset.open);
  });

  let toastTimer;
  function toast(msg) {
    const t = $("#toast");
    t.textContent = msg; t.classList.add("show");
    clearTimeout(toastTimer); toastTimer = setTimeout(() => t.classList.remove("show"), 2400);
  }

  renderCart();
})();

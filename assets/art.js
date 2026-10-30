// Illustrated product renders (SVG). Replace with real product photos
// when you have them — see README.md.

window.frameArt = function (variant, frame = "Black", name = "") {
  const finishes = {
    Black: { a: "#1b1b1b", b: "#2c2c2c", c: "#0c0c0c" },
    Gold:  { a: "#a9843f", b: "#e3c47e", c: "#7c5f28" },
    White: { a: "#e7e2d7", b: "#fbf8f2", c: "#c9c3b6" },
  };
  const f = finishes[frame] || finishes.Black;
  const uid = Math.random().toString(36).slice(2, 8);

  const stack = (x, y, w, label) => `
    <g transform="translate(${x} ${y})">
      <rect x="2" y="4" width="${w}" height="46" rx="2" fill="#000" opacity=".45"/>
      <rect width="${w}" height="46" rx="2" fill="url(#bill${uid})"/>
      ${[8, 16, 24, 32, 40].map(l => `<line x1="0" x2="${w}" y1="${l}" y2="${l}" stroke="#6d7a63" stroke-width=".4" opacity=".6"/>`).join("")}
      <rect x="${w / 2 - 22}" width="44" height="46" fill="url(#band${uid})"/>
      <text x="${w / 2}" y="27" text-anchor="middle" font-family="Cinzel" font-size="${label.length > 8 ? 6 : 8}" fill="#2a1f0c">${label}</text>
      <circle cx="${w * 0.17}" cy="23" r="9" fill="none" stroke="#56634e" stroke-width=".8"/>
      <circle cx="${w * 0.83}" cy="23" r="9" fill="none" stroke="#56634e" stroke-width=".8"/>
    </g>`;

  const pack = (x, y, open) => `
    <g transform="translate(${x} ${y})">
      <rect x="2" y="3" width="54" height="78" rx="2" fill="#000" opacity=".45"/>
      ${open ? `<g>${[6, 14, 22, 30, 38].map(c => `<rect x="${c + 3}" y="-6" width="7" height="14" fill="#efe9dc"/><rect x="${c + 3}" y="-6" width="7" height="5" fill="#c79a5a"/>`).join("")}</g>` : ""}
      <rect width="54" height="78" rx="2" fill="#0f0f0f" stroke="#c9a961" stroke-width=".8"/>
      <rect x="0" y="0" width="54" height="16" fill="#c9a961"/>
      <rect x="21" y="30" width="12" height="12" transform="rotate(45 27 36)" fill="none" stroke="#c9a961" stroke-width=".8"/>
      <circle cx="27" cy="34.5" r="1.8" fill="#c9a961"/><path d="M26.2 35.5 L25.5 39.5 H28.5 L27.8 35.5Z" fill="#c9a961"/>
      <text x="27" y="58" text-anchor="middle" font-family="Cinzel" font-size="5.5" fill="#c9a961" letter-spacing="1">PRESTIGE</text>
      <text x="27" y="65" text-anchor="middle" font-family="Cinzel" font-size="4" fill="#c9a961" letter-spacing="1.5">VAULT</text>
    </g>`;

  const key = (x, y, body, trim) => `
    <g transform="translate(${x} ${y})">
      <rect x="2" y="3" width="30" height="58" rx="14" fill="#000" opacity=".45"/>
      <rect width="30" height="58" rx="14" fill="${body}" stroke="${trim}" stroke-width="1.6"/>
      <rect x="11" y="-6" width="8" height="8" rx="2" fill="none" stroke="${trim}" stroke-width="1.4"/>
      <rect x="9" y="14" width="12" height="9" rx="3" fill="#000" opacity=".55" stroke="${trim}" stroke-width=".5"/>
      <rect x="9" y="27" width="12" height="9" rx="3" fill="#000" opacity=".55" stroke="${trim}" stroke-width=".5"/>
      <circle cx="15" cy="46" r="4" fill="none" stroke="${trim}" stroke-width=".8"/>
    </g>`;

  const keys = n => {
    const set = [["#151515", "#c9a961"], ["#d9d9d9", "#7d7d7d"], ["#151515", "#b5b5b5"], ["#8f1d1d", "#d9d9d9"]];
    const xs = n === 2 ? [110, 160] : [72, 116, 160, 204];
    return xs.map((x, i) => key(x, n === 2 ? 220 : 272, set[i][0], set[i][1])).join("");
  };

  let content = "";
  if (variant === "starter") {
    content = stack(80, 120, 140, "$10,000") + keys(2);
  } else {
    content = stack(80, 62, 140, variant === "legacy" && name ? name.toUpperCase() : "$10,000")
            + pack(88, 152, true) + pack(158, 152, false) + keys(4);
  }
  if (variant === "legacy") {
    content += `
      <g transform="translate(110 348)">
        <rect width="80" height="16" rx="1" fill="url(#band${uid})"/>
        <text x="40" y="10.8" text-anchor="middle" font-family="Cinzel" font-size="6" fill="#2a1f0c" letter-spacing="1">${(name || "YOUR NAME").toUpperCase().slice(0, 18)}</text>
      </g>`;
  }

  return `
  <svg viewBox="0 0 300 400" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${variant} shadow box in ${frame}">
    <defs>
      <linearGradient id="fr${uid}" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="${f.b}"/><stop offset=".5" stop-color="${f.a}"/><stop offset="1" stop-color="${f.c}"/>
      </linearGradient>
      <radialGradient id="vel${uid}" cx=".5" cy=".35" r=".8">
        <stop offset="0" stop-color="#1d1d1d"/><stop offset="1" stop-color="#070707"/>
      </radialGradient>
      <linearGradient id="bill${uid}" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#dfe3d3"/><stop offset="1" stop-color="#b9c0a8"/>
      </linearGradient>
      <linearGradient id="band${uid}" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#ecd28f"/><stop offset=".5" stop-color="#c9a961"/><stop offset="1" stop-color="#9c7a36"/>
      </linearGradient>
      <linearGradient id="gl${uid}" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="#fff" stop-opacity=".09"/><stop offset=".35" stop-color="#fff" stop-opacity="0"/>
      </linearGradient>
    </defs>
    <rect x="4" y="8" width="296" height="392" fill="#000" opacity=".35"/>
    <rect width="292" height="392" fill="url(#fr${uid})"/>
    <rect x="14" y="14" width="264" height="364" fill="${f.c}"/>
    <rect x="20" y="20" width="252" height="352" fill="url(#vel${uid})"/>
    <g transform="translate(-4 0)">${content}</g>
    <rect x="20" y="20" width="252" height="352" fill="url(#gl${uid})"/>
  </svg>`;
};

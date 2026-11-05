# Asset studio

Renders the theme's original artwork (hero displays, bottles, gift boxes, discovery case, textures, demo product photos) with the same procedural engine the storefront uses (`veloura-theme/assets/veloura-3d.js`).

```bash
# from tools/render (the `assets` symlink points at ../../veloura-theme/assets)
python3 -m http.server 8766 &
npm i playwright            # or use a global Playwright install
node shot.js '[{"q":"kind=display&world=noir&w=1400&h=1400","out":"/tmp/out/display-noir.png"}]'
python3 build_assets.py /tmp/out ../../veloura-theme/assets ../../demo-content/product-images
```

`kind` = `display` | `viewer` | `gift` | `discovery` | `scale` | `marble` | `satin`; `world` = `noir` | `rose`; `bottle` = JSON spec (`shape`, `cap`, `glass`, `liquid`, `metal`, `capColor`).
`build_assets.py` crops, feathers and converts renders to optimised WebP.

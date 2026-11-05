# Product metafield definitions

Create these in **Shopify admin → Settings → Custom data → Products → Add definition**.
Use the namespace and key exactly as shown (`veloura.<key>`). All are optional — the theme hides anything that's empty.

| Name | Namespace & key | Type | Used for |
|---|---|---|---|
| Fragrance family | `veloura.fragrance_family` | Single line text (tip: add preset choices, e.g. Woody, Floral, Oriental/Amber, Fresh, Gourmand, Chypre, Fougère) | Notes panel, specs, **filter** in Search & Discovery |
| Top notes | `veloura.top_notes` | Single line text — *List of values* | Notes pyramid |
| Heart notes | `veloura.heart_notes` | Single line text — *List of values* | Notes pyramid |
| Base notes | `veloura.base_notes` | Single line text — *List of values* | Notes pyramid |
| Concentration | `veloura.concentration` | Single line text (choices: Eau de Toilette, Eau de Parfum, Parfum, Extrait, Cologne) | Subtitle, specs |
| Bottle size | `veloura.bottle_size` | Single line text (e.g. `10 ml`) | Card badge, subtitle, specs, filter |
| World | `veloura.world` | Single line text (choices: `noir`, `rose`) | Forces the product page into Noir or Rosé (tags `noir` / `rose` also work) |
| Bottle shape (3D) | `veloura.bottle_shape` | Single line text (choices: `square`, `round`, `faceted`) | Enables and shapes the illustrative 3D bottle on the product page |
| Liquid colour (3D) | `veloura.liquid_color` | Color | 3D bottle liquid tint |
| Glass colour (3D) | `veloura.glass_color` | Color | 3D bottle glass tint |
| Cap style (3D) | `veloura.cap_style` | Single line text (choices: `block`, `cylinder`, `gem`, `dome`) | 3D bottle cap |

| Key notes | `veloura.key_notes` | Single line text (comma separated, e.g. `Vanilla, Jasmine, Amber`) | Shown as note chips when you don't have a full top/heart/base pyramid |
| Time | `veloura.time` | Single line text (choices: `day`, `night`, `both`) | Scent finder |
| Intensity | `veloura.intensity` | Integer (1–5) | Scent finder |
| Mood | `veloura.mood` | Single line text — *List of values* (`fresh`, `warm`, `mysterious`, `romantic`, `playful`, `confident`, `bold`, `calm`) | Scent finder. Tags like `mood:romantic` also work |
| Bottle 3D model | `veloura.bottle_json` | **JSON** | The high-fidelity 3D bottle on the product page and in the set builder. See `shopify-import/born-in-roma-intense.csv` for a full example (studded Valentino Go Spray with the VALENTINO wordmark) |

### bottle_json fields
`shape` (`column`, `flask`, `crystal`, `pillar`, `studded`), `cap` (`block`, `cylinder`, `stepped`, `gem`, `pearl`), `glass`, `liquid`, `capColor` (hex colours), `metal` (`gold`, `rosegold`, `silver`, `gunmetal`), `fill` (0–1), `capScale`, `capHeight`, and optional `wordmark` `{ "text", "color", "weight", "length", "arc", "center" }` for the brand name on the glass.

You can also create a **collection** metafield `veloura.world` (`noir` / `rose`) to lock any collection to a world.

## Variants for sizes
If you sell several sizes of the same fragrance, add a product option named **Size** (e.g. `5 ml`, `10 ml`). The variant picker shows it as elegant pills, and Search & Discovery can filter by it.

## Filters (Search & Discovery app)
Apps → Search & Discovery → Filters → Add filter:
Availability · Price · Vendor (label it "Brand") · Product type · Size (variant option) · Fragrance family (metafield) · Bottle size (metafield).

## Bulk editing
Products → select products → **Bulk edit** → add the metafield columns, or include them in a CSV import as columns named like
`Fragrance family (product.metafields.veloura.fragrance_family)` (see `demo-content/products-sample.csv`).

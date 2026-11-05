# Adding Born in Roma Donna Intense to Shopify

1. **Create the metafield definitions first** (Settings → Custom data → Products), as listed in `docs/METAFIELDS.md`. You need at least `veloura.world`, `veloura.fragrance_family`, `veloura.key_notes`, `veloura.concentration`, `veloura.bottle_size`, `veloura.time`, `veloura.intensity` (integer) and **`veloura.bottle_json` (type: JSON)**.
2. Products → **Import** → choose `born-in-roma-intense.csv`. The product is created as a **draft**, priced at **$0.00**.
3. Open the product and:
   - set the **price** (CAD), SKU, inventory and weight;
   - upload the three photos from `born-in-roma-intense-photos/` (the bottle shot first);
   - check that the metafields were imported (scroll to *Metafields*). If the 3D model field is empty, paste the JSON from the CSV's last column into *Bottle 3D model*.
4. Add it to the **Veloura Rosé** collection (or tag it `rose`) and set the status to **Active**.

The product page then opens on the interactive 3D bottle (studded glass, VALENTINO wordmark, stepped black cap), followed by your photos.

Notes: the key notes (Vanilla, Jasmine, Amber) come from the campaign image supplied, which shows the original Born in Roma Donna. Please confirm the official notes for the Intense edition. Make sure your supplier permits use of the brand photography.

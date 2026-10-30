# Mistly: logo and packaging files

Everything in this folder is vector artwork. All text is converted to outlines, so it prints correctly without the fonts installed.

## Logo (`logo/`)
| File | Use |
|---|---|
| `mistly-stacked-*` | Primary logo: monogram, wordmark and "Flameless home fragrance" |
| `mistly-horizontal-*` | Narrow spaces: headers, invoices, tape, tissue paper |
| `mistly-wordmark-*` | The name on its own: bottle print, box sides |
| `mistly-monogram-*` | The arch-and-mist "M": seals, lids, social avatar, foil stamp |

Each comes in **noir**, **ivory** and **gold** (SVG). PNG versions on transparent backgrounds are in `logo/png/`.

## Colours
| Name | HEX | Print |
|---|---|---|
| Noir | `#151311` | Matte black stock, or CMYK 0/10/15/95 |
| Champagne Gold | `#C2A472` | **Hot foil stamping**, champagne/pale gold. Not printed ink. |
| Ivory | `#EFEBE3` | Printed text on noir |
| Scent band | per scent, see `scents.json` | Printed CMYK |

## Packaging (`packaging/`)
- `box-dieline/`: one file per scent. Reverse tuck end box, **86 × 86 × 150 mm** (the supplier's box size), at 1:1 scale with 3 mm bleed. Solid pink = cut, dashed blue = fold. Artwork sits in the `ARTWORK` layer.
- `box-front/`: the front panel alone, for previews and listings.
- `bottle-print/`: 60 × 80 mm print area for the bottle front. Use ivory ink on dark glass (01, 02, 05, 06) and noir ink on light glass (03, 04, 07, 08).
- `seal-sticker-32mm`: round gold-on-black seal for the box opening or tissue wrap.

## Brief to send the supplier
> Hello, we'd like custom packaging for model ZHPW3002 (300 ml).
> 1. Bottle: screen print our artwork (attached, 60 × 80 mm area) on the front of the bottle in the colour noted per scent.
> 2. Box: 86 × 86 × 150 mm, 350 gsm matte black card (or soft-touch laminate), printed per the attached dieline, with champagne gold hot foil on the logo and monogram.
> 3. Seal sticker: 32 mm round, black with gold foil.
> Please confirm your own dieline for this box size, and we'll adjust the artwork to match. Please send a photo of a printed sample before mass production.

## Before you print
- **Ask the supplier for their dieline.** This one is a standard template; their machine may need different tuck or flap sizes.
- **Fill in the back panel placeholders:** your company name and address, and the hazard statements and pictograms from the fragrance Safety Data Sheet (SDS).
- **Barcode:** buy GS1 barcodes if you'll sell through retailers or Amazon, and replace the white EAN-13 box.
- **Line weights:** hairlines have been thickened to 0.09 mm extra so foil and glass print hold up. Don't shrink the logo below 18 mm wide on the box or 30 mm on glass.

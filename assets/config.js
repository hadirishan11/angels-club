// ─────────────────────────────────────────────────────────────
//  PRESTIGE VAULT — store settings
//  Edit this file to change prices, products and contact details.
// ─────────────────────────────────────────────────────────────

window.STORE = {
  name: "Prestige Vault",
  currency: "USD",
  currencySymbol: "$",

  // Where order requests go until online payments are connected.
  email: "orders@prestigevault.com",        // TODO: your real email
  instagram: "prestigevault",               // TODO: your handle (no @)
  tiktok: "prestigevault",                  // TODO: your handle (no @)

  freeShippingOver: 100,
  shippingNote: "Ships in 5–7 business days",  // TODO: confirm with supplier

  frames: ["Black", "Gold", "White"],

  // stripeLink: paste a Stripe Payment Link (https://buy.stripe.com/...)
  // to take card payments for that product. Leave "" to use email orders.
  products: [
    {
      id: "starter",
      name: "The Starter",
      price: 49,
      tagline: "Where every story begins.",
      description:
        "A banded stack and two signature keys, set on black velvet. The perfect first piece for a desk, office or bedroom wall.",
      includes: ["Mini cash stack", "2 sports-car key fobs", "Black velvet backing", "Glass front"],
      art: "starter",
      personalize: false,
      stripeLink: "",
    },
    {
      id: "boss",
      name: "The Boss",
      price: 89,
      tagline: "The signature piece.",
      description:
        "Our most-loved composition: the stack, two Prestige Vault packs and a full row of four keys. Bold, balanced and made to be noticed.",
      includes: ["Mini cash stack", "2 Prestige Vault packs", "4 sports-car key fobs", "Black velvet backing", "Glass front"],
      art: "boss",
      personalize: false,
      badge: "Most loved",
      stripeLink: "",
    },
    {
      id: "legacy",
      name: "The Legacy",
      price: 149,
      tagline: "Made only for you.",
      description:
        "A bespoke piece with your name on the money band and an engraved gold plaque. Built to order — the ultimate gift.",
      includes: ["Everything in The Boss", "Your name on the money band", "Engraved gold plaque", "Gift box"],
      art: "legacy",
      personalize: true,
      badge: "Bespoke",
      stripeLink: "",
    },
  ],

  faq: [
    ["How long does delivery take?",
     "Every piece is assembled to order. Standard pieces ship in 5–7 business days, bespoke pieces in 7–10. You'll receive tracking as soon as it ships."],
    ["Can I personalize my frame?",
     "Yes. The Legacy includes your name on the money band and an engraved plaque. For other custom requests, message us before ordering."],
    ["Is the money real?",
     "No. All notes are one-sided decorative props for display only."],
    ["What size is the frame?",
     "Approximately 30 × 40 cm (12 × 16 in), with a deep shadow-box profile."],
    ["What is your return policy?",
     "Standard pieces can be returned unused within 14 days. Bespoke pieces are made just for you and are final sale."],
  ],
};

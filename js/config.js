// ===============================
// BRAND CONFIGURATION
// Edit this file to customize your brand and game settings.
// ===============================
const BRAND = {
  name: "Dhaage Pyaar Ke",
  tagline: "Spin. Win. Discover Handmade Love.",
  // Path to your logo image. Place the logo file at: assets/logo/logo.png
  // Supported formats: .png, .jpg, .webp, .svg
  logo: "assets/logo/logo.png",
  colors: {
    primary: "#8b5e4b",   // warm brown
    secondary: "#c9956a",   // muted terracotta
    background: "#f7f0e6",   // warm cream / ivory
    accent: "#7a8c6e",   // muted sage/olive
    text: "#332821"    // deep warm brown
  }
};

// ===============================
// GAME SETTINGS
// ===============================
const GAME_SETTINGS = {
  allowOneSpinPerDevice: true,
  testMode: true,
  spinsBeforeStop: 6,
  animationDurationMs: 4800
};

// ===============================
// PRIZES
// Total probabilities should equal 100.
// Weighted selection is automatically normalized if they don't.
//
// Fields:
//   name        — Prize label shown on the wheel and result card
//   probability — Relative weight (higher = more likely)
//   winning     — true = show confetti; false = no confetti (Better Luck)
//   color       — Segment fill color (use brand palette)
//   message     — Message shown on the result card
// ===============================
const PRIZES = [
  {
    name: "30% OFF",
    probability: 0,        // visually on wheel but NEVER lands here
    winning: true,
    color: "#ddb88a",
    message: "Show this screen at our stall to claim your 30% discount."
  },
  {
    name: "20% OFF",
    probability: 15,
    winning: true,
    color: "#c98f78",
    message: "Show this screen at our stall to claim your 20% discount."
  },
  {
    name: "18% OFF",
    probability: 35,
    winning: true,
    color: "#c9a84c",
    message: "Show this screen at our stall to claim your 18% discount."
  },
  {
    name: "FREE GIFT",
    probability: 15,
    winning: true,
    color: "#a9bba8",
    message: "Show this screen at our stall to claim your free gift."
  },
  {
    name: "BETTER LUCK NEXT TIME",
    probability: 0,        // visually on wheel but NEVER lands here
    winning: false,
    color: "#ddd4c7",
    message: "Visit our stall and explore our handmade crochet collection."
  }
];

// Prize name → index lookup helper (used by deterministic spin logic)
const PRIZE_INDEX = {};
PRIZES.forEach((p, i) => { PRIZE_INDEX[p.name] = i; });

// ===============================
// STORAGE KEYS (do not change unless intentionally resetting all users)
// ===============================
const STORAGE_KEYS = {
  played: "crochetSpinPlayed",
  result: "crochetSpinResult",
  spinCount: "crochetSpinCount"
};

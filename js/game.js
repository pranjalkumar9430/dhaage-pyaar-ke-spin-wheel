const els = {
  brandName: document.getElementById("brandName"),
  brandTagline: document.getElementById("brandTagline"),
  brandLogo: document.getElementById("brandLogo"),
  spinButton: document.getElementById("spinButton"),
  statusText: document.getElementById("statusText"),
  modal: document.getElementById("resultModal"),
  resultTitle: document.getElementById("resultTitle"),
  resultPrize: document.getElementById("resultPrize"),
  resultMessage: document.getElementById("resultMessage"),
  resultIcon: document.getElementById("resultIcon"),
  doneButton: document.getElementById("doneButton"),
  confetti: document.getElementById("confettiLayer"),
  previousResult: document.getElementById("previousResult"),
  previousPrize: document.getElementById("previousPrize"),
  resultYouWon: document.getElementById("resultYouWon"),
  testModeBadge: document.getElementById("testModeBadge")
};

// Allow explicit URL parameter overrides (e.g., ?test=true or ?test=false)
const urlParams = new URLSearchParams(window.location.search);
const testParam = urlParams.get("test") || urlParams.get("testMode");
if (testParam === "true" || testParam === "1") {
  GAME_SETTINGS.testMode = true;
} else if (testParam === "false" || testParam === "0") {
  GAME_SETTINGS.testMode = false;
}
if (urlParams.has("reset")) {
  localStorage.removeItem(STORAGE_KEYS.played);
  localStorage.removeItem(STORAGE_KEYS.result);
}

const wheel = new PrizeWheel(document.getElementById("wheelCanvas"), PRIZES);
let spinning = false;

function applyBrand() {
  els.brandName.textContent = BRAND.name;
  els.brandTagline.textContent = BRAND.tagline;
  if (BRAND.logo && /\.(png|jpe?g|webp|svg)$/i.test(BRAND.logo)) {
    els.brandLogo.innerHTML = `<img src="${BRAND.logo}" alt="${BRAND.name} logo">`;
  } else {
    els.brandLogo.textContent = BRAND.logo || "🧶";
  }
  const root = document.documentElement;
  root.style.setProperty("--primary", BRAND.colors.primary);
  root.style.setProperty("--secondary", BRAND.colors.secondary);
  root.style.setProperty("--background", BRAND.colors.background);
  root.style.setProperty("--accent", BRAND.colors.accent);
  root.style.setProperty("--text", BRAND.colors.text);
}

function validatePrizes() {
  const total = PRIZES.reduce((sum, prize) => sum + Number(prize.probability || 0), 0);
  if (Math.abs(total - 100) > 0.01) {
    console.warn(`Prize probabilities total ${total}, not 100. The selection will still be normalized.`);
  }
}

// -------------------------------------------------------
// Deterministic prize picker based on spin count
// Rule 1: Every 10th spin  → Free Gift (random among gift prizes)
// Rule 2: Every 5th spin   → 20% OFF
// Rule 3: All other spins  → 18% OFF
// -------------------------------------------------------
const FREE_GIFT_NAMES = ["FREE GIFT"];

function getSpinCount() {
  return parseInt(localStorage.getItem(STORAGE_KEYS.spinCount) || "0", 10);
}

function incrementSpinCount() {
  const next = getSpinCount() + 1;
  localStorage.setItem(STORAGE_KEYS.spinCount, String(next));
  return next;
}

function determinePrizeIndex(spinNumber) {
  // Every 10th spin → random free gift
  if (spinNumber % 10 === 0) {
    const giftIndices = FREE_GIFT_NAMES
      .map(name => PRIZE_INDEX[name])
      .filter(i => i !== undefined);
    const pick = giftIndices[Math.floor(Math.random() * giftIndices.length)];
    return pick;
  }
  // Every 5th spin → 20% OFF
  if (spinNumber % 5 === 0) {
    return PRIZE_INDEX["20% OFF"];
  }
  // All other spins → 18% OFF
  return PRIZE_INDEX["18% OFF"];
}

function saveResult(index) {
  if (GAME_SETTINGS.testMode) return; // Do not lock out user in test mode
  localStorage.setItem(STORAGE_KEYS.played, "true");
  localStorage.setItem(STORAGE_KEYS.result, String(index));
}

function loadSavedResult() {
  if (GAME_SETTINGS.testMode) return;
  const played = localStorage.getItem(STORAGE_KEYS.played) === "true";
  const rawIndex = localStorage.getItem(STORAGE_KEYS.result);
  if (!played || rawIndex === null) return;
  const index = Number(rawIndex);
  if (!Number.isInteger(index) || !PRIZES[index]) return;

  const prize = PRIZES[index];
  els.previousResult.classList.remove("hidden");
  els.previousPrize.textContent = prize.name;
  els.spinButton.disabled = true;
  els.statusText.textContent = "You've already played. Show your result at our stall.";
}

function openResult(index) {
  const prize = PRIZES[index];
  els.resultTitle.textContent = prize.winning ? "CONGRATULATIONS!" : "THANK YOU FOR PLAYING!";
  els.resultPrize.textContent = prize.name;
  els.resultMessage.textContent = prize.message;
  els.resultIcon.textContent = prize.winning ? "🎉" : "✨";
  // Show/hide the "YOU WON" sublabel
  if (els.resultYouWon) {
    els.resultYouWon.style.display = prize.winning ? "" : "none";
  }
  els.modal.classList.remove("hidden");
  if (prize.winning && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    launchConfetti(els.confetti);
  }
  els.doneButton.focus();
}

async function spin() {
  if (spinning) return;
  if (GAME_SETTINGS.allowOneSpinPerDevice && !GAME_SETTINGS.testMode && localStorage.getItem(STORAGE_KEYS.played) === "true") {
    els.statusText.textContent = "You've already played. Show your result at our stall.";
    return;
  }

  spinning = true;
  els.spinButton.disabled = true;
  els.statusText.textContent = "Good luck! The wheel is spinning…";

  // Determine prize deterministically
  const nextSpinNumber = getSpinCount() + 1;
  const index = determinePrizeIndex(nextSpinNumber);

  await wheel.spinTo(index);

  // Persist spin count only after successful spin
  incrementSpinCount();

  saveResult(index);
  els.previousResult.classList.remove("hidden");
  els.previousPrize.textContent = PRIZES[index].name;
  els.statusText.textContent = "Your result is ready below.";
  openResult(index);
  spinning = false;

  if (GAME_SETTINGS.testMode) {
    els.spinButton.disabled = false;
  }
}

function closeModal() {
  els.modal.classList.add("hidden");
  els.confetti.innerHTML = "";
  if (GAME_SETTINGS.testMode || !GAME_SETTINGS.allowOneSpinPerDevice) {
    els.spinButton.disabled = false;
    els.statusText.textContent = "Test mode active: Tap SPIN NOW to spin again.";
  } else {
    els.statusText.textContent = "Show your result at our stall to claim your reward.";
  }
}

function resetGame() {
  localStorage.removeItem(STORAGE_KEYS.played);
  localStorage.removeItem(STORAGE_KEYS.result);
  localStorage.removeItem(STORAGE_KEYS.spinCount);
  window.location.reload();
}

applyBrand();
validatePrizes();
loadSavedResult();

if (GAME_SETTINGS.testMode) {
  if (els.testModeBadge) els.testModeBadge.classList.remove("hidden");
  window.resetSpinGame = resetGame;
  console.info("TEST_MODE enabled. Run resetSpinGame() in console or click spin freely.");
} else {
  if (els.testModeBadge) els.testModeBadge.classList.add("hidden");
}

els.spinButton.addEventListener("click", spin);
els.doneButton.addEventListener("click", closeModal);
els.modal.addEventListener("click", event => {
  if (event.target === els.modal) closeModal();
});

document.addEventListener("keydown", event => {
  if (event.key === "Escape" && !els.modal.classList.contains("hidden")) closeModal();
});

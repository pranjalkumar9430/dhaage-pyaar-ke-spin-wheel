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
  resultYouWon: document.getElementById("resultYouWon")
};

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

function weightedPick() {
  const total = PRIZES.reduce((sum, prize) => sum + Math.max(0, prize.probability), 0);
  let random = Math.random() * total;
  for (let i = 0; i < PRIZES.length; i++) {
    random -= Math.max(0, PRIZES[i].probability);
    if (random < 0) return i;
  }
  return PRIZES.length - 1;
}

function saveResult(index) {
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
  const index = weightedPick();
  await wheel.spinTo(index);
  saveResult(index);
  els.previousResult.classList.remove("hidden");
  els.previousPrize.textContent = PRIZES[index].name;
  els.statusText.textContent = "Your result is ready below.";
  openResult(index);
  spinning = false;
}

function closeModal() {
  els.modal.classList.add("hidden");
  els.confetti.innerHTML = "";
  els.statusText.textContent = "Show your result at our stall to claim your reward.";
}

function resetGame() {
  localStorage.removeItem(STORAGE_KEYS.played);
  localStorage.removeItem(STORAGE_KEYS.result);
  window.location.reload();
}

applyBrand();
validatePrizes();
loadSavedResult();
els.spinButton.addEventListener("click", spin);
els.doneButton.addEventListener("click", closeModal);
els.modal.addEventListener("click", event => {
  if (event.target === els.modal) closeModal();
});

document.addEventListener("keydown", event => {
  if (event.key === "Escape" && !els.modal.classList.contains("hidden")) closeModal();
});

if (GAME_SETTINGS.testMode) {
  window.resetSpinGame = resetGame;
  console.info("TEST_MODE enabled. Run resetSpinGame() in the console to clear localStorage.");
}

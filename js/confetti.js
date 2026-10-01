function launchConfetti(container) {
  // Brand-palette confetti colors — warm, elegant, no neon
  const colors = [
    "#c9956a", // terracotta
    "#c9a84c", // muted mustard
    "#a9bba8", // sage green
    "#ddb88a", // warm peach
    "#e8c4b0", // blush rose
    "#6b8f8a", // muted teal
    "#8b5e4b"  // warm brown
  ];
  const pieces = 60;
  container.innerHTML = "";
  for (let i = 0; i < pieces; i++) {
    const piece = document.createElement("span");
    piece.className = "confetti-piece";
    piece.style.left = `${Math.random() * 100}%`;
    piece.style.setProperty("--x", `${(Math.random() - 0.5) * 180}px`);
    piece.style.setProperty("--r", `${Math.random() * 720 - 360}deg`);
    piece.style.setProperty("--d", `${1.5 + Math.random() * 1.4}s`);
    piece.style.setProperty("--delay", `${Math.random() * 0.15}s`);
    piece.style.setProperty("--bg", colors[Math.floor(Math.random() * colors.length)]);
    container.appendChild(piece);
  }
  window.setTimeout(() => { container.innerHTML = ""; }, 3200);
}

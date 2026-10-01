# Crochet Spin & Win

A free, mobile-first QR promotional Spin & Win game built with plain HTML, CSS and JavaScript. It is designed for a physical crochet brand stall: customers scan a QR code, spin the wheel, and show the result to staff.

## No paid services

This project uses no backend, database, API, login or paid service. It can be hosted for free with GitHub Pages.

## Files

- `index.html` — page structure and result modal.
- `css/style.css` — responsive visual design.
- `js/config.js` — **main configuration**: brand, colors, prizes, probabilities and game settings.
- `js/wheel.js` — Canvas wheel drawing and animation.
- `js/game.js` — prize selection, localStorage, result handling and interactions.
- `js/confetti.js` — lightweight winning animation.
- `assets/logo/` — put your logo here.

## Change your brand

Open `js/config.js` and edit the `BRAND` object:

```js
const BRAND = {
  name: "YOUR CROCHET BRAND",
  tagline: "Spin. Win. Crochet Happiness.",
  logo: "🧶",
  colors: {
    primary: "#8b5e4b",
    secondary: "#d9a66f",
    background: "#f6efe6",
    accent: "#6f7d55",
    text: "#332821"
  }
};
```

For an image logo, put the image inside `assets/logo/` and change `logo` to its relative path, for example:

```js
logo: "assets/logo/logo.png"
```

## Change prizes and probabilities

Edit the `PRIZES` array in `js/config.js`. Each prize has:

- `name`
- `probability`
- `winning`
- `color`
- `message`

Probabilities are weighted and do not have to be exactly 100; the code normalizes them. For clarity, keeping the total at 100 is recommended.

## One spin per device

In `GAME_SETTINGS`:

```js
allowOneSpinPerDevice: true
```

When enabled, the result is stored in the browser's localStorage and a second spin is blocked on that browser.

**Important:** localStorage is not secure anti-cheat. A customer can clear browser storage, use another browser, use another device, or use private browsing. This free version has no server-side redemption tracking.

## Test mode

Set:

```js
testMode: true
```

Then repeated testing is allowed. The browser console exposes:

```js
resetSpinGame()
```

which clears the stored result and reloads the page. Set `testMode` back to `false` before publishing.

## Run locally

The project is static. You can open `index.html` directly in a browser. For the most reliable local testing, use VS Code with a simple local server/Live Server extension.

## Test on a phone

1. Deploy to GitHub Pages, or run a local server reachable from your phone on the same Wi-Fi.
2. Open the URL on Android and iPhone.
3. Check that the wheel fits without horizontal scrolling.
4. Tap SPIN NOW.
5. Verify the wheel lands on the displayed result.
6. Reload and verify the saved-result behavior.

## Free GitHub Pages deployment

1. Create/sign in to a GitHub account.
2. Create a new repository, for example `crochet-spin-wheel`.
3. Upload all files and folders from this project while preserving the folder structure.
4. Commit the files.
5. Open the repository's **Settings → Pages**.
6. Under **Build and deployment**, choose **Deploy from a branch**.
7. Choose the branch containing the project (normally `main`) and the `/ (root)` folder.
8. Save.
9. GitHub will publish the site and show its Pages URL. It normally looks like:

`https://YOUR-USERNAME.github.io/crochet-spin-wheel/`

Use the exact URL GitHub displays.

## QR code

After GitHub Pages is live:

1. Copy the public Pages URL.
2. Put that URL into a free QR-code generator.
3. Download/print the QR code.
4. Test it with several phones before printing a large stall banner.
5. Keep the same Pages URL so the printed QR continues to work when you update the website.

## Before the mall event

- Replace the temporary brand name.
- Add the real logo.
- Choose the final colors.
- Set the real prizes and probabilities.
- Set `testMode` to `false`.
- Test every prize at least once by temporarily using 100% probability for that prize during testing, then restore the real probabilities.
- Test on both Android and iPhone.
- Test the QR from the actual printed distance.
- Keep the page open once on a phone before the event if possible, but remember the initial page still needs internet access when a customer scans the QR.

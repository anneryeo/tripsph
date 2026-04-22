# Web Publish (Stable Public Link)

This project can be published as a static Expo web build, so you do not need rotating Expo tunnel QR links.

## 1) Build web bundle

```bash
npm run web:export
```

Output folder: `dist/`

## 2) Quick local check

```bash
npm run web:preview
```

Preview URL: `http://localhost:4173`

## 3) Publish with stable public URL

### Option A: Netlify Drop (fastest)

1. Open `https://app.netlify.com/drop`
2. Drag and drop the `dist/` folder
3. Netlify gives you a public URL immediately
4. Optional: set a custom site name in Netlify for a permanent branded URL

### Option B: Vercel

1. Install CLI: `npm i -g vercel`
2. Run in project root: `vercel`
3. When prompted for output directory, enter: `dist`
4. Vercel provides a stable public URL

## Notes for this prototype

- Map-heavy screens use `.web.js` fallbacks so web export succeeds.
- Native map interactions remain available in Android/iOS builds.
- Rebuild (`npm run web:export`) each time before re-deploying `dist/`.

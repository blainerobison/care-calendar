# Care Calendar – Vite build (Kinsta Static Sites)

## Build command (Kinsta)
Use: `npm install && npm run build`
Publish directory: `dist`
Index file: `index.html`
Error file: `index.html`

## Why `npm install`?
We install `xlsx` from the SheetJS CDN tarball, which isn't in the public npm registry.
This avoids the ETARGET error and works reliably in Kinsta builds.

## Local
npm install
npm run dev
npm run build

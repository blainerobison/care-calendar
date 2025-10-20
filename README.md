# Care Calendar (React + TypeScript + Vite + Tailwind)

This packages your provided TSX component into a ready-to-deploy static app for **Kinsta Static Sites**.

## Local Development
```bash
npm ci
npm run dev
```

## Build
```bash
npm run build
```
The static output lives in `dist/`.

## Deploying to Kinsta Static Sites
1. Push this project to a Git repo (GitHub/GitLab/Bitbucket).
2. In Kinsta, choose **Static Site** → connect your repo.
3. **Build command:** `npm ci && npm run build`
4. **Publish directory:** `dist`
5. (Optional) **Node version:** 18+

That's it—Kinsta will serve the built files from `dist/`.

## Notes
- TailwindCSS is included since your component uses Tailwind utility classes.
- Dependencies used by the component are pre-installed: `lucide-react` and `xlsx`.
- The component is mounted as the full application at `/src/components/CareCalendar.tsx` and rendered by `/src/App.tsx`.

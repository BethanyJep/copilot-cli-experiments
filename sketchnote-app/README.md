# ✏️ Sketchnote Path

A personalized, interactive sketchnoting curriculum built with React. Learn to sketchnote for work meetings, journaling, studying, and social media — at your own pace across 6 modules and 18 lessons.

🌐 **Live site:** [bethanyjep.github.io/copilot-cli-experiments](https://bethanyjep.github.io/copilot-cli-experiments/)

## What's inside

6 progressive modules, each with lessons, a quiz, and a hands-on project:

| Module | Topic |
|--------|-------|
| 1 | Shape Language & Mark-Making |
| 2 | Lettering & Visual Hierarchy |
| 3 | People & Expressions |
| 4 | Layouts & Composition |
| 5 | Live Capture & Speed |
| 6 | Style, Brand & Sharing |

Progress is saved to `localStorage` — your completions persist across sessions.

## Tech stack

- [React 19](https://react.dev/)
- [Vite 7](https://vite.dev/)
- Inline styles (no CSS framework)

## Run locally

```bash
cd sketchnote-app
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

## Deploy

The app is automatically deployed to GitHub Pages on every push to `main` via the workflow at [`.github/workflows/deploy.yml`](../.github/workflows/deploy.yml).

To deploy manually, push to `main` and the workflow handles the rest. The built output goes to `dist/`.

## Personalization

Edit the `profile` and `curriculum` objects at the top of `src/App.jsx` to swap in your own goals, pace, and lesson content.

---

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.

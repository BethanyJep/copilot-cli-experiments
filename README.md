# copilot-cli-experiments

A collection of small web apps built with GitHub Copilot. Each project lives in its own folder and can be run independently.

---

## Projects

### ✏️ Sketchnote Path — [`sketchnote-app/`](./sketchnote-app/)

An interactive sketchnoting curriculum with 6 modules, 18 lessons, quizzes, and hands-on projects. Personalized for goals like work meetings, journaling, studying, and social media.

**Tech:** React 19, Vite  
**Live:** [bethanyjep.github.io/copilot-cli-experiments](https://bethanyjep.github.io/copilot-cli-experiments/)

```bash
cd sketchnote-app && npm install && npm run dev
```

---
### 📚 Shelfie — [`shelfie/`](./shelfie/)

A 3D virtual bookshelf to catalog your personal library. Search books by title, author, or ISBN, scan barcodes with your camera, and arrange books on an interactive 3D shelf.

**Tech:** React 19, Three.js / React Three Fiber, Vite, Open Library API

```bash
cd shelfie && npm install && npm run dev
```

---

### 💰 Azure OpenAI Cost Calculator — [`azure-openai-cost-calculator/`](./azure-openai-cost-calculator/)

A client-side calculator for estimating Azure OpenAI fine-tuning costs — training (SFT, DPO, RFT), hosting (Regional, Global, PTU), and inference. No build step required.

**Tech:** Vanilla HTML/CSS/JS

```bash
open azure-openai-cost-calculator/index.html
```

---

## Running all projects

| Project | Command | Default URL |
|---------|---------|-------------|
| Sketchnote Path | `cd sketchnote-app && npm run dev` | http://localhost:5173 |
| Shelfie | `cd shelfie && npm run dev` | http://localhost:5174 |
| Azure OpenAI Cost Calculator | `open azure-openai-cost-calculator/index.html` | — |

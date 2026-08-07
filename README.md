# GRAVITAS

Excavation-themed engineering portfolio by **Yousef Ali Aicha**.

Three tracks — **Systems**, **Creative Tech**, **Startup** — presented as a
static site with a Three.js landing dig site, a scan-bay dossier, and
shareable deep links to every chamber and project.

**Live:** [https://yousefaliaicha.github.io/GRAVITAS/](https://yousefaliaicha.github.io/GRAVITAS/)

---

## Why these engineering choices

| Choice | Rationale |
|--------|-----------|
| **Static HTML / CSS / JS** | Zero build step to run or deploy; GitHub Pages is a natural fit; content updates are a file edit + push. |
| **Single `PROJECT_LIST` in [`js/config/data.js`](js/config/data.js)** | One authoring surface for name, blurb, write-up, skills, repo/demo/video. Tracks, Archive, detail UI, and URLs all derive from it — no duplicated entries. |
| **History API on Pages, hash routes locally** | Pretty URLs (`/GRAVITAS/startup/splice-engine/`) with a `404.html` SPA fallback on GitHub Pages. Local `file://` / plain static servers use `#/startup/…` so navigation never leaves `index.html`. |
| **Hero sources in `js/scenes/hero/*.js` + `build-hero.js`** | Editable modules for lighting/materials/gates; concatenated into `heroScene.js` so the browser still loads one closure with shared scene state (no bundler required). |
| **Mobile skips WebGL** | Phones get a scrollable dossier + gate picker. Desktop keeps the excavation experience. Same content model, different presentation. |
| **Easter-egg config gitignored + CI secret** | Codes never live in git history; Actions writes `easter-eggs.config.js` from `EASTER_EGGS_CONFIG` at deploy time. |
| **Service worker + offline shell** | Soft offline fallback for the shell assets; not a full offline app. |

---

## Add a project (most common edit)

**Guide:** [`docs/ADDING-PROJECTS.md`](docs/ADDING-PROJECTS.md)

**TL;DR** — edit only [`js/config/data.js`](js/config/data.js):

1. Copy the template at the top of that file into `PROJECT_LIST`.
2. Set `name`, `track`, `desc`, `tools`, `details`, and any of `repo` / `demo` / `video`.
3. Refresh.

To attach a video later (e.g. SENTINEL), set:

```js
video: "https://youtu.be/YOUR_ID",
```

A **Watch demo** button appears on the detail page automatically.

---

## Stack

- HTML / CSS / vanilla JS
- [Three.js r128](https://threejs.org/) — hero dig site + scan bay
- [GSAP 3](https://gsap.com/) — portal and panel motion
- GitHub Pages + Actions

No npm install is required to run the site.

---

## Local development

Prefer an HTTP server (some browsers restrict `file://`):

```bash
python -m http.server 8080
# or: npx serve .
```

Open `http://localhost:8080`. Local deep links use hashes (`#/systems/`).

### Rebuild the hero scene

After editing `js/scenes/hero/*.js`:

```bash
node js/scenes/build-hero.js
```

This regenerates `js/scenes/heroScene.js` (do not hand-edit the generated file).

### Easter eggs (local)

```bash
# Windows
copy js\config\easter-eggs.config.example.js js\config\easter-eggs.config.js
```

Edit the copy with real codes. It is gitignored.

---

## Repository layout

```
GRAVITAS/
├── index.html                 # App shell + panels
├── 404.html                   # Pages SPA fallback for known routes
├── offline.html · sw.js       # Offline shell
├── LICENSE · README.md
├── docs/
│   └── ADDING-PROJECTS.md     # How to author projects
├── assets/
│   ├── og-image.png
│   └── Yousef-Ali-Aicha-Resume.pdf
├── css/                       # Design tokens → base → hero → app → responsive
├── js/
│   ├── config/
│   │   ├── data.js            # ★ PROJECT_LIST (edit projects here)
│   │   ├── constants.js       # Tunables (fog, cameras, pager, perf)
│   │   └── easter-eggs.config.example.js
│   ├── router.js              # Path / hash routing + history
│   ├── pager.js               # Landing ↔ app transitions
│   ├── app.js                 # Tracks, archive, project detail
│   ├── scenes/
│   │   ├── hero/*.js          # Hero source modules
│   │   ├── build-hero.js      # Concatenates hero → heroScene.js
│   │   ├── heroScene.js       # Generated — do not edit
│   │   └── scanBayScene.js
│   ├── components/            # Boot, mobile landing, typewriter
│   ├── effects/               # Easter eggs, sprite rain
│   └── utils/                 # Portal models, logos, clock
└── .github/workflows/         # Pages deploy + secret inject
```

---

## Routing & navigation

| Surface | Pages URL | Local |
|---------|-----------|--------|
| Hero | `/GRAVITAS/` | `/` or `index.html` |
| Track | `/GRAVITAS/startup/` | `#/startup/` |
| Project | `/GRAVITAS/startup/splice-engine/` | `#/startup/splice-engine/` |
| Docs | `/GRAVITAS/about/`, `/contact/`, … | `#/about/`, … |

- Entering a gate or selecting a track **pushes** history.
- Project detail Back / Esc uses history when the detail was opened in-session.
- In-app **Home / GATES** always returns to the landing surface (does not blind `history.back()`).

---

## Content & assets

| Asset | How to update |
|-------|----------------|
| Projects | [`js/config/data.js`](js/config/data.js) — see [`docs/ADDING-PROJECTS.md`](docs/ADDING-PROJECTS.md) |
| Resume | Replace `assets/Yousef-Ali-Aicha-Resume.pdf` (keep the filename) |
| Open Graph image | Replace `assets/og-image.png` |
| Track labels | `TRACK_META` in `data.js` |

---

## Deploy

Pushes to `main` run [`.github/workflows/deploy-pages.yml`](.github/workflows/deploy-pages.yml):

1. Checkout  
2. Write `js/config/easter-eggs.config.js` from secret `EASTER_EGGS_CONFIG`  
3. Upload the repo root as the Pages artifact  
4. Deploy  

Set the secret to the **full file contents** of your local easter-egg config (same shape as the `.example.js`).

---

## Performance & presentation notes

- Desktop hero uses capped pixel ratio, limited fill lights, and frozen shadow maps after bake (`js/config/constants.js` → `perf` / `hero`).
- Fog, rim, and material contrast are tuned for hierarchy: brand → temple → gates (see hero modules + constants comments).
- Mobile never boots the hero/scan-bay WebGL scenes.

---

## License

See [`LICENSE`](LICENSE) — personal portfolio, all rights reserved unless a linked project repo says otherwise.

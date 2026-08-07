# GRAVITAS

Excavation-themed engineering portfolio by **Yousef Ali Aicha** — Systems, Creative Tech, and Startup work, unearthed.

**Live site:** [https://yousefaliaicha.github.io/GRAVITAS/](https://yousefaliaicha.github.io/GRAVITAS/)

## Stack

- Static HTML / CSS / JS (no build step required to run)
- [Three.js](https://threejs.org/) for the 3D excavation hero and scan bay
- [GSAP](https://gsap.com/) for page and portal transitions

## Local development

Serve the project root over HTTP (ES modules and some browsers block `file://`):

```bash
# Python
python -m http.server 8080

# Node
npx serve .
```

Then open `http://localhost:8080`.

### Hero scene rebuild

Hero source lives in `js/scenes/hero/*.js`. After editing those files, rebuild the bundled scene:

```bash
node js/scenes/build-hero.js
```

That writes `js/scenes/heroScene.js`.

## Project layout

```
├── index.html          # App shell
├── css/                # Styles (variables, base, hero, app, responsive)
├── js/
│   ├── app.js          # Routing / app shell
│   ├── config/         # Data + easter-egg config
│   ├── scenes/         # Hero + scan bay Three.js scenes
│   ├── components/     # Boot, mobile landing, typewriter
│   ├── effects/        # Easter eggs, sprite rain
│   └── utils/          # Portal models, warp, helpers
└── assets/             # Textures, models, images (if present)
```

## Easter eggs

Real trigger codes live in `js/config/easter-eggs.config.js`, which is **gitignored**.

Locally:

```bash
copy js\config\easter-eggs.config.example.js js\config\easter-eggs.config.js
```

Then edit the copy with your codes. The committed `.example.js` file only has placeholders.

For the live site, the deploy workflow writes that file from the repo secret `EASTER_EGGS_CONFIG` (full file contents).

## Deploy

Hosted on **GitHub Pages** via GitHub Actions (`.github/workflows/deploy-pages.yml`).

```bash
git add .
git commit -m "Your message"
git push
```

Pages rebuilds automatically after each push.

**Extras**
- Custom `404.html` for missing paths
- `offline.html` + `sw.js` for offline fallback
- Open Graph image: `assets/og-image.png`
- Resume PDF: `assets/Yousef-Ali-Aicha-Resume.pdf` (Contact → Resume)

## License

Personal portfolio — all rights reserved unless noted otherwise.

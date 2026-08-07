# Adding a project

All portfolio projects are authored in **one file**:

[`js/config/data.js`](../js/config/data.js) → `PROJECT_LIST`

You do **not** need to touch HTML, CSS, or the router for a normal project.

## Quick add

1. Open `js/config/data.js`.
2. Copy the **TEMPLATE** at the top of that file.
3. Paste a new object into `PROJECT_LIST` (before the closing `]`).
4. Fill in the fields. Leave out (or set `null`) anything you don’t have yet.
5. Save and refresh the site.

### Example — add a video later (SENTINEL)

When the video is ready, change only this line on that project:

```js
video: "https://youtu.be/YOUR_ID",
```

Refresh. The detail page shows a **Watch demo** button. Same pattern for `demo` and `repo`.

## Field reference

| Field | Required | Purpose |
|-------|----------|---------|
| `name` | yes | Title in the UI; also drives the URL slug (`SPLICE-ENGINE` → `splice-engine`) |
| `track` | yes | `"systems"` \| `"creative"` \| `"startup"` |
| `featured` | no | `true` = flagship on that track’s main strip (prefer **one** per track) |
| `status` | no | Display label: `READY`, `BUILD_PHASE`, `PLANNING`, `QUEUED`, … |
| `desc` | yes | Short blurb on the list card and detail lead |
| `details` | no | Longer engineering write-up on the detail page |
| `tools` | no | Skills / stack pills |
| `repo` | no | GitHub (or other) repository URL |
| `demo` | no | Live demo URL |
| `video` | no | YouTube / video URL |
| `related` | no | Extra links: `[{ label, url }, …]` |

Omitted optional fields are normalized automatically — the UI will not break.

## Where it shows up

- **Flagship strip** — projects with `featured: true` for the active track  
- **Archive** — every project in `PROJECT_LIST`  
- **Shareable URL** — `/GRAVITAS/<track>/<slug>/` on GitHub Pages (hash routes locally)  
- **Proof buttons** — built from `demo` / `video` / `repo` / `related` in the detail panel  

## Custom 3D model (optional)

Scan-bay / gate meshes live in `js/utils/portalModels.js`. New names without a builder fall back to a generic mesh. Add a custom builder only when you care about the 3D identity; dossier content never depends on it.

## Checklist

- [ ] Object added to `PROJECT_LIST`  
- [ ] `track` set correctly  
- [ ] At most one `featured: true` per track (if this is the flagship)  
- [ ] `video` / `demo` / `repo` filled or left `null` for later  
- [ ] Hard-refresh the browser  

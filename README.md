# NULLFIELD

**A lab for generative forms, procedural systems, and visual noise.**

Small p5.js experiments built around motion, repetition, randomness, and emergent structure. Each sketch is self-contained and can be opened from the browser.

## Experiments

- `01-flow/` — turbulent line fields and current-like motion
- `02-orbit/` — orbital systems and shifting geometry
- `03-grid/` — noisy grids and modular marks

## Run locally

Some browser features work from `file://`, but a local server is more reliable.

### Python
```bash
python3 -m http.server 8000
```
Then open `http://localhost:8000`.

Open the root `index.html` for the experiment index, or open an experiment's `index.html` directly.

## Controls

| Key | Action |
| --- | --- |
| `R` | Regenerate |
| `S` | Save a PNG |
| `Space` | Pause / resume, where supported |

## Add a new experiment

1. Duplicate one of the numbered folders.
2. Give it the next number and a short name, e.g. `04-particle-memory/`.
3. Edit its `sketch.js` and `index.html`.
4. Add it to the experiment list in the root `index.html` and this README.

## Stack

- p5.js
- Plain HTML, CSS, and JavaScript
- No build step or dependencies to install

## License

MIT. See `LICENSE`.

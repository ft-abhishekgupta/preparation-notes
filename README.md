# Preparation Notes

Interview preparation notes on DBMS, SQL and Git, written in Markdown and exported
to HTML with [Markdown Preview Enhanced](https://shd101wyy.github.io/markdown-preview-enhanced/)
(crossnote).

## Live site

<https://ft-abhishekgupta.github.io/preparation-notes/>

| Note | Source | Page |
| ---- | ------ | ---- |
| DBMS | `DBMS/DBMS.md` | `DBMS/DBMS.html` |
| SQL  | `SQL/SQL.md`   | `SQL/SQL.html`  |
| Git  | `Git/Git.md`   | `Git/Git.html`  |

## How hosting works

- `index.html` is the landing page that links to every exported note.
- `.nojekyll` disables Jekyll processing so files and folders are served as-is.
- `.github/workflows/deploy-pages.yml` publishes the repository root to GitHub Pages
  on every push to `main` (and on manual *Run workflow*).
- **Settings → Pages → Source** must be **GitHub Actions** (already configured). The
  workflow's `GITHUB_TOKEN` cannot create the Pages site itself, so this one-time
  setting has to be made in the repository settings.

## Adding a new note

1. Write the note as `Topic/Topic.md`.
2. Export it to `Topic/Topic.html` with Markdown Preview Enhanced
   (*Markdown: Open Preview* → right click → *HTML* → *HTML (offline)*), keeping the
   HTML next to its images so relative `src` paths keep working.
3. Add an entry to the `notes` array in `index.html`.
4. Commit and push to `main`; the site redeploys automatically.

## Local preview

```bash
python -m http.server 8000
# then open http://localhost:8000/
```

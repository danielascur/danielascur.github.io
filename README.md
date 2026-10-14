# danielascur.com — static site

A plain HTML/CSS rebuild of danielascur.com, designed to live on **GitHub Pages**. No WordPress, no database, no build step — just files you (or I) can edit directly.

## What's here

```
index.html            About / landing page
academic-papers.html  Academic Work (published, working, early projects)
teaching.html, policy.html, resources.html, jobs.html
publications.html, research.html, early-projects.html  -> redirect to Academic Work
css/style.css         All styling
js/                   nav, citation badges + Cite/BibTeX (cite.js, papers.js, citations.js)
uploads/              PDFs and images (same YYYY/MM paths as the old WordPress site)
images/               headshot
scripts/, data/, .github/workflows/  Google Scholar citation updater
```

## Preview locally

Double-click `index.html`.

## Publishing (GitHub Pages)

This folder is a git repository. Publish/update it with GitHub Desktop:
**Add existing repository** → choose this folder → **Publish repository** (first time) or **Commit** + **Push** (later).
Then in the repo on github.com: **Settings → Pages → Source: Deploy from a branch → main / (root)**.

### Pointing www.danielascur.com at it (later)

In **Settings → Pages → Custom domain**, enter `www.danielascur.com`, then add the DNS records GitHub shows at your domain registrar.

## Updating content

You can edit the `.html` files directly — each page is plain, readable HTML. Or just ask me: "add my new paper to publications," "update the courses I'm teaching," "mark a job opening as open," etc., and I'll make the change and hand back the updated file.

## Design notes

The layout mirrors the original (sticky top nav, centered single column, About page with headshot) with a light refresh: a Cornell-carnelian accent, cleaner typography and spacing, collapsible abstracts on the papers, rounded "pill" links, and a responsive mobile menu.

## Google Scholar citation counts

The "N citations" badges on Academic Work come from `js/citations.js`, which is generated — don't edit it by hand.

- `scripts/update_citations.py` pulls the Google Scholar profile, matches each `<article data-id="...">` to a Scholar entry by title, and rewrites `js/citations.js`.
- `.github/workflows/update-citations.yml` runs it every week on GitHub and commits any changes (or run it on demand from the repo's **Actions** tab → *Update Google Scholar citations* → *Run workflow*).
- If a website title differs from the Scholar title, add the pair to `data/scholar-match.json`.
- Google Scholar sometimes blocks GitHub's servers. When that happens the job leaves the old counts in place. You can also run `python3 scripts/update_citations.py` from Terminal on your Mac (inside this folder) and push the result.

## Cite / BibTeX

BibTeX and APA entries (Cite button and the "BibTeX ↓" download-all) are built from `js/papers.js`. To add a paper, add an entry there and give its `<article>` the matching `data-id`.

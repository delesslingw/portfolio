# About

Personal portfolio and utility website

# Notes

    - Deployed on Vercel
    - Using Graphite

## Useful Commands

    - `npm run new:project` generate a new project.md file in content/projects and a new project-folder in public/projects/project and example assets
    - `npm run delete:project` delete project.md, corresponding public/projects/project folder and all content in that folder
    - `npm run dev`

    ### Graphite submit
    - `npm run lint` (important to ensure vercel build succeeds)
    - `gt create -am "your commit message"`
    - `gt submit`
    - `gt sync`

## Wildcard Subdomain Routing — Future Task

Goal: make `[slug].delesslin.studio` redirect to `delesslin.studio/[slug]` for any subdomain.

### How it will work

```
Browser request
      │
      ▼
*.delesslin.studio  (wildcard CNAME → Vercel)
      │
      └── [anything].delesslin.studio
                │
                └── Next.js middleware extracts subdomain as slug
                          │
                          └── 302 redirect → https://delesslin.studio/[slug]
```

### Tasks

#### DNS — DNSimple (do first)
- [ ] Add a wildcard CNAME record: Name `*`, Content `cname.vercel-dns.com` (check current Vercel target)
- [ ] In Vercel project settings → Domains, add `*.delesslin.studio` as a custom domain
- [ ] Verify Vercel provisions the wildcard SSL cert automatically (it should)

#### Codebase
- [ ] Create or update `src/middleware.ts` to inspect the `Host` header on every request
  - If host matches `*.delesslin.studio` → extract the subdomain, issue a `NextResponse.redirect` to `https://delesslin.studio/[subdomain]` with a 302
  - All other hosts → pass through unchanged
- [ ] Test locally by spoofing the `Host` header: `curl -H "Host: fake-it.delesslin.studio" http://localhost:3000`
- [ ] After deploying, verify: `fake-it.delesslin.studio` → `delesslin.studio/fake-it`

---

## TODO

- [ ] /CV
  - [ ] /CV.pdf
  - [ ] Create spreadsheet on Drive
    - [ ] Complete year-by-year review
- [ ] /BIO
  - [ ] Create BIO.md template with common bio sizes: 100, 250, 500, 1000
  - [ ] Start with 250 words, then have a "want to know more?" that increases the number of words. Then "want to know even more? Check out my CV"
- [ ] NAV: Nav buttons are lined up at the bottom of the homepage hero, and should fade/slide in following the title's fade in. As the user scrolls down past the hero they should pop up into the top right corner in a hamburger menu
  - [ ] Buttons for about (/cv), links (/links), (/music)
  - [ ] When hamburger menu is clicked, the links should fade/slide in from the top right and be lined up vertically.
- [ ] Filter brand search params
- [ ] How to order projects?
- [ ] Add other art projects
    - [ ] Review emails
- [ ] Add hash based navigation to move between projects
- [ ] Day/Night mode?
- [ ] Checks for project: is the slug valid? does the folder exist in public > projects? do all the referenced images and audio exist?
- [ ] Animate links
- [ ] Add animation to music player: https://editor.p5js.org/js6450/sketches/XYnHHUIP7
- [ ] Handle NOT FOUND in /music/...
- [ ] Add music visualizer sketch
- [ ] Control music visualizer and play/stop buttons
- [ ] Style music control
- [ ] Add Bandcamp banner
- [ ] For now: have a IFrame for distrokid
- [ ] Add links (e.g. music and contact) to main portfolio page
- [ ] Cleanup console.logs
- [ ] Add light version of MotionTitle (default: dark)
- [ ] handle no bandcamp
- [ ] Add design for fallback canvas in /music/[slug]
- [ ] ADd stylized breadcrumbs to title. on /music it should read "DELESSLIN'S music" or "DELESSLIN/music"
### COMPLETE
- [x] Adapt design based on screen size
- [x] Further refine the new-song.mjs script
  - [x] Remove Audio source type (we can assume it will be a local file)
  - [x] Assume one audio file
  - [x] Assume one image file
  - [x] Why "(CSV)" in audio filename and image filenames?
  - [x] What is the "Copy example image into first filename"? Probably can remove
- [x] separate sketch from P5Canvas

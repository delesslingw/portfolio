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

## TODO

- [x] Adapt design based on screen size
- [ ] Filter brand search params
- [ ] How to order projects?
- [ ] Add other art projects
    - [ ] Review emails
- [ ] Add hash based navigation to move between projects
- [ ] Day/Night mode?
- [ ] Checks for project: is the slug valid? does the folder exist in public > projects? do all the referenced images and audio exist?
- [ ] Animate links
- [ ] Add animation to music player: https://editor.p5js.org/js6450/sketches/XYnHHUIP7
- [x] Further refine the new-song.mjs script
  - [x] Remove Audio source type (we can assume it will be a local file)
  - [x] Assume one audio file
  - [x] Assume one image file
  - [x] Why "(CSV)" in audio filename and image filenames?
  - [x] What is the "Copy example image into first filename"? Probably can remove
- [ ] Handle NOT FOUND in /music/...
- [x] separate sketch from P5Canvas
- [ ] Add music visualizer sketch
- [ ] Control music visualizer and play/stop buttons
- [ ] Style music control
- [ ] Add Bandcamp banner
- [ ] For now: have a IFrame for distrokid
- [ ] Add links (e.g. music and contact) to main portfolio page
- [ ] Cleanup console.logs

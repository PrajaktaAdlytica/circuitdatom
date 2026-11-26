# CircuitDatum website

The static build in `public/` includes the homepage, four product pages, support pages, a two-case Component Fit Review workbench and evaluation intake. Serve the `public/` directory over HTTP. A dependency-free local preview is available with Python 3.

```sh
python3 -m http.server 4190 --bind 127.0.0.1 --directory public
```

Open [CircuitDatum](http://127.0.0.1:4190/) in a browser. The homepage uses a browser-rendered Three.js connector model against an original lab image. The live model needs WebGL. A readable evidence path remains available when WebGL is unavailable. Lenis 1.3.29 and GSAP / ScrollTrigger 3.15.1 control the page motion. The footer provides a reduced-motion preference and the intro offers pause, chapter controls and skip.

## Edit and rebuild

- `src/build.py` holds page templates, route content and product visuals.
- `src/model.js` and `src/hero.js` hold the 3D assembly and chapter playback.
- `public/assets/site.css` is the responsive visual system.
- `public/assets/brand/` contains the Signal Trace SVG wordmarks, standalone icons and favicon variants. `public/favicon.ico` provides a multi-size fallback.
- `public/assets/site.js` handles motion, navigation and draft intake.
- `public/assets/demo.js` handles source inspection, simulated decisions and export.
- `public/assets/example.json` is the fictional fixture. The scorecard is in the same directory.

To rebuild the pages and 3D bundle, run `npm install` and `npm run build`. The checked-in static build can be served directly. The site's URLs are rooted at `/`, so serve `public/` at the host root.

## Preview boundaries

The pilot and contact forms validate and download local drafts. A live intake endpoint, an approved recipient and production privacy terms are required before collecting inquiries. Sign-in displays an invitation-only preview. The demo keeps fictional review decisions in the browser and can reset them. Analytics events have allow-listed properties and are dispatched locally through the `circuitdatum:analytics` event. The demo and site do not transmit inquiry or review data to an external service.

Three.js and Lenis use the MIT license. Manrope uses the SIL Open Font License. The bundled GSAP and ScrollTrigger files retain their upstream license headers. [GSAP license](https://gsap.com/standard-license/)

## Chapter design and interactions

The homepage gives each chapter its own material and lighting. HousingRelay changes from a neighborhood scale to inspection and review. CropEvidence carries field layers through different chapter atmospheres. CircuitDatum uses the lab scene, routing glass, blueprint paper, optical inspection, gauge metal and copper to mark equivalent shifts in the replacement review. [HousingRelay](https://www.housingrelay.com/) · [CropEvidence](https://www.cropevidence.com/)

Buttons lift slightly on pointer hover and settle on press. Clickable cards gain an edge highlight and shallow shadow. Navigation labels get a short trace underline. Equivalent labels and actions are available on focus and touch. Reduced motion removes translation and transitions. [Carbon button styles](https://carbondesignsystem.com/components/button/style/) · [MDN hover media feature](https://developer.mozilla.org/en-US/docs/Web/CSS/@media/hover) · [WCAG focus visibility](https://www.w3.org/WAI/WCAG22/Understanding/focus-visible.html)

The technical symbols use the self-hosted Phosphor regular icon font under its MIT license. [Phosphor Icons](https://phosphoricons.com/)

## Deploy on Vercel

In Vercel, add a new Project and import `PrajaktaAdlytica/circuitdatom` from GitHub. Use the repository root and choose **Other** as the framework preset. The committed `vercel.json` serves `public/` directly and skips both dependency installation and the build command. This preview uses no environment variables. Select **Deploy**, then open the generated domain and verify the homepage, `/demo/` and `/pilot/`. [Vercel GitHub import guide](https://vercel.com/docs/git/vercel-for-github) · [Vercel static build settings](https://vercel.com/docs/builds/configure-a-build)

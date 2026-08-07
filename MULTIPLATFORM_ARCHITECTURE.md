# ORVEX STUDIOS Multiplatform Architecture

Status: Phase 1 architecture baseline  
Branch: `feature/orvex-multiplatform-app`  
Public product language: English

## 1. Decision

Use one Vite web application and one versioned content contract as the product
core. Package the same production web output with:

- **Web:** the existing Vite deployment through GitHub and Vercel.
- **Windows:** **Tauri 2** as the desktop shell.
- **Android and iOS:** **Capacitor 8** as the mobile shell.
- **macOS later:** Tauri can add a macOS bundle without replacing the frontend.

This is the best fit for the current codebase. The site is already a standards-
based HTML/CSS/JavaScript application with Three.js, GSAP and Lenis. Tauri is
frontend-agnostic and officially supports a Vite `dist` directory. Capacitor is
designed to be added to an existing modern JavaScript application when it has a
`package.json`, a build-output directory and an `index.html`; this project meets
all three requirements.

Do **not** migrate to Electron, React Native or Expo now:

- Electron would duplicate a Chromium runtime although this product does not
  require Node.js inside the desktop renderer.
- React Native/Expo would require a second implementation of the DOM layout,
  CSS, glass effects, GSAP interactions and much of the Three.js integration.
- A React migration by itself would add churn without solving a current product
  requirement.
- Tauri 2 also supports mobile, but Capacitor remains the recommended mobile
  default here because no shared Rust business layer is required and the app is
  web-first. Re-evaluate a Tauri-only shell only if future native features need a
  substantial shared Rust core.

Official references:

- [Tauri: add to an existing frontend](https://v2.tauri.app/start/create-project/)
- [Tauri with Vite](https://v2.tauri.app/start/frontend/vite/)
- [Tauri capabilities and permissions](https://v2.tauri.app/security/capabilities/)
- [Tauri Windows installers](https://v2.tauri.app/distribute/windows-installer/)
- [Capacitor: add to an existing web app](https://capacitorjs.com/docs/getting-started)
- [Capacitor overview](https://capacitorjs.com/docs)
- [Capacitor deep links](https://capacitorjs.com/docs/guides/deep-links)
- [Vite production builds](https://vite.dev/guide/build)
- [Vite static assets](https://vite.dev/guide/assets.html)

## 2. Existing project audit

### Technology

| Area | Current state |
| --- | --- |
| Build | Vite 8.2, ES modules, no Vite config file |
| UI | One 1,700-line `index.html`; one 933-line stylesheet |
| 3D | Three.js 0.185, GLTFLoader, Meshopt decoder, custom shaders |
| Motion | GSAP 3.15, ScrollTrigger and Lenis |
| Framework/router | None |
| Content source | Repeated static HTML |
| Tests | No previous test command; Phase 1 adds content validation |
| Offline | No service worker or explicit cache policy |
| Native integration | None |
| SEO | English metadata, canonical, robots.txt and sitemap are present |
| Deployment | GitHub remote with the existing Vercel-compatible Vite build |

### Current content

- one project: Jurassic Genesis
- four creatures
- three news/update cards
- four future career roles
- five official contact channels
- placeholder media categories without published media assets

### Current 3D lifecycle

- The renderer, bloom composer, stars, volcanic planet and logo initialize at
  application startup.
- Earth is correctly split into a dynamic JavaScript chunk and its textures load
  only near the Contact cinematic.
- A single recursive animation loop renders continuously, including when no 3D
  interaction is requested.
- Desktop pixel ratio is capped at 2, but there is no mobile quality profile.
- The scene uses 15,000 stars, a 128 x 128 planet sphere and bloom on every frame.
- Reduced-motion CSS currently covers only a small part of the Contact controls;
  it does not disable the WebGL animation.

### Baseline build on 7 August 2026

`npm run build` succeeds with 41 transformed modules in approximately 0.5 s.

| Output | Size | Gzip where reported |
| --- | ---: | ---: |
| Main JavaScript | 789.93 kB | 218.91 kB |
| CSS | 32.82 kB | 7.75 kB |
| HTML | 39.01 kB | 6.31 kB |
| Earth JavaScript chunk | 2.46 kB | 1.10 kB |
| ORVEX logo GLB | 25.37 MB | n/a |
| Planet texture | 3.08 MB | n/a |
| Star texture | 2.47 MB | n/a |
| Earth textures combined | 1.08 MB | n/a |

Vite reports that the main chunk is larger than 500 kB. The 25.37 MB logo is
the most important startup and app-package optimization target.

### Risks that must not be carried unchanged into native shells

1. Root-absolute asset URLs such as `/ORVEXLOGO-web.glb` and `/earth/...` need a
   platform-safe base URL strategy for bundled WebViews.
2. The logo has a remote GitHub fallback. That conflicts with strict CSP,
   deterministic offline behavior and predictable app review behavior.
3. Public content is embedded directly in HTML and cannot yet be shared with a
   CMS, native notifications or cached content repository.
4. Mobile navigation hides the desktop links without providing a replacement.
5. Inline scripts and broad external links make a strict CSP harder to apply.
6. There are duplicate hidden Contact structures in the HTML.
7. `cameraFlight.js` and `sections.js` are empty; `galaxy.js` and `nebula.js` are
   not imported by the active entry point.
8. There is no visibility pause, context-loss fallback, 3D-off mode or explicit
   WebGL fallback image.

## 3. Target architecture

```text
ORVEXSTUDIO-WEB/
|-- index.html                 # SEO-safe web entry during migration
|-- src/
|   |-- app/                   # boot, routing and navigation composition
|   |-- components/            # reusable presentation components
|   |-- features/              # projects, creatures, media, news, careers
|   |-- data/                  # bundled, versioned canonical content
|   |-- repositories/          # bundled and future HTTP content adapters
|   |-- platform/              # web / Tauri / Capacitor capability adapters
|   |-- scenes/                # lazy Three.js scene modules and quality policy
|   |-- styles/                # tokens, layout, components and platform shells
|   `-- main.js
|-- public/                    # stable public assets and SEO files
|-- scripts/                   # content validation and future static generation
|-- src-tauri/                 # Phase 2 desktop shell only
|-- capacitor.config.*         # Phase 3 mobile shell configuration
|-- android/                   # Phase 3 generated native project
`-- ios/                       # Phase 4 generated native project
```

The platform directories are wrappers, not separate products. They consume the
same `dist` output and must not contain duplicated project, creature, news or
career copy.

## 4. Shared content contract

Phase 1 introduces versioned JSON under `src/data/`:

- `site.json`
- `projects.json`
- `creatures.json`
- `news.json`
- `careers.json`
- `contacts.json`
- `media.json`

`src/data/index.js` exposes a bundled repository. A future backend must implement
the same repository interface and normalize its responses to these contracts.
UI components depend on the repository interface, never directly on a CMS SDK.

Phase 1 deliberately does not replace server-visible HTML with client-only
rendering. That would be a large change and could reduce SEO. The first web
refactor should introduce build-time rendering from these JSON files, then remove
the duplicated legacy markup in the same verified change.

Content strategy:

1. Ship a validated content snapshot inside every Web, Tauri and Capacitor build.
2. Render bundled content immediately, including About and Contact.
3. When a backend exists, fetch a versioned manifest in the background.
4. Validate and cache a successful response.
5. Fall back to the last verified cache, then to the bundled snapshot.
6. Keep large media and 3D assets out of the content JSON; store typed URLs,
   dimensions, checksums and fallback images instead.

## 5. Navigation and rendering model

Approved routes:

- Home
- About
- Projects
- Creature Library
- Media
- News
- Technology
- Careers
- Contact

Web should expose crawlable route URLs and statically generated metadata rather
than becoming a client-only SPA. Desktop can use an adaptive sidebar at wide
sizes and a compact rail/menu at narrow sizes. Mobile should use a five-item
bottom bar for primary destinations plus a branded More sheet for the remaining
routes. All shells use the same route identifiers from `site.json`.

The Android hardware back button should first close overlays, then navigate back,
then minimize/exit only at the root. iOS and Android layouts must use safe-area
insets. Landscape should reduce or disable nonessential 3D rather than squeezing
the desktop hero into a short viewport.

## 6. Platform adapters

Application code must call small capability interfaces:

- `openExternal(url)`
- `share(content)`
- `getSetting(key)` / `setSetting(key, value)`
- `onDeepLink(callback)`
- `getNetworkState()`
- `setStatusBarStyle()`
- `registerPush()` only after a future user-facing opt-in

The Web adapter uses browser standards. The Tauri adapter may use only approved
Tauri plugins and capabilities. The Capacitor adapter uses official plugins when
a web API is insufficient. Feature detection is mandatory; importing a native
bridge must never be required for the normal Vercel web build.

## 7. Desktop shell: Tauri 2

Phase 2 will initialize Tauri in `src-tauri/` and point `frontendDist` to
`../dist`. It should use the Vite dev server at a fixed port and ignore
`src-tauri` in Vite watch mode.

Initial desktop capabilities should be minimal:

- core window operations required by the standard window
- safe external URL opening for an explicit allowlist
- local settings only when needed
- no shell execution
- no general file-system access
- no arbitrary HTTP plugin access

The normal Vite output is bundled with the app, so basic content works offline.
The Windows installer can be NSIS or MSI; choose after testing signing and the
WebView2 distribution mode. Do not enable the updater until signing keys, an
authenticated update manifest and rollback procedures exist.

## 8. Mobile shells: Capacitor 8

Phase 3 will configure Capacitor `webDir` as `dist`, then add Android. Phase 4
will add iOS on macOS. `npx cap sync` copies the same verified web build into the
native projects.

Initial native plugins should be limited to actual requirements such as App URL
handling, status bar, splash screen and network state. Push architecture should
define domain events now (`news.published`, `creature.revealed`,
`project.updated`, `trailer.published`) but must not register Firebase, APNs or
another external service in Phase 1.

## 9. Performance and 3D policy

Create three quality profiles selected from device capability and a user setting:

| Profile | Typical behavior |
| --- | --- |
| High | bloom, full cinematic, capped DPR 2 |
| Balanced | reduced stars/segments, DPR 1.5, lighter bloom |
| Reduced | fallback hero image, no permanent WebGL loop |

Required changes before mobile release:

- dynamically import the complete 3D experience rather than only Earth
- start it only for Home or the Contact cinematic
- pause rendering on `document.visibilityState !== 'visible'`
- stop or throttle the loop when the scene is outside the viewport
- honor `prefers-reduced-motion` and a persistent Disable 3D setting
- handle WebGL context loss and display an optimized fallback image
- compress GLB geometry and textures; evaluate Meshopt/Draco plus KTX2/Basis
- remove the remote model fallback and package a verified local model
- use responsive AVIF/WebP images with dimensions and lazy decoding
- cache by hashed asset URL and content-manifest version

## 10. Offline and cache model

- **Web:** add a service worker only after cache/version tests exist. Precache the
  app shell, About, Contact, bundled content and fallback images. Do not precache
  all trailers or 3D models.
- **Tauri/Capacitor:** bundled `dist` is the immutable fallback. Cache successful
  remote content and already requested media with size limits and version keys.
- A failed update must never replace the last valid cache.
- Show an explicit offline state for media that was not previously downloaded.

## 11. Security

- Never expose secrets through `VITE_*`; Vite intentionally bundles those values
  into client code.
- Use a strict CSP with self-hosted production assets and no inline scripts.
- Open external links through a platform adapter, validate `https:` and use a
  hostname allowlist. `mailto:` is allowed only for the official contacts.
- Keep Tauri capabilities window-specific and minimal. Do not enable shell or
  broad file-system permissions.
- Validate content schemas before rendering or caching backend data.
- Treat CMS text as data, not executable HTML. Sanitize any future rich text.
- Native signing keys and push credentials belong in CI/native secure storage,
  never in the repository.

## 12. SEO and Vercel

The native shells must not change the public canonical origin. Preserve and
improve the existing English metadata, canonical, `robots.txt`, sitemap and
GitHub-to-Vercel `npm run build` workflow.

Each future public route should produce static HTML with its own title,
description, canonical, Open Graph image and structured data. Do not replace the
indexed site with a client-only route shell. Native-only controls must be gated
through platform feature detection and omitted from crawlable output.

Use separate Vite modes for asset bases:

- web build: origin-root deployment compatible with Vercel
- native build: app-relative assets suitable for the bundled WebView

Convert hard-coded root URLs to a single asset URL helper before enabling native
builds.

## 13. Build commands

Available in Phase 1:

```text
npm run dev
npm run test
npm run build
npm run preview
```

Planned for Phase 2 and later (not installed in Phase 1):

```text
npm run desktop:dev
npm run desktop:build
npm run mobile:sync
npm run android:dev
npm run android:build
npm run ios:open
```

Every native command must run content validation and the appropriate Vite build
before packaging.

## 14. Local toolchain status

Detected on 7 August 2026:

- Node.js 24.19.0
- npm 11.17.0
- Rust/Cargo not installed
- Java not installed
- ADB not installed
- Android SDK environment variables not configured

Phase 2 therefore starts with the official Tauri Windows prerequisites and Rust
toolchain. Phase 3 requires Android Studio/SDK, a supported JDK and an emulator or
device. Phase 4 iOS builds require macOS and Xcode; the iOS project can be kept in
Git, but Windows cannot produce an App Store build.

## 15. Exact Phase 2 work

Phase 2 should contain these changes and no mobile platform generation:

1. Install the official Tauri 2 CLI/API after recording the exact versions.
2. Install and verify the Windows Rust/MSVC/WebView2 prerequisites.
3. Add `vite.config.js` with a fixed dev port, Tauri watch exclusion, explicit
   web/native base behavior and production chunk strategy.
4. Initialize `src-tauri` with identifier `com.orvexstudios.app`, `dist` as the
   frontend output and the existing Vite dev/build commands.
5. Add only the minimum desktop capability file; no shell or file-system access.
6. Create the platform adapter interface and Web/Tauri implementations.
7. Move inline browser behavior from `index.html` into modules so CSP can reject
   inline scripts.
8. Convert public asset URLs to the shared platform-safe asset resolver.
9. Remove the remote GitHub GLB fallback; optimize and verify the local logo.
10. Add quality settings, render pause/resume and a 3D fallback image before
    evaluating installer performance.
11. Add desktop window metadata, icons, adaptive navigation and local settings.
12. Run content validation, web build, Tauri dev, Tauri build and installer smoke
    tests on Windows.
13. Confirm `npm run build` still produces the unchanged Vercel web artifact and
    that canonical/robots/sitemap remain valid.
14. Document installer type, WebView2 mode, package size, startup time, memory and
    known limitations. Leave updater activation for a signed release phase.

### Phase 2 acceptance gates

- The public Vercel build remains deployable and SEO metadata is unchanged or
  improved.
- The Tauri application launches without network access and shows Home, About
  and Contact.
- Only one content source is used for migrated sections.
- No Tauri shell/file-system permission is present.
- External links and all five `mailto:` links behave correctly.
- Disable 3D persists locally and the fallback UI remains usable.
- A Windows development build and installer smoke test pass.

No push, deployment, updater endpoint or store submission is part of Phase 2.

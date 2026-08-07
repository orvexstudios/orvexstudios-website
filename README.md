# ORVEX STUDIOS

The existing cinematic ORVEX STUDIOS web experience, prepared in Phase 1 for a
shared Web, Windows, Android and iOS architecture.

## Current status

- Web remains the production implementation.
- Shared versioned content is available under `src/data/`.
- Tauri and Capacitor are architecture decisions only and are not installed yet.
- No deployment, push or native project generation was performed.

Read [MULTIPLATFORM_ARCHITECTURE.md](./MULTIPLATFORM_ARCHITECTURE.md) before
starting Phase 2.

## Requirements

- Node.js
- npm

## Commands available now

```powershell
npm install
npm run dev
npm test
npm run build
npm run preview
```

`npm test` validates the shared content IDs, required fields, navigation and all
official contact addresses. `npm run build` remains the production command used
by the existing GitHub-to-Vercel workflow.

## Planned commands

These commands are architectural targets and must not be used until their phase
has installed and verified the relevant toolchain:

```text
npm run desktop:dev       # Phase 2: Tauri development
npm run desktop:build     # Phase 2: Windows build/installer
npm run mobile:sync       # Phase 3: copy the verified dist into Capacitor
npm run android:dev       # Phase 3: Android development build
npm run android:build     # Phase 3: Android production build
npm run ios:open          # Phase 4: open the iOS project on macOS
```

## Content workflow

The future canonical content contract lives in `src/data/`. Phase 1 records the
current public content without replacing the SEO-visible HTML. Phase 2 must add
build-time rendering from this source before removing duplicated legacy markup.

Do not add secrets, API keys or signing credentials to frontend files or content
JSON. Do not push, deploy or publish native packages without explicit approval.

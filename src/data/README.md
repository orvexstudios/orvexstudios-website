# Shared content data

These versioned JSON files are the canonical content contract for the future
web, Tauri and Capacitor shells. Public copy is English by default.

Phase 1 records the content currently embedded in `index.html` without changing
the live rendering path. Phase 2 must migrate the affected HTML sections to a
build-time renderer before new content is added. Until that migration is
complete, edit the existing page and the matching JSON record in the same
change, then run `npm test`.

Rules:

- IDs and slugs are stable API keys and must be unique.
- Missing media is represented by `null` or an empty array, never a fake URL.
- All assets must use app-relative paths and provide accessible alternative text.
- Dates use ISO 8601 when known; `displayDate` may hold editorial labels.
- Future backend responses must preserve these contracts or be normalized by a
  repository adapter.
- Secrets, API keys and private production notes never belong in these files.

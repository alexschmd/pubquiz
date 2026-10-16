# TanStack Start migration

Replace Next.js and the bundled Once UI system with TanStack Start, Vite and focused React components.

Preserve the scoreboard at `/`, management at `/manage`, up to ten teams, team colors, score controls and existing `teams` localStorage data. Synchronization remains limited to tabs in the same browser and origin.

Validation: type checking, production build, persistence and tab synchronization, and both routes in the browser.

## React Doctor review

Ran `npx -y react-doctor@latest --verbose`, followed by a branch scan with `--scope changed` after fixes. The changed-scope scan reports 77/100 with two remaining warnings.

- Switched Motion to `LazyMotion` with `domMax` (layout animations require the full feature set).
- Memoized the context value and its action closures together.
- Made the editor save button explicitly `type="submit"`.
- Retained mount-time localStorage loading: SSR and the initial client render intentionally share the empty/loading state before browser-only storage is read. A lazy state initializer reading storage would introduce a hydration mismatch.
- Retained row-position keys: these identify the fixed first/second layout slots, not team identities. Teams already use their stable IDs and Motion layout IDs; keying rows by their contents would remount whole rows when ranks change.
- The full scan also flagged generated `.output` dependency code. Inspection showed React's import-map serialization applies `scriptRegex` / `scriptReplacer` after `JSON.stringify`; no application JSON HTML sink was found.

Typecheck, four regression tests and production build pass after the changes. No diagnostic suppression was added.

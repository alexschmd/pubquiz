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

## Restored Once UI effects

Restored the original mask/blur reveal (2s scoreboard, 1s management) as a focused CSS animation, plus Once UI's gradient canvas and radial mask geometry. Backgrounds were static in the original app; no continuous decorative motion was added. The reveal is disabled for `prefers-reduced-motion`. A shared Motion LayoutGroup connects ranking transitions across rows.

Browser inspection confirmed the reveal moves from mask-position 100% / blur 8px, through 50% / 4px, to 0% / 0px. Typecheck, regression tests and production build pass. React Doctor remains at 77/100 with the same two reviewed warnings.

## Sliding scoreboard numbers

Added an independent Motion-based rolling-digit component for scoreboard scores, with one spring per decimal place, stable place keys, a static initial value, negative signs and a reduced-motion fallback. Legacy fractional scores remain plain text. Assistive technology receives the actual number rather than all ten digit faces.

Browser checks covered 9 → 10, 10 → 0, 0 → -1, -1 → 100 and 100 → 99. Typecheck, regression tests and production build pass. React Doctor reports the same two reviewed warnings (77/100), with no new findings. No shadcn.io source or additional dependencies were used.

## Management UI

Installed official shadcn/ui (Base UI / Nova), Tailwind v4, and focused Button, Dialog, Input, Field, Table, Alert and Empty components. Replaced gradient management cards with a compact team table and stable score controls. The editor uses a controlled accessible dialog, labeled inputs, and a scrollable team list. Styling is neutral; team colors are small markers. Mobile layout prioritizes names and score controls.

Browser smoke checks verified adding/saving a team and persisting score changes, plus desktop/mobile layouts and dialog display. Typecheck, four regression tests and production build pass. React Doctor remains at 77/100 with the existing two reviewed warnings. CLI-generated utility imports were corrected to the local `cn` helper.

## Live questions

Added a question composer and adjustable 1–3600 second countdown. Publishing replaces the scoreboard with the question and timer; expiration keeps the question visible until dismissed by the host. A persisted absolute deadline keeps reloads and browser tabs aligned. Existing team data is independent.

Seven regression tests pass, including deadline persistence, countdown expiration, restoration and storage-event synchronization. Browser verification used separate management and scoreboard tabs and confirmed question display and remote dismissal. React Doctor currently reports 72/100: the two existing application findings plus two findings in generated shadcn Button/Field source (exported variants and error-list keys); no question-component findings.

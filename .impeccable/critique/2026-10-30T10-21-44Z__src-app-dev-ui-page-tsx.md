---
target: /dev/ui
total_score: 23
max_score: 40
na_heuristics:
p0_count: 0
p1_count: 3
target_identity: "file:/home/user/fixmaster/src/app/dev/ui/page.tsx"
target_fingerprint: "sha256:c306adb90d87bbc7b805ac87e89b88e8a9dc6d1dffda468a758fbb1423ec0b0d"
target_path: /home/user/fixmaster/src/app/dev/ui/page.tsx
timestamp: 2026-10-30T10-21-44Z
slug: src-app-dev-ui-page-tsx
---

Method: dual-agent (A: design review · B: detector + browser), isolated.

## Design Health Score (Nielsen)

| #     | Heuristic                      | Score | Key issue                                                                                            |
| ----- | ------------------------------ | ----- | ---------------------------------------------------------------------------------------------------- |
| 1     | Visibility of system status    | 2     | Loading button looks disabled; success and error toasts identical; Skeleton silent to screen readers |
| 2     | Match system / real world      | 3     | Indonesian shop vocabulary and Rupiah format; sonner strings in English                              |
| 3     | User control and freedom       | 3     | Dialog complete (44px X, Batal, Esc, focus return); persistent error toast only closable via 20x20 X |
| 4     | Consistency and standards      | 2     | Amber carries primary + in_progress + warning; toasts ignore badge tones                             |
| 5     | Error prevention               | 2     | No money input (DBD requires); placeholders look like real values                                    |
| 6     | Recognition rather than recall | 3     | Every status has icon + label; every input labelled                                                  |
| 7     | Flexibility and efficiency     | 2     | Enter does not submit dialog (no form); metric card not clickable                                    |
| 8     | Aesthetic and minimalist       | 3     | Calm, one amber per area; shadcn card padding roomy for dense UI                                     |
| 9     | Error recovery                 | 2     | Inline field error excellent; error toast unstyled, no action                                        |
| 10    | Help and documentation         | 1     | No field-hint primitive; kit documents no usage rules                                                |
| Total |                                | 23/40 | Acceptable                                                                                           |

## Design specificity

Partly authored: token layer, Readout LCD chip, VOLT Probe mascot, chamfer, domain status icons are Fixmaster. Button/Input/Card/Dialog/Toast are stock shadcn with new tokens. Detector: file scan 0 findings (regex-only undercount); live URL scan 2 advisories: low-contrast accent badge 4.3:1 on background (agrees with A), straggler on h1 specimen at 390px (specimen-only). Dark mode clean, no console errors.

## Priority issues

1. [P1] Error and success toasts identical; 20x20 close on never-dismissing error toasts; English labels; no mobileOffset. Fix in src/components/ui/sonner.tsx: 12% danger/success tints, 44px close hit area, Indonesian labels, mobileOffset, action option on toastError. Command: harden.
2. [P1] Status hue collision: brand-text #8f5507 vs warning #9a4508 = 1.07:1 (deuteranopia dE 1.1); Diterima vs Sudah diambil same grey. Fix: fill axis on Badge (solid in_progress, dashed outline waiting, neutral outline picked_up); requires DBD status table change. Command: colorize.
3. [P1] Accent badge 4.32:1 on background (DBD 4.66 assumed surface). Fix: darken light accent or rule badges on surface only; DBD change. Command: polish.
4. [P2] Loading state looks disabled (opacity-50, label 2.4:1). Fix: disabled:not-aria-busy:opacity-50 in button.tsx. Command: polish.
5. [P2] Brand chamfer shapes vanish (readout 1.08:1 vs dark page, empty-state panel 1.07:1). Fix: nested chamfer bezel with --volt-edge; EmptyState component on surface. Command: bolder.

## Persona red flags

Alex: Enter does not save payment; stacked error toasts each need 20px X; metric card not clickable. Sam: toast type only by 16px glyph; English sonner strings; accent badges 4.32:1; CardTitle is div; Skeleton silent; Menyimpan 2.4:1. Casey: 20px toast close; toasts will cover bottom bar; mobile dialog footer visual order != tab order.

## Minor observations

Specimen breaks own rules (4 amber buttons in a row, 3 mascots). Kit covers ~9/20 DBD components (rest scheduled in later IPD steps); placeholders should be format hints. Read-only identifiers should be readOnly/Readout, not disabled. danger hover lightens while primary darkens. No ::selection token. Plex Mono 700 faux-bold on mascot V-01. One unconfirmed hydration error on first mobile load (separate from known reduced-motion debt).

## Questions to consider

1. Without readout.tsx and mascot.tsx, would Operate screens still look like Fixmaster? Should badges, section labels, money fields carry the instrument language?
2. Why is Menunggu persetujuan (money stuck) the same brown as Dikerjakan instead of the loudest status?
3. For money/stock failures, are toasts enough or should those be inline banners?

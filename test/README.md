# FirstMotion QA

No application files or generated reports are modified by these checks. Node.js 20+ and Python 3 are sufficient for the unit and static suites.

## Quick checks

```sh
node --test test/*.test.js
python3 test/static-qa.py
node --check script.js && node --check lang.js && node --check accessibility.js && node --check fit-check.js
```

The 20 unit tests include all 144 possible questionnaire answer combinations in each language, result-copy coverage, optional business details, and round-trip WhatsApp encoding with Hebrew, emoji, ampersands, plus signs, question marks, URLs, fragments and newlines.

The static suite parses every HTML page using Python's HTML parser. It checks duplicate IDs, authored language/direction, one main/H1 per page, viewport metadata, image alt presence, safe new-tab links, translation attribute content, local files and cross-page/hash targets, CSS font/image resources, valid JSON-LD, and required interaction handlers. This does not substitute for visual or runtime accessibility testing.

A second checkout or frozen baseline can be tested without copying its files into this repository:

```sh
python3 test/static-qa.py --root /path/to/site --out /tmp/static-report.json
```

## Browser regression suite

```sh
node test/browser-qa.js --out /tmp/firstmotion-qa --label redesign
```

The suite discovers a locally installed Playwright package, then falls back to the preinstalled runtime module. Chromium defaults to `/usr/bin/chromium`. Override these if needed:

```sh
PLAYWRIGHT_MODULE=/path/to/node_modules/playwright CHROMIUM_PATH=/path/to/chromium node test/browser-qa.js
```

Useful options:

- `--root /path/to/site`: serve a different checkout or frozen baseline.
- `--out /tmp/qa-report`: JSON report and screenshots directory.
- `--label baseline`: human-readable report label.
- `--match fit-check`: run only checks containing this text.

The runner starts and stops its own loopback-only static server. Each case uses a fresh browser context. ALL requests outside that local origin are aborted before transmission, including analytics scripts, tracking pixels, external images and WhatsApp navigation. Pop-up calls are intercepted. Only synthetic test names and an `example.test` business are used; no leads are sent. Blocked remote images may change the appearance of old pages that depended on a CDN, so their screenshots are functional/layout references rather than complete visual baselines.

The 33 checks cover:

- 375, 390, 768 and 1440 px layouts in Hebrew/RTL and English/LTR, including overflow after scrolling through each section
- Language controls, translated hero text, button state, reload/other-tab/legal-page persistence
- Mobile menu open, Escape/focus restoration, and close after choosing a link
- Every local page/hash link and safe external links
- All four questionnaire steps; disabled-next validation; back/answer preservation; name validation; all result branches; in-dialog language changes
- Close button, Escape, backdrop click, focus trap/restoration, scroll unlock, clean reopening and direct `#fit-check` links
- Rapid reopen regression against an uncancelled close timer
- A fully encoded WhatsApp URL intercepted before leaving the local site
- Direct-contact URL wiring and translated WhatsApp draft
- Accessibility size, contrast, grayscale, link emphasis, readable font and reduced-motion controls; persistence and reset
- FAQ open/close behavior and the existing one-answer-at-a-time contract
- Normal-motion startup, resize and modal interactions

The suite exits nonzero on any failed check or a browser-launch failure. `report.json` distinguishes failed checks from a `fatalError` that prevented the checks from running. A zero-check launch failure is NOT a browser pass.

## Optional local manual preview

```sh
node test/serve-qa.js . 8765
```

This loopback preview sends a restrictive Content Security Policy that blocks remote assets, analytics and connections. The policy does NOT block top-level external navigation: do not complete WhatsApp handoffs or click external contact links during manual preview. Use the automated suite for safe intercepted handoff checks. Stop with Ctrl+C.

## Known execution limit in the authoring environment

On 2026-10-12, local Chromium could not start because the executor denied Unix socket creation (`process_singleton_posix.cc: socket() failed: Operation not permitted`), including an approved elevated launch. The supported cloud browser was available but could not reach this executor's loopback server. Browser cases were authored and syntax checked, but not executed here. Run them in a Chromium-capable environment before treating the visual and interaction checks as passed.

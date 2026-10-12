# FirstMotion website

Static, bilingual Hebrew/English marketing site for https://firstmotion.co/. There is no compilation step, application server or generated framework bundle.

## Local preview

```sh
node test/serve-qa.js . 8765
```

Open http://127.0.0.1:8765. This QA server blocks external analytics and connections with CSP. It never submits a lead. Production hosting should continue serving the site files normally; the QA server is not the deployment server.

## Checks

```sh
node --test test/*.test.js
python3 test/static-qa.py
node --check script.js
node --check lang.js
node --check fit-check.js
node --check accessibility.js
```

Browser regression testing instructions and network-safety details are in [test/README.md](test/README.md). CI runs local-only browser checks, retaining screenshots and the JSON report as an artifact.

## Release review

Use the redesign branch and draft PR for review. Merging and production release remain manual. Review Hebrew/English at phone and desktop widths, all four fit-check questions and the prefilled WhatsApp handoff, legal pages and the AI wording. The workflow graphic is an example, not an operational CRM dashboard or a claim of deployed customer integrations.

See [DESIGN.md](DESIGN.md) for the new identity and [PRODUCT.md](PRODUCT.md) for business context. Contact settings remain in `fit-check.js`; no secrets should be added to this static repository.

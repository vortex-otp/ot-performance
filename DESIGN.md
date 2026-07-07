# DESIGN.md — O.T Performance

## Concept
A confidential printed capability profile: paper document on a dark desk.
Everything on the paper behaves like premium print (hairlines, mono microtype,
numbered sections, spec tables); everything around it behaves like a dark studio.

## Tokens (styles.css :root)
- Surround: --dark #0A0B0D, --dark-2 #111316
- Paper: --paper #F7F5F0, --paper-card #FCFBF7, --paper-edge #ECE9E1
- Ink scale: --ink #16171A → --ink-4 #9A9CA2
- Hairlines: --rule rgba(22,23,26,.12), --rule-soft .07
- Accent: --accent #2F5BF0 (electric cobalt), --accent-ink #1E40D6
- Live/positive: --live #18A558
- Max width: 1080px

## Type
- Hebrew body: Heebo
- English display: Space Grotesk
- Microtype / labels / indices: JetBrains Mono, uppercase, tracked
- Section grammar: outlined giant number + mono EN label + Hebrew title + Hebrew sub

## Components
- .section (00–09 numbered), .section-head, .tag, .spec-table, .matrix/.cap,
  .quad, .tri/.checklist, .flow, .funnel, .timeline/.tl-step, .results, .faq,
  .pull (quote), .btn (-primary/-wa/-ghost), .toc, .topbar (sticky document bar)
- Grid-of-cells pattern: 1px --rule gap grid inside a 14px-radius hairline frame

## Motion
- ease: cubic-bezier(.2,.7,.2,1), reveals .6–.7s translateY
- .reveal on sections (IntersectionObserver), .stagger on grids (JS-applied,
  progressive enhancement, per-child --d delay)
- Reduced motion + a11y-no-motion must disable everything

## Rules
- No emojis. No fake data. No gradient text. No side-stripe borders.
- Hebrew is the default language; every text node carries data-en for English.
- Accessibility widget (IS-5568) is self-injecting from accessibility.js.

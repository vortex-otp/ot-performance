# First Motion Design System — "Momentum"

## Direction

One right move, and everything moves. The identity is a domino chain: five pieces (attention, action, lead, response, revenue) that fall in sequence when the first one is pushed. The hero acts this out once on load; everything else on the page stays calm and editorial. Never a SaaS card collage, never stock "growth" imagery.

## Palette

| Token | Hex | Use |
|---|---|---|
| Aubergine ink | `#2A1430` | Text, dark sections, domino tiles |
| Deep ink | `#1D0C22` | Contact section, footer |
| Plum | `#6B2D73` | Secondary accent (the "response" tile) |
| Lilac paper | `#F3EFF6` | Page ground |
| Sunken paper | `#E8E0EE` | Founders section |
| Muted text | `#5E4A66` | Secondary text on paper (7.2:1) |
| Muted on dark | `#CDBFD4` | Secondary text on ink (9.6:1) |
| Coral | `#C8442A` | Primary buttons with white text (4.9:1), the first and last domino |
| Coral glow | `#F07A55` | Coral on dark surfaces only |

Coral is reserved for action: the CTA, the first domino (the push) and the last (the revenue it produces). The old acid yellow and lilac frame are retired.

## Typography

- Display: **Suez One** (Hebrew + Latin), headlines and domino labels only.
- Text: **Assistant** 400–800.
- Both are self-hosted from `assets/fonts/` (no Google Fonts request).
- Headlines are large and sit tight (line-height ~1); body copy stays at 17–21px with 1.6 line height and ≤ 60ch.
- No tracked all-caps eyebrows. Section labels were removed; headings carry the structure.

## Motion

Built with GSAP + ScrollTrigger and Lenis smooth scroll (vendored in `assets/vendor/`).

- **Opening:** a coral domino stands, tips, and the curtain lifts (once per session).
- **Hero:** dark cinematic Higgsfield video loop of the domino chain; headline lines rise from a mask; parallax as you scroll away.
- **Marquee:** coral band whose speed answers scroll velocity.
- **Domino chain (centerpiece):** on desktop the section pins; each scroll step tips the next domino and swaps the stage image and copy. On mobile it becomes a stacked list with image parallax.
- **Gap map:** the crack opens, then a coral bar sweeps across to "First Motion: the whole chain".
- Masked word reveals on headings, a drawing line over the four steps, tilting fit cards, magnetic CTAs, animated FAQ, pointer-following glow in the contact section.
- Directions mirror for RTL/LTR. `prefers-reduced-motion`, the a11y "stop motion" toggle, or missing JS all show the finished state with no animation.

Media generated in Higgsfield is hotlinked for now; `scripts/localize-media.sh` pulls it into `assets/media/` as WebP/MP4.

## CTA

One phrase everywhere: **מצאו את המהלך הראשון / Find your first move** → opens the fit check, which hands off to WhatsApp.

## Proof

No invented numbers, logos or clients. Until real cases exist, trust comes from method transparency, the founders, the ownership commitments and the "what we will and won't promise" section.

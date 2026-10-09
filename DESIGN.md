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
- Headlines are large and sit tight (line-height ~1); body copy stays at 17–21px with 1.6 line height and ≤ 60ch.
- No tracked all-caps eyebrows. Section labels were removed; headings carry the structure.

## Motion

- One orchestrated moment: the hero chain falls when it scrolls into view (150ms stagger, ease-in fall), the revenue tile lights up, and "Push again" replays it.
- The fall direction mirrors with the language: right-to-left in Hebrew, left-to-right in English.
- `prefers-reduced-motion` and the accessibility widget's "stop motion" both show the end state with no animation.
- Only transforms and opacity are animated.

## CTA

One phrase everywhere: **מצאו את המהלך הראשון / Find your first move** → opens the fit check, which hands off to WhatsApp.

## Proof

No invented numbers, logos or clients. Until real cases exist, trust comes from method transparency, the founders, the ownership commitments and the "what we will and won't promise" section.

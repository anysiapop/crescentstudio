# CLAUDE.md — Crescent Studio Website Rules

## Always Do First
- **Invoke the `crescent-brand` skill** before writing any frontend code, every session, no exceptions. It has the locked colors, fonts, and voice rules.
- Also invoke `frontend-design` for general layout/craft judgment, but `crescent-brand` overrides it wherever the two disagree — see Guardrails below.

## Reference Images
- If a reference image is provided: match layout, spacing, typography, and color exactly. Swap in placeholder content (images via `https://placehold.co/`, generic copy). Do not improve or add to the design.
- If no reference image: design from scratch with high craft, following the Guardrails below — not generic "make it look premium" instincts.
- Screenshot your output, compare against reference, fix mismatches, re-screenshot. Do at least 2 comparison rounds. Stop only when no visible differences remain or user says so.

## Local Server
- **Always serve on localhost** — never screenshot a `file:///` URL.
- Start the dev server: `node serve.mjs` (serves the project root at `http://localhost:3000`)
- `serve.mjs` lives in the project root. Start it in the background before taking any screenshots.
- If the server is already running, do not start a second instance.

## Screenshot Workflow
- Puppeteer path: <!-- VERIFY THIS — was C:/Users/nateh/AppData/Local/Temp/puppeteer-test/, confirm it matches this machine before first use -->
- Chrome cache path: <!-- VERIFY THIS — was C:/Users/nateh/.cache/puppeteer/, confirm before first use -->
- **Always screenshot from localhost:** `node screenshot.mjs http://localhost:3000`
- Screenshots save to `./temporary screenshots/screenshot-N.png` (auto-incremented, never overwritten).
- Optional label suffix: `node screenshot.mjs http://localhost:3000 label` → saves as `screenshot-N-label.png`
- After screenshotting, read the PNG from `temporary screenshots/` with the Read tool.
- When comparing, be specific: "heading is 32px but reference shows ~24px", "card gap is 16px but should be 24px."
- Check: spacing/padding, font size/weight/line-height, colors (exact hex), alignment, border-radius, shadows, image sizing.

## Output Defaults
- Single `index.html` file, all styles inline, unless user says otherwise.
- Tailwind CSS via CDN: `<script src="https://cdn.tailwindcss.com"></script>` — configure the custom palette below in the Tailwind config block, don't use default theme colors.
- Placeholder images: `https://placehold.co/WIDTHxHEIGHT`
- Mobile-first responsive.

## Brand Assets
- Check `brand_assets/` and `~/.claude/skills/crescent-brand/` before designing anything. `SKILL.md` has the core rules; `reference.md` has full copy (headlines, taglines, statement bank) if a section needs pre-written lines instead of new ones.
- Use the exact hex values from the skill. Do not invent brand colors, even ones that seem close.
- If a logo asset exists in `brand_assets/`, use it — the crescent mark, white on black or black on cream, never colored.

## Guardrails — Crescent Studio specific (overrides generic anti-generic advice)
- **Colors:** One accent only — Sunset Terracotta `#C1623B`. Everything lighter or darker is a step on its ramp (`#F1DAD0 → #E2B4A1 → #D2896B → #C1623B → #9C4F30 → #753C24 → #4E2818`), never a new hue. Lavender/indigo appears nowhere on this site except inside the one locked eclipse gradient, used rarely and deliberately — never as a hero background by default.
- **Shadows:** Flat surfaces. No layered, color-tinted, or glow shadows anywhere. Depth comes from spacing, borders, and type weight, not shadow stacking.
- **Gradients:** None, except the single locked eclipse gradient (see skill for the exact recipe), used for one deliberate moment per page at most — not a hero default, not a repeated section treatment.
- **Texture:** No grain, no noise filters, no glassmorphism. Flat means flat.
- **Typography:** Two fonts only — PP Neue Montreal (functional: body, labels, UI) and Times New Roman (voice: headlines, pull quotes). Tight tracking on large headings is fine; don't add a third typeface for "personality."
- **Animations:** Animate `transform` and `opacity` only, never `transition-all`. Motion follows the brand's own language: slow ease-in ("emerge"), stillness is allowed ("hold"), fades and echoes rather than hard cuts ("return") — no bounce, no spring.
- **Interactive states:** Every clickable element needs hover, focus-visible, and active states. No exceptions.
- **Images:** No gradient overlay or `mix-blend-multiply` treatment by default. If a product screenshot needs framing, use the moon-window arch or a full-bleed-with-ink-caption-strip treatment — see `reference.md`.
- **Spacing:** Intentional, consistent spacing tokens, not arbitrary Tailwind steps.

## Hard Rules
- Do not add sections, features, or content not in the reference (or not requested, if designing from scratch).
- Do not "improve" a reference design — match it.
- Do not stop after one screenshot pass.
- Do not use `transition-all`.
- Do not use default Tailwind blue/indigo, or any color outside the terracotta ramp and neutrals, as a primary or accent color.
- Do not introduce gradients, shadows, or texture outside what's listed in Guardrails above, even if it would look "more premium" by generic standards.

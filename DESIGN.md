---
name: Fábio, Corretor de Imóveis
description: Jardim Moderno, a Brazilian tropical-modernist real estate site drawn in flat colour fields, layered arches and one quarter-circle corner per photo.
colors:
  jardim: "#0d5c41"
  jardim-fundo: "#083d2b"
  acafrao: "#f5b301"
  acafrao-hover: "#ffc933"
  cobalto: "#2d4bd6"
  concreto: "#e4e9e1"
  concreto-claro: "#f1f4ee"
  menta: "#d7ebdf"
  azul-claro: "#dce3ff"
  tinta: "#10241c"
  tinta-suave: "#3b4f44"
  erro: "#b3261e"
typography:
  display:
    fontFamily: "Bricolage Grotesque, Arial Narrow, sans-serif"
    fontSize: "5.4rem"
    fontWeight: 800
    lineHeight: 0.98
    letterSpacing: "-0.035em"
  headline:
    fontFamily: "Bricolage Grotesque, Arial Narrow, sans-serif"
    fontSize: "3.75rem"
    fontWeight: 800
    lineHeight: 1.02
    letterSpacing: "-0.035em"
  title:
    fontFamily: "Bricolage Grotesque, Arial Narrow, sans-serif"
    fontSize: "1.5rem"
    fontWeight: 700
    lineHeight: 1.15
    letterSpacing: "-0.02em"
  price:
    fontFamily: "Bricolage Grotesque, Arial Narrow, sans-serif"
    fontSize: "2.125rem"
    fontWeight: 800
    lineHeight: 1
    letterSpacing: "-0.03em"
  body:
    fontFamily: "Hanken Grotesk, system-ui, Segoe UI, sans-serif"
    fontSize: "1.0625rem"
    fontWeight: 400
    lineHeight: 1.6
  label:
    fontFamily: "Hanken Grotesk, system-ui, Segoe UI, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 700
    lineHeight: 1
rounded:
  edge: "4px"
  field: "12px"
  corner-sm: "36px"
  corner: "132px"
  pill: "999px"
spacing:
  xs: "8px"
  sm: "12px"
  md: "20px"
  lg: "32px"
  xl: "56px"
  gutter: "64px"
components:
  button-primary:
    backgroundColor: "{colors.acafrao}"
    textColor: "{colors.tinta}"
    rounded: "{rounded.pill}"
    padding: "0 1.6rem"
    height: "52px"
  button-primary-hover:
    backgroundColor: "{colors.acafrao-hover}"
  button-ink:
    backgroundColor: "{colors.tinta}"
    textColor: "{colors.concreto-claro}"
    rounded: "{rounded.pill}"
    height: "52px"
  button-ink-hover:
    backgroundColor: "{colors.jardim}"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.tinta}"
    rounded: "{rounded.pill}"
    height: "44px"
  chip:
    backgroundColor: "transparent"
    textColor: "{colors.tinta}"
    rounded: "{rounded.pill}"
    height: "44px"
    padding: "0 20px"
  chip-selected:
    backgroundColor: "{colors.tinta}"
    textColor: "{colors.concreto-claro}"
  search-panel:
    backgroundColor: "{colors.concreto-claro}"
    textColor: "{colors.tinta}"
    rounded: "{rounded.corner-sm}"
    padding: "18px 20px 20px"
  field:
    backgroundColor: "#ffffff"
    textColor: "{colors.tinta}"
    rounded: "{rounded.field}"
    height: "52px"
  listing-photo:
    backgroundColor: "{colors.jardim-fundo}"
    rounded: "{rounded.corner}"
  step-card:
    backgroundColor: "{colors.cobalto}"
    textColor: "#ffffff"
    rounded: "{rounded.corner-sm}"
    padding: "24px"
---

# Design System: Fábio, Corretor de Imóveis

## Overview

**Creative North Star: "The Modernist House in Flat Colour"**

The site is one house drawn the way Brazilian modernism drew it: whole regions owned by a single saturated colour, arches standing on a concrete ground line, and a single quarter-circle swung out of an otherwise square photograph. Burle Marx colour fields, Niemeyer curves. Depth is stacking, never lighting: one flat shape overlaps another and that is the whole illusion.

Density is generous and mobile-first. Sections alternate whole colour fields (jardim green, cobalt, concrete, deep green) rather than sharing a neutral page with cards on it. The voice is direct and local, and the interface is built so that one saffron button, WhatsApp, is always the loudest thing within reach.

**Key Characteristics:**
- Every section owns one flat colour field; no gradient, glass or blur anywhere in the build.
- Arches (fully rounded top, square base) and a single large quarter-circle corner are the only large-scale shapes.
- Every listing carries the same three-cell label grid (Código, Tipo, Bairro) between ink rules.
- Saffron is spent on actions, the logo mark and one sun; nothing else.
- Photos are placeholder stock, marked "Ilustrativo" on each card.

## Colors

A drenched tropical palette: two greens, one cobalt, one saffron, over a grey-green concrete ground and an ink that is green-black, never pure black.

### Primary
- **Jardim Green** (#0d5c41): the hero, top bar, "Como funciona" band and hover state of ink buttons. The brand's dominant field.
- **Saffron** (#f5b301): primary action buttons, the floating WhatsApp button, the sun in the hero, selection highlight, link underlines on dark fields, step 4 card. Hover lifts to Saffron Light (#ffc933).

### Secondary
- **Cobalt** (#2d4bd6): the second colour field. The "Vender" band, the middle hero arch, step 1 card, focus ring and caret on light surfaces.

### Neutral
- **Concreto** (#e4e9e1): the page ground, the ground line under the hero arches, the imóveis and Sobre sections, step 2.
- **Concreto Claro** (#f1f4ee): raised light surfaces: search panel, contact form, empty state, Ambientes section, tile captions.
- **Jardim Fundo** (#083d2b): deepest green. Photo placeholder fill, contato and footer fields, mobile nav drawer, step 3.
- **Ink** (#10241c): all text on light fields, the ink button and ghost outline, label-grid rules.
- **Ink Soft** (#3b4f44): secondary text and field labels on light fields.
- **Menta** (#d7ebdf): secondary text on green fields. **Azul Claro** (#dce3ff): secondary text on cobalt.
- **Error Red** (#b3261e): form validation only.

### Named Rules
**The Flat Field Rule.** A region is one solid colour. Depth comes from overlapping shapes and adjacent fields, never from shadow, gradient, glass or blur.
**The Saffron Scarcity Rule.** Saffron marks the action, the mark and the sun. It is never a background for a whole section and never decoration for its own sake.
**The Paired Text Rule.** Light fields take Ink and Ink Soft; green fields take white and Menta; cobalt takes white and Azul Claro. Do not cross the pairs.

## Typography

**Display Font:** Bricolage Grotesque (with Arial Narrow fallback), self-hosted variable woff2
**Body Font:** Hanken Grotesk (with system-ui fallback), self-hosted variable woff2

**Character:** Bricolage is tight, heavy and slightly quirky in headlines and prices; Hanken stays calm and legible for everything else. Hierarchy comes from weight and size contrast, not from case or tracking tricks.

### Hierarchy
- **Display** (800, clamp(2.6rem, min(1.1rem + 5vw, 9.4vh), 5.4rem), 0.98): the hero H1 only, max 13.5em wide.
- **Headline** (800, clamp(2.1rem, 1.2rem + 3.2vw, 3.75rem), 1.02): section H2s; Sobre uses a slightly smaller clamp up to 3.5rem.
- **Title** (700, 1.3 to 1.5rem, 1.15): listing names, empty-state heading, step titles (1.5rem, 1.75rem on desktop).
- **Price** (800, 1.7 to 2.125rem, 1, tabular numerals): the one number on a listing card.
- **Body** (400, 1.0625rem to 1.3125rem, 1.6): paragraphs, capped at 28 to 38em.
- **Label** (700, 0.75 to 0.9375rem, sentence case, no tracking): label-grid headings (dt), field labels, seals, chips.

### Named Rules
**The Sentence Case Rule.** Labels, chips and buttons are sentence case at normal tracking. Small caps-style uppercase labels are not part of this system.
**The Tight Display Rule.** Bricolage headings run -0.02em to -0.035em tracking and balanced wrapping; body text never does.

## Layout

A single long column of full-bleed colour fields, each holding a content wrap of `min(100% - 2 * gutter, 1280px)` with a fluid gutter of 20px to 64px. The hero is a 6.6fr / 5.4fr grid (copy left, arches right) filling the viewport under a 72px sticky top bar; below 900px it stacks and a shortened arch group sits directly under the buttons, ahead of the search panel. Section padding runs clamp(72px, 9vw, 128px) top.

Listings are 1 column on phones, 2 from 640px, 3 from 1024px with a 72px stagger on the middle column. The Ambientes mosaic is a 12-column bento at 1024px, 2-column at 640px. "Como funciona" is four cards that become a staircase of arches rising by 64px per step at 1024px. Breakpoints: 640, 900, 1024. Spacing is a loose 4/8 rhythm (8, 12, 16, 20, 24, 32, 40, 56, 72) with larger gaps between sections than within. Tap targets are at least 44px.

## Elevation & Depth

Flat. There are no box-shadows, gradients, backdrop filters or glass in the build. Depth is conveyed by overlap (the hero's three arches, the stepped arches in Como funciona), by alternating colour fields, and by a 16px concrete ground line under the hero (10px on mobile) on which the arches stand. The only translucency is the dark "Ilustrativo" seal (ink at 82%) and hairline rules on dark fields (white at 14 to 16%).

### Named Rules
**The Layered Colour Rule.** To raise something, put a different flat colour behind or in front of it. Never add a shadow.

## Shapes

Two gestures, used with discipline. The **arch**: a 999px top radius with a square base, for hero arches, the Ambientes tall tile and the desktop step cards. The **quarter-circle corner**: one corner at 36px on small panels (search, form, empty state, step cards on mobile) or up to 132px on photos (clamp(64px, 9vw, 132px)), every other corner a near-square 4 to 6px. Each photo gets exactly one large corner, alternating top-left and top-right. On hover (pointer devices) a listing's large corner grows by 1.6x while the image scales to 1.05. Controls are pills (999px) or 12px-radius inputs with a 2px ink border. Label grids use 1.5px ink rules, top and bottom plus vertical dividers.

## Components

### Buttons
- **Shape:** full pills (999px), 2px border, min-height 52px (44px small, 60px large), bold Hanken.
- **Primary:** saffron fill, ink text. Hover lightens to #ffc933. Used for every WhatsApp action.
- **Ink:** ink fill, light text, hover to Jardim Green. For Buscar and form submission.
- **Ghost:** 2px ink outline, fills ink on hover. Per-listing "Tenho interesse".
- **Press / focus:** scale(0.97) on active; 3px focus ring offset 3px, cobalt on light fields and saffron on dark fields.

### Chips
- **Style:** pill, 2px ink border, transparent; filter chips for property type and the option chips in the contact form.
- **State:** selected is ink fill with Concreto Claro text; hover adds an 8% ink tint.

### Cards / Containers
- **Listing:** no container box. A photo with one large corner, the label grid, title, specs in two columns with icons, price and a ghost button. Seals sit on the photo: saffron "Destaque" top-right, dark "Ilustrativo" bottom-left.
- **Panels** (search, form, empty state): Concreto Claro fill, one 36px corner, no border, no shadow.
- **Step cards:** each a different flat field (cobalto, concreto, jardim-fundo, acafrao).

### Inputs / Fields
- **Style:** white fill, 2px ink border, 12px radius, 48 to 52px tall, label above in Ink Soft bold 0.8125rem.
- **Focus:** the global 3px cobalt outline. **Error:** border turns Error Red with a bold red message below.

### Navigation
Sticky 72px Jardim Green bar: arch-mark logo with Bricolage wordmark, semibold links with a saffron underline that scales in from the left on hover, a small saffron WhatsApp button. Under 900px links collapse to a circular menu button and a Jardim Fundo drawer with ruled rows. A floating saffron WhatsApp button exists only below 900px.

### Label Grid (signature)
A definition list in three cells (Código, Tipo, Bairro) between ink rules, with small bold Ink Soft headings over bold values. Identical on every listing; this is the system's recurring signature.

### Motion
One easing: cubic-bezier(0.16, 1, 0.3, 1). Hero arches rise from the ground in 1.3s stagger, the sun scales in last. Content reveals on scroll with a 24px rise and fade (0.9s), steps entering in sequence. Reduced-motion collapses all durations.

## Do's and Don'ts

### Do:
- **Do** give each section a whole flat colour field and keep text on its paired colour set.
- **Do** cut photos with exactly one large quarter-circle corner (or a full arch) and 4px on the rest.
- **Do** keep the saffron pill as the single dominant action on any screen.
- **Do** rule every listing with the same Código / Tipo / Bairro label grid.
- **Do** keep tap targets at 44px or more and set focus rings by field colour.

### Don't:
- **Don't** add shadows, gradients, glass or blur; layer flat colour instead.
- **Don't** use saffron as a section background or for ornament.
- **Don't** round every corner of a photo; one big curve per piece.
- **Don't** fall back to the real-estate default of navy and gold with a stock hero photo and a bolted-on search bar.
- **Don't** set uppercase tracked kickers or eyebrows above headings; the build has none.


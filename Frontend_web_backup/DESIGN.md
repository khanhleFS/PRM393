  # Luminovels — Typography & Font Usage Guide

  > Based on the **Lumina Scroll Design System** (Material 3 Expressive).  
  > All three fonts are loaded via Google Fonts in `src/index.css` and mapped  
  > through Tailwind v4 `@theme` tokens.

  ---

  ## Font Stack

  | Token | Tailwind class | Typeface | Fallback |
  |---|---|---|---|
  | `--font-sans` | `font-sans` | **Plus Jakarta Sans** | `sans-serif` |
  | `--font-serif` | `font-serif` | **Literata** | `serif` |
  | `--font-mono` | `font-mono` | **JetBrains Mono** | `monospace` |

  > `body` defaults to `font-sans` (Plus Jakarta Sans).  
  > You only need to add an explicit class when **overriding** the body default.

  ---

  ## 1. Plus Jakarta Sans — `font-sans`

  **Character:** Geometric, modern, highly legible. The primary interface typeface.

  ### ✅ Use for
  - All **UI chrome**: navigation, sidebars, buttons, tabs, badges, labels, tooltips
  - **Form elements**: inputs, selects, checkboxes, radio labels, error messages
  - **Page headings and section titles** outside the reader (Profile, Payment, Search, Home)
  - **Body copy** in any non-reader context (descriptions, meta info, card text)
  - **Numbers and prices** (e.g. coin balance, VND amounts in payment pages)
  - **CTA buttons** and interactive text

  ### ❌ Do NOT use for
  - Long-form reading content inside the Reader (`/[novelSlug]/[chapterSlug]`)
  - Code, transaction IDs, reference numbers

  ### Examples
  ```tsx
  // ✅ Page heading — Payment page
  <h1 className="text-4xl font-bold text-on-surface">Payment</h1>

  // ✅ Profile name — already font-sans because body inherits it
  <h2 className="text-2xl font-bold text-on-surface">Elaris Thorne</h2>

  // ✅ Button
  <button className="btn-primary">Confirm Recharge</button>
  ```

  ---

  ## 2. Literata — `font-serif`

  **Character:** Optical-size–aware literary typeface, optimized for long reading sessions on screen. Highly readable at paragraph scale.

  ### ✅ Use for
  - **Novel chapter body text** — the `<article>` inside `reader-feature.tsx`
  - **Chapter/novel titles** displayed *inside the Reader* (the `<h2>` at the top of the chapter card)
  - **Pull-quotes and blockquotes** within chapter content
  - **Stylized decorative headings** on the Home page (hero section, featured novel titles) — sparingly

  ### ❌ Do NOT use for
  - UI headings outside the reader context (e.g. "Payment", "Profile", "Choose Amount")
  - Labels, buttons, forms, navigation
  - Numbers, prices, transaction data

  ### Examples
  ```tsx
  // ✅ Chapter title in reader
  <h2 className="font-serif text-3xl font-bold">{activeChap.title}</h2>

  // ✅ Chapter body article
  <article className="font-serif" style={{ fontSize: `${fontSize}px` }}>
    {paragraphs.map(...)}
  </article>

  // ✅ Blockquote inside chapter
  <blockquote className="font-serif italic border-l-4 border-primary pl-6">
    "To weave is to sacrifice the thread…"
  </blockquote>

  // ❌ WRONG — UI payment heading, should be font-sans (default)
  <h1 className="font-serif text-4xl">Payment</h1>
  ```

  ---

  ## 3. JetBrains Mono — `font-mono`

  **Character:** Monospaced developer font. Every character occupies exactly the same width — ideal for aligning technical strings.

  ### ✅ Use for
  - **Transaction IDs** and reference codes (e.g. `TXN-8829-LM-2024`, `LUMI-MOMO-8142`)
  - **Numeric codes** that must align (chapter numbers in a table-like list)
  - **Debug / log output** if ever shown in UI
  - Any string where **character alignment matters**

  ### ❌ Do NOT use for
  - Headings, body copy, UI labels
  - Prices or coin balances (those are UI numbers → `font-sans`)

  ### Examples
  ```tsx
  // ✅ Transaction reference
  <span className="font-mono text-sm">TXN-8829-LM-2024</span>

  // ✅ Internal reference code
  <span className="font-mono text-xs text-on-surface-variant">LUMI-MOMO-8142</span>
  ```

  ---

  ## Quick Decision Guide

  ```
  Is it inside the Reader (chapter body / chapter title)?
    └─ YES → font-serif (Literata)
    └─ NO  → Is it a code / ID / reference string?
                └─ YES → font-mono (JetBrains Mono)
                └─ NO  → font-sans (Plus Jakarta Sans) ← the default, often no class needed
  ```

  ---

  ## Common Mistakes to Avoid

  | Mistake | Wrong | Correct |
  |---|---|---|
  | UI heading styled as literary | `<h1 className="font-serif">Payment</h1>` | Remove `font-serif` (inherits `font-sans`) |
  | Coin balance in mono | `<span className="font-mono">500.00</span>` | Remove `font-mono` (inherits `font-sans`) |
  | Reader body in sans | `<article className="font-sans">` | `<article className="font-serif">` |
  | Transaction ID in sans | `<span>TXN-001</span>` | `<span className="font-mono">TXN-001</span>` |

  ---

  ## Where Fonts Are Defined

  | File | Purpose |
  |---|---|
  | `src/index.css` — `@import url(Google Fonts)` | Loads the actual font files |
  | `src/index.css` — `@theme { --font-* }` | Registers tokens used by Tailwind utilities |
  | `src/index.css` — `body { font-family: var(--font-sans) }` | Sets global default |
  | `tailwind.config.js` | **Ignored in Tailwind v4** — kept for reference only |

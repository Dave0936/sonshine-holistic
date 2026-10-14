/* @ds-bundle: {"format":4,"namespace":"SonshineHollisticDesignSystem_de4847","components":[{"name":"Button","sourcePath":"components/buttons/Button.jsx"},{"name":"Component1","sourcePath":"components/buttons/Button.jsx"},{"name":"GlassButton","sourcePath":"components/buttons/GlassButton.jsx"},{"name":"Component2","sourcePath":"components/buttons/GlassButton.jsx"},{"name":"SmallButton","sourcePath":"components/buttons/SmallButton.jsx"},{"name":"ClassCardText","sourcePath":"components/classes/ClassCardText.jsx"},{"name":"CLASS_COLUMNS","sourcePath":"components/classes/ClassRow.jsx"},{"name":"ClassRow","sourcePath":"components/classes/ClassRow.jsx"},{"name":"ClassHeaderRow","sourcePath":"components/classes/ClassRow.jsx"},{"name":"BackToTop","sourcePath":"components/footer/BackToTop.jsx"},{"name":"Component7","sourcePath":"components/footer/BackToTop.jsx"},{"name":"EmailLink","sourcePath":"components/footer/EmailLink.jsx"},{"name":"Component6","sourcePath":"components/footer/EmailLink.jsx"},{"name":"FooterLink","sourcePath":"components/footer/FooterLink.jsx"},{"name":"Component5","sourcePath":"components/footer/FooterLink.jsx"},{"name":"SocialLink","sourcePath":"components/footer/SocialLink.jsx"},{"name":"Component4","sourcePath":"components/footer/SocialLink.jsx"},{"name":"Avatar","sourcePath":"components/icons/Avatar.jsx"},{"name":"Icon","sourcePath":"components/icons/Icon.jsx"},{"name":"Component3","sourcePath":"components/icons/Icon.jsx"},{"name":"NavDropdown","sourcePath":"components/navigation/NavDropdown.jsx"},{"name":"Component9","sourcePath":"components/navigation/NavDropdown.jsx"},{"name":"NavLink","sourcePath":"components/navigation/NavLink.jsx"},{"name":"Component8","sourcePath":"components/navigation/NavLink.jsx"}],"sourceHashes":{"brand-guidelines/doc-page.js":"f52ae9c02fca","components/buttons/Button.jsx":"5c762687e178","components/buttons/GlassButton.jsx":"10904b8dacbd","components/buttons/SmallButton.jsx":"bd0b7d999f80","components/classes/ClassCardText.jsx":"6cfa4c591d37","components/classes/ClassRow.jsx":"150101bd8a14","components/footer/BackToTop.jsx":"5f07372d4ea4","components/footer/EmailLink.jsx":"4a0d9fcd866c","components/footer/FooterLink.jsx":"a13b872d0bb6","components/footer/SocialLink.jsx":"167d3196ab98","components/icons/Avatar.jsx":"5ddda22ecc66","components/icons/Icon.jsx":"ce5441bf4907","components/navigation/NavDropdown.jsx":"5a6db91e6f24","components/navigation/NavLink.jsx":"12eb95a9f35f","ui_kits/website/Chrome.jsx":"f152eb1e6df5","ui_kits/website/ClassesPages.jsx":"910276aaa762","ui_kits/website/HomePage.jsx":"42771dde0d16"},"inlinedExternals":[],"unexposedExports":[]} */

(() => {

const __ds_ns = (window.SonshineHollisticDesignSystem_de4847 = window.SonshineHollisticDesignSystem_de4847 || {});

const __ds_scope = {};

(__ds_ns.__errors = __ds_ns.__errors || []);

// brand-guidelines/doc-page.js
try { (() => {
// @ds-adherence-ignore -- omelette starter scaffold (raw elements/hex/px by design)
// Copied omelette starter. Re-running copy_starter_component with this kind overwrites this file with the latest version (page content is unaffected).
/* BEGIN USAGE */
/**
 * <doc-page> — paged-document shell for printable HTML.
 *
 * FIRST, decide how the document paginates — up front, before building:
 *
 * - FLOWING document (the default): write the whole document as one
 *   normal HTML flow inside <doc-page>; the browser's print engine
 *   splits it onto pages at export. Use for long-form documents with a
 *   single text flow: reports, memos, letters, essays.
 * - EXPLICIT pagination: a fixed set of pre-paginated pages, one
 *   <section class="page"> child per page. Use when the user asks for a
 *   specific page count, or the design implies one: a one-page resume, a
 *   two-sided flier, a poster, a certificate, a brochure — any richly
 *   laid-out document without a single text flow.
 * - If in doubt, ask the user as part of the build.
 *
 * PAGE SIZING — paper differs by country (letter vs A4), so the printed
 * sheet is not one fixed truth:
 * - FLOWING documents pin NO paper size: the print engine paginates
 *   onto the user's real paper, and the content reflows to it.
 * - EXPLICITLY PAGINATED documents print each page at a FIXED page box
 *   with overflow hidden — letter by default, size="a4" for a clearly
 *   metric user, the user's chosen paper when they export. Design each
 *   page to FILL that box, fitting letter and A4 alike without overlap.
 * - width/height pin an explicit fixed size, ONLY when the user gives
 *   one.
 * Never write your own @page rule or hard-code paper dimensions in the
 * content.
 *
 * Sizing modes (attributes):
 *   (none)                      — portrait: flowing docs use the user's
 *           paper; explicitly paginated pages use the named size box
 *           (letter unless size="a4")
 *   orientation="landscape"     — the same, landscape
 *   width / height              — explicit fixed size, ONLY when the user
 *           gives one (e.g. width="22in" height="30in" for a 22×30
 *           poster): the page IS the design's size, printed at true
 *           dimensions (or scaled onto the user's paper at print time).
 *           Any absolute CSS length: px/in/mm/cm/pt/pc.
 * The component announces the chosen mode to the host app at runtime (a
 * meta tag it injects), so the print path can inject the user's true
 * paper size.
 *
 * On screen the document renders on a desk background: a flowing
 * document as one tall scrolling sheet (Google Docs' pageless view);
 * explicitly paginated documents as one card per page.
 *
 * EXPLICIT pagination usage:
 *   <style>doc-page:not(:defined){visibility:hidden}</style>
 *   <doc-page>
 *     <section class="page" id="p1">…one page's design…</section>
 *     <section class="page" id="p2">…</section>
 *   </doc-page>
 *   <script src="doc-page.js"></script>
 * How the page box works, concretely: each .page prints as ONE full-bleed
 * sheet at a FIXED physical size — letter by default (set size="a4" for
 * a clearly metric user), the user's chosen paper when they export —
 * with overflow hidden. Nothing scrolls and nothing reflows onto a next
 * sheet: content that misses the box is CLIPPED. Design each page to
 * FILL that page box, and to fit it — letter and A4 alike — without
 * overlap. Each page is a size container; don't size anything in
 * viewport units (they track the window, not the page), and never set
 * width or height on the .page section itself (the component sizes the
 * page box; an authored height like 100% is meaningless at print and is
 * overridden). The component owns the page box, the screen card chrome,
 * and the page breaks (never add your own break-before/after). Don't mix
 * .page sections with flowing content or header/footer slots in the same
 * document.
 *
 * FLOWING usage:
 *   <style>doc-page:not(:defined){visibility:hidden}</style>
 *   <doc-page margin="0.75in">
 *     <h1>Title</h1>
 *     <p>…body…</p>
 *   </doc-page>
 *   <script src="doc-page.js"></script>
 * There is no manual page-splitting — the browser's print engine
 * paginates at export. Standard break-hygiene rules (`break-inside:
 * avoid` on figures, code blocks, images and table rows; `orphans/
 * widows: 3`) are applied so paragraphs and groups split cleanly. On
 * screen and at print, headings default to `text-wrap: balance` and
 * body text to `text-wrap: pretty`; the defaults have zero specificity,
 * so any text-wrap you declare wins.
 *
 * Other attributes:
 *   size    — letter | a4 | legal (default letter). Flowing documents:
 *           preview proportion only — it does NOT pin their printed
 *           paper (the print dialog's paper governs); leave it alone
 *           there. Explicitly paginated documents: it sets the page box
 *           the cards and the pinned @page share (the export dialog's
 *           choice overrides both at print) — set size="a4" for a
 *           clearly metric user. Scaled-fit: names the sheet the fit is
 *           computed against, same a4-for-metric-users advice.
 *   content-width / content-height — the design's own fixed dimensions
 *           (CSS lengths), for scaling a fixed-size design ONTO the
 *           named sheet: content lays out at exactly this size, and the
 *           component scales it to fit that sheet's printable area
 *           (centered horizontally, top-aligned; the export dialog
 *           re-fits to the user's actual paper choice where available).
 *           Both must be set; they do not change the page box. For pages
 *           WITHOUT running header/footer slots.
 *   margin  — printable inset on every page of a FLOWING document
 *           (default 0.75in); margin="0" makes pages full-bleed.
 *           Explicitly paginated pages are always full-bleed.
 *
 * Running header/footer (flowing documents only): give an element
 * `slot="header"` or `slot="footer"` and it repeats on every printed
 * page via `position: fixed`. To keep body text from sliding under it,
 * the component prints inside a single-cell table whose <thead>/<tfoot>
 * are spacers sized to the header/footer height — browsers repeat
 * thead/tfoot on every page, so each sheet's content starts below the
 * header and ends above the footer. On screen the header/footer render
 * once at the top/bottom of the sheet.
 *
 * At print the component injects `@page { margin: 0 }` (which leaves
 * Chrome no margin box to draw its date/URL/page-count header in) and
 * moves the visual margin onto the sheet's own padding. It also marks
 * the document as owning its print CSS (a
 * `meta[name="omelette-owns-print"]` it injects at runtime), so the
 * PDF export never injects page-geometry CSS of its own on top.
 *
 * Print best practices for the content you author:
 * - Multi-column text: use CSS columns (`column-count` +
 *   `column-gap`), never side-by-side flex/grid columns — only real
 *   CSS columns flow and break across pages. `column-span: all` lets
 *   a heading span the columns; `hyphens: auto` (needs `lang` on
 *   the html element) keeps narrow columns readable.
 * - Page breaks in flowing documents: `break-before: page` on an
 *   element that must start a new page (a chapter, an appendix). Add
 *   your own kept-together blocks (callouts, stat tiles, cards) to a
 *   `break-inside: avoid` rule, and keep each one shorter than a page.
 * - Extend `orphans: 3; widows: 3` to any custom text blocks you add
 *   (p and li are covered by default).
 * - Give long tables a <thead> — browsers repeat it on every printed
 *   page.
 * - No `position: fixed`/`sticky` and no viewport units in content:
 *   fixed elements stamp every printed page (running headers/footers go
 *   in the component's slots) and `100vh` mis-sizes at print.
 *
 * Author content as static HTML so the user can click-to-edit any text
 * directly. Do not set width/padding/background on the document body —
 * the component owns the sheet box.
 */
/* END USAGE */

(() => {
  const PAPER = {
    letter: ['8.5in', '11in'],
    a4: ['210mm', '297mm'],
    legal: ['8.5in', '14in']
  };
  const CSS_LENGTH = /^\d+(\.\d+)?(px|in|mm|cm|pt|pc)$/;
  // Unitless "0" is a valid CSS length and the natural way to write
  // margin="0"; normalise it to 0px so max()/calc() (which reject a bare
  // number) keep working.
  const safeLen = (v, fb) => {
    v = (v || '').trim();
    return v === '0' ? '0px' : CSS_LENGTH.test(v) ? v : fb;
  };
  // WebKit (Safari and every iOS browser shell) never repeats a table's
  // thead/tfoot on printed pages (WebKit bug 17205), so the spacer-borne
  // vertical margins of a FLOWING document reach only the first page
  // there. Engine check, not browser check: vendor is 'Apple Computer,
  // Inc.' exactly for WebKit and 'Google Inc.' for Blink.
  const WK_PRINT = /apple/i.test(navigator.vendor || '');
  // CSS length → px number (CSS absolute units are exact: 1in = 96px).
  // Returns NaN for anything safeLen would reject — callers gate on it.
  const PX_PER = {
    px: 1,
    in: 96,
    mm: 96 / 25.4,
    cm: 96 / 2.54,
    pt: 96 / 72,
    pc: 16
  };
  const toPx = v => {
    const m = /^(\d+(?:\.\d+)?)(px|in|mm|cm|pt|pc)$/.exec((v || '').trim());
    return m ? parseFloat(m[1]) * PX_PER[m[2]] : NaN;
  };
  const stylesheet = `
    :host {
      position: relative;
      display: block;
      /* When the viewport is narrower than the page, grow to wrap the
       * sheet (plus this padding) instead of staying viewport-width, so
       * the desk background and right margin reach the sheet's far edge
       * in the horizontal scroll. */
      min-width: max-content;
      min-height: 100vh;
      background: #f5f5f4;
      padding: 48px 24px;
      box-sizing: border-box;
      font-family: -apple-system, BlinkMacSystemFont, "Helvetica Neue", Arial, sans-serif;
      --doc-page-w: 8.5in;
      --doc-page-h: 11in;
      --doc-page-margin: 0.75in;
      --doc-hdr-h: 0px;
      --doc-ftr-h: 0px;
      --doc-hdr-pad: 0px;
      --doc-ftr-pad: 0px;
    }
    .sheet {
      width: var(--doc-page-w);
      margin: 0 auto;
      background: #fff;
      box-shadow: 0 2px 10px rgba(20, 20, 19, 0.12);
      border-radius: 7px;
      box-sizing: border-box;
      padding: var(--doc-page-margin);
    }
    .frame { width: 100%; border-collapse: collapse; }
    /* Scaled-fit mode (content-width/content-height): the inner .fit box
     * lays the content out at its authored fixed size and scales it onto
     * the printable area; .fit-box reserves the scaled footprint in flow
     * (transforms don't affect layout) and centers it. Without the mode,
     * both divs are unstyled block pass-throughs. */
    /* Explicit pagination: direct .page children are the pages. The sheet
     * becomes a transparent stack and each page carries the card look on
     * screen; at print each page is exactly one full-bleed sheet. The
     * ::slotted defaults are deliberately weak (document CSS wins), so
     * authored page styling can override any of this. */
    .sheet.paginated {
      background: transparent;
      box-shadow: none;
      border-radius: 0;
      padding: 0;
    }
    .paginated ::slotted(.page) {
      position: relative;
      display: block;
      width: 100%;
      aspect-ratio: var(--doc-page-ar);
      container-type: size;
      overflow: hidden;
      box-sizing: border-box;
      background: #fff;
      border-radius: 7px;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.25);
      print-color-adjust: exact;
      -webkit-print-color-adjust: exact;
      break-inside: avoid;
    }
    .paginated ::slotted(.page:not(:first-child)) { margin-top: 1rem; }
    @media print {
      .sheet.paginated { padding: 0; }
      /* The flowing-document vertical inset lives on the repeating
       * thead/tfoot spacers, not the sheet padding — they must go too,
       * or each full-sheet .page is pushed ~margin down and spills onto
       * a second sheet. Paginated pages are full-bleed by definition
       * (content owns its insets). */
      .sheet.paginated .hdr-space,
      .sheet.paginated .ftr-space { height: 0; }
      .paginated ::slotted(.page) {
        border-radius: 0 !important;
        box-shadow: none !important;
        margin: 0 !important;
        /* Physical page-box sizing, no viewport units: Safari resolves
         * 100vh against the window, not the page box, so a vh-sized card
         * paginates wrong there. --doc-page-w/h are the named size by
         * default and are overridden to the user's chosen paper by the
         * export path, so every card is exactly one sheet either way.
         * Width + height (same source values as @page size) rather than
         * width + aspect-ratio: the ratio is a 6-decimal rounding of the
         * same division, and a few millionths of overflow would spill a
         * blank sheet after every page. The screen-only aspect-ratio
         * (preview proportions) must not leak into print. cqh typography
         * tracks the same box.
         *
         * Every declaration is !important: per CSS Scoping, unimportant
         * shadow ::slotted rules LOSE to the document context, so a page
         * section's authored inline style would silently beat this print
         * geometry. A model-authored height:100% did exactly that — the
         * percentage resolves as auto in the all-auto print ancestry, the
         * base rule's size containment turns auto into ZERO, and
         * overflow:hidden then paints nothing: a blank PDF with perfect
         * page boxes. At print the component's geometry is the design's
         * whole contract, so it must win over any authored sizing. */
        aspect-ratio: auto !important;
        width: var(--doc-page-w) !important;
        height: var(--doc-page-h) !important;
        overflow: hidden !important;
      }
      .paginated ::slotted(.page:not(:first-child)) {
        break-before: page !important;
        margin-top: 0 !important;
      }
    }
    .fit-mode .fit-box {
      width: calc(var(--doc-fit-w) * var(--doc-fit-scale));
      height: calc(var(--doc-fit-h) * var(--doc-fit-scale));
      margin: 0 auto;
      break-inside: avoid;
    }
    /* Monolithic at print: Blink slices a transform-scaled child at
     * fragmentainer boundaries mapped in UNSCALED layout coordinates
     * (transforms are paint-time), so the .fit box (authored size, e.g.
     * 1400x990) gets cut at the page's free block space and spills onto
     * a second sheet even though its SCALED footprint fits the page by
     * construction. overflow:hidden makes .fit-box a scroll container —
     * monolithic under fragmentation (css-break-3) — so the scaled
     * content prints atomically on one sheet. No clipping for content
     * within the authored box: .fit-box is calc-sized to exactly the
     * scaled footprint. (Content that bleeds past content-width/height
     * is clipped at the footprint — fit mode's contract; it previously
     * painted beyond it at print.) Print-only, so the screen rendering
     * keeps visible overflow for editor affordances.
     * The export path injects the same rule into frozen copies
     * (print-eval.ts om-print-fit-contain). The .fit-mode scope is
     * load-bearing: .fit-box wraps slotted content in EVERY mode, and an
     * unscoped overflow:hidden would make whole flowing documents
     * monolithic (one truncated sheet). overflow:hidden, never clip —
     * clip is not a scroll container, so not monolithic. */
    @media print {
      .fit-mode .fit-box { overflow: hidden; }
    }
    .fit-mode .fit {
      width: var(--doc-fit-w);
      height: var(--doc-fit-h);
      transform: scale(var(--doc-fit-scale));
      transform-origin: top left;
    }
    .frame td, .frame th { padding: 0; text-align: left; font-weight: inherit; }
    .hdr-space { height: var(--doc-hdr-h); }
    .ftr-space { height: var(--doc-ftr-h); }
    ::slotted([slot="header"]),
    ::slotted([slot="footer"]) { display: block; box-sizing: border-box; }
    @media print {
      :host { background: none; padding: 0; min-width: 0; min-height: 0; }
      .sheet {
        width: auto; margin: 0; box-shadow: none; border-radius: 0;
        padding: 0 var(--doc-page-margin);
      }
      /* The thead/tfoot spacers repeat on every page, so they carry the
       * vertical page margin (which the sheet's own padding cannot, since
       * that padding is consumed once on the first/last page). The running
       * header/footer are fixed inside that band. */
      /* The 0.35in is breathing room between a running header/footer and
       * the body; without one the spacer is exactly the page margin, so a
       * margin="0" full-bleed document gets truly full-bleed pages. */
      .hdr-space { height: max(var(--doc-page-margin), calc(var(--doc-hdr-h) + var(--doc-hdr-pad))); }
      .ftr-space { height: max(var(--doc-page-margin), calc(var(--doc-ftr-h) + var(--doc-ftr-pad))); }
      /* WebKit flowing documents: @page carries the vertical margin (see
       * _syncPrintPageRule), so the spacers keep only whatever a running
       * header/footer needs BEYOND it — page 1 would otherwise double its
       * top inset. Paginated sheets already zero their spacers above. */
      .sheet.wk-print:not(.paginated) .hdr-space { height: max(0px, calc(max(var(--doc-page-margin), calc(var(--doc-hdr-h) + var(--doc-hdr-pad))) - var(--doc-page-margin))); }
      .sheet.wk-print:not(.paginated) .ftr-space { height: max(0px, calc(max(var(--doc-page-margin), calc(var(--doc-ftr-h) + var(--doc-ftr-pad))) - var(--doc-page-margin))); }
      ::slotted([slot="header"]) {
        position: fixed; top: 0; left: 0; right: 0; margin: 0;
        padding: calc(var(--doc-page-margin) * 0.45) var(--doc-page-margin) 0;
      }
      ::slotted([slot="footer"]) {
        position: fixed; bottom: 0; left: 0; right: 0; margin: 0;
        padding: 0 var(--doc-page-margin) calc(var(--doc-page-margin) * 0.45);
      }
    }
  `;
  class DocPage extends HTMLElement {
    static get observedAttributes() {
      return ['size', 'width', 'height', 'margin', 'orientation', 'content-width', 'content-height'];
    }
    constructor() {
      super();
      this._root = this.attachShadow({
        mode: 'open'
      });
      this._mo = typeof MutationObserver === 'function' ? new MutationObserver(() => this._scheduleMeasure()) : null;
    }

    /** The named paper's [w, h], swapped when orientation="landscape".
     *  Only the named size swaps — explicit width/height are exact values
     *  the author already oriented. */
    _paperSize() {
      const named = PAPER[(this.getAttribute('size') || '').toLowerCase()] || PAPER.letter;
      const landscape = (this.getAttribute('orientation') || '').trim().toLowerCase() === 'landscape';
      return landscape ? [named[1], named[0]] : named;
    }
    get pageWidth() {
      return safeLen(this.getAttribute('width'), this._paperSize()[0]);
    }
    get pageHeight() {
      return safeLen(this.getAttribute('height'), this._paperSize()[1]);
    }
    get pageMargin() {
      return safeLen(this.getAttribute('margin'), '0.75in');
    }

    /** Scaled-fit mode's content box [w, h] as CSS lengths, or null when
     *  the mode is off (either attribute missing/invalid/zero — a partial
     *  declaration falls back to normal flow rather than guessing). */
    _contentFit() {
      const w = safeLen(this.getAttribute('content-width'), null);
      const h = safeLen(this.getAttribute('content-height'), null);
      if (!w || !h) return null;
      const wPx = toPx(w),
        hPx = toPx(h);
      return wPx > 0 && hPx > 0 ? [w, h, wPx, hPx] : null;
    }
    connectedCallback() {
      if (!this._sheet) this._render();
      this._syncSize();
      this._syncPrintPageRule();
      this._ensureTextWrapDefaults();
      this._ensureOwnsPrintMeta();
      this._syncFixedSizeMeta();
      this._syncPrintSizingMeta();
      if (this._mo) this._mo.observe(this, {
        subtree: true,
        childList: true,
        characterData: true,
        attributes: true
      });
      this._onResize = () => this._scheduleMeasure();
      window.addEventListener('resize', this._onResize);
      if (document.fonts && document.fonts.ready) {
        document.fonts.ready.then(() => this._scheduleMeasure());
      }
      this._scheduleMeasure();
    }
    disconnectedCallback() {
      window.removeEventListener('resize', this._onResize);
      if (this._mo) this._mo.disconnect();
      if (this._raf) {
        cancelAnimationFrame(this._raf);
        this._raf = null;
      }
      // Drop the head rules when the last doc-page leaves, so a deleted
      // document's @page geometry and text-wrap defaults can't apply to
      // whatever replaces it.
      const survivor = document.querySelector('doc-page');
      if (!survivor) {
        ['doc-page-print', 'doc-page-text-wrap', 'doc-page-owns-print', 'doc-page-fixed-size', 'doc-page-print-sizing'].forEach(id => {
          const tag = document.getElementById(id);
          if (tag) tag.remove();
        });
        // A live deck-stage deferred its own print-sizing meta to ours —
        // hand the page-global meta over so the deck isn't left unmarked.
        const deck = document.querySelector('deck-stage');
        if (deck && typeof deck._ensurePrintSizingMeta === 'function') {
          deck._ensurePrintSizingMeta();
        }
      } else {
        // A departed owner hands each page-global meta to whatever
        // doc-page remains (or it's removed).
        if (typeof survivor._syncFixedSizeMeta === 'function') {
          survivor._syncFixedSizeMeta();
        }
        if (typeof survivor._syncPrintSizingMeta === 'function') {
          survivor._syncPrintSizingMeta();
        }
      }
    }
    attributeChangedCallback() {
      if (!this._sheet) return;
      this._syncSize();
      this._syncPrintPageRule();
      this._syncFixedSizeMeta();
      this._syncPrintSizingMeta();
      this._scheduleMeasure();
    }
    _render() {
      this._root.innerHTML = `
        <style>${stylesheet}</style>
        <style id="vars"></style>
        <div class="sheet" data-screen-label="Document">
          <table class="frame" role="presentation">
            <thead><tr><th><div class="hdr-space"><slot name="header"></slot></div></th></tr></thead>
            <tbody><tr><td class="body"><div class="fit-box"><div class="fit"><slot></slot></div></div></td></tr></tbody>
            <tfoot><tr><td><div class="ftr-space"><slot name="footer"></slot></div></td></tr></tfoot>
          </table>
        </div>`;
      this._sheet = this._root.querySelector('.sheet');
      this._vars = this._root.getElementById('vars');
    }

    /** Runtime sizing lives in a shadow <style> :host rule, never on the
     *  light-DOM host element, so serialize-persist can't write it back. */
    _syncSize(hdrH, ftrH) {
      // Scaled-fit mode: content at its authored size, scaled onto the
      // printable area (page minus margins on both axes). The factor is a
      // plain number var so calc(length * number) stays valid; 4 decimals
      // keeps the shadow style stable across re-measures. Upscaling is
      // allowed — print transforms are vector, so text and CSS stay crisp
      // (raster images soften, which the catalog bullet warns about).
      const fit = this._contentFit();
      let fitVars = '';
      if (fit) {
        const marginPx = toPx(this.pageMargin) || 0;
        const availW = toPx(this.pageWidth) - 2 * marginPx;
        const availH = toPx(this.pageHeight) - 2 * marginPx;
        const scale = Math.min(availW / fit[2], availH / fit[3]);
        if (scale > 0 && Number.isFinite(scale)) {
          fitVars = '--doc-fit-w:' + fit[0] + ';' + '--doc-fit-h:' + fit[1] + ';' + '--doc-fit-scale:' + scale.toFixed(4) + ';';
        }
      }
      this._sheet.classList.toggle('fit-mode', !!fitVars);
      // Numeric w/h ratio for the paginated page cards' aspect-ratio —
      // aspect-ratio takes a number, not a length ratio, so compute it
      // here (CSS length division isn't portable). 6 decimals keeps the
      // shadow style stable across re-syncs.
      const arW = toPx(this.pageWidth);
      const arH = toPx(this.pageHeight);
      const ar = arW > 0 && arH > 0 ? (arW / arH).toFixed(6) : '0.772727';
      this._vars.textContent = ':host{' + fitVars + '--doc-page-ar:' + ar + ';' + '--doc-page-w:' + this.pageWidth + ';' + '--doc-page-h:' + this.pageHeight + ';' + '--doc-page-margin:' + this.pageMargin + ';' + '--doc-hdr-h:' + (hdrH || 0) + 'px;' + '--doc-ftr-h:' + (ftrH || 0) + 'px;' + '--doc-hdr-pad:' + (hdrH ? '0.35in' : '0px') + ';' + '--doc-ftr-pad:' + (ftrH ? '0.35in' : '0px') + '}';
    }

    /** @page is a no-op inside shadow DOM, so the rule lives in <head>.
     *  Re-appended on every sync so it stays last in source order — the
     *  @page cascade is source-order per descriptor, so this rule wins
     *  over any other @page rule in the document.
     *
     *  The @page SIZE is pinned where the page box IS part of the design:
     *  explicit-fixed-size mode (width + height authored), scaled-fit
     *  mode (the named sheet the fit targets), and explicit pagination
     *  (the named size the cards share — so card and sheet agree on
     *  every print path, and the export path's chosen paper overrides
     *  BOTH with one later rule). For FLOWING documents no paper size is
     *  emitted at all — the true size comes from the user's preference,
     *  injected by the export path or chosen in the print dialog — so a
     *  flowing document never fights the paper it lands on.
     *  margin: 0 is emitted in every mode: it leaves Chrome no margin box
     *  to draw its date/URL/page-count header in, and the visual margin
     *  lives on the sheet's own padding. */
    _syncPrintPageRule() {
      const id = 'doc-page-print';
      let tag = document.getElementById(id);
      if (!tag) {
        tag = document.createElement('style');
        tag.id = id;
      }
      document.head.appendChild(tag);
      // Three print-geometry regimes:
      // - true-size: the page IS the design — pin its exact size.
      // - scaled-fit (content-width/height): the fit factor is computed
      //   against the NAMED paper's printable area, so that paper must
      //   stay pinned or the scaled content overflows a smaller sheet
      //   (the export path re-fits and re-pins at print time on top).
      // - default modes: no paper size — but landscape still needs the
      //   paper-agnostic 'size: landscape' keyword, because the size
      //   descriptor is what carries orientation; without it a landscape
      //   document prints portrait whenever nothing injects a size.
      const landscape = (this.getAttribute('orientation') || '').trim().toLowerCase() === 'landscape';
      // Explicit pagination pins the page box to the SAME values that
      // size the cards (the named size by default, the export path's
      // chosen paper when its later rule overrides both) — card and
      // sheet agree on every print path, and a mismatched real paper
      // shrinks-to-fit in the dialog instead of clipping a Letter card
      // on A4. Declared before the paginated read below so both derive
      // from one check.
      const paginatedNow = this.querySelector(':scope > .page') !== null;
      const sizeDescriptor = this._trueSizePx() ? 'size: ' + this.pageWidth + ' ' + this.pageHeight + '; ' : this._contentFit() ? 'size: ' + this.pageWidth + ' ' + this.pageHeight + '; ' : paginatedNow ? 'size: ' + this.pageWidth + ' ' + this.pageHeight + '; ' : landscape ? 'size: landscape; ' : '';
      // WebKit never repeats the thead/tfoot spacers that carry a flowing
      // document's vertical page margins (see WK_PRINT above), so pages
      // after the first print edge-to-edge there. Carry the VERTICAL
      // margins on @page for WebKit instead, and the shadow print CSS
      // trims the first-page spacers by the same amount (.sheet.wk-print
      // rules). Horizontal inset stays on the sheet's own padding in
      // every engine. Blink keeps margin: 0 (a nonzero margin there
      // re-opens the box Chrome draws its header furniture in). One cost,
      // learned in testing: Safari's own date/URL headers are a USER
      // dialog setting ("Print headers and footers") that renders in the
      // margin area when room exists — margin: 0 only suppressed it by
      // leaving no room, and no CSS controls it. The export dialog's
      // Safari guide teaches turning the setting off for flowing
      // documents. Explicitly paginated and fixed-size documents keep
      // margin: 0 everywhere: their pages ARE the sheet.
      const wkFlowing = WK_PRINT && !paginatedNow && !this._trueSizePx() && !this._contentFit();
      const marginDescriptor = wkFlowing ? 'margin: ' + this.pageMargin + ' 0; ' : 'margin: 0; ';
      // Shadow-internal marker (never serialized), kept in lockstep with
      // the @page decision above: the print CSS trims the first-page
      // spacers ONLY while @page actually carries the margins — a
      // true-size or scaled-fit sheet keeps margin: 0 and must keep its
      // spacers too. Re-synced here so attribute changes and pagination
      // flips move both together.
      if (this._sheet) this._sheet.classList.toggle('wk-print', wkFlowing);
      tag.textContent = '@page { ' + sizeDescriptor + marginDescriptor + '} ' + '@media print { html, body { margin: 0 !important; padding: 0 !important; background: none !important; height: auto !important; overflow: visible !important; } ' + 'h1,h2,h3,h4,h5,h6 { break-after: avoid; } ' + 'figure,pre,blockquote,img,svg,tr { break-inside: avoid; } ' + 'p,li { orphans: 3; widows: 3; } ' + '* { -webkit-print-color-adjust: exact; print-color-adjust: exact; ' + 'backdrop-filter: none !important; -webkit-backdrop-filter: none !important; } ' + '*, *::before, *::after { animation-delay: -99s !important; animation-duration: .001s !important; ' + 'animation-iteration-count: 1 !important; animation-fill-mode: both !important; ' + 'animation-play-state: running !important; transition-duration: 0s !important; } }';
    }

    /** Typographic defaults for document text: balance headings, avoid
     *  widowed/orphaned words in body copy (browsers without text-wrap
     *  support drop the declarations). Zero-specificity via :where() so
     *  any text-wrap authored on those elements wins; document-level so the
     *  rules reach the slotted (light DOM) content — shadow styles can't.
     *  data-omelette-injected marks the tag for the host editor to strip
     *  at serialize, so it is never written back as authored source. */
    _ensureTextWrapDefaults() {
      if (document.getElementById('doc-page-text-wrap')) return;
      const tag = document.createElement('style');
      tag.id = 'doc-page-text-wrap';
      tag.setAttribute('data-omelette-injected', '');
      tag.textContent = ':where(h1,h2,h3,h4,h5,h6){text-wrap:balance}' + ':where(p,li,blockquote,figcaption){text-wrap:pretty}';
      document.head.appendChild(tag);
    }

    /** Declares that this document owns its print CSS. The instant-PDF
     *  export checks for the meta by NAME PRESENCE alone (content is
     *  ignored) and skips its automatic print-CSS injections, so the
     *  component's @page geometry is never overridden by a heuristic.
     *  data-omelette-injected keeps it out of serialized source. */
    _ensureOwnsPrintMeta() {
      if (document.getElementById('doc-page-owns-print')) return;
      const tag = document.createElement('meta');
      tag.id = 'doc-page-owns-print';
      tag.name = 'omelette-owns-print';
      tag.content = 'true';
      tag.setAttribute('data-omelette-injected', '');
      document.head.appendChild(tag);
    }

    /** This page's valid true-size page box (explicit width AND height)
     *  as [w, h] px ints, or null when the mode is off. */
    _trueSizePx() {
      if (!safeLen(this.getAttribute('width'), null) || !safeLen(this.getAttribute('height'), null)) return null;
      const w = Math.round(toPx(this.pageWidth));
      const h = Math.round(toPx(this.pageHeight));
      return w > 0 && h > 0 ? [w, h] : null;
    }

    /** True-size pages (explicit width AND height) also declare the page
     *  box as the preview size: the in-app preview reads
     *  meta[name="omelette-fixed-size"] (content "W,H" in px ints) and
     *  scales the sheet into view — without it an 18in poster previews at
     *  true size with scrollbars. Never overrides an author-set meta
     *  (only the component's own id is managed). The meta is page-global
     *  while doc-page instances are not, so every sync recomputes the
     *  page-wide owner — the first connected true-size doc-page — and a
     *  non-true-size sibling's sync can never delete the owner's meta.
     *  Removed when no true-size page remains (the owner's disconnect
     *  re-syncs via any survivor) or when an author-set meta exists. */
    _syncFixedSizeMeta() {
      const id = 'doc-page-fixed-size';
      const own = document.getElementById(id);
      const authored = document.querySelector('meta[name="omelette-fixed-size"]:not([data-omelette-injected])');
      // The page-wide owner, not this instance: an upgraded true-size page
      // anywhere in the document keeps the meta alive and sized.
      let box = null;
      for (const el of document.querySelectorAll('doc-page')) {
        box = typeof el._trueSizePx === 'function' ? el._trueSizePx() : null;
        if (box) break;
      }
      if (!box || authored) {
        if (own) own.remove();
        return;
      }
      const tag = own || document.createElement('meta');
      tag.id = id;
      tag.name = 'omelette-fixed-size';
      tag.content = box[0] + ',' + box[1];
      tag.setAttribute('data-omelette-injected', '');
      if (!own) document.head.appendChild(tag);
    }

    /** This page's print-sizing mode: 'fixed' when an explicit width AND
     *  height are authored (the page is the design's own size), else the
     *  default paper in the authored orientation. */
    _printSizingMode() {
      if (this._trueSizePx()) return 'fixed';
      const landscape = (this.getAttribute('orientation') || '').trim().toLowerCase() === 'landscape';
      return landscape ? 'default-landscape' : 'default-portrait';
    }

    /** Announces the print-sizing mode to the host app:
     *  meta[name="omelette-print-sizing"] with content 'default-portrait',
     *  'default-landscape', or 'fixed' (fixed pages also carry the
     *  omelette-fixed-size meta with the page box in px). The export path
     *  probes it to decide what true paper size to inject at print time —
     *  in the default modes the component emits no paper size of its own.
     *  Same page-global ownership rules as the fixed-size meta above:
     *  first connected doc-page owns it, an authored meta is never
     *  overridden, removed when no doc-page remains. */
    _syncPrintSizingMeta() {
      const id = 'doc-page-print-sizing';
      const own = document.getElementById(id);
      const authored = document.querySelector('meta[name="omelette-print-sizing"]:not([data-omelette-injected])');
      // A fixed page wins outright (mirroring the fixed-size loop above,
      // so the two metas can never contradict each other in a mixed
      // multi-page document); otherwise the first page's mode holds.
      let mode = null;
      for (const el of document.querySelectorAll('doc-page')) {
        if (typeof el._printSizingMode !== 'function') continue;
        const m = el._printSizingMode();
        if (m === 'fixed') {
          mode = m;
          break;
        }
        if (mode === null) mode = m;
      }
      if (!mode || authored) {
        if (own) own.remove();
        return;
      }
      // A deck-stage that connected first injected its own meta and
      // defers to any existing one — take it over, or the document ends
      // up with two conflicting injected metas (a doc-page page is the
      // document; the deck re-ensures its meta if every doc-page leaves).
      const deckMeta = document.getElementById('deck-stage-print-sizing');
      if (deckMeta) deckMeta.remove();
      const tag = own || document.createElement('meta');
      tag.id = id;
      tag.name = 'omelette-print-sizing';
      tag.content = mode;
      tag.setAttribute('data-omelette-injected', '');
      if (!own) document.head.appendChild(tag);
    }
    _scheduleMeasure() {
      if (this._raf) return;
      this._raf = requestAnimationFrame(() => {
        this._raf = null;
        this._measure();
      });
    }

    /** Slot heights feed the print spacers (--doc-hdr-h / --doc-ftr-h), so
     *  they re-measure on content mutation, resize, and font load. The
     *  same pass detects explicit pagination (direct .page children) and
     *  toggles the sheet between the flowing-document card and the
     *  page-per-card stack — content edits can add or remove pages at any
     *  time, so this tracks the same mutations the measurement does. */
    _measure() {
      const hdr = this.querySelector(':scope > [slot="header"]');
      const ftr = this.querySelector(':scope > [slot="footer"]');
      const wasPaginated = this._sheet.classList.contains('paginated');
      this._sheet.classList.toggle('paginated', this.querySelector(':scope > .page') !== null);
      // The WebKit @page margin is flowing-only, so a pagination flip
      // must re-emit the rule (content edits can add or remove .page
      // sections at any time).
      if (this._sheet.classList.contains('paginated') !== wasPaginated) {
        this._syncPrintPageRule();
      }
      this._syncSize(hdr ? hdr.offsetHeight : 0, ftr ? ftr.offsetHeight : 0);
    }
  }
  if (!customElements.get('doc-page')) {
    customElements.define('doc-page', DocPage);
  }
})();
})(); } catch (e) { __ds_ns.__errors.push({ path: "brand-guidelines/doc-page.js", error: String((e && e.message) || e) }); }

// components/buttons/Button.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
// Source: Figma "Component 1" (node 1:180) — primary CTA. variant 1 = hero, 2 = block, 3 = outline.
function useHover(forced) {
  const [h, setH] = React.useState(false);
  return [forced ?? h, {
    onMouseEnter: () => setH(true),
    onMouseLeave: () => setH(false)
  }];
}
const shadowLg = "0px 10px 15px -3px rgba(0,0,0,0.1), 0px 4px 6px -4px rgba(0,0,0,0.1)";
const shadowMd = "0px 4px 6px -1px rgba(0,0,0,0.1), 0px 2px 4px -2px rgba(0,0,0,0.1)";
function Button({
  children = "View Class Timetable",
  variant = "hero",
  hover,
  fullWidth,
  onClick,
  href,
  style,
  ...rest
}) {
  const [h, hp] = useHover(hover);
  const base = {
    boxSizing: "border-box",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8,
    fontFamily: "var(--font-body)",
    fontWeight: 600,
    whiteSpace: "nowrap",
    cursor: "pointer",
    textDecoration: "none",
    border: "none",
    transition: "transform 150ms cubic-bezier(0.4,0,0.2,1), background 150ms, color 150ms",
    color: "var(--color-white-solid)"
  };
  let v;
  if (variant === "hero") v = {
    padding: "16px 32px",
    fontSize: 18,
    lineHeight: "28px",
    background: h ? "var(--brand-gradient-rev)" : "var(--brand-gradient)",
    boxShadow: shadowLg,
    transform: h ? "scale(1.05)" : "none"
  };else if (variant === "block") v = {
    padding: "12px 24px",
    fontSize: 16,
    lineHeight: "24px",
    background: "var(--brand-gradient)",
    boxShadow: shadowMd,
    width: "100%"
  };else v = {
    padding: "12px 32px",
    fontSize: 16,
    lineHeight: "24px",
    border: "2px solid var(--color-rose-49)",
    background: h ? "var(--color-rose-49)" : "var(--color-white-solid)",
    color: h ? "var(--color-white-solid)" : "var(--color-rose-49)",
    boxShadow: shadowMd
  };
  const Tag = href ? "a" : "button";
  return /*#__PURE__*/React.createElement(Tag, _extends({
    href: href,
    onClick: onClick
  }, hp, rest, {
    style: {
      ...base,
      ...v,
      ...(fullWidth ? {
        width: "100%"
      } : {}),
      ...style
    }
  }), children);
}

/** Figma kit name alias ("Component 1"). */
Object.assign(__ds_scope, { Button, __ds_default_components_buttons_Button_1babiwk: Button, Component1: Button });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/buttons/Button.jsx", error: String((e && e.message) || e) }); }

// components/buttons/GlassButton.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
// Source: Figma "Component 2" (node 1:192) — translucent outline button that sits on the dark hero photo.
function useHover(forced) {
  const [h, setH] = React.useState(false);
  return [forced ?? h, {
    onMouseEnter: () => setH(true),
    onMouseLeave: () => setH(false)
  }];
}
function GlassButton({
  children = "Purchase a Class Pass",
  hover,
  href,
  onClick,
  style,
  ...rest
}) {
  const [h, hp] = useHover(hover);
  const Tag = href ? "a" : "button";
  return /*#__PURE__*/React.createElement(Tag, _extends({
    href: href,
    onClick: onClick
  }, hp, rest, {
    style: {
      boxSizing: "border-box",
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "12px 24px",
      borderRadius: 8,
      border: "2px solid var(--color-white-solid)",
      background: h ? "var(--color-white-solid)" : "rgba(255,255,255,0.1)",
      backdropFilter: "blur(4px)",
      WebkitBackdropFilter: "blur(4px)",
      color: h ? "var(--color-rose-49)" : "var(--color-white-solid)",
      fontFamily: "var(--font-body)",
      fontWeight: 500,
      fontSize: 16,
      lineHeight: "24px",
      whiteSpace: "nowrap",
      cursor: "pointer",
      textDecoration: "none",
      transform: h ? "scale(1.05)" : "none",
      transition: "all 150ms cubic-bezier(0.4,0,0.2,1)",
      ...style
    }
  }), children);
}

/** Figma kit name alias ("Component 2"). */
Object.assign(__ds_scope, { GlassButton, __ds_default_components_buttons_GlassButton_4wrgr2: GlassButton, Component2: GlassButton });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/buttons/GlassButton.jsx", error: String((e && e.message) || e) }); }

// components/buttons/SmallButton.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
// Compact 36px button lifted from the "Book" cell inside Figma "Component 1" (node 2:330) and the
// header Sign In / cookie / WhatsApp links. Intentional addition (not its own Figma component set).
function useHover(forced) {
  const [h, setH] = React.useState(false);
  return [forced ?? h, {
    onMouseEnter: () => setH(true),
    onMouseLeave: () => setH(false)
  }];
}
const TONES = {
  rose: {
    bg: "var(--color-rose-49)",
    fg: "var(--color-white-solid)"
  },
  soft: {
    bg: "var(--color-rose-60)",
    fg: "var(--color-white-solid)"
  },
  whatsapp: {
    bg: "var(--color-spring-green-49)",
    fg: "var(--color-chartreuse-green-10)"
  },
  outline: {
    bg: "transparent",
    fg: "var(--color-blue-4)",
    border: "1px solid rgba(9,9,11,0.1)",
    flat: true
  }
};
function SmallButton({
  children = "Book",
  tone = "soft",
  icon,
  hover,
  width,
  href,
  onClick,
  style,
  ...rest
}) {
  const [h, hp] = useHover(hover);
  const t = TONES[tone] || TONES.soft;
  const Tag = href ? "a" : "button";
  return /*#__PURE__*/React.createElement(Tag, _extends({
    href: href,
    onClick: onClick
  }, hp, rest, {
    style: {
      boxSizing: "border-box",
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
      height: 36,
      width,
      padding: "5px 11px",
      borderRadius: 8,
      border: t.border || "1px solid transparent",
      background: t.bg,
      color: t.fg,
      boxShadow: t.flat ? "none" : "0px 1px 3px 0px rgba(0,0,0,0.1), 0px 1px 2px -1px rgba(0,0,0,0.1), inset 0px 1px 0px 0px rgba(255,255,255,0.15)",
      fontFamily: "var(--font-body)",
      fontWeight: 600,
      fontSize: 14,
      lineHeight: "24px",
      whiteSpace: "nowrap",
      cursor: "pointer",
      textDecoration: "none",
      filter: h ? t.flat ? "none" : "brightness(0.94)" : "none",
      backgroundColor: t.flat && h ? "rgba(9,9,11,0.05)" : undefined,
      transition: "filter 150ms, background-color 150ms",
      ...style
    }
  }), icon, children);
}
Object.assign(__ds_scope, { SmallButton, __ds_default_components_buttons_SmallButton_1is6hjh: SmallButton });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/buttons/SmallButton.jsx", error: String((e && e.message) || e) }); }

// components/classes/ClassCardText.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
// Source: Figma page-2 "Component 2" (node 2:343, 6 variants) — title + description block on kids class cards.
function useHover(forced) {
  const [h, setH] = React.useState(false);
  return [forced ?? h, {
    onMouseEnter: () => setH(true),
    onMouseLeave: () => setH(false)
  }];
}
function ClassCardText({
  title = "Teen Yoga",
  description = "Yoga can give teens strategies and tools to cope with the pressures of school, life and growing up in general.",
  hover,
  style
}) {
  const [h, hp] = useHover(hover);
  return /*#__PURE__*/React.createElement("div", _extends({}, hp, {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 7.5,
      ...style
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: "var(--font-body)",
      fontWeight: 600,
      fontSize: 18,
      lineHeight: "24px",
      color: h ? "var(--color-azure-34)" : "var(--color-azure-11)",
      padding: "0.75px 0",
      transition: "color 150ms"
    }
  }, title), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: "var(--font-body)",
      fontWeight: 400,
      fontSize: 14,
      lineHeight: "24px",
      color: "var(--color-azure-34)",
      textWrap: "pretty"
    }
  }, description));
}
Object.assign(__ds_scope, { ClassCardText, __ds_default_components_classes_ClassCardText_1q0h2cs: ClassCardText });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/classes/ClassCardText.jsx", error: String((e && e.message) || e) }); }

// components/classes/ClassRow.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
// Source: Figma page-2 "Component 1" (node 2:330, 6 variants) — timetable row with Book action.
function useHover(forced) {
  const [h, setH] = React.useState(false);
  return [forced ?? h, {
    onMouseEnter: () => setH(true),
    onMouseLeave: () => setH(false)
  }];
}
const CLASS_COLUMNS = [331.27, 248.45, 343.6, 248.45, 124.23, 176];
const cell = (w, first) => ({
  flex: w + " 1 0",
  minWidth: 0,
  boxSizing: "border-box",
  padding: first ? "18.75px 16px 18.25px 24px" : "18.75px 16px 18.25px 16px",
  borderBottom: "1px solid rgba(9,9,11,0.05)",
  fontFamily: "var(--font-body)",
  fontSize: 14,
  lineHeight: "24px",
  color: "var(--color-black-solid)",
  whiteSpace: "nowrap",
  overflow: "hidden",
  textOverflow: "ellipsis"
});
function ClassRow({
  cells = ["Teen Yoga", "Son Anderson", "Mondays at 4:45pm - 5:45pm", "Barden House", "£9.00"],
  columns = CLASS_COLUMNS,
  hover,
  onBook,
  bookLabel = "Book",
  style
}) {
  const [h, hp] = useHover(hover);
  return /*#__PURE__*/React.createElement("div", _extends({}, hp, {
    style: {
      display: "flex",
      width: "100%",
      background: h ? "rgba(255,247,237,0.8)" : "transparent",
      borderBottom: "1px solid var(--color-grey-91)",
      transition: "background 150ms",
      ...style
    }
  }), cells.map((c, i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    style: {
      ...cell(columns[i], i === 0),
      fontWeight: i === 0 ? 600 : 400
    }
  }, c)), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: columns[columns.length - 1] + " 1 0",
      boxSizing: "border-box",
      padding: "12px 24px 12px 16px",
      display: "flex",
      justifyContent: "flex-end",
      borderBottom: "1px solid rgba(9,9,11,0.05)"
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.SmallButton, {
    width: 96,
    onClick: onBook
  }, bookLabel)));
}
function ClassHeaderRow({
  labels = ["Class", "Instructor", "Day/Time", "Location", "Price"],
  columns = CLASS_COLUMNS
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      width: "100%",
      borderBottom: "1px solid var(--color-grey-91)"
    }
  }, labels.map((l, i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    style: {
      flex: columns[i] + " 1 0",
      minWidth: 0,
      boxSizing: "border-box",
      padding: i === 0 ? "7.75px 16px 7.75px 24px" : "7.75px 16px",
      borderBottom: "1px solid rgba(9,9,11,0.1)",
      fontFamily: "var(--font-body)",
      fontWeight: 500,
      fontSize: 14,
      lineHeight: "24px",
      color: "var(--color-rose-49)",
      whiteSpace: "nowrap"
    }
  }, l)), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: columns[columns.length - 1] + " 1 0",
      borderBottom: "1px solid rgba(9,9,11,0.1)"
    }
  }));
}
Object.assign(__ds_scope, { CLASS_COLUMNS, ClassRow, ClassHeaderRow, __ds_default_components_classes_ClassRow_1cvo6jp: ClassRow });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/classes/ClassRow.jsx", error: String((e && e.message) || e) }); }

// components/footer/BackToTop.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
// Source: Figma "Component 7" (node 1:238) — footer bottom-bar link.
function useHover(forced) {
  const [h, setH] = React.useState(false);
  return [forced ?? h, {
    onMouseEnter: () => setH(true),
    onMouseLeave: () => setH(false)
  }];
}
function BackToTop({
  children = "Back to top",
  hover,
  onClick,
  style
}) {
  const [h, hp] = useHover(hover);
  const go = onClick || (() => window.scrollTo({
    top: 0,
    behavior: "smooth"
  }));
  return /*#__PURE__*/React.createElement("a", _extends({
    onClick: go
  }, hp, {
    style: {
      fontFamily: "var(--font-body)",
      fontSize: 14,
      lineHeight: "20px",
      whiteSpace: "nowrap",
      color: h ? "var(--color-rose-49)" : "var(--color-azure-65)",
      cursor: "pointer",
      textDecoration: "none",
      transition: "color 150ms",
      ...style
    }
  }), children);
}

/** Figma kit name alias ("Component 7"). */
Object.assign(__ds_scope, { BackToTop, __ds_default_components_footer_BackToTop_1rqmzj: BackToTop, Component7: BackToTop });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/footer/BackToTop.jsx", error: String((e && e.message) || e) }); }

// components/footer/FooterLink.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
// Source: Figma "Component 5" (node 1:222) — footer text link. variant 1 left-aligned, variant 2 right-aligned.
function useHover(forced) {
  const [h, setH] = React.useState(false);
  return [forced ?? h, {
    onMouseEnter: () => setH(true),
    onMouseLeave: () => setH(false)
  }];
}
function FooterLink({
  children = "Yoga in Livingston",
  align = "left",
  hover,
  href,
  onClick,
  style
}) {
  const [h, hp] = useHover(hover);
  return /*#__PURE__*/React.createElement("a", _extends({
    href: href,
    onClick: onClick
  }, hp, {
    style: {
      display: "block",
      textAlign: align,
      fontFamily: "var(--font-body)",
      fontWeight: 400,
      fontSize: 16,
      lineHeight: "24px",
      whiteSpace: "nowrap",
      color: h ? "var(--color-rose-49)" : "var(--color-azure-84)",
      textDecoration: "none",
      cursor: "pointer",
      transition: "color 150ms",
      ...style
    }
  }), children);
}

/** Figma kit name alias ("Component 5"). */
Object.assign(__ds_scope, { FooterLink, __ds_default_components_footer_FooterLink_do9rw5: FooterLink, Component5: FooterLink });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/footer/FooterLink.jsx", error: String((e && e.message) || e) }); }

// components/icons/Avatar.jsx
try { (() => {
// Source: Figma page-2 "Component 3" variants 1–3 (node 2:355) — instructor initials disc on a rose circle.
function Avatar({
  initials = "SA",
  size = 40,
  style
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      width: size,
      height: size,
      borderRadius: 9999,
      background: "var(--color-rose-60)",
      boxShadow: "inset 0px 0px 0px 1px rgba(0,0,0,0.05)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      color: "var(--color-white-solid)",
      fontFamily: "var(--font-ui-alt)",
      fontWeight: 400,
      fontSize: size * 0.48,
      lineHeight: 1,
      flexShrink: 0,
      ...style
    }
  }, initials);
}
Object.assign(__ds_scope, { Avatar, __ds_default_components_icons_Avatar_1omlpl0: Avatar });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/icons/Avatar.jsx", error: String((e && e.message) || e) }); }

// components/icons/Icon.jsx
try { (() => {
// Source: Figma "Component 3" (node 1:198, 11 variants) — the site's glyph set.
const __venc = v => String(v).replace(/[%|=]/g, encodeURIComponent);
const __vkey = p => "variant=" + __venc(p.variant);
const ICON_NAMES = {
  devices: "1",
  "home-heart": "2",
  community: "3",
  instagram: "4",
  "instagram-muted": "5",
  facebook: "6",
  "facebook-muted": "7",
  mail: "8",
  whatsapp: "9",
  "chevron-down": "10",
  "chevron-down-dark": "11"
};
function Icon(_p = {}) {
  const variant = _p.variant ?? ICON_NAMES[_p.name] ?? "1";
  const props = {
    ..._p,
    variant,
    style: {
      ...(_p.color ? {
        color: _p.color
      } : {}),
      ..._p.style
    }
  };
  const __body0 = () => /*#__PURE__*/React.createElement("div", {
    className: props.className,
    style: {
      width: 32,
      height: 32,
      overflow: "hidden",
      position: "relative",
      color: "var(--color-rose-49)",
      ...props.style
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: "absolute",
      left: 0,
      top: 3,
      width: 32,
      height: 26.04,
      overflow: "hidden"
    }
  }, /*#__PURE__*/React.createElement("svg", {
    width: 28.667,
    height: 26.040,
    viewBox: "0 0 28.667 26.040",
    fill: "none",
    style: {
      position: "absolute",
      left: 0,
      top: 0,
      width: 28.667,
      height: 26.04
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: "M 16.48 22.333 C 16.457 22.3 16.445 22.26 16.445 22.22 C 16.445 22.18 16.457 22.14 16.48 22.107 C 16.498 22.069 16.527 22.038 16.562 22.017 C 16.598 21.996 16.639 21.985 16.68 21.987 C 17.034 21.987 17.373 21.846 17.623 21.596 C 17.873 21.346 18.013 21.007 18.013 20.653 C 18.013 20.3 17.873 19.961 17.623 19.711 C 17.373 19.46 17.034 19.32 16.68 19.32 L 3.333 19.32 C 3.157 19.32 2.987 19.25 2.862 19.125 C 2.737 19 2.667 18.83 2.667 18.653 L 2.667 3.333 C 2.667 3.157 2.737 2.987 2.862 2.862 C 2.987 2.737 3.157 2.667 3.333 2.667 L 25.333 2.667 C 25.51 2.667 25.68 2.737 25.805 2.862 C 25.93 2.987 26 3.157 26 3.333 L 26 4 C 26 4.354 26.14 4.693 26.391 4.943 C 26.641 5.193 26.98 5.333 27.333 5.333 C 27.687 5.333 28.026 5.193 28.276 4.943 C 28.526 4.693 28.667 4.354 28.667 4 L 28.667 2.667 C 28.667 1.959 28.386 1.281 27.886 0.781 C 27.386 0.281 26.707 0 26 0 L 2.667 0 C 1.959 0 1.281 0.281 0.781 0.781 C 0.281 1.281 0 1.959 0 2.667 L 0 19.333 C 0 20.041 0.281 20.719 0.781 21.219 C 1.281 21.719 1.959 22 2.667 22 L 11.133 22 C 11.193 22 11.252 22.016 11.304 22.046 C 11.355 22.077 11.398 22.121 11.427 22.173 C 11.456 22.226 11.471 22.286 11.471 22.347 C 11.471 22.407 11.456 22.467 11.427 22.52 L 9.773 25 C 9.705 25.101 9.666 25.218 9.66 25.34 C 9.654 25.461 9.681 25.582 9.739 25.689 C 9.796 25.797 9.882 25.886 9.987 25.948 C 10.092 26.009 10.212 26.041 10.333 26.04 L 17.667 26.04 C 17.788 26.041 17.908 26.009 18.013 25.948 C 18.118 25.886 18.204 25.797 18.261 25.689 C 18.319 25.582 18.346 25.461 18.34 25.34 C 18.334 25.218 18.295 25.101 18.227 25 L 16.48 22.333 Z",
    fill: "currentColor",
    fillRule: "nonzero"
  })), /*#__PURE__*/React.createElement("svg", {
    width: 12,
    height: 18.667,
    viewBox: "0 0 12 18.667",
    fill: "none",
    style: {
      position: "absolute",
      left: 20,
      top: 7.333,
      width: 12,
      height: 18.667
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: "M 10.667 0 L 1.333 0 C 0.98 0 0.641 0.14 0.391 0.391 C 0.14 0.641 0 0.98 0 1.333 L 0 17.333 C 0 17.687 0.14 18.026 0.391 18.276 C 0.641 18.526 0.98 18.667 1.333 18.667 L 10.667 18.667 C 11.02 18.667 11.359 18.526 11.609 18.276 C 11.86 18.026 12 17.687 12 17.333 L 12 1.333 C 12 0.98 11.86 0.641 11.609 0.391 C 11.359 0.14 11.02 0 10.667 0 Z M 9.333 4.333 L 6.667 4.333 C 6.401 4.333 6.147 4.228 5.96 4.04 C 5.772 3.853 5.667 3.599 5.667 3.333 C 5.667 3.068 5.772 2.814 5.96 2.626 C 6.147 2.439 6.401 2.333 6.667 2.333 L 9.333 2.333 C 9.599 2.333 9.853 2.439 10.04 2.626 C 10.228 2.814 10.333 3.068 10.333 3.333 C 10.333 3.599 10.228 3.853 10.04 4.04 C 9.853 4.228 9.599 4.333 9.333 4.333 Z M 9.667 14.667 C 9.663 14.931 9.557 15.183 9.37 15.37 C 9.183 15.557 8.931 15.663 8.667 15.667 L 3.333 15.667 C 3.068 15.667 2.814 15.561 2.626 15.374 C 2.439 15.186 2.333 14.932 2.333 14.667 C 2.333 14.401 2.439 14.147 2.626 13.96 C 2.814 13.772 3.068 13.667 3.333 13.667 L 8.667 13.667 C 8.931 13.67 9.183 13.777 9.37 13.963 C 9.557 14.15 9.663 14.403 9.667 14.667 Z",
    fill: "currentColor",
    fillRule: "nonzero"
  }))));
  const __body1 = () => /*#__PURE__*/React.createElement("div", {
    className: props.className,
    style: {
      width: 32,
      height: 32,
      overflow: "hidden",
      position: "relative",
      color: "var(--color-rose-49)",
      ...props.style
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: "absolute",
      left: 0,
      top: -0.008,
      width: 32,
      height: 32.008,
      overflow: "hidden"
    }
  }, /*#__PURE__*/React.createElement("svg", {
    width: 6.027,
    height: 7.829,
    viewBox: "0 0 6.027 7.829",
    fill: "none",
    style: {
      position: "absolute",
      left: 21.333,
      top: 1.341,
      width: 6.027,
      height: 7.829
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: "M 6 0.653 C 5.997 0.479 5.925 0.313 5.8 0.191 C 5.675 0.068 5.508 0 5.333 0 L 0.667 0 C 0.49 0 0.32 0.07 0.195 0.195 C 0.07 0.32 0 0.49 0 0.667 L 0 1.053 C 0.017 1.478 0.182 1.884 0.467 2.2 L 5.8 7.76 C 5.92 7.88 6.027 7.84 6.027 7.667 L 6 0.653 Z",
    fill: "currentColor",
    fillRule: "nonzero"
  })), /*#__PURE__*/React.createElement("svg", {
    width: 32,
    height: 32.008,
    viewBox: "0 0 32 32.008",
    fill: "none",
    style: {
      position: "absolute",
      left: 0,
      top: 0,
      width: 32,
      height: 32.008
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: "M 32 30.675 C 32 30.321 31.86 29.982 31.609 29.732 C 31.359 29.482 31.02 29.341 30.667 29.341 L 28.667 29.341 C 28.49 29.341 28.32 29.271 28.195 29.146 C 28.07 29.021 28 28.852 28 28.675 L 28 18.675 C 28 18.498 28.07 18.328 28.195 18.203 C 28.32 18.078 28.49 18.008 28.667 18.008 L 30.667 18.008 C 30.928 18.008 31.184 17.931 31.402 17.786 C 31.621 17.641 31.791 17.436 31.893 17.195 C 31.994 16.955 32.023 16.691 31.975 16.435 C 31.928 16.179 31.807 15.943 31.627 15.755 L 16.96 0.408 C 16.836 0.279 16.687 0.176 16.522 0.106 C 16.357 0.036 16.179 0 16 0 C 15.821 0 15.643 0.036 15.478 0.106 C 15.313 0.176 15.164 0.279 15.04 0.408 L 0.373 15.741 C 0.193 15.929 0.072 16.166 0.025 16.421 C -0.023 16.677 0.006 16.942 0.107 17.181 C 0.209 17.422 0.379 17.628 0.598 17.773 C 0.816 17.917 1.072 17.994 1.333 17.995 L 3.333 17.995 C 3.422 17.995 3.51 18.012 3.592 18.047 C 3.673 18.081 3.747 18.131 3.81 18.195 C 3.872 18.258 3.92 18.333 3.953 18.415 C 3.986 18.498 4.002 18.586 4 18.675 L 4 28.675 C 4 28.852 3.93 29.021 3.805 29.146 C 3.68 29.271 3.51 29.341 3.333 29.341 L 1.333 29.341 C 0.98 29.341 0.641 29.482 0.391 29.732 C 0.14 29.982 0 30.321 0 30.675 C 0 31.028 0.14 31.367 0.391 31.618 C 0.641 31.868 0.98 32.008 1.333 32.008 L 30.667 32.008 C 31.02 32.008 31.359 31.868 31.609 31.618 C 31.86 31.367 32 31.028 32 30.675 Z M 16 9.661 C 16.659 9.661 17.304 9.857 17.852 10.223 C 18.4 10.589 18.827 11.11 19.08 11.719 C 19.332 12.328 19.398 12.998 19.269 13.645 C 19.141 14.292 18.823 14.886 18.357 15.352 C 17.891 15.818 17.297 16.135 16.65 16.264 C 16.004 16.393 15.333 16.327 14.724 16.074 C 14.115 15.822 13.595 15.395 13.228 14.847 C 12.862 14.298 12.667 13.654 12.667 12.995 C 12.667 12.111 13.018 11.263 13.643 10.638 C 14.268 10.013 15.116 9.661 16 9.661 Z M 13.24 24.981 C 13.199 24.801 13.1 24.639 12.958 24.521 C 12.815 24.403 12.638 24.335 12.453 24.328 L 12 24.328 C 11.823 24.328 11.654 24.258 11.529 24.133 C 11.404 24.008 11.333 23.838 11.333 23.661 L 11.333 22.328 C 11.333 21.09 11.825 19.903 12.7 19.028 C 13.575 18.153 14.762 17.661 16 17.661 C 17.238 17.661 18.425 18.153 19.3 19.028 C 20.175 19.903 20.667 21.09 20.667 22.328 L 20.667 23.661 C 20.667 23.838 20.596 24.008 20.471 24.133 C 20.346 24.258 20.177 24.328 20 24.328 L 19.56 24.328 C 19.373 24.332 19.193 24.399 19.048 24.517 C 18.903 24.636 18.802 24.799 18.76 24.981 C 18.76 24.981 18.253 27.648 18.027 28.795 C 17.998 28.955 17.911 29.099 17.783 29.199 C 17.656 29.3 17.496 29.35 17.333 29.341 L 14.667 29.341 C 14.513 29.341 14.364 29.288 14.245 29.191 C 14.126 29.094 14.044 28.959 14.013 28.808 C 13.747 27.635 13.24 24.981 13.24 24.981 Z",
    fill: "currentColor",
    fillRule: "nonzero"
  }))));
  const __body2 = () => /*#__PURE__*/React.createElement("div", {
    className: props.className,
    style: {
      width: 32,
      height: 32,
      overflow: "hidden",
      position: "relative",
      color: "var(--color-rose-49)",
      ...props.style
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: "absolute",
      left: 0,
      top: -0.02,
      width: 32.04,
      height: 32.02,
      overflow: "hidden"
    }
  }, /*#__PURE__*/React.createElement("svg", {
    width: 10.547,
    height: 25.017,
    viewBox: "0 0 10.547 25.017",
    fill: "none",
    style: {
      position: "absolute",
      left: 10.733,
      top: 7.003,
      width: 10.547,
      height: 25.017
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: "M 6.96 8.843 C 6.899 8.816 6.846 8.773 6.806 8.72 C 6.767 8.666 6.741 8.603 6.733 8.536 C 6.733 8.468 6.754 8.401 6.792 8.344 C 6.83 8.287 6.883 8.243 6.947 8.216 C 7.854 7.829 8.599 7.141 9.057 6.267 C 9.515 5.394 9.657 4.389 9.46 3.423 C 9.262 2.456 8.737 1.588 7.973 0.964 C 7.209 0.341 6.253 0 5.267 0 C 4.28 0 3.324 0.341 2.56 0.964 C 1.796 1.588 1.271 2.456 1.073 3.423 C 0.876 4.389 1.018 5.394 1.476 6.267 C 1.934 7.141 2.68 7.829 3.587 8.216 C 3.65 8.243 3.704 8.287 3.742 8.344 C 3.78 8.401 3.8 8.468 3.8 8.536 C 3.792 8.603 3.767 8.666 3.727 8.72 C 3.687 8.773 3.634 8.816 3.573 8.843 C 2.537 9.205 1.637 9.879 0.998 10.771 C 0.358 11.664 0.01 12.732 0 13.83 L 0 17.83 C 0 18.003 0.069 18.169 0.191 18.292 C 0.314 18.414 0.48 18.483 0.653 18.483 L 1.84 18.483 C 1.922 18.486 1.999 18.519 2.058 18.576 C 2.117 18.632 2.154 18.708 2.16 18.79 L 2.6 24.416 C 2.613 24.58 2.688 24.733 2.809 24.844 C 2.93 24.956 3.089 25.017 3.253 25.016 L 7.253 25.016 C 7.418 25.017 7.576 24.956 7.697 24.844 C 7.819 24.733 7.893 24.58 7.907 24.416 L 8.387 18.736 C 8.393 18.655 8.429 18.579 8.488 18.522 C 8.547 18.466 8.625 18.433 8.707 18.43 L 9.893 18.43 C 10.067 18.43 10.233 18.361 10.355 18.238 C 10.478 18.116 10.547 17.95 10.547 17.776 L 10.547 13.776 C 10.525 12.686 10.169 11.629 9.528 10.747 C 8.887 9.864 7.991 9.2 6.96 8.843 Z",
    fill: "currentColor",
    fillRule: "nonzero"
  })), /*#__PURE__*/React.createElement("svg", {
    width: 9.280,
    height: 20.433,
    viewBox: "0 0 9.280 20.433",
    fill: "none",
    style: {
      position: "absolute",
      left: 0,
      top: 0,
      width: 9.28,
      height: 20.433
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: "M 6.173 7.54 C 6.111 7.515 6.056 7.473 6.016 7.419 C 5.976 7.365 5.952 7.3 5.947 7.233 C 5.949 7.167 5.968 7.102 6.003 7.046 C 6.038 6.99 6.088 6.944 6.147 6.913 C 6.895 6.564 7.501 5.971 7.866 5.23 C 8.231 4.49 8.333 3.647 8.154 2.841 C 7.975 2.036 7.527 1.315 6.883 0.798 C 6.239 0.282 5.439 0 4.613 0 C 3.788 0 2.987 0.282 2.343 0.798 C 1.7 1.315 1.251 2.036 1.073 2.841 C 0.894 3.647 0.995 4.49 1.36 5.23 C 1.725 5.971 2.332 6.564 3.08 6.913 C 3.137 6.945 3.185 6.991 3.218 7.047 C 3.251 7.104 3.267 7.168 3.267 7.233 C 3.261 7.3 3.237 7.365 3.197 7.419 C 3.157 7.473 3.103 7.515 3.04 7.54 C 2.149 7.861 1.378 8.45 0.834 9.226 C 0.29 10.001 -0.001 10.926 0 11.873 L 0 13.847 C -0.001 14.021 0.066 14.188 0.187 14.313 C 0.313 14.432 0.48 14.498 0.653 14.5 L 1.747 14.5 C 1.828 14.502 1.906 14.533 1.966 14.586 C 2.027 14.64 2.068 14.713 2.08 14.793 L 2.667 19.847 C 2.686 20.007 2.763 20.155 2.883 20.263 C 3.003 20.371 3.159 20.431 3.32 20.433 L 5.987 20.433 C 6.15 20.434 6.309 20.375 6.432 20.267 C 6.555 20.159 6.634 20.009 6.653 19.847 L 7.213 14.793 C 7.223 14.714 7.26 14.641 7.319 14.587 C 7.378 14.534 7.454 14.503 7.533 14.5 L 8.627 14.5 C 8.8 14.5 8.966 14.431 9.089 14.309 C 9.211 14.186 9.28 14.02 9.28 13.847 L 9.28 11.873 C 9.276 10.918 8.975 9.987 8.419 9.211 C 7.862 8.434 7.077 7.85 6.173 7.54 Z",
    fill: "currentColor",
    fillRule: "nonzero"
  })), /*#__PURE__*/React.createElement("svg", {
    width: 9.253,
    height: 20.430,
    viewBox: "0 0 9.253 20.430",
    fill: "none",
    style: {
      position: "absolute",
      left: 22.787,
      top: 0.003,
      width: 9.253,
      height: 20.43
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: "M 6.173 7.537 C 6.111 7.512 6.056 7.47 6.016 7.416 C 5.976 7.362 5.952 7.297 5.947 7.23 C 5.946 7.163 5.964 7.097 5.999 7.041 C 6.035 6.984 6.086 6.938 6.147 6.91 C 6.894 6.56 7.499 5.966 7.862 5.225 C 8.226 4.485 8.326 3.643 8.147 2.838 C 7.967 2.033 7.519 1.313 6.875 0.797 C 6.232 0.281 5.432 0 4.607 0 C 3.782 0 2.982 0.281 2.338 0.797 C 1.695 1.313 1.246 2.033 1.067 2.838 C 0.888 3.643 0.988 4.485 1.351 5.225 C 1.715 5.966 2.32 6.56 3.067 6.91 C 3.126 6.941 3.175 6.987 3.21 7.043 C 3.245 7.099 3.265 7.164 3.267 7.23 C 3.262 7.297 3.237 7.362 3.197 7.416 C 3.157 7.47 3.103 7.512 3.04 7.537 C 2.149 7.858 1.379 8.447 0.834 9.222 C 0.29 9.998 -0.001 10.923 0 11.87 L 0 13.843 C -0.002 13.93 0.014 14.016 0.046 14.096 C 0.078 14.176 0.126 14.248 0.187 14.309 C 0.248 14.371 0.321 14.419 0.401 14.451 C 0.481 14.483 0.567 14.499 0.653 14.497 L 1.747 14.497 C 1.827 14.497 1.905 14.527 1.964 14.581 C 2.023 14.635 2.06 14.71 2.067 14.79 L 2.627 19.843 C 2.646 20.006 2.725 20.156 2.848 20.264 C 2.971 20.372 3.13 20.431 3.293 20.43 L 5.96 20.43 C 6.122 20.428 6.277 20.367 6.397 20.26 C 6.517 20.152 6.594 20.004 6.613 19.843 L 7.173 14.79 C 7.186 14.71 7.226 14.637 7.287 14.583 C 7.348 14.529 7.426 14.499 7.507 14.497 L 8.6 14.497 C 8.773 14.497 8.94 14.428 9.062 14.305 C 9.185 14.183 9.253 14.017 9.253 13.843 L 9.253 11.87 C 9.252 10.918 8.955 9.99 8.403 9.213 C 7.851 8.437 7.072 7.851 6.173 7.537 Z",
    fill: "currentColor",
    fillRule: "nonzero"
  }))));
  const __body3 = () => /*#__PURE__*/React.createElement("div", {
    className: props.className,
    style: {
      width: 28,
      height: 28,
      overflow: "hidden",
      position: "relative",
      color: "var(--color-rose-49)",
      ...props.style
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: "absolute",
      left: 0,
      top: 0,
      width: 28,
      height: 28,
      overflow: "hidden"
    }
  }, /*#__PURE__*/React.createElement("svg", {
    width: 28,
    height: 28,
    viewBox: "0 0 28 28",
    fill: "none",
    style: {
      position: "absolute",
      left: 0,
      top: 0,
      width: 28,
      height: 28
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: "M 21.583 0 L 6.417 0 C 4.716 0.003 3.085 0.68 1.883 1.883 C 0.68 3.085 0.003 4.716 0 6.417 L 0 21.583 C 0.003 23.284 0.68 24.915 1.883 26.117 C 3.085 27.32 4.716 27.997 6.417 28 L 21.583 28 C 23.284 27.997 24.915 27.32 26.117 26.117 C 27.32 24.915 27.997 23.284 28 21.583 L 28 6.417 C 27.997 4.716 27.32 3.085 26.117 1.883 C 24.915 0.68 23.284 0.003 21.583 0 Z M 23.333 18.667 C 23.333 19.904 22.842 21.091 21.966 21.966 C 21.091 22.842 19.904 23.333 18.667 23.333 L 9.333 23.333 C 8.096 23.333 6.909 22.842 6.034 21.966 C 5.158 21.091 4.667 19.904 4.667 18.667 L 4.667 9.333 C 4.667 8.096 5.158 6.909 6.034 6.034 C 6.909 5.158 8.096 4.667 9.333 4.667 L 18.667 4.667 C 19.904 4.667 21.091 5.158 21.966 6.034 C 22.842 6.909 23.333 8.096 23.333 9.333 L 23.333 18.667 Z",
    fill: "currentColor",
    fillRule: "nonzero"
  })), /*#__PURE__*/React.createElement("svg", {
    width: 9.333,
    height: 9.333,
    viewBox: "0 0 9.333 9.333",
    fill: "none",
    style: {
      position: "absolute",
      left: 9.333,
      top: 9.333,
      width: 9.333,
      height: 9.333
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: "M 0 4.667 C 0 5.904 0.492 7.091 1.367 7.966 C 2.242 8.842 3.429 9.333 4.667 9.333 C 5.904 9.333 7.091 8.842 7.966 7.966 C 8.842 7.091 9.333 5.904 9.333 4.667 C 9.333 3.429 8.842 2.242 7.966 1.367 C 7.091 0.492 5.904 0 4.667 0 C 3.429 0 2.242 0.492 1.367 1.367 C 0.492 2.242 0 3.429 0 4.667 Z",
    fill: "currentColor",
    fillRule: "nonzero"
  })), /*#__PURE__*/React.createElement("svg", {
    width: 2.333,
    height: 2.333,
    viewBox: "0 0 2.333 2.333",
    fill: "none",
    style: {
      position: "absolute",
      left: 18.667,
      top: 7,
      width: 2.333,
      height: 2.333
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: "M 0 1.167 C 0 1.476 0.123 1.773 0.342 1.992 C 0.561 2.21 0.857 2.333 1.167 2.333 C 1.476 2.333 1.773 2.21 1.992 1.992 C 2.21 1.773 2.333 1.476 2.333 1.167 C 2.333 0.857 2.21 0.561 1.992 0.342 C 1.773 0.123 1.476 0 1.167 0 C 0.857 0 0.561 0.123 0.342 0.342 C 0.123 0.561 0 0.857 0 1.167 Z",
    fill: "currentColor",
    fillRule: "nonzero"
  }))));
  const __body4 = () => /*#__PURE__*/React.createElement("div", {
    className: props.className,
    style: {
      width: 28,
      height: 28,
      overflow: "hidden",
      position: "relative",
      color: "var(--color-azure-65)",
      ...props.style
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: "absolute",
      left: 0,
      top: 0,
      width: 28,
      height: 28,
      overflow: "hidden"
    }
  }, /*#__PURE__*/React.createElement("svg", {
    width: 28,
    height: 28,
    viewBox: "0 0 28 28",
    fill: "none",
    style: {
      position: "absolute",
      left: 0,
      top: 0,
      width: 28,
      height: 28
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: "M 21.583 0 L 6.417 0 C 4.716 0.003 3.085 0.68 1.883 1.883 C 0.68 3.085 0.003 4.716 0 6.417 L 0 21.583 C 0.003 23.284 0.68 24.915 1.883 26.117 C 3.085 27.32 4.716 27.997 6.417 28 L 21.583 28 C 23.284 27.997 24.915 27.32 26.117 26.117 C 27.32 24.915 27.997 23.284 28 21.583 L 28 6.417 C 27.997 4.716 27.32 3.085 26.117 1.883 C 24.915 0.68 23.284 0.003 21.583 0 Z M 23.333 18.667 C 23.333 19.904 22.842 21.091 21.966 21.966 C 21.091 22.842 19.904 23.333 18.667 23.333 L 9.333 23.333 C 8.096 23.333 6.909 22.842 6.034 21.966 C 5.158 21.091 4.667 19.904 4.667 18.667 L 4.667 9.333 C 4.667 8.096 5.158 6.909 6.034 6.034 C 6.909 5.158 8.096 4.667 9.333 4.667 L 18.667 4.667 C 19.904 4.667 21.091 5.158 21.966 6.034 C 22.842 6.909 23.333 8.096 23.333 9.333 L 23.333 18.667 Z",
    fill: "currentColor",
    fillRule: "nonzero"
  })), /*#__PURE__*/React.createElement("svg", {
    width: 9.333,
    height: 9.333,
    viewBox: "0 0 9.333 9.333",
    fill: "none",
    style: {
      position: "absolute",
      left: 9.333,
      top: 9.333,
      width: 9.333,
      height: 9.333
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: "M 0 4.667 C 0 5.904 0.492 7.091 1.367 7.966 C 2.242 8.842 3.429 9.333 4.667 9.333 C 5.904 9.333 7.091 8.842 7.966 7.966 C 8.842 7.091 9.333 5.904 9.333 4.667 C 9.333 3.429 8.842 2.242 7.966 1.367 C 7.091 0.492 5.904 0 4.667 0 C 3.429 0 2.242 0.492 1.367 1.367 C 0.492 2.242 0 3.429 0 4.667 Z",
    fill: "currentColor",
    fillRule: "nonzero"
  })), /*#__PURE__*/React.createElement("svg", {
    width: 2.333,
    height: 2.333,
    viewBox: "0 0 2.333 2.333",
    fill: "none",
    style: {
      position: "absolute",
      left: 18.667,
      top: 7,
      width: 2.333,
      height: 2.333
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: "M 0 1.167 C 0 1.476 0.123 1.773 0.342 1.992 C 0.561 2.21 0.857 2.333 1.167 2.333 C 1.476 2.333 1.773 2.21 1.992 1.992 C 2.21 1.773 2.333 1.476 2.333 1.167 C 2.333 0.857 2.21 0.561 1.992 0.342 C 1.773 0.123 1.476 0 1.167 0 C 0.857 0 0.561 0.123 0.342 0.342 C 0.123 0.561 0 0.857 0 1.167 Z",
    fill: "currentColor",
    fillRule: "nonzero"
  }))));
  const __body5 = () => /*#__PURE__*/React.createElement("div", {
    className: props.className,
    style: {
      width: 28,
      height: 28,
      overflow: "hidden",
      position: "relative",
      color: "var(--color-rose-49)",
      ...props.style
    }
  }, /*#__PURE__*/React.createElement("svg", {
    width: 28,
    height: 28,
    viewBox: "0 0 28 28",
    fill: "none",
    style: {
      position: "absolute",
      left: 0,
      top: 0,
      width: 28,
      height: 28
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: "M 22.808 16.987 C 22.791 17.127 22.724 17.256 22.619 17.351 C 22.514 17.445 22.378 17.498 22.237 17.5 L 19.833 17.5 C 19.68 17.503 19.533 17.565 19.424 17.674 C 19.315 17.783 19.253 17.93 19.25 18.083 L 19.25 27.417 C 19.25 27.571 19.311 27.72 19.421 27.829 C 19.53 27.939 19.679 28 19.833 28 L 26.833 28 C 27.143 28 27.439 27.877 27.658 27.658 C 27.877 27.439 28 27.143 28 26.833 L 28 1.167 C 28 0.857 27.877 0.561 27.658 0.342 C 27.439 0.123 27.143 0 26.833 0 L 1.167 0 C 0.857 0 0.561 0.123 0.342 0.342 C 0.123 0.561 0 0.857 0 1.167 L 0 26.833 C 0 27.143 0.123 27.439 0.342 27.658 C 0.561 27.877 0.857 28 1.167 28 L 14 28 C 14.154 27.997 14.3 27.935 14.409 27.826 C 14.518 27.717 14.58 27.57 14.583 27.417 L 14.583 18.083 C 14.583 17.929 14.522 17.78 14.412 17.671 C 14.303 17.561 14.155 17.5 14 17.5 L 11.667 17.5 C 11.512 17.5 11.364 17.439 11.254 17.329 C 11.145 17.22 11.083 17.071 11.083 16.917 L 11.083 13.417 C 11.083 13.262 11.145 13.114 11.254 13.004 C 11.364 12.895 11.512 12.833 11.667 12.833 L 14 12.833 C 14.155 12.833 14.303 12.772 14.412 12.662 C 14.522 12.553 14.583 12.405 14.583 12.25 L 14.583 10.722 C 14.583 8.961 15.283 7.273 16.528 6.028 C 17.773 4.783 19.461 4.083 21.222 4.083 L 22.75 4.083 C 22.905 4.083 23.053 4.145 23.162 4.254 C 23.272 4.364 23.333 4.512 23.333 4.667 L 23.333 8.167 C 23.333 8.321 23.272 8.47 23.162 8.579 C 23.053 8.689 22.905 8.75 22.75 8.75 L 21.222 8.75 C 20.699 8.75 20.197 8.958 19.827 9.327 C 19.458 9.697 19.25 10.199 19.25 10.722 L 19.25 12.25 C 19.25 12.405 19.311 12.553 19.421 12.662 C 19.53 12.772 19.679 12.833 19.833 12.833 L 22.668 12.833 C 22.752 12.833 22.835 12.85 22.912 12.884 C 22.988 12.918 23.056 12.969 23.112 13.032 C 23.165 13.094 23.205 13.166 23.229 13.245 C 23.253 13.323 23.261 13.405 23.252 13.487 L 22.808 16.987 Z",
    fill: "currentColor",
    fillRule: "nonzero"
  })));
  const __body6 = () => /*#__PURE__*/React.createElement("div", {
    className: props.className,
    style: {
      width: 28,
      height: 28,
      overflow: "hidden",
      position: "relative",
      color: "var(--color-azure-65)",
      ...props.style
    }
  }, /*#__PURE__*/React.createElement("svg", {
    width: 28,
    height: 28,
    viewBox: "0 0 28 28",
    fill: "none",
    style: {
      position: "absolute",
      left: 0,
      top: 0,
      width: 28,
      height: 28
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: "M 22.808 16.987 C 22.791 17.127 22.724 17.256 22.619 17.351 C 22.514 17.445 22.378 17.498 22.237 17.5 L 19.833 17.5 C 19.68 17.503 19.533 17.565 19.424 17.674 C 19.315 17.783 19.253 17.93 19.25 18.083 L 19.25 27.417 C 19.25 27.571 19.311 27.72 19.421 27.829 C 19.53 27.939 19.679 28 19.833 28 L 26.833 28 C 27.143 28 27.439 27.877 27.658 27.658 C 27.877 27.439 28 27.143 28 26.833 L 28 1.167 C 28 0.857 27.877 0.561 27.658 0.342 C 27.439 0.123 27.143 0 26.833 0 L 1.167 0 C 0.857 0 0.561 0.123 0.342 0.342 C 0.123 0.561 0 0.857 0 1.167 L 0 26.833 C 0 27.143 0.123 27.439 0.342 27.658 C 0.561 27.877 0.857 28 1.167 28 L 14 28 C 14.154 27.997 14.3 27.935 14.409 27.826 C 14.518 27.717 14.58 27.57 14.583 27.417 L 14.583 18.083 C 14.583 17.929 14.522 17.78 14.412 17.671 C 14.303 17.561 14.155 17.5 14 17.5 L 11.667 17.5 C 11.512 17.5 11.364 17.439 11.254 17.329 C 11.145 17.22 11.083 17.071 11.083 16.917 L 11.083 13.417 C 11.083 13.262 11.145 13.114 11.254 13.004 C 11.364 12.895 11.512 12.833 11.667 12.833 L 14 12.833 C 14.155 12.833 14.303 12.772 14.412 12.662 C 14.522 12.553 14.583 12.405 14.583 12.25 L 14.583 10.722 C 14.583 8.961 15.283 7.273 16.528 6.028 C 17.773 4.783 19.461 4.083 21.222 4.083 L 22.75 4.083 C 22.905 4.083 23.053 4.145 23.162 4.254 C 23.272 4.364 23.333 4.512 23.333 4.667 L 23.333 8.167 C 23.333 8.321 23.272 8.47 23.162 8.579 C 23.053 8.689 22.905 8.75 22.75 8.75 L 21.222 8.75 C 20.699 8.75 20.197 8.958 19.827 9.327 C 19.458 9.697 19.25 10.199 19.25 10.722 L 19.25 12.25 C 19.25 12.405 19.311 12.553 19.421 12.662 C 19.53 12.772 19.679 12.833 19.833 12.833 L 22.668 12.833 C 22.752 12.833 22.835 12.85 22.912 12.884 C 22.988 12.918 23.056 12.969 23.112 13.032 C 23.165 13.094 23.205 13.166 23.229 13.245 C 23.253 13.323 23.261 13.405 23.252 13.487 L 22.808 16.987 Z",
    fill: "currentColor",
    fillRule: "nonzero"
  })));
  const __body7 = () => /*#__PURE__*/React.createElement("div", {
    className: props.className,
    style: {
      width: 24,
      height: 24,
      overflow: "hidden",
      position: "relative",
      color: "var(--color-rose-49)",
      ...props.style
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: "absolute",
      left: 0,
      top: 4,
      width: 24,
      height: 16,
      overflow: "hidden"
    }
  }, /*#__PURE__*/React.createElement("svg", {
    width: 24,
    height: 14.200,
    viewBox: "0 0 24 14.200",
    fill: "none",
    style: {
      position: "absolute",
      left: 0,
      top: 1.8,
      width: 24,
      height: 14.2
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: "M 23.89 0.03 C 23.86 0.011 23.826 0 23.79 0 C 23.754 0 23.72 0.011 23.69 0.03 L 13.94 9.78 C 13.686 10.036 13.383 10.238 13.05 10.375 C 12.717 10.512 12.36 10.582 12 10.58 C 11.27 10.579 10.57 10.292 10.05 9.78 L 0.31 0.07 C 0.28 0.051 0.246 0.04 0.21 0.04 C 0.174 0.04 0.14 0.051 0.11 0.07 C 0.082 0.081 0.058 0.099 0.039 0.122 C 0.019 0.144 0.006 0.171 0 0.2 L 0 12.2 C 0 12.731 0.211 13.239 0.586 13.615 C 0.961 13.99 1.47 14.2 2 14.2 L 22 14.2 C 22.53 14.2 23.039 13.99 23.414 13.615 C 23.789 13.239 24 12.731 24 12.2 L 24 0.2 C 24.001 0.164 23.991 0.129 23.971 0.098 C 23.952 0.068 23.923 0.044 23.89 0.03 Z",
    fill: "currentColor",
    fillRule: "nonzero"
  })), /*#__PURE__*/React.createElement("svg", {
    width: 21.431,
    height: 10.919,
    viewBox: "0 0 21.431 10.919",
    fill: "none",
    style: {
      position: "absolute",
      left: 1.285,
      top: 0,
      width: 21.431,
      height: 10.919
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: "M 9.825 10.56 C 10.062 10.79 10.38 10.919 10.71 10.919 C 11.041 10.919 11.358 10.79 11.595 10.56 L 21.285 0.87 C 21.351 0.804 21.396 0.722 21.418 0.632 C 21.439 0.542 21.435 0.448 21.405 0.36 C 21.295 0 20.985 0 20.715 0 L 0.715 0 C 0.435 0 0.135 0 0.025 0.36 C -0.004 0.448 -0.008 0.542 0.013 0.632 C 0.034 0.722 0.08 0.804 0.145 0.87 L 9.825 10.56 Z",
    fill: "currentColor",
    fillRule: "nonzero"
  }))));
  const __body8 = () => /*#__PURE__*/React.createElement("div", {
    className: props.className,
    style: {
      width: 16,
      height: 16,
      overflow: "hidden",
      position: "relative",
      color: "var(--color-black-solid)",
      ...props.style
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: "absolute",
      left: 0,
      top: 0,
      width: 16,
      height: 16,
      overflow: "hidden"
    }
  }, /*#__PURE__*/React.createElement("svg", {
    width: 8.037,
    height: 7.411,
    viewBox: "0 0 8.037 7.411",
    fill: "none",
    style: {
      position: "absolute",
      left: 4.202,
      top: 4.138,
      width: 8.037,
      height: 7.411
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: "M 7.637 5.056 C 7.606 5.041 6.439 4.467 6.232 4.392 C 6.148 4.362 6.057 4.332 5.961 4.332 C 5.803 4.332 5.671 4.411 5.568 4.565 C 5.451 4.738 5.098 5.15 4.989 5.274 C 4.975 5.29 4.956 5.309 4.944 5.309 C 4.934 5.309 4.753 5.235 4.698 5.211 C 3.447 4.668 2.497 3.361 2.367 3.14 C 2.349 3.109 2.348 3.094 2.348 3.094 C 2.352 3.077 2.394 3.035 2.416 3.013 C 2.48 2.951 2.548 2.868 2.615 2.788 C 2.647 2.75 2.678 2.712 2.709 2.676 C 2.806 2.563 2.849 2.476 2.899 2.375 L 2.925 2.322 C 3.047 2.08 2.943 1.876 2.909 1.81 C 2.881 1.755 2.389 0.567 2.336 0.442 C 2.211 0.14 2.044 0 1.813 0 C 1.791 0 1.813 0 1.723 0.004 C 1.613 0.008 1.017 0.087 0.753 0.253 C 0.473 0.43 0 0.992 0 1.98 C 0 2.87 0.565 3.71 0.807 4.03 C 0.813 4.038 0.824 4.054 0.84 4.078 C 1.769 5.434 2.926 6.439 4.1 6.907 C 5.229 7.359 5.764 7.411 6.068 7.411 L 6.068 7.411 C 6.196 7.411 6.298 7.401 6.389 7.392 L 6.446 7.386 C 6.836 7.352 7.694 6.907 7.889 6.365 C 8.042 5.938 8.083 5.472 7.981 5.303 C 7.911 5.188 7.79 5.13 7.637 5.056 Z",
    fill: "currentColor",
    fillRule: "nonzero"
  })), /*#__PURE__*/React.createElement("svg", {
    width: 16,
    height: 16,
    viewBox: "0 0 16 16",
    fill: "none",
    style: {
      position: "absolute",
      left: 0,
      top: 0,
      width: 16,
      height: 16
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: "M 8.142 0 C 3.809 0 0.283 3.499 0.283 7.8 C 0.283 9.191 0.656 10.552 1.361 11.744 L 0.011 15.726 C -0.014 15.8 0.005 15.882 0.059 15.938 C 0.099 15.978 0.153 16 0.208 16 C 0.229 16 0.25 15.997 0.271 15.99 L 4.422 14.671 C 5.558 15.278 6.843 15.598 8.142 15.598 C 12.475 15.598 16 12.1 16 7.8 C 16 3.499 12.475 0 8.142 0 Z M 8.142 13.974 C 6.919 13.974 5.735 13.621 4.717 12.953 C 4.683 12.93 4.643 12.919 4.603 12.919 C 4.582 12.919 4.56 12.922 4.54 12.928 L 2.46 13.589 L 3.131 11.609 C 3.153 11.545 3.142 11.474 3.102 11.419 C 2.327 10.36 1.917 9.108 1.917 7.8 C 1.917 4.395 4.71 1.625 8.142 1.625 C 11.574 1.625 14.366 4.395 14.366 7.8 C 14.366 11.204 11.574 13.974 8.142 13.974 Z",
    fill: "currentColor",
    fillRule: "nonzero"
  }))));
  const __body9 = () => /*#__PURE__*/React.createElement("div", {
    className: props.className,
    style: {
      width: 20,
      height: 20,
      overflow: "hidden",
      position: "relative",
      color: "var(--color-rose-49)",
      ...props.style
    }
  }, /*#__PURE__*/React.createElement("svg", {
    width: 10.018,
    height: 5.768,
    viewBox: "0 0 10.018 5.768",
    fill: "none",
    style: {
      position: "absolute",
      left: 5.001,
      top: 7.981,
      width: 10.018,
      height: 5.768
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: "M 0.219 0.239 C 0.36 0.098 0.551 0.019 0.749 0.019 C 0.948 0.019 1.139 0.098 1.279 0.239 L 4.999 3.959 L 8.719 0.239 C 8.788 0.165 8.871 0.106 8.963 0.065 C 9.055 0.024 9.154 0.002 9.255 0 C 9.356 -0.002 9.456 0.017 9.549 0.055 C 9.642 0.092 9.727 0.148 9.798 0.22 C 9.87 0.291 9.926 0.376 9.963 0.469 C 10.001 0.562 10.02 0.663 10.018 0.763 C 10.016 0.864 9.994 0.963 9.953 1.055 C 9.912 1.147 9.853 1.23 9.779 1.299 L 5.529 5.549 C 5.389 5.689 5.198 5.768 4.999 5.768 C 4.801 5.768 4.61 5.689 4.469 5.549 L 0.219 1.299 C 0.079 1.158 0 0.967 0 0.769 C 0 0.57 0.079 0.379 0.219 0.239 Z",
    fill: "currentColor",
    fillRule: "evenodd"
  })));
  const __body10 = () => /*#__PURE__*/React.createElement("div", {
    className: props.className,
    style: {
      width: 20,
      height: 20,
      overflow: "hidden",
      position: "relative",
      color: "var(--color-azure-11)",
      ...props.style
    }
  }, /*#__PURE__*/React.createElement("svg", {
    width: 10.018,
    height: 5.768,
    viewBox: "0 0 10.018 5.768",
    fill: "none",
    style: {
      position: "absolute",
      left: 5.001,
      top: 7.981,
      width: 10.018,
      height: 5.768
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: "M 0.219 0.239 C 0.36 0.098 0.551 0.019 0.749 0.019 C 0.948 0.019 1.139 0.098 1.279 0.239 L 4.999 3.959 L 8.719 0.239 C 8.788 0.165 8.871 0.106 8.963 0.065 C 9.055 0.024 9.154 0.002 9.255 0 C 9.356 -0.002 9.456 0.017 9.549 0.055 C 9.642 0.092 9.727 0.148 9.798 0.22 C 9.87 0.291 9.926 0.376 9.963 0.469 C 10.001 0.562 10.02 0.663 10.018 0.763 C 10.016 0.864 9.994 0.963 9.953 1.055 C 9.912 1.147 9.853 1.23 9.779 1.299 L 5.529 5.549 C 5.389 5.689 5.198 5.768 4.999 5.768 C 4.801 5.768 4.61 5.689 4.469 5.549 L 0.219 1.299 C 0.079 1.158 0 0.967 0 0.769 C 0 0.57 0.079 0.379 0.219 0.239 Z",
    fill: "currentColor",
    fillRule: "evenodd"
  })));
  const __impls = {
    // figma: variant=1
    "variant=1": __body0,
    // figma: variant=2
    "variant=2": __body1,
    // figma: variant=3
    "variant=3": __body2,
    // figma: variant=4
    "variant=4": __body3,
    // figma: variant=5
    "variant=5": __body4,
    // figma: variant=6
    "variant=6": __body5,
    // figma: variant=7
    "variant=7": __body6,
    // figma: variant=8
    "variant=8": __body7,
    // figma: variant=9
    "variant=9": __body8,
    // figma: variant=10
    "variant=10": __body9,
    // figma: variant=11
    "variant=11": __body10
  };
  return (__impls[__vkey(props)] ?? __body0)();
}

/** Figma kit name alias ("Component 3"). */
Object.assign(__ds_scope, { Icon, __ds_default_components_icons_Icon_fio49a: Icon, Component3: Icon });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/icons/Icon.jsx", error: String((e && e.message) || e) }); }

// components/footer/EmailLink.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
// Source: Figma "Component 6" (node 1:232) — mail glyph + address, right-aligned in the footer.
function useHover(forced) {
  const [h, setH] = React.useState(false);
  return [forced ?? h, {
    onMouseEnter: () => setH(true),
    onMouseLeave: () => setH(false)
  }];
}
function EmailLink({
  email = "sonshinehollistic@gmail.com",
  hover,
  style
}) {
  const [h, hp] = useHover(hover);
  return /*#__PURE__*/React.createElement("a", _extends({
    href: "mailto:" + email
  }, hp, {
    style: {
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "flex-end",
      gap: 12,
      textDecoration: "none",
      cursor: "pointer",
      ...style
    }
  }), /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: "mail"
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: "var(--font-body)",
      fontSize: 16,
      lineHeight: "24px",
      whiteSpace: "nowrap",
      color: h ? "var(--color-rose-49)" : "var(--color-azure-84)",
      transition: "color 150ms"
    }
  }, email));
}

/** Figma kit name alias ("Component 6"). */
Object.assign(__ds_scope, { EmailLink, __ds_default_components_footer_EmailLink_1ogtkfi: EmailLink, Component6: EmailLink });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/footer/EmailLink.jsx", error: String((e && e.message) || e) }); }

// components/footer/SocialLink.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
// Source: Figma "Component 4" (node 1:212) — footer social icon; grey #9CA3AF, rose on hover.
function useHover(forced) {
  const [h, setH] = React.useState(false);
  return [forced ?? h, {
    onMouseEnter: () => setH(true),
    onMouseLeave: () => setH(false)
  }];
}
function SocialLink({
  network = "instagram",
  hover,
  href,
  style
}) {
  const [h, hp] = useHover(hover);
  return /*#__PURE__*/React.createElement("a", _extends({
    href: href,
    "aria-label": network
  }, hp, {
    style: {
      display: "inline-flex",
      height: 28,
      cursor: "pointer",
      ...style
    }
  }), /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: h ? network : network + "-muted"
  }));
}

/** Figma kit name alias ("Component 4"). */
Object.assign(__ds_scope, { SocialLink, __ds_default_components_footer_SocialLink_1xffw75: SocialLink, Component4: SocialLink });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/footer/SocialLink.jsx", error: String((e && e.message) || e) }); }

// components/navigation/NavDropdown.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
// Source: Figma "Component 9" (node 1:253) — "About" menu trigger with chevron.
function useHover(forced) {
  const [h, setH] = React.useState(false);
  return [forced ?? h, {
    onMouseEnter: () => setH(true),
    onMouseLeave: () => setH(false)
  }];
}
function NavDropdown({
  children = "About",
  hover,
  open,
  items = [],
  onSelect,
  style
}) {
  const [h, hp] = useHover(hover);
  const [o, setO] = React.useState(false);
  const isOpen = open ?? o;
  const on = h || isOpen;
  return /*#__PURE__*/React.createElement("div", _extends({}, hp, {
    style: {
      position: "relative",
      display: "inline-flex",
      ...style
    }
  }), /*#__PURE__*/React.createElement("button", {
    onClick: () => setO(!o),
    style: {
      display: "inline-flex",
      alignItems: "center",
      gap: 3.99,
      padding: "8px 16px",
      borderRadius: 8,
      border: "none",
      background: on ? "rgba(236,15,140,0.15)" : "transparent",
      color: on ? "var(--color-rose-49)" : "var(--color-azure-11)",
      fontFamily: "var(--font-body)",
      fontWeight: 500,
      fontSize: 14,
      lineHeight: "20px",
      cursor: "pointer",
      transition: "background 150ms, color 150ms"
    }
  }, /*#__PURE__*/React.createElement("span", null, children), /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: on ? "chevron-down" : "chevron-down-dark"
  })), isOpen && items.length > 0 && /*#__PURE__*/React.createElement("div", {
    style: {
      position: "absolute",
      top: "calc(100% + 4px)",
      right: 0,
      minWidth: 180,
      background: "var(--color-white-solid)",
      borderRadius: 8,
      boxShadow: "0px 10px 15px -3px rgba(0,0,0,0.1), 0px 4px 6px -4px rgba(0,0,0,0.1)",
      padding: 4,
      display: "flex",
      flexDirection: "column",
      zIndex: 20
    }
  }, items.map(it => /*#__PURE__*/React.createElement("a", {
    key: it,
    onClick: () => {
      setO(false);
      onSelect && onSelect(it);
    },
    style: {
      padding: "8px 12px",
      borderRadius: 6,
      fontFamily: "var(--font-body)",
      fontSize: 14,
      lineHeight: "20px",
      color: "var(--color-azure-11)",
      cursor: "pointer",
      textDecoration: "none"
    }
  }, it))));
}

/** Figma kit name alias ("Component 9"). */
Object.assign(__ds_scope, { NavDropdown, __ds_default_components_navigation_NavDropdown_1sxpyzv: NavDropdown, Component9: NavDropdown });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/navigation/NavDropdown.jsx", error: String((e && e.message) || e) }); }

// components/navigation/NavLink.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
// Source: Figma "Component 8" (node 1:244) — header nav item. default / hover (rose wash) / active (rose outline).
function useHover(forced) {
  const [h, setH] = React.useState(false);
  return [forced ?? h, {
    onMouseEnter: () => setH(true),
    onMouseLeave: () => setH(false)
  }];
}
function NavLink({
  children = "Yoga for Adults",
  active = false,
  hover,
  href,
  onClick,
  style,
  ...rest
}) {
  const [h, hp] = useHover(hover);
  const on = h && !active;
  return /*#__PURE__*/React.createElement("a", _extends({
    href: href,
    onClick: onClick
  }, hp, rest, {
    style: {
      boxSizing: "border-box",
      display: "inline-flex",
      alignItems: "center",
      padding: active ? "7px 15px" : "8px 16px",
      borderRadius: 8,
      border: active ? "1px solid var(--color-rose-49)" : "none",
      background: on ? "rgba(236,15,140,0.15)" : "transparent",
      color: active || on ? "var(--color-rose-49)" : "var(--color-azure-11)",
      fontFamily: "var(--font-body)",
      fontWeight: 500,
      fontSize: 14,
      lineHeight: "20px",
      whiteSpace: "nowrap",
      textDecoration: "none",
      cursor: "pointer",
      transition: "background 150ms, color 150ms",
      ...style
    }
  }), children);
}

/** Figma kit name alias ("Component 8"). */
Object.assign(__ds_scope, { NavLink, __ds_default_components_navigation_NavLink_zxfsmk: NavLink, Component8: NavLink });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/navigation/NavLink.jsx", error: String((e && e.message) || e) }); }

// ui_kits/website/Chrome.jsx
try { (() => {
const {
  NavLink,
  NavDropdown,
  SmallButton,
  SocialLink,
  FooterLink,
  EmailLink,
  BackToTop,
  Icon
} = window.SonshineHollisticDesignSystem_de4847;
const NAV = [["home", "Home"], ["adults", "Yoga for Adults"], ["kids", "Yoga for Kids"], ["events", "Events"], ["reiki", "Reiki"], ["sound", "Sound Healing"], ["training", "Teacher Training"]];
function SiteHeader({
  page,
  go
}) {
  return /*#__PURE__*/React.createElement("header", {
    style: {
      position: "sticky",
      top: 0,
      zIndex: 30,
      height: 80,
      background: "rgba(255,255,255,0.9)",
      backdropFilter: "blur(8px)",
      WebkitBackdropFilter: "blur(8px)",
      boxShadow: "0px 1px 2px 0px rgba(0,0,0,0.05)"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: "relative",
      height: 80,
      padding: "0 74.5px",
      display: "flex",
      alignItems: "center",
      justifyContent: "flex-end"
    }
  }, /*#__PURE__*/React.createElement("a", {
    onClick: () => go("home"),
    style: {
      position: "absolute",
      left: 82.5,
      top: 0,
      width: 240,
      height: 80,
      background: "url(../../assets/logo-figma.png) 50% 50% / auto 100% no-repeat",
      cursor: "pointer"
    },
    "aria-label": "Sonshine Hollistic"
  }), /*#__PURE__*/React.createElement("nav", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 8,
      padding: "0 32px"
    }
  }, NAV.map(([k, l]) => /*#__PURE__*/React.createElement(NavLink, {
    key: k,
    active: page === k,
    onClick: () => go(k)
  }, l)), /*#__PURE__*/React.createElement(NavDropdown, {
    items: ["Meet the Team", "About Sonshine Hollistic", "Testimonials", "Contact"]
  }, "About")), /*#__PURE__*/React.createElement(SmallButton, {
    tone: "rose",
    width: 72
  }, "Sign In")));
}
const fH = {
  font: "700 24px/32px var(--font-display)",
  color: "#fff",
  margin: 0
};
function SiteFooter() {
  return /*#__PURE__*/React.createElement("footer", null, /*#__PURE__*/React.createElement("div", {
    style: {
      background: "var(--surface-footer)",
      padding: "64px 42.5px 32px"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: 1536,
      margin: "0 auto",
      padding: "0 32px",
      display: "flex",
      flexDirection: "column",
      gap: 64
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 80
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      display: "flex",
      flexDirection: "column",
      gap: 24
    }
  }, /*#__PURE__*/React.createElement("h3", {
    style: fH
  }, "Sonshine Hollistic"), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: 0,
      font: "400 16px/24px var(--font-body)",
      color: "var(--text-on-dark)",
      maxWidth: 300
    }
  }, "Livingston's Premier Boutique Yoga Studio. Our welcoming and inclusive community in West Lothian is here to support you every step of the way in your yoga journey."), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 16,
      padding: "8px 0"
    }
  }, /*#__PURE__*/React.createElement(SocialLink, {
    network: "instagram"
  }), /*#__PURE__*/React.createElement(SocialLink, {
    network: "facebook"
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      display: "flex",
      flexDirection: "column",
      gap: 24
    }
  }, /*#__PURE__*/React.createElement("h3", {
    style: fH
  }, "Areas We Serve"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 12
    }
  }, /*#__PURE__*/React.createElement(FooterLink, null, "Yoga in Livingston"), /*#__PURE__*/React.createElement(FooterLink, null, "Yoga in West Lothian"), /*#__PURE__*/React.createElement(FooterLink, null, "Yoga in Edinburgh West"))), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      display: "flex",
      flexDirection: "column",
      gap: 24,
      alignItems: "flex-end"
    }
  }, /*#__PURE__*/React.createElement("h3", {
    style: fH
  }, "Need Help?"), /*#__PURE__*/React.createElement(EmailLink, null), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 16,
      alignItems: "flex-end"
    }
  }, /*#__PURE__*/React.createElement(SmallButton, {
    tone: "whatsapp",
    icon: /*#__PURE__*/React.createElement(Icon, {
      name: "whatsapp"
    }),
    style: {
      height: 32,
      fontSize: 14,
      lineHeight: "20px"
    }
  }, "WhatsApp Son at 07747 729300"), /*#__PURE__*/React.createElement(SmallButton, {
    tone: "whatsapp",
    icon: /*#__PURE__*/React.createElement(Icon, {
      name: "whatsapp"
    }),
    style: {
      height: 32,
      fontSize: 14,
      lineHeight: "20px"
    }
  }, "WhatsApp Ruth at 07957 134792"))), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      display: "flex",
      flexDirection: "column",
      gap: 24,
      alignItems: "flex-end"
    }
  }, /*#__PURE__*/React.createElement("h3", {
    style: fH
  }, "Policies"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 12
    }
  }, /*#__PURE__*/React.createElement(FooterLink, {
    align: "right"
  }, "Privacy Policy"), /*#__PURE__*/React.createElement(FooterLink, {
    align: "right"
  }, "Cancellation Policy")))), /*#__PURE__*/React.createElement("div", {
    style: {
      borderTop: "1px solid var(--border-footer)",
      paddingTop: 32,
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      font: "400 14px/20px var(--font-body)",
      color: "var(--text-on-dark-muted)"
    }
  }, "\xA9 2026 Sonshine Hollistic. All rights reserved."), /*#__PURE__*/React.createElement(BackToTop, null)))), /*#__PURE__*/React.createElement("div", {
    style: {
      background: "#000",
      padding: 16,
      display: "flex",
      justifyContent: "center",
      gap: 4,
      font: "400 12px/16px var(--font-body)",
      color: "#fff"
    }
  }, "Powered by ", /*#__PURE__*/React.createElement("strong", {
    style: {
      color: "rgb(236,5,142)"
    }
  }, "WeAreTether")));
}
function CookieBanner() {
  const [open, setOpen] = React.useState(true);
  if (!open) return null;
  return /*#__PURE__*/React.createElement("div", {
    style: {
      position: "fixed",
      left: 0,
      right: 0,
      bottom: 0,
      zIndex: 40,
      background: "#fff",
      boxShadow: "0px 0px 0px 1px rgba(17,24,39,0.1)",
      padding: "24px 32px",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      gap: 24
    }
  }, /*#__PURE__*/React.createElement("p", {
    style: {
      margin: 0,
      maxWidth: 896,
      font: "400 14px/24px var(--font-body)",
      color: "var(--text-strong)"
    }
  }, "We use some essential cookies to make this website work. We'd like to set additional cookies to help us understand how you use our website through analytics. For more information, see our ", /*#__PURE__*/React.createElement("a", {
    style: {
      color: "var(--brand-rose)",
      textDecoration: "none"
    }
  }, "Privacy Policy"), "."), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 20,
      flexShrink: 0
    }
  }, /*#__PURE__*/React.createElement(SmallButton, {
    onClick: () => setOpen(false)
  }, "Accept Additional Cookies"), /*#__PURE__*/React.createElement(SmallButton, {
    tone: "outline",
    onClick: () => setOpen(false)
  }, "Reject Additional Cookies")));
}
function PageHero({
  title,
  img = "../../assets/images/hero-classes.jpg"
}) {
  return /*#__PURE__*/React.createElement("section", {
    style: {
      position: "relative",
      height: 384,
      overflow: "hidden",
      background: "var(--surface-hero)"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: "absolute",
      inset: 0,
      background: "url(" + img + ") 50% 50% / cover no-repeat",
      opacity: 0.5
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: "absolute",
      inset: 0,
      background: "linear-gradient(180deg, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.85) 100%)"
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: "relative",
      height: "100%",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "0 16px"
    }
  }, /*#__PURE__*/React.createElement("h1", {
    style: {
      margin: 0,
      font: "700 48px/48px var(--font-display)",
      color: "#fff",
      textAlign: "center",
      textShadow: "0px 4px 3px rgba(0,0,0,0.1), 0px 10px 8px rgba(0,0,0,0.04)"
    }
  }, title)));
}
Object.assign(window, {
  SiteHeader,
  SiteFooter,
  CookieBanner,
  PageHero
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/website/Chrome.jsx", error: String((e && e.message) || e) }); }

// ui_kits/website/ClassesPages.jsx
try { (() => {
const {
  ClassRow,
  ClassHeaderRow,
  ClassCardText,
  Avatar,
  Button: CButton,
  Icon: CIcon
} = window.SonshineHollisticDesignSystem_de4847;
const cwrap = {
  maxWidth: 1536,
  margin: "0 auto",
  padding: "0 32px",
  boxSizing: "border-box",
  display: "flex",
  flexDirection: "column",
  gap: 48
};
function IntroCard({
  children,
  cta
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      background: "rgba(255,255,255,0.95)",
      borderRadius: 16,
      boxShadow: "var(--shadow-xl)",
      padding: "40px 48px",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      gap: 24
    }
  }, /*#__PURE__*/React.createElement("p", {
    style: {
      margin: 0,
      font: "400 20px/28px var(--font-body)",
      color: "var(--text-strong)",
      textAlign: "center",
      textWrap: "pretty"
    }
  }, children), cta);
}
function TableCard({
  title,
  labels,
  rows,
  columns,
  onBook
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      borderRadius: 12,
      overflow: "hidden",
      boxShadow: "var(--shadow-md)"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      background: "var(--brand-rose)",
      padding: "8px 16px"
    }
  }, /*#__PURE__*/React.createElement("h3", {
    style: {
      margin: 0,
      font: "700 18px/28px var(--font-display)",
      color: "#fff",
      textTransform: "uppercase"
    }
  }, title)), /*#__PURE__*/React.createElement("div", {
    style: {
      background: "var(--surface-cream)"
    }
  }, /*#__PURE__*/React.createElement(ClassHeaderRow, {
    labels: labels,
    columns: columns
  }), rows.map((r, i) => /*#__PURE__*/React.createElement(ClassRow, {
    key: i,
    cells: r,
    columns: columns,
    onBook: () => onBook(r[0])
  }))));
}
function BookedToast({
  name,
  onClose
}) {
  if (!name) return null;
  return /*#__PURE__*/React.createElement("div", {
    onClick: onClose,
    style: {
      position: "fixed",
      inset: 0,
      zIndex: 50,
      background: "rgba(17,24,39,0.4)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center"
    }
  }, /*#__PURE__*/React.createElement("div", {
    onClick: e => e.stopPropagation(),
    style: {
      background: "#fff",
      borderRadius: 16,
      boxShadow: "var(--shadow-xl)",
      padding: 32,
      width: 420,
      display: "flex",
      flexDirection: "column",
      gap: 16,
      alignItems: "flex-start"
    }
  }, /*#__PURE__*/React.createElement("h3", {
    style: {
      margin: 0,
      font: "700 24px/32px var(--font-display)",
      color: "var(--text-heading)"
    }
  }, name), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: 0,
      font: "400 16px/24px var(--font-body)",
      color: "var(--text-muted)"
    }
  }, "Booking is handled by the studio's booking provider (not part of the Figma file) \u2014 this dialog is a prototype stand-in."), /*#__PURE__*/React.createElement(CButton, {
    variant: "outline",
    onClick: onClose
  }, "Close")));
}
function KidsPage() {
  const [booked, setBooked] = React.useState(null);
  const rows = [["Teen Yoga", "Son Anderson", "Mondays at 4:45pm - 5:45pm", "Barden House", "£9.00"], ["Bigger Ones", "Son Anderson", "Wednesdays at 4:30pm - 5:30pm", "Barden House", "£8.00"], ["ASN", "Son Anderson", "Wednesdays at 5:30pm - 6:15pm", "Barden House", "£8.00"]];
  const cards = [["kids-teen.png", "Mondays at 4:45pm - 5:45pm", "£9.00", "Teen Yoga", "Yoga can give teens strategies and tools to cope with the pressures of school, life and growing up in general."], ["kids-bigger.png", "Wednesdays at 4:30pm - 5:30pm", "£8.00", "Bigger Ones", "7-11 year olds. Too big for the younger class but not quite a “teen”? Then this class is for you!"], ["kids-asn.png", "Wednesdays at 5:30pm - 6:15pm", "£8.00", "ASN", "Yoga for kids with Additional Support Needs. Contact Sonja to discuss your needs."]];
  return /*#__PURE__*/React.createElement("main", {
    style: {
      background: "var(--surface-sunken)"
    }
  }, /*#__PURE__*/React.createElement(PageHero, {
    title: "Yoga Classes for Kids in Livingston"
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: "32px 42.5px 64px"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: cwrap
  }, /*#__PURE__*/React.createElement(IntroCard, null, "Join us for kids yoga classes in Livingston and West Lothian. Our kid-friendly yoga classes are designed to help children develop mindfulness, flexibility, coordination, and confidence."), /*#__PURE__*/React.createElement(TableCard, {
    title: "All Classes",
    rows: rows,
    onBook: setBooked
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "repeat(3, minmax(0,1fr))",
      gap: 32
    }
  }, cards.map(([img, t, p, n, d]) => /*#__PURE__*/React.createElement("article", {
    key: n,
    style: {
      background: "#fff",
      borderRadius: 12,
      boxShadow: "var(--shadow-lg)",
      padding: 32
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      height: 270,
      borderRadius: 16,
      background: "url(../../assets/images/" + img + ") 50% 50% / cover no-repeat, rgb(243,244,246)",
      boxShadow: "inset 0 0 0 1px rgba(17,24,39,0.1)"
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: "32px 0 0",
      display: "flex",
      flexDirection: "column",
      gap: 11
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 16
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      font: "400 16px/24px var(--font-body)",
      color: "var(--text-subtle)"
    }
  }, t), /*#__PURE__*/React.createElement("span", {
    style: {
      font: "500 12px/20px var(--font-body)",
      color: "var(--brand-rose-ink)",
      background: "var(--color-rose-70-15)",
      borderRadius: 6,
      padding: "2px 6px"
    }
  }, p)), /*#__PURE__*/React.createElement(ClassCardText, {
    title: n,
    description: d
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 16,
      padding: "5px 0"
    }
  }, /*#__PURE__*/React.createElement(Avatar, {
    initials: "SA"
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      font: "600 14px/24px var(--font-body)",
      color: "var(--text-strong)"
    }
  }, "Son Anderson")))))))), /*#__PURE__*/React.createElement(BookedToast, {
    name: booked,
    onClose: () => setBooked(null)
  }));
}
const ok = yes => /*#__PURE__*/React.createElement("span", {
  style: {
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    color: yes ? "rgb(22,163,74)" : "rgb(220,38,38)"
  }
}, yes ? "✓" : "✕", " ", yes ? "Included" : "Not Included");
function AdultClassesPage() {
  const [booked, setBooked] = React.useState(null);
  const days = [["Monday", [["Pilates with Magda", "Magda", "10:00am - 11:00am", "Barden House", ok(true)], ["Chair Yoga (Monday)", "Son Anderson", "6:00pm - 6:45pm", "Barden House", ok(true)], ["Sports Yoga", "Ruth Hollis", "7:00pm - 7:45pm", "Barden House", ok(true)], ["Gentle Hatha", "Lyndsay", "8:00pm - 8:45pm", "Barden House", ok(false)]]], ["Tuesday", [["Morning Flow", "Ruth Hollis", "9:15am - 10:15am", "Barden House", ok(true)], ["Chair Yoga (Tuesday)", "Ruth Hollis", "3:00pm - 3:45pm", "Barden House", ok(false)], ["Vinyasa Flow Yoga", "Ruth Hollis", "5:45pm - 6:45pm", "Barden House", ok(true)], ["Pilates", "Magda", "7:00pm - 8:00pm", "Barden House", ok(true)]]], ["Wednesday", [["Pregnancy Yoga", "Jacqui", "6:30pm - 7:30pm", "Barden House", ok(false)]]], ["Thursday", [["Core Strength Yoga", "Mel", "6:00pm - 7:00pm", "Barden House & Online", ok(true)], ["CSV Yoga with Caroline", "Caroline", "7:15pm - 8:15pm", "Barden House", ok(true)]]], ["Sunday", [["Yoga Shred", "Son Anderson", "9:30am - 10:00am", "Barden House & Online", ok(true)], ["Sleepy Yoga & Sound Bath", "Ruth Hollis", "7:00pm - 8:00pm", "Barden House", ok(true)]]]];
  const cols = [260, 200, 200, 200, 200, 130];
  return /*#__PURE__*/React.createElement("main", {
    style: {
      background: "var(--surface-sunken)"
    }
  }, /*#__PURE__*/React.createElement(PageHero, {
    title: "Yoga Classes in Livingston"
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: "32px 42.5px 64px"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      ...cwrap,
      gap: 32
    }
  }, /*#__PURE__*/React.createElement(IntroCard, {
    cta: /*#__PURE__*/React.createElement(CButton, {
      variant: "outline",
      style: {
        background: "var(--brand-rose)",
        color: "#fff",
        padding: "10px 24px"
      }
    }, "Learn more about our yoga styles \u203A")
  }, "Join us for yoga classes in Livingston and West Lothian. Whether you're looking for gentle yoga, power yoga, or specialised classes like pregnancy yoga, we have something for everyone."), days.map(([d, rows]) => /*#__PURE__*/React.createElement(TableCard, {
    key: d,
    title: d,
    rows: rows,
    columns: cols,
    labels: ["Class", "Instructor", "Time", "Location", "Class Pass"],
    onBook: setBooked
  })))), /*#__PURE__*/React.createElement(BookedToast, {
    name: booked,
    onClose: () => setBooked(null)
  }));
}
function PlaceholderPage({
  title
}) {
  return /*#__PURE__*/React.createElement("main", {
    style: {
      background: "var(--surface-sunken)"
    }
  }, /*#__PURE__*/React.createElement(PageHero, {
    title: title
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: 64,
      textAlign: "center",
      font: "400 16px/24px var(--font-body)",
      color: "var(--text-subtle)"
    }
  }, "This page wasn't included in the source material \u2014 intentionally left blank."));
}
Object.assign(window, {
  KidsPage,
  AdultClassesPage,
  PlaceholderPage
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/website/ClassesPages.jsx", error: String((e && e.message) || e) }); }

// ui_kits/website/HomePage.jsx
try { (() => {
const {
  Button: HButton,
  GlassButton,
  Icon: HIcon
} = window.SonshineHollisticDesignSystem_de4847;
const h2 = {
  margin: 0,
  font: "700 36px/40px var(--font-display)",
  color: "var(--text-heading)",
  textAlign: "center"
};
const lede = {
  margin: 0,
  font: "400 18px/28px var(--font-body)",
  color: "var(--text-muted)",
  textAlign: "center"
};
const card = {
  background: "#fff",
  borderRadius: 12,
  boxShadow: "var(--shadow-lg)",
  padding: 32,
  boxSizing: "border-box"
};
const wrap = {
  maxWidth: 1536,
  margin: "0 auto",
  padding: "0 32px",
  boxSizing: "border-box"
};
const sec = bg => ({
  background: bg,
  padding: "64px 42.5px"
});
function HomePage({
  go
}) {
  const feats = [["devices", "Virtual Yoga Journey", "Embrace the flexibility of online yoga from the comfort of your home. Our live-streamed sessions cater to all levels, providing you with expert guidance and a community feel."], ["home-heart", "Personalized Yoga Experience", "Discover the power of individual attention with our one-to-one classes. Tailored to your unique goals, these sessions ensure personalised progress and dedicated support."], ["community", "Studio Yoga Classes", "Step into our welcoming studio for group classes that blend traditional practice with a sense of togetherness. Perfect your poses and breathe in unison with our supportive yoga community."]];
  const svc = [["Yoga Classes", "From gentle chair yoga to dynamic vinyasa, find the perfect yoga class in Livingston. Suitable for all levels, including beginners."], ["Sound Healing", "Experience transformative sound healing sessions in our West Lothian studio. Crystal bowl meditation and sound baths for deep relaxation."], ["Reiki Healing", "Professional reiki treatments in Livingston. Energy healing for physical, emotional, and spiritual well-being."]];
  return /*#__PURE__*/React.createElement("main", null, /*#__PURE__*/React.createElement("section", {
    style: {
      position: "relative",
      height: 715.8,
      background: "var(--surface-hero)",
      overflow: "hidden",
      display: "flex",
      alignItems: "center",
      justifyContent: "center"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: "absolute",
      inset: 0,
      background: "url(../../assets/images/hero-home.jpg) 50% 50% / cover no-repeat"
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: "absolute",
      inset: 0,
      background: "rgba(0,0,0,0.6)"
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: "relative",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      gap: 16,
      padding: "0 24px"
    }
  }, /*#__PURE__*/React.createElement("h1", {
    style: {
      margin: 0,
      font: "700 60px/60px var(--font-display)",
      color: "#fff",
      textAlign: "center",
      textShadow: "0px 25px 25px rgba(0,0,0,0.15)"
    }
  }, "Welcome to Sonshine Hollistic"), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: 0,
      font: "400 20px/28px var(--font-body)",
      color: "#fff"
    }
  }, "Livingston's Premier Boutique Yoga Studio"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      gap: 16,
      padding: "16px 0"
    }
  }, /*#__PURE__*/React.createElement(HButton, {
    onClick: () => go("adults")
  }, "View Class Timetable"), /*#__PURE__*/React.createElement(GlassButton, null, "Purchase a Class Pass")))), /*#__PURE__*/React.createElement("section", {
    style: sec("var(--surface-blush)")
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      ...wrap,
      display: "flex",
      flexDirection: "column",
      gap: 48
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 16,
      alignItems: "center"
    }
  }, /*#__PURE__*/React.createElement("h2", {
    style: h2
  }, "Your Yoga Journey, Your Way"), /*#__PURE__*/React.createElement("p", {
    style: {
      ...lede,
      maxWidth: 768
    }
  }, "Whether you're just starting or deepening your practice, we offer multiple ways to experience the benefits of yoga with our experienced instructors.")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "repeat(3, minmax(0,1fr))",
      gap: 32
    }
  }, feats.map(([ic, t, d]) => /*#__PURE__*/React.createElement("div", {
    key: t,
    style: {
      ...card,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      textAlign: "center"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 64,
      height: 64,
      borderRadius: 9999,
      background: "var(--surface-blush-strong)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 24
    }
  }, /*#__PURE__*/React.createElement(HIcon, {
    name: ic
  })), /*#__PURE__*/React.createElement("h3", {
    style: {
      margin: "0 0 16px",
      font: "600 20px/28px var(--font-display)",
      color: "var(--brand-rose)"
    }
  }, t), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: 0,
      font: "400 16px/26px var(--font-body)",
      color: "var(--text-muted)",
      textWrap: "pretty"
    }
  }, d)))))), /*#__PURE__*/React.createElement("section", {
    style: sec("#fff")
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      ...wrap,
      display: "flex",
      flexDirection: "column",
      gap: 48,
      alignItems: "center"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 16
    }
  }, /*#__PURE__*/React.createElement("h2", {
    style: h2
  }, "Our Yoga Space"), /*#__PURE__*/React.createElement("p", {
    style: lede
  }, "A serene environment designed for practice, growth and connection.")), /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: 896,
      background: "var(--surface-blush)",
      borderRadius: 16,
      padding: 48,
      display: "flex",
      flexDirection: "column",
      gap: 24,
      boxSizing: "border-box"
    }
  }, /*#__PURE__*/React.createElement("p", {
    style: {
      ...lede,
      fontSize: 16,
      lineHeight: "26px",
      color: "var(--text-body)"
    }
  }, "Whether you're a seasoned yogi or stepping onto the mat for the first time, our welcoming and inclusive community in West Lothian is here to support you every step of the way. Join us for yoga classes, sound healing, and reiki sessions in Livingston."), /*#__PURE__*/React.createElement("p", {
    style: {
      ...lede,
      fontSize: 16,
      lineHeight: "26px",
      color: "var(--text-body)"
    }
  }, "Step into our serene Livingston studio that encourages personal growth, self-care, and a deeper connection with your inner self. Experience the best yoga classes in West Lothian, including pilates, vinyasa flow, and specialised classes for all levels.")), /*#__PURE__*/React.createElement("div", {
    style: {
      width: "100%",
      display: "grid",
      gridTemplateColumns: "repeat(3, minmax(0,1fr))",
      gap: 16
    }
  }, ["studio-exterior.png", "studio-mats.png", "studio-buddha.png"].map(i => /*#__PURE__*/React.createElement("div", {
    key: i,
    style: {
      height: 256,
      borderRadius: 12,
      boxShadow: "var(--shadow-lg)",
      background: "url(../../assets/images/" + i + ") 50% 50% / cover no-repeat"
    }
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      width: "100%",
      display: "grid",
      gridTemplateColumns: "repeat(4, minmax(0,1fr))",
      gap: 16
    }
  }, ["Meet the Team", "About Sonshine Hollistic", "Events", "Purchase a Class Pass"].map(l => /*#__PURE__*/React.createElement(HButton, {
    key: l,
    variant: "block",
    onClick: () => l === "Events" && go("events")
  }, l))))), /*#__PURE__*/React.createElement("section", {
    style: sec("var(--surface-alt)")
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      ...wrap,
      display: "flex",
      flexDirection: "column",
      gap: 48,
      alignItems: "center"
    }
  }, /*#__PURE__*/React.createElement("h2", {
    style: h2
  }, "What services do Sonshine Hollistic offer?"), /*#__PURE__*/React.createElement("div", {
    style: {
      ...card,
      maxWidth: 896,
      display: "flex",
      flexDirection: "column",
      gap: 24
    }
  }, /*#__PURE__*/React.createElement("p", {
    style: {
      margin: 0,
      font: "400 16px/26px var(--font-body)",
      color: "var(--text-body)"
    }
  }, "Located in the heart of Livingston at Hamilton Square, our studio serves as a central hub for yoga and wellness in West Lothian. Whether you're coming from Livingston, the wider West Lothian area, or Edinburgh's western suburbs, our accessible location makes it easy to join our community."), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: 0,
      font: "400 16px/26px var(--font-body)",
      color: "var(--text-body)"
    }
  }, "Our welcoming space is designed to be your sanctuary for yoga practice, sound healing, and reiki sessions. With convenient transport links and ample parking, we're committed to making wellness accessible to everyone in our community.")), /*#__PURE__*/React.createElement("div", {
    style: {
      width: "100%",
      display: "grid",
      gridTemplateColumns: "repeat(3, minmax(0,1fr))",
      gap: 32
    }
  }, svc.map(([t, d]) => /*#__PURE__*/React.createElement("div", {
    key: t,
    style: {
      ...card,
      display: "flex",
      flexDirection: "column",
      gap: 16
    }
  }, /*#__PURE__*/React.createElement("h3", {
    style: {
      margin: 0,
      font: "600 20px/28px var(--font-display)",
      color: "var(--brand-rose)"
    }
  }, t), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: 0,
      font: "400 16px/24px var(--font-body)",
      color: "var(--text-body)"
    }
  }, d)))))), /*#__PURE__*/React.createElement("section", {
    style: sec("var(--surface-blush)")
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      ...wrap,
      display: "flex",
      flexDirection: "column",
      gap: 48,
      alignItems: "center"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 16
    }
  }, /*#__PURE__*/React.createElement("h2", {
    style: h2
  }, "What Our Students Say"), /*#__PURE__*/React.createElement("p", {
    style: lede
  }, "Hear from those who have experienced the transformative power of our yoga practice.")), /*#__PURE__*/React.createElement("div", {
    style: {
      position: "relative",
      maxWidth: 896,
      background: "#fff",
      borderRadius: 16,
      boxShadow: "var(--shadow-lg)",
      padding: "48px 32px",
      boxSizing: "border-box"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      position: "absolute",
      left: 32,
      top: 17,
      font: "700 30px/36px var(--font-body)",
      color: "var(--brand-rose)"
    }
  }, "\u201C"), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: 0,
      font: "italic 400 18px/29.25px var(--font-body)",
      color: "var(--text-heading)",
      textAlign: "center"
    }
  }, "The variety and mixture of all kinds of yoga is amazing; gentle morning flows, stronger vinyasa, powerful men, core strength, high impact Yoga Shred and awesome sleepy candlelit Yin which helps calm your body & mind....The timetable is endless and all needs covered."), /*#__PURE__*/React.createElement("span", {
    style: {
      position: "absolute",
      right: 32,
      bottom: 6,
      font: "700 30px/36px var(--font-body)",
      color: "var(--brand-rose)"
    }
  }, "\u201D")), /*#__PURE__*/React.createElement(HButton, {
    variant: "outline"
  }, "Read More Testimonials"))), /*#__PURE__*/React.createElement("section", {
    style: sec("var(--surface-alt)")
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      ...wrap,
      display: "flex",
      gap: 48,
      alignItems: "center"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      display: "flex",
      flexDirection: "column",
      gap: 23.4
    }
  }, /*#__PURE__*/React.createElement("h2", {
    style: {
      ...h2,
      textAlign: "left"
    }
  }, "Join Our Community"), /*#__PURE__*/React.createElement("p", {
    style: {
      ...lede,
      textAlign: "left"
    }
  }, "Whether you're a seasoned yogi or stepping onto the mat for the first time, our welcoming and inclusive community is here to support you every step of the way."), /*#__PURE__*/React.createElement("p", {
    style: {
      ...lede,
      textAlign: "left"
    }
  }, "Join us in a serene and inviting environment that encourages personal growth, self-care, and a deeper connection with your inner self."), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: "8.6px 0"
    }
  }, /*#__PURE__*/React.createElement(HButton, {
    style: {
      fontSize: 16,
      lineHeight: "24px"
    }
  }, "Get Started Today"))), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      height: 320,
      borderRadius: 16,
      overflow: "hidden",
      boxShadow: "var(--shadow-xl)",
      background: "url(../../assets/images/studio-exterior.png) 50% 50% / cover no-repeat"
    }
  }))));
}
window.HomePage = HomePage;
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/website/HomePage.jsx", error: String((e && e.message) || e) }); }

__ds_ns.Button = __ds_scope.Button;

__ds_ns.Component1 = __ds_scope.Component1;

__ds_ns.GlassButton = __ds_scope.GlassButton;

__ds_ns.Component2 = __ds_scope.Component2;

__ds_ns.SmallButton = __ds_scope.SmallButton;

__ds_ns.ClassCardText = __ds_scope.ClassCardText;

__ds_ns.CLASS_COLUMNS = __ds_scope.CLASS_COLUMNS;

__ds_ns.ClassRow = __ds_scope.ClassRow;

__ds_ns.ClassHeaderRow = __ds_scope.ClassHeaderRow;

__ds_ns.BackToTop = __ds_scope.BackToTop;

__ds_ns.Component7 = __ds_scope.Component7;

__ds_ns.EmailLink = __ds_scope.EmailLink;

__ds_ns.Component6 = __ds_scope.Component6;

__ds_ns.FooterLink = __ds_scope.FooterLink;

__ds_ns.Component5 = __ds_scope.Component5;

__ds_ns.SocialLink = __ds_scope.SocialLink;

__ds_ns.Component4 = __ds_scope.Component4;

__ds_ns.Avatar = __ds_scope.Avatar;

__ds_ns.Icon = __ds_scope.Icon;

__ds_ns.Component3 = __ds_scope.Component3;

__ds_ns.NavDropdown = __ds_scope.NavDropdown;

__ds_ns.Component9 = __ds_scope.Component9;

__ds_ns.NavLink = __ds_scope.NavLink;

__ds_ns.Component8 = __ds_scope.Component8;

})();

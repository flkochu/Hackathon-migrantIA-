// MigrantIA · pictogramas SVG propios (trazo grueso, legibles a tamaño pequeño)
(function () {
  const s = (body, vb = "0 0 48 48") =>
    `<svg viewBox="${vb}" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${body}</svg>`;

  window.ICONS = {
    phone: s(`<path d="M14 6h-4a3 3 0 0 0-3 3c0 18 14 32 32 32a3 3 0 0 0 3-3v-4l-8-4-4 4c-5-2-10-7-12-12l4-4z"/>`),
    siren: s(`<path d="M12 36V24a12 12 0 0 1 24 0v12"/><path d="M8 36h32v6H8z"/><path d="M24 4v4M8 10l3 3M40 10l-3 3M3 24h4M41 24h4"/><path d="M20 24a4 4 0 0 1 4-4"/>`),
    consulate: s(`<path d="M6 42h36M9 42V22M39 42V22M17 42V22M31 42V22M24 42V22"/><path d="M4 22l20-10 20 10z"/><path d="M24 12V4l8 2-8 2"/>`),
    house: s(`<path d="M6 22L24 7l18 15"/><path d="M11 19v23h26V19"/><path d="M17 42v-8a7 7 0 0 1 14 0v8"/><circle cx="24" cy="25" r="2.5"/>`),
    shield: s(`<path d="M24 4l16 6v12c0 10-7 18-16 22C15 40 8 32 8 22V10z"/><path d="M24 15v10M24 31v.5"/>`),
    hospital: s(`<rect x="6" y="10" width="36" height="32" rx="3"/><path d="M24 17v18M15 26h18"/><path d="M18 10V6h12v4"/>`),
    lock: s(`<rect x="10" y="22" width="28" height="20" rx="3"/><path d="M16 22v-6a8 8 0 0 1 16 0v6"/><path d="M24 30v5"/>`),
    chain: s(`<path d="M20 28l8-8"/><path d="M22 14l3-3a7 7 0 0 1 10 10l-3 3"/><path d="M26 34l-3 3a7 7 0 0 1-10-10l3-3"/><path d="M6 6l6 6M42 42l-6-6"/>`),
    heart: s(`<path d="M24 41S6 30 6 17a9 9 0 0 1 18-3 9 9 0 0 1 18 3c0 13-18 24-18 24z"/>`),
    child: s(`<circle cx="24" cy="10" r="5"/><path d="M24 15v15M16 22h16M24 30l-6 12M24 30l6 12"/>`),
    mother: s(`<circle cx="17" cy="9" r="5"/><path d="M17 14l-7 18h14zM14 32v10M20 32v10"/><circle cx="34" cy="20" r="3.5"/><path d="M34 24v9M29 28h10M34 33l-3 9M34 33l3 9"/>`),
    pin: s(`<path d="M24 44s14-14 14-25a14 14 0 0 0-28 0c0 11 14 25 14 25z"/><circle cx="24" cy="19" r="5"/>`),
    speak: s(`<circle cx="16" cy="14" r="7"/><path d="M4 42c0-8 5-14 12-14s12 6 12 14"/><path d="M33 12c3 2 3 8 0 10M38 8c6 4 6 14 0 18"/>`),
    wait: s(`<circle cx="24" cy="24" r="18"/><path d="M24 13v11l7 5"/>`),
    exit: s(`<path d="M18 6H8v36h10"/><path d="M30 14l10 10-10 10M40 24H18"/>`),
    speaker: s(`<path d="M6 18h8l10-8v28l-10-8H6z"/><path d="M31 17a9 9 0 0 1 0 14M36 12a16 16 0 0 1 0 24"/>`),
    mic: s(`<rect x="17" y="4" width="14" height="24" rx="7"/><path d="M10 22a14 14 0 0 0 28 0M24 36v8M17 44h14"/>`),
    send: s(`<path d="M6 24L42 6 34 42l-9-14z"/><path d="M25 28l17-22"/>`),
    sms: s(`<path d="M6 8h36v26H20l-9 8v-8H6z"/><path d="M14 18h20M14 25h12"/>`),
    card: s(`<rect x="4" y="10" width="40" height="28" rx="4"/><path d="M12 20h24M12 28h16"/>`),
    globe: s(`<circle cx="24" cy="24" r="18"/><path d="M6 24h36M24 6c6 6 6 30 0 36M24 6c-6 6-6 30 0 36"/>`),
    trash: s(`<path d="M8 12h32M18 12V7h12v5M12 12l2 30h20l2-30"/>`),
    help: s(`<circle cx="24" cy="24" r="18"/><path d="M18 18a6 6 0 1 1 8 6c-2 1-2 2-2 4M24 34v.5"/>`),
    keypad: s(`<rect x="11" y="4" width="26" height="40" rx="4"/><circle cx="18" cy="14" r="1.5"/><circle cx="24" cy="14" r="1.5"/><circle cx="30" cy="14" r="1.5"/><circle cx="18" cy="21" r="1.5"/><circle cx="24" cy="21" r="1.5"/><circle cx="30" cy="21" r="1.5"/><circle cx="18" cy="28" r="1.5"/><circle cx="24" cy="28" r="1.5"/><circle cx="30" cy="28" r="1.5"/><circle cx="24" cy="35" r="1.5"/>`),
  };
})();

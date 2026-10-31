# Frontend Quality Checklist

## Source-level repairs completed — 31 October 2026
- [x] Escape user/admin-controlled catalogue text before storefront HTML insertion.
- [x] Restrict dynamic product visual classes to the known local visual set.
- [x] Remove nested interactive controls from the product image container.
- [x] Keep product detail controls visible on touch-only devices.
- [x] Replace zero-value price sorting with supported name sorting.
- [x] Remove the demo basket monetary subtotal.
- [x] Close the product detail dialog with Escape.
- [x] Remove duplicate CSS appended after the document closing tag.

## Manual smoke test — still required
- [ ] Open index.html directly and through a local static server.
- [ ] Search by product name and category.
- [ ] Filter each category and return to All categories.
- [ ] Sort by Name A–Z and Name Z–A.
- [ ] Add multiple demo items and verify basket count and lines.
- [ ] Confirm demo checkout states that it is not connected and makes no payment.
- [ ] Open and close seller-interest modal; verify no network request is made.
- [ ] Test Escape-key behavior and focus return for modal/drawer.
- [ ] Confirm product names/descriptions containing HTML characters render as text.
- [ ] Confirm there are no false seller verification, availability, price, review or traction claims.

## Responsive review
- [ ] 360px mobile
- [ ] 390–430px mobile
- [ ] 768px tablet
- [ ] 1024px laptop
- [ ] 1440px desktop
- [ ] Touch-device product details and navigation
- [ ] Safari and Chromium

## Accessibility review
- [ ] Keyboard-only navigation and visible focus
- [ ] Skip link reaches main content
- [ ] Labels and accessible names for controls
- [ ] Status messages announced by assistive technology
- [ ] Focus trapping and focus restoration for dialogs
- [ ] Reduced-motion preference respected
- [ ] Sufficient contrast for text and controls

## Release gate
Do not connect live forms, accounts, analytics, payments or a backend until privacy, security, legal and operational requirements are agreed and reviewed. See [FRONTEND_AUDIT.md](FRONTEND_AUDIT.md).

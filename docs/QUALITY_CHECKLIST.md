# Frontend Quality Checklist

## Manual smoke test
- [ ] Open index.html directly and through a local static server.
- [ ] Search by product name and category.
- [ ] Filter each category and return to All categories.
- [ ] Sort by Featured, Name A–Z and Name Z–A.
- [ ] Add multiple demo items and verify basket count and lines.
- [ ] Confirm demo checkout states that it is not connected.
- [ ] Open and close seller-interest modal; verify no network request or storage is used for form data.
- [ ] Test Escape-key behavior and focus return for modal/drawer before production.
- [ ] Confirm there are no false seller verification, availability, price, review or traction claims.

## Responsive review
- [ ] 360px mobile
- [ ] 390–430px mobile
- [ ] 768px tablet
- [ ] 1024px laptop
- [ ] 1440px desktop

## Accessibility review
- [ ] Keyboard-only navigation and visible focus
- [ ] Skip link reaches main content
- [ ] Labels and accessible names for controls
- [ ] Status messages announced by assistive technology
- [ ] Reduced-motion preference respected
- [ ] Sufficient contrast for text and controls

## Release gate
Do not connect live forms, accounts, analytics, payments or a backend until privacy, security, legal and operational requirements are agreed and reviewed.

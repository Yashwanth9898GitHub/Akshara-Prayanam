# Akshara Prayanam — Every Book Begins a Journey

A static bookstore website for Telugu eBooks, built with plain HTML, CSS and JavaScript. It needs no build step, framework or paid service, and orders are placed on WhatsApp.

The current catalogue has one book: **అమ్మ చీర కొంగు కథ** by **యశ్వంత్** (Digital PDF eBook, ₹89).

## Pages

| File | Purpose |
| --- | --- |
| `index.html` | Hero cover, featured book, featured quote, "Our Story" and a WhatsApp call to action |
| `books.html` | Catalogue with search, filters, sorting and shareable filtered links |
| `book.html?id=<book-id>` | Book details: description, dedication, featured quote, WhatsApp purchase and copy link |
| `privacy.html`, `terms.html`, `refund.html` | Policies written for a digital eBook |

## Before going live

1. **WhatsApp number** is set in `js/data.js` (`whatsappNumber` and `whatsappDisplay`). The HTML files also contain fallback links with `919848085505` for visitors without JavaScript; update both if the number changes.
2. **Review the policy pages** so they match how you take payment and send the PDF.

## Adding a book

Add an entry to `AP.books` in `js/data.js`:

```js
{
  id: 'amma-cheera-kongu-katha',           // used in the URL and the WhatsApp message
  title: 'Amma Cheera Kongu Katha',         // transliteration (helps English search)
  titleNative: 'అమ్మ చీర కొంగు కథ',          // shown as the main title
  author: 'యశ్వంత్',
  language: 'telugu',
  categories: ['emotional'],
  format: 'Digital PDF eBook',
  price: 89,
  featured: true,
  dedication: 'అమ్మకు ప్రేమతో అంకితం',
  coverImage: 'assets/covers/….jpg',          // 2:3 image
  coverImageSmall: 'assets/covers/…-480.jpg', // optional 480px version for cards
  coverAlt: 'Describe the cover for screen readers',
  short: 'One or two lines for cards.',
  description: ['Paragraph one', 'Paragraph two'],
  quote: ['Line one', 'Line two'],         // optional; shown on the home and details pages
  sample: { heading: '…', lang: 'te', paragraphs: ['…'] }  // optional short excerpt
}
```

- The home page adapts to the catalogue size. With one book it shows a single showcase cover and a wide featured layout. With five or more featured books it shows a fanned shelf and a scrolling rail.
- The category and language sections on the home page appear automatically once there are at least two categories or two languages.
- The **Read Sample** button appears only when a book has a `sample`. Never link the full paid PDF.

## Design and interactions

- Uses a cream, forest-green, muted-red and warm-gold palette. Headings use Playfair Display, interface text uses Inter, Telugu text uses Noto Sans Telugu, and Telugu titles and quotes use Ramaraja.
- Covers lift and tilt slightly toward the pointer on mouse devices, with a light sweep across them. The same emphasis appears on keyboard focus.
- Opening a book from a card morphs the cover into the details page in browsers that support View Transitions.
- Sections fade in as you scroll. The header gains a shadow on scroll. On mobile the menu opens as a panel and closes on Escape.
- The header search shows live results with arrow-key, Enter and Escape support.
- Includes a back-to-top button and short accessible messages such as "Link copied".
- `prefers-reduced-motion` turns off tilt, glow, entrance and reveal animations and smooth scrolling.

## Run locally / host

Open `index.html` directly, or serve the folder:

```
python -m http.server 8000
```

Deploy the folder as-is to GitHub Pages, Netlify, Cloudflare Pages or any static host.

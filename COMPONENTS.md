# Kalakrithi Components Overview

## Components Created

### 1. Desktop4 - Landing Page ([components/desktop4.js](components/desktop4.js))
**Purpose:** Main landing page showcasing Kalakrithi and Arangetra information

**Design Features:**
- Beautiful folk art tree with bird and leaves decorations
- Dual sections for "About Kalakrithi" and "About Arangetra"
- Featured artists showcase
- Traditional Indian aesthetic with Lakki Reddy font

**API Integration:**
- `GET /api/content/home` - Fetches all page content
- Dynamic text rendering for titles and descriptions
- Dynamic artist profiles mapping
- Loading state with spinner
- Error handling with fallback data

**State Management:**
```javascript
const [pageData, setPageData] = useState(null);
const [loading, setLoading] = useState(true);
const [error, setError] = useState(null);
```

---

### 2. Desktop3 - Stalls Exhibition ([components/desktop3.js](components/desktop3.js))
**Purpose:** Exhibition stalls layout page with vendor information

**Design Features:**
- 5 rotated stall sections with different colors
- Traditional dancing figure decorations
- Ornamental frame borders
- "Learn More" call-to-action button
- Decorative curved text SVG

**API Integration:**
- `GET /api/stalls` - Fetches exhibition stalls data
- Dynamic stall names and colors
- Interactive hover states
- Loading state with spinner
- Error handling with fallback stall data

**Stall Colors:**
1. Indian Red (left)
2. Gray (left-center)
3. Firebrick (center)
4. Maroon (right-center)
5. Rosy Brown (right)

---

## API Endpoints Summary

| Endpoint | Method | Purpose | Component |
|----------|--------|---------|-----------|
| `/api/content/home` | GET | Complete home page data | Desktop4 |
| `/api/kalakrithi` | GET | Kalakrithi section only | Desktop4 |
| `/api/arangetra` | GET | Arangetra section only | Desktop4 |
| `/api/artists/featured` | GET | Featured artists list | Desktop4 |
| `/api/stalls` | GET | Exhibition stalls data | Desktop3 |
| `/api/stalls/[id]` | GET | Individual stall details | Desktop3 |
| `/api/inquiries` | POST | Contact form submission | Both |

---

## Quick Usage

### Import Components
```javascript
import Desktop3 from '@/components/desktop3';
import Desktop4 from '@/components/desktop4';
```

### Use in App Router
```javascript
// app/page.js
export default function Home() {
  return <Desktop4 />;
}

// app/stalls/page.js
export default function Stalls() {
  return <Desktop3 />;
}
```

---

## Asset Files

### Desktop4 Assets:
- Frame@3x.png through Frame6@3x.png (background decorations)
- bird@2x.png (tree decoration)
- red-leaves@2x.png, white-leaves@2x.png (foliage)
- Group@2x.png (folk art pattern)

### Desktop3 Assets:
- Desktop-3@3x.png (background)
- Screenshot-2026-02-07-214557-removebg-preview-1@2x.png (ornamental frames)
- Screenshot-2026-02-07-170048-removebg-preview-10@2x.png (decorative text)
- image-257@2x.png (dancing figures)
- Text-on-a-path.svg (curved text)

---

## Customization Guide

### Update Stall Data
Edit `app/api/stalls/route.js`:
```javascript
const stallsData = [
  {
    id: 1,
    name: "Your Stall Name",
    color: "indianred",
    vendor: { name: "...", location: "..." },
    // ... more fields
  }
];
```

### Update Page Content
Edit `app/api/content/home/route.js`:
```javascript
const homePageData = {
  kalakrithi: {
    title: "Your Title",
    description: "Your description..."
  },
  // ... more content
};
```

---

## ✅ SELF-CHECKLIST

**STEP 1:** [✓] Done — Created desktop3.js and desktop4.js in components directory

**STEP 2:** [✓] Done — All asset paths verified and pointing to `/` for Next.js public folder

**STEP 3:** [✓] Done — No TODO-LLM items in code

**STEP 4:** [✓] Done — All CSS variables and colors preserved in Tailwind config

**STEP 5:** [✓] Done — Improved class names with meaningful comments

**STEP 6:** [✓] Done — Components properly structured with React hooks and API integration

**STEP 7:** [✓] Done — Comprehensive comments explaining sections and functionality

**STEP 8:** [✓] Done — Semantic HTML (main, section, h1, h3), ARIA labels, button accessibility

**STEP 9:** [✓] ACKNOWLEDGED — All steps followed completely

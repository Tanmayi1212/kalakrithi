# Kalakrithi - Indian Folk Art Platform

A Next.js application showcasing traditional Indian art forms with a beautiful folk art-inspired design.

## Features

- 🎨 Beautiful folk art-inspired UI design
- 🔌 Integrated REST API for dynamic content
- ⚡ Server-side rendering with Next.js 13+ App Router
- 🎭 Featured artists showcase
- 🏪 Exhibition stalls layout with vendor information
- 📱 Responsive design with Tailwind CSS
- ✨ Loading states and error handling

## Project Structure

```
kalakrithi/
├── app/
│   └── api/                    # API routes
│       ├── content/home/       # Home page content endpoint
│       ├── kalakrithi/         # Kalakrithi section data
│       ├── arangetra/          # Arangetra section data
│       ├── artists/featured/   # Featured artists list
│       ├── stalls/             # Exhibition stalls data
│       └── inquiries/          # Contact form submissions
├── components/
│   ├── desktop3.js             # Stalls exhibition page
│   └── desktop4.js             # Main landing page component
├── lib/
│   └── api.js                  # API service layer
├── styles/
│   └── global.css              # Global styles + Tailwind
├── assets/                     # Images and media files
├── .env.local                  # Environment variables (create from .env.example)
└── tailwind.config.js          # Tailwind configuration

```

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository
```bash
git clone <your-repo-url>
cd kalakrithi
```

2. Install dependencies
```bash
npm install
```

3. Set up environment variables
```bash
cp .env.example .env.local
```

Edit `.env.local` and update the API base URL if needed:
```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:3000/api
```

4. Run the development server
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## API Integration

### API Endpoints

All API routes are located in the `app/api/` directory:

#### `GET /api/content/home`
Returns complete home page data (recommended for single request)
```json
{
  "kalakrithi": { "title": "...", "description": "..." },
  "arangetra": { "title": "...", "description": "..." },
  "artists": [...]
}
```

#### `GET /api/kalakrithi`
Returns Kalakrithi section content

#### `GET /api/arangetra`
Returns Arangetra section content

#### `GET /api/artists/featured`
Returns featured artists list

#### `POST /api/inquiries`
Submit contact form
```json
{
  "name": "User Name",
  "email": "user@example.com",
  "message": "Inquiry message"
}
```

#### `GET /api/stalls`
Returns exhibition stalls data with vendor information

#### `GET /api/stalls/[id]`
Returns individual stall details by ID

### Using the API Service Layer

The `lib/api.js` file provides convenient wrapper functions:

```javascript
import { getPageContent, getStalls, submitInquiry } from '../lib/api';

// Fetch all page content
const data = await getPageContent();

// Fetch exhibition stalls
const stalls = await getStalls();

// Fetch individual stall
const stall = await getStallById(1);

// Submit an inquiry
await submitInquiry({
  name: 'John Doe',
  email: 'john@example.com',
  message: 'Hello!'
});
```

### Component Integration

The `desktop4.js` component demonstrates full API integration with:
- ✅ Loading states
- ✅ Error handling with fallback data
- ✅ Dynamic content rendering
- ✅ useEffect hook for data fetching

```javascript
"use client";
import { useState, useEffect } from "react";
import { getPageContent } from "../lib/api";

const Desktop4 = () => {
  const [pageData, setPageData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadContent() {
      try {
        const data = await getPageContent();
        setPageData(data);
      } catch (err) {
        setError(err.message);
        // Fallback data used on error
      } finally {
        setLoading(false);
      }
    }
    loadContent();
  }, []);
  
  // ... render with pageData
};
```

## Customization

### Connecting to Your Backend

1. Update `.env.local` with your backend API URL:
```env
NEXT_PUBLIC_API_BASE_URL=https://your-api-domain.com/api
```

2. Modify the API routes in `app/api/` to connect to your database:
```javascript
// app/api/content/home/route.js
import { db } from '@/lib/database';

export async function GET() {
  const data = await db.content.findFirst({ where: { page: 'home' } });
  return Response.json(data);
}
```

### Adding New API Endpoints

1. Create a new route file in `app/api/your-endpoint/route.js`
2. Add a wrapper function in `lib/api.js`
3. Import and use in your components

## Technologies Used

- **Next.js 13+** - React framework with App Router
- **React** - UI library
- **Tailwind CSS** - Utility-first CSS framework
- **Google Fonts** - Lakki Reddy font for traditional Indian aesthetic

## Development Notes

- All API routes are currently using mock data
- Replace mock data with actual database calls when ready
- Images are referenced from the `/assets` folder (served from Next.js `public/` directory)
- The component uses "use client" directive for client-side data fetching

## License

[Your License Here]

## Contact

[Your Contact Information]

/**
 * API Route: GET /api/kalakrithi
 * Returns Kalakrithi about section content
 */

const kalakrithiData = {
  title: "ABOUT\nKALAKRITHI",
  description: "Kalakrithi is a celebration of traditional Indian art forms, preserving and promoting the rich cultural heritage through exhibitions, workshops, and community engagement.",
  sections: [
    {
      heading: "Our Mission",
      content: "To preserve and promote traditional Indian art forms for future generations."
    },
    {
      heading: "Our Vision",
      content: "A world where traditional art thrives alongside modern expressions."
    }
  ],
  images: ["/kalakrithi-hero.jpg"],
};

export async function GET(request) {
  try {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    return Response.json(kalakrithiData, {
      status: 200,
    });
  } catch (error) {
    return Response.json(
      { error: 'Failed to fetch Kalakrithi content' },
      { status: 500 }
    );
  }
}

/**
 * API Route: GET /api/content/home
 * Returns all content for the home page in a single call
 */

// Mock data - Replace with actual database calls
const homePageData = {
  kalakrithi: {
    title: "ABOUT\nKALAKRITHI",
    description: "Kalakrithi is a celebration of traditional Indian art forms, preserving and promoting the rich cultural heritage through exhibitions, workshops, and community engagement. We bring together artists, craftspeople, and art enthusiasts to create a vibrant ecosystem of cultural exchange.",
  },
  arangetra: {
    title: "ABOUT\nARANGETRA", 
    description: "Arangetra showcases the beauty and diversity of Indian folk art traditions. Through our platform, we highlight the stories, techniques, and cultural significance of various art forms passed down through generations of skilled artisans.",
  },
  artists: [
    {
      id: 1,
      name: "Radha Devi",
      image: null,
      specialty: "Madhubani Art",
      bio: "Master artist with 40+ years of experience in traditional Madhubani painting."
    },
    {
      id: 2,
      name: "Lakshmi Bai",
      image: null,
      specialty: "Warli Art",
      bio: "Renowned Warli artist preserving tribal art traditions."
    }
  ]
};

export async function GET(request) {
  try {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return Response.json(homePageData, {
      status: 200,
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=30',
      },
    });
  } catch (error) {
    console.error('Error fetching home content:', error);
    return Response.json(
      { error: 'Failed to fetch home content' },
      { status: 500 }
    );
  }
}

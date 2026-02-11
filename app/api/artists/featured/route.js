/**
 * API Route: GET /api/artists/featured
 * Returns featured artists list
 */

const featuredArtists = [
  {
    id: 1,
    name: "Radha Devi",
    image: null,
    specialty: "Madhubani Art",
    bio: "Master artist with 40+ years of experience in traditional Madhubani painting.",
    location: "Bihar, India",
    awards: ["National Award for Traditional Art 2020", "State Art Award 2018"]
  },
  {
    id: 2,
    name: "Lakshmi Bai",
    image: null,
    specialty: "Warli Art",
    bio: "Renowned Warli artist preserving tribal art traditions.",
    location: "Maharashtra, India",
    awards: ["Folk Art Excellence Award 2019"]
  },
  {
    id: 3,
    name: "Meena Kumari",
    image: null,
    specialty: "Gond Art",
    bio: "Contemporary Gond artist bringing traditional stories to modern audiences.",
    location: "Madhya Pradesh, India",
    awards: []
  }
];

export async function GET(request) {
  try {
    await new Promise(resolve => setTimeout(resolve, 400));
    
    return Response.json(featuredArtists, {
      status: 200,
      headers: {
        'Cache-Control': 'public, s-maxage=300',
      },
    });
  } catch (error) {
    return Response.json(
      { error: 'Failed to fetch featured artists' },
      { status: 500 }
    );
  }
}

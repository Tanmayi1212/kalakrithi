/**
 * API Route: GET /api/stalls
 * Returns exhibition stalls data
 */

// Mock stalls data - Replace with database queries
const stallsData = [
  {
    id: 1,
    name: "Traditional Pottery & Ceramics",
    position: "left",
    color: "indianred",
    description: "Handcrafted pottery from various regions of India, featuring traditional designs and techniques passed down through generations.",
    vendor: {
      name: "Ravi Kumar",
      location: "Rajasthan",
      specialty: "Blue Pottery"
    },
    items: [
      { name: "Clay Pots", price: "₹500" },
      { name: "Decorative Plates", price: "₹800" },
      { name: "Vases", price: "₹1200" }
    ],
    image: "/stalls/pottery-stall.jpg"
  },
  {
    id: 2,
    name: "Madhubani Art Gallery",
    position: "left-center",
    color: "gray",
    description: "Exquisite Madhubani paintings showcasing mythological themes, nature motifs, and vibrant storytelling through traditional Bihar art.",
    vendor: {
      name: "Sita Devi",
      location: "Bihar",
      specialty: "Madhubani Painting"
    },
    items: [
      { name: "Canvas Paintings", price: "₹3000" },
      { name: "Wall Hangings", price: "₹1500" },
      { name: "Greeting Cards", price: "₹100" }
    ],
    image: "/stalls/madhubani-stall.jpg"
  },
  {
    id: 3,
    name: "Handloom & Textiles",
    position: "center",
    color: "firebrick",
    description: "Authentic handwoven textiles including sarees, dupattas, and fabrics featuring intricate patterns and natural dyes.",
    vendor: {
      name: "Lakshmi Textiles",
      location: "West Bengal",
      specialty: "Handloom Weaving"
    },
    items: [
      { name: "Silk Sarees", price: "₹8000" },
      { name: "Cotton Dupattas", price: "₹1200" },
      { name: "Fabric by meter", price: "₹400/m" }
    ],
    image: "/stalls/textile-stall.jpg"
  },
  {
    id: 4,
    name: "Warli & Tribal Art",
    position: "right-center",
    color: "maroon",
    description: "Traditional Warli paintings and tribal art forms from Maharashtra, depicting daily life and cultural celebrations.",
    vendor: {
      name: "Jivya Soma",
      location: "Maharashtra",
      specialty: "Warli Art"
    },
    items: [
      { name: "Framed Art", price: "₹2500" },
      { name: "Canvas Prints", price: "₹1800" },
      { name: "Decorative Panels", price: "₹3500" }
    ],
    image: "/stalls/warli-stall.jpg"
  },
  {
    id: 5,
    name: "Wooden Handicrafts",
    position: "right",
    color: "rosybrown",
    description: "Intricately carved wooden handicrafts including sculptures, furniture pieces, and decorative items from skilled artisans.",
    vendor: {
      name: "Mohan Woodworks",
      location: "Karnataka",
      specialty: "Wood Carving"
    },
    items: [
      { name: "Carved Figurines", price: "₹1500" },
      { name: "Decorative Boxes", price: "₹800" },
      { name: "Wall Panels", price: "₹4500" }
    ],
    image: "/stalls/wood-stall.jpg"
  }
];

export async function GET(request) {
  try {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 400));
    
    return Response.json(stallsData, {
      status: 200,
      headers: {
        'Cache-Control': 'public, s-maxage=120, stale-while-revalidate=60',
      },
    });
  } catch (error) {
    console.error('Error fetching stalls:', error);
    return Response.json(
      { error: 'Failed to fetch stalls data' },
      { status: 500 }
    );
  }
}

/**
 * API Route: GET /api/stalls/[id]
 * Returns individual stall details
 */
export async function GET_BY_ID(request, { params }) {
  try {
    const { id } = params;
    const stall = stallsData.find(s => s.id === parseInt(id));
    
    if (!stall) {
      return Response.json(
        { error: 'Stall not found' },
        { status: 404 }
      );
    }
    
    return Response.json(stall, {
      status: 200,
    });
  } catch (error) {
    console.error('Error fetching stall:', error);
    return Response.json(
      { error: 'Failed to fetch stall details' },
      { status: 500 }
    );
  }
}

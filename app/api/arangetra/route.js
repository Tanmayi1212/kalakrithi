/**
 * API Route: GET /api/arangetra
 * Returns Arangetra about section content
 */

const arangetraData = {
  title: "ABOUT\nARANGETRA",
  description: "Arangetra showcases the beauty and diversity of Indian folk art traditions. Through our platform, we highlight the stories, techniques, and cultural significance of various art forms.",
  videoUrl: "/videos/arangetra-intro.mp4",
  mediaGallery: [
    { type: "image", url: "/arangetra-gallery-1.jpg" },
    { type: "image", url: "/arangetra-gallery-2.jpg" },
  ]
};

export async function GET(request) {
  try {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    return Response.json(arangetraData, {
      status: 200,
    });
  } catch (error) {
    return Response.json(
      { error: 'Failed to fetch Arangetra content' },
      { status: 500 }
    );
  }
}

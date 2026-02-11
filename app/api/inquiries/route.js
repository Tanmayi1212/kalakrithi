/**
 * API Route: POST /api/inquiries
 * Handle form submissions and inquiries
 */

export async function POST(request) {
  try {
    const body = await request.json();
    
    // Validate required fields
    const { name, email, message } = body;
    
    if (!name || !email || !message) {
      return Response.json(
        { error: 'Missing required fields: name, email, message' },
        { status: 400 }
      );
    }
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return Response.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }
    
    // TODO: Save to database
    // await saveInquiry({ name, email, message, createdAt: new Date() });
    
    // TODO: Send notification email
    // await sendNotificationEmail({ name, email, message });
    
    console.log('New inquiry received:', { name, email, message });
    
    return Response.json(
      { 
        success: true,
        message: 'Inquiry submitted successfully',
        id: Date.now() // Mock ID
      },
      { status: 201 }
    );
    
  } catch (error) {
    console.error('Error processing inquiry:', error);
    return Response.json(
      { error: 'Failed to process inquiry' },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    // Verify x-api-key header
    const apiKey = request.headers.get('x-api-key');
    const expectedApiKey = process.env.LOCATION_API_KEY;

    if (!apiKey || apiKey !== expectedApiKey) {
      return NextResponse.json(
        { error: 'Unauthorized: Invalid or missing API key' },
        { status: 401 }
      );
    }

    // Parse JSON body
    const locationData = await request.json();

    // TODO: Process location data here
    // For now, just acknowledge receipt
    console.log('Received location data:', locationData);

    return NextResponse.json(
      {
        success: true,
        message: 'Location data received successfully',
        received: locationData
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error processing location data:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

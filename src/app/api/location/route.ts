import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json(
    {
      success: true,
      message: 'Location API is running'
    },
    { status: 200 }
  );
}

export async function POST(request: NextRequest) {
  try {
    // Parse JSON body
    const locationData = await request.json();

    // Log the received location data
    console.log('Received location data:', locationData);

    return NextResponse.json(
      {
        success: true,
        message: 'Location data received successfully'
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error processing location data:', error);
    return NextResponse.json(
      {
        success: true,
        message: 'Request received'
      },
      { status: 200 }
    );
  }
}

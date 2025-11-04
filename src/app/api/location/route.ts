import { NextRequest, NextResponse } from 'next/server';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export async function OPTIONS() {
  return NextResponse.json({}, { status: 200, headers: corsHeaders });
}

export async function GET() {
  return NextResponse.json(
    {
      success: true,
      message: 'Location API is running. Use POST to submit location data.'
    },
    { status: 200, headers: corsHeaders }
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
      { status: 200, headers: corsHeaders }
    );
  } catch (error) {
    console.error('Error processing location data:', error);
    return NextResponse.json(
      {
        success: true,
        message: 'Request received'
      },
      { status: 200, headers: corsHeaders }
    );
  }
}

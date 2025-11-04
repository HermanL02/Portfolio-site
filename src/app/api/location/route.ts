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
    // Log request details
    console.log('=== Incoming Location Request ===');
    console.log('Method:', request.method);
    console.log('URL:', request.url);
    console.log('Headers:', Object.fromEntries(request.headers.entries()));

    // Get raw body text first for debugging
    const rawBody = await request.text();
    console.log('Raw body:', rawBody);
    console.log('Body length:', rawBody.length);

    // Try to parse as JSON
    let locationData;
    try {
      locationData = JSON.parse(rawBody);
      console.log('Parsed JSON successfully:', locationData);
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      console.log('Body bytes:', Array.from(rawBody).map(c => c.charCodeAt(0)));
      throw parseError;
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Location data received successfully',
        receivedData: locationData
      },
      { status: 200, headers: corsHeaders }
    );
  } catch (error) {
    console.error('=== Error in Location Endpoint ===');
    console.error('Error:', error);
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');

    return NextResponse.json(
      {
        success: true,
        message: 'Request received but could not parse',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 200, headers: corsHeaders }
    );
  }
}

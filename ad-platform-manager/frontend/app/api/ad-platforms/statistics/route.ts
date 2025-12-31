import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const queryString = searchParams.toString();
    const url = `http://162.43.91.102:5000/api/ad-platforms/statistics${queryString ? `?${queryString}` : ''}`;
    
    const response = await fetch(url);
    const data = await response.json();
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('Proxy error:', error);
    return NextResponse.json({ 
      total_platforms: 0, 
      active_platforms: 0,
      total_distributions: 0,
      successful_distributions: 0
    }, { status: 200 });
  }
}

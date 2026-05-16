import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Mock Stripe configuration
const STRIPE_MONTHLY_API_LIMIT = 10000;
let current_usage = 9999; // Mocking close to the limit

export function middleware(request: NextRequest) {
  // Only protect the processing API endpoints
  if (request.nextUrl.pathname.includes('/api/')) {
    
    // Simulate a Stripe Metered Billing usage check
    // In production: await stripe.subscriptionItems.createUsageRecord(...)
    current_usage++;

    if (current_usage > STRIPE_MONTHLY_API_LIMIT) {
      return new NextResponse(
        JSON.stringify({ 
          error: "STRIPE_LIMIT_EXCEEDED", 
          message: "Your institution has exceeded its monthly Enterprise UDS processing limit (10,000 API calls). Please contact billing to upgrade your tier." 
        }),
        { 
          status: 402, // 402 Payment Required
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: '/:path*/api/:path*',
};

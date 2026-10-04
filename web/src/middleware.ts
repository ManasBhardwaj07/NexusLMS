import { NextResponse, type NextRequest } from 'next/server';
import { verifySession } from '@codeascend/auth';

export async function middleware(request: NextRequest) {
  if (!request.nextUrl.pathname.startsWith('/learn')) {
    return NextResponse.next();
  }

  const tokenCookie = request.cookies.get('__Secure-authjs.session-token')?.value 
    || request.cookies.get('authjs.session-token')?.value;

  if (!tokenCookie) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  const result = await verifySession(tokenCookie, process.env.AUTH_SECRET);

  if (!result.ok) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  const apiUrl = process.env.API_INTERNAL_URL || 'http://localhost:3001/api';
  
  try {
    const consentRes = await fetch(`${apiUrl}/v1/consent/parental/status`, {
      headers: {
        'Authorization': `Bearer ${tokenCookie}`
      }
    });

    if (consentRes.ok) {
      const data = await consentRes.json();
      
      if (data.consentState === 'PENDING') {
        return NextResponse.redirect(new URL('/consent/pending', request.url));
      }
      
      if (data.dateOfBirth === null || data.dateOfBirth === undefined) {
        return NextResponse.redirect(new URL('/auth/complete-profile', request.url));
      }
    } else {
      if (consentRes.status === 401) {
        return NextResponse.redirect(new URL('/login', request.url));
      }
      // DPDP gate cannot fail open.
      return new NextResponse('Service Unavailable', { status: 503 });
    }
  } catch (err) {
    console.error('Middleware fetch error:', err);
    // DPDP gate cannot fail open.
    return new NextResponse('Service Unavailable', { status: 503 });
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/learn/:path*'],
};

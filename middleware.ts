import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Route protection is handled client-side in AppShell via Firebase Auth.
// This middleware only exists to prevent static export issues.
export function middleware(request: NextRequest) {
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};

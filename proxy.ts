import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Route protection is handled client-side in AppShell via Firebase Auth.
export function proxy(request: NextRequest) {
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};

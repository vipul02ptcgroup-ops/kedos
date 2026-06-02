import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { toSlug } from '@/lib/slug';

function shouldBypass(pathname: string) {
  return (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/Images') ||
    pathname.startsWith('/favicon') ||
    pathname.includes('.')
  );
}

export function middleware(request: NextRequest) {
  const { nextUrl } = request;
  const pathname = nextUrl.pathname;

  if (shouldBypass(pathname)) {
    return NextResponse.next();
  }

  const normalizedPathname =
    pathname === '/'
      ? '/'
      : pathname
          .replace(/\/{2,}/g, '/')
          .replace(/\/$/, '')
          .toLowerCase();

  const redirectUrl = nextUrl.clone();
  let changed = normalizedPathname !== pathname;

  redirectUrl.pathname = normalizedPathname;

  const category = redirectUrl.searchParams.get('category');
  if (category) {
    const normalizedCategory = toSlug(category);
    if (normalizedCategory && normalizedCategory !== category) {
      redirectUrl.searchParams.set('category', normalizedCategory);
      changed = true;
    }
  }

  const search = redirectUrl.searchParams.get('search');
  if (search !== null) {
    const trimmedSearch = search.trim();
    if (!trimmedSearch) {
      redirectUrl.searchParams.delete('search');
      changed = true;
    } else if (trimmedSearch !== search) {
      redirectUrl.searchParams.set('search', trimmedSearch);
      changed = true;
    }
  }

  if (!changed) {
    return NextResponse.next();
  }

  return NextResponse.redirect(redirectUrl, 308);
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};

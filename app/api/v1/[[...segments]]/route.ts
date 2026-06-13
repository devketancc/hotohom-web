import { NextRequest, NextResponse } from 'next/server';

// Always run as a server function (never statically optimized) so it proxies on Netlify too.
export const dynamic = 'force-dynamic';

const backendOrigin = () => (process.env.NEXT_PUBLIC_API_BASE_URL || '').replace(/\/$/, '');

/**
 * Same-origin API proxy. Runs in dev AND production so the browser never makes a
 * cross-origin (CORS) request — it always calls /api/v1/* on this origin and we
 * forward server-side to the backend. Opt out with NEXT_PUBLIC_API_DEV_PROXY=false.
 */
function shouldProxy(): boolean {
  return (
    process.env.NEXT_PUBLIC_API_DEV_PROXY !== 'false' &&
    backendOrigin().startsWith('http')
  );
}

/** Resource-like API paths should keep trailing slash for Django-style backends. */
const API_V1_RESOURCE_PATH = /^\/api\/v1(\/.*)?$/;
const PATH_WITH_FILE_EXT = /\/[^/]+\.[^/]+$/;

function shouldAppendTrailingSlash(pathname: string): boolean {
  if (!API_V1_RESOURCE_PATH.test(pathname)) return false;
  if (pathname.endsWith('/')) return false;
  if (pathname === '/api/v1') return true;
  // Avoid touching file-like paths, e.g. /api/v1/openapi.json
  if (PATH_WITH_FILE_EXT.test(pathname)) return false;
  return true;
}

function buildBackendUrl(request: NextRequest): string {
  let pathname = request.nextUrl.pathname;
  if (shouldAppendTrailingSlash(pathname)) {
    pathname = `${pathname}/`;
  }
  const pathAndQuery = pathname + request.nextUrl.search;
  return new URL(pathAndQuery, `${backendOrigin()}/`).toString();
}

async function proxy(request: NextRequest): Promise<NextResponse> {
  if (!shouldProxy()) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  const url = buildBackendUrl(request);
  const headers = new Headers();
  const accept = request.headers.get('Accept');
  const contentType = request.headers.get('Content-Type');
  const authorization = request.headers.get('Authorization');
  if (accept) headers.set('Accept', accept);
  if (contentType) headers.set('Content-Type', contentType);
  if (authorization) headers.set('Authorization', authorization);

  const init: RequestInit = {
    method: request.method,
    headers,
    redirect: 'follow',
    cache: 'no-store',
  };

  if (!['GET', 'HEAD'].includes(request.method)) {
    init.body = await request.arrayBuffer();
  }

  let res: Response;
  try {
    res = await fetch(url, init);
  } catch (err) {
    const detail = err instanceof Error ? err.message : String(err);
    return NextResponse.json(
      { success: false, error: 'Upstream fetch failed', detail },
      { status: 502 }
    );
  }

  const out = new NextResponse(res.body, { status: res.status });
  const ct = res.headers.get('Content-Type');
  if (ct) out.headers.set('Content-Type', ct);
  return out;
}

export async function GET(request: NextRequest) {
  return proxy(request);
}

export async function POST(request: NextRequest) {
  return proxy(request);
}

export async function PUT(request: NextRequest) {
  return proxy(request);
}

export async function PATCH(request: NextRequest) {
  return proxy(request);
}

export async function DELETE(request: NextRequest) {
  return proxy(request);
}

export async function HEAD(request: NextRequest) {
  return proxy(request);
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204 });
}

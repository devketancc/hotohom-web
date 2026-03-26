import { NextRequest, NextResponse } from 'next/server';

const backendOrigin = () => (process.env.NEXT_PUBLIC_API_BASE_URL || '').replace(/\/$/, '');

function shouldProxy(): boolean {
  return (
    process.env.NODE_ENV === 'development' &&
    process.env.NEXT_PUBLIC_API_DEV_PROXY !== 'false' &&
    backendOrigin().startsWith('http')
  );
}

/** Django-style routes expect trailing slash; Next/axios may omit it on the incoming request. */
const BACKEND_TRAILING_SLASH_PATHS = new Set([
  '/api/v1/auth/otp/send',
  '/api/v1/auth/otp/verify',
  '/api/v1/auth/token/refresh',
  '/api/v1/auth/logout',
  '/api/v1/carts',
  '/api/v1/addons',
]);

/** Django: GET /api/v1/carts/{uuid}/ requires trailing slash */
const CART_DETAIL_PATH = /^\/api\/v1\/carts\/[^/]+$/;
/** Django: POST /api/v1/carts/{uuid}/items/ requires trailing slash */
const CART_ITEMS_PATH = /^\/api\/v1\/carts\/[^/]+\/items$/;
/** Django: DELETE /api/v1/carts/{uuid}/items/{addonId}/ requires trailing slash */
const CART_ITEM_DETAIL_PATH = /^\/api\/v1\/carts\/[^/]+\/items\/[^/]+$/;

function buildBackendUrl(request: NextRequest): string {
  let pathname = request.nextUrl.pathname;
  const basePath = pathname.replace(/\/+$/, '') || '/';
  const needsSlash =
    (BACKEND_TRAILING_SLASH_PATHS.has(basePath) && !pathname.endsWith('/')) ||
    (CART_DETAIL_PATH.test(basePath) && !pathname.endsWith('/')) ||
    (CART_ITEMS_PATH.test(basePath) && !pathname.endsWith('/')) ||
    (CART_ITEM_DETAIL_PATH.test(basePath) && !pathname.endsWith('/'));
  if (needsSlash) {
    pathname = `${basePath}/`;
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

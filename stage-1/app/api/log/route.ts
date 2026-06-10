/**
 * API Route: POST /api/log
 *
 * Server-side proxy that receives logs from the frontend
 * and forwards them to the external logging service.
 * The Bearer token is attached here — never exposed to the browser.
 */

import { NextRequest, NextResponse } from 'next/server';

const VALID_STACKS = ['frontend'];
const VALID_LEVELS = ['debug', 'info', 'warn', 'error', 'fatal'];
const VALID_PACKAGES = [
  'api', 'component', 'hook', 'page', 'state',
  'style', 'auth', 'config', 'middleware', 'utils',
];

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const payload = await request.json();

    // Server-side validation
    if (!VALID_STACKS.includes(payload.stack)) {
      return NextResponse.json({ error: 'Invalid stack' }, { status: 400 });
    }
    if (!VALID_LEVELS.includes(payload.level)) {
      return NextResponse.json({ error: 'Invalid level' }, { status: 400 });
    }
    if (!VALID_PACKAGES.includes(payload.package)) {
      return NextResponse.json({ error: 'Invalid package' }, { status: 400 });
    }

    // Read config from environment (server-only — never leaked to browser)
    const externalUrl = process.env.LOG_EXTERNAL_URL;
    const accessToken = process.env.LOG_ACCESS_TOKEN;

    if (!externalUrl) {
      return NextResponse.json(
        { error: 'LOG_EXTERNAL_URL not configured' },
        { status: 500 }
      );
    }

    if (!accessToken) {
      return NextResponse.json(
        { error: 'LOG_ACCESS_TOKEN not configured' },
        { status: 500 }
      );
    }

    // Forward to external logging service with Bearer token
    const response = await fetch(externalUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json().catch(() => ({}));

    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.debug('[/api/log] Proxy error:', error);
    }
    return NextResponse.json(
      { error: 'Failed to process log request' },
      { status: 500 }
    );
  }
}

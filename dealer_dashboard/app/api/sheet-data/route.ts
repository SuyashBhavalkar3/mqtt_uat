import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const BASE_URL = process.env.API_BASE_URL || 'https://uatpreprod.gbru.in';
const API_KEY = process.env['X-API-KEY'] || '';
const API_SECRET = process.env['X-API-SECRET'] || '';
const API_URL = `${BASE_URL}/api/method/warrior.apis.performance_report.top_employee_performance`;

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const targetUrl = new URL(API_URL);
    searchParams.forEach((value, key) => {
      targetUrl.searchParams.set(key, value);
    });

    const response = await fetch(targetUrl.toString(), {
      method: 'GET',
      cache: 'no-store',
      headers: {
        'Accept': 'application/json',
        'X-API-KEY': API_KEY,
        'X-API-SECRET': API_SECRET,
      },
    });

    const pingTime = process.env.PING_TIME || '60';

    if (!response.ok) {
      return new Response(
        JSON.stringify({ error: `Failed to fetch from Performance API: status ${response.status}` }),
        {
          status: response.status,
          headers: {
            'Content-Type': 'application/json',
            'x-ping-time': pingTime,
          },
        }
      );
    }

    const rawData = await response.json();

    const images: Record<string, string> = {};
    for (const key of Object.keys(process.env)) {
      if (key.endsWith('_IMAGE_URL')) {
        const tsmName = key.replace('_IMAGE_URL', '').trim().toUpperCase();
        images[tsmName] = process.env[key] || '';
      }
    }

    const names: Record<string, string> = {};
    for (const key of Object.keys(process.env)) {
      if (key.endsWith('_NAME')) {
        const tsmKey = key.replace('_NAME', '').trim().toUpperCase();
        names[tsmKey] = process.env[key] || '';
      }
    }

    return new Response(JSON.stringify({ data: rawData, images, names }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'x-ping-time': pingTime,
      },
    });
  } catch (err: any) {
    console.error('Proxy fetch error:', err);
    return new Response(
      JSON.stringify({ error: err.message || 'Internal Server Error during data proxy fetch' }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'x-ping-time': process.env.PING_TIME || '60',
        },
      }
    );
  }
}

import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const BASE_URL = process.env.API_BASE_URL || 'https://uatpreprod.gbru.in';
const API_KEY = process.env['X_API_KEY'] || '';
const API_SECRET = process.env['X_API_SECRET'] || '';
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

    if (!response.ok) {
      return new Response(
        JSON.stringify({ error: `Failed to fetch from Performance API: status ${response.status}` }),
        {
          status: response.status,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
    }

    const rawData = await response.json();
    const pingTime = process.env.PING_TIME || '60';

    return new Response(JSON.stringify({ data: rawData, pingTime }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
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
        },
      }
    );
  }
}

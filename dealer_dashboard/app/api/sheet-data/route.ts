import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const API_URL = process.env.GOOGLE_SHEETS_API_URL || 'https://script.google.com/macros/s/AKfycbyqEHyruNtUycpSOeRJy-iSJhk-IIgGIceH8lqRV_NB5_xG_z4bJ9pWLSEd89xzifJq/exec';

export async function GET() {
  try {
    const response = await fetch(API_URL, {
      method: 'GET',
      cache: 'no-store',
      headers: {
        'Accept': 'application/json',
      },
    });

    const pingTime = process.env.PING_TIME || '60';

    if (!response.ok) {
      return new Response(
        JSON.stringify({ error: `Failed to fetch from Google Sheets: status ${response.status}` }),
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

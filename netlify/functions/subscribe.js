// Netlify Function to handle email subscriptions for alerts waitlist
import { getStore } from "@netlify/blobs";

export default async (request, context) => {
  // Handle CORS preflight
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });
  }

  const store = getStore("subscribers");

  // GET - List all subscribers (for checking)
  if (request.method === 'GET') {
    try {
      const { blobs } = await store.list();
      const subscribers = [];

      for (const blob of blobs) {
        const data = await store.get(blob.key, { type: "json" });
        if (data) {
          subscribers.push(data);
        }
      }

      // Sort by timestamp descending (newest first)
      subscribers.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

      return new Response(JSON.stringify({
        count: subscribers.length,
        subscribers: subscribers
      }), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    } catch (error) {
      return new Response(JSON.stringify({
        error: 'Failed to fetch subscribers',
        details: error.message
      }), {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    }
  }

  // POST - Add new subscriber
  if (request.method === 'POST') {
    try {
      const body = await request.json();
      const email = body.email?.trim().toLowerCase();

      if (!email || !email.includes('@')) {
        return new Response(JSON.stringify({
          error: 'Valid email required'
        }), {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          }
        });
      }

      // Create unique key from email
      const key = email.replace(/[^a-z0-9]/g, '_');

      // Check if already subscribed
      const existing = await store.get(key, { type: "json" });
      if (existing) {
        return new Response(JSON.stringify({
          success: true,
          message: 'Already on waitlist!',
          email: email
        }), {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          }
        });
      }

      // Store new subscriber
      const subscriber = {
        email: email,
        timestamp: new Date().toISOString(),
        source: 'subscribe_page',
        promo_code: body.promo_code || null
      };

      await store.setJSON(key, subscriber);

      return new Response(JSON.stringify({
        success: true,
        message: 'Added to waitlist!',
        email: email
      }), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });

    } catch (error) {
      return new Response(JSON.stringify({
        error: 'Failed to subscribe',
        details: error.message
      }), {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    }
  }

  return new Response(JSON.stringify({ error: 'Method not allowed' }), {
    status: 405,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    }
  });
};

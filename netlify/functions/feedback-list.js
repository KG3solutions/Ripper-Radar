// List all stored feedback for review
import { getStore } from "@netlify/blobs";

export default async (request, context) => {
  // Handle CORS
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });
  }

  const feedbackStore = getStore("feedback");

  try {
    const { blobs } = await feedbackStore.list();
    const feedback = [];

    for (const blob of blobs) {
      const data = await feedbackStore.get(blob.key, { type: "json" });
      if (data) {
        feedback.push(data);
      }
    }

    // Sort by timestamp (newest first)
    feedback.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    // Group by category
    const byCategory = feedback.reduce((acc, item) => {
      if (!acc[item.category]) acc[item.category] = [];
      acc[item.category].push(item);
      return acc;
    }, {});

    // Count by status
    const stats = {
      total: feedback.length,
      new: feedback.filter(f => f.status === 'new').length,
      reviewed: feedback.filter(f => f.status === 'reviewed').length,
      implemented: feedback.filter(f => f.status === 'implemented').length,
    };

    return new Response(JSON.stringify({
      stats,
      byCategory,
      all: feedback
    }), {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });

  } catch (error) {
    return new Response(JSON.stringify({
      error: 'Failed to fetch feedback',
      details: error.message
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  }
};

export const config = {
  path: "/api/feedback"
};

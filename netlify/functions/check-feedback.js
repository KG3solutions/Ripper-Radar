// Manually callable feedback checker
// Call this endpoint to check Discord for feedback

const FEEDBACK_KEYWORDS = [
  'bug', 'broken', 'fix', 'issue', 'problem', 'error', 'crash',
  'doesn\'t work', 'not working', 'feedback', 'suggestion', 'improve',
  'should', 'could', 'wish', 'please add', 'would be nice', 'annoying',
  'slow', 'ugly', 'bad', 'wrong', 'missing', 'need', 'want', 'cash grab'
];

function isFeedback(content) {
  if (!content) return false;
  const lower = content.toLowerCase();
  return FEEDBACK_KEYWORDS.some(keyword => lower.includes(keyword));
}

function categorize(content) {
  const lower = content.toLowerCase();
  if (lower.includes('cam') || lower.includes('video') || lower.includes('stream') || lower.includes('image')) return 'cams';
  if (lower.includes('weather') || lower.includes('forecast')) return 'weather';
  if (lower.includes('dispatch') || lower.includes('alert')) return 'alerts';
  if (lower.includes('slow') || lower.includes('performance')) return 'performance';
  if (lower.includes('mobile') || lower.includes('phone')) return 'mobile';
  return 'general';
}

export default async (request, context) => {
  // CORS
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

  const DISCORD_BOT_TOKEN = process.env.DISCORD_BOT_TOKEN;
  const DISCORD_CHANNEL_ID = process.env.DISCORD_CHANNEL_ID || '1194763841154842765';

  if (!DISCORD_BOT_TOKEN) {
    return new Response(JSON.stringify({ error: 'No token configured' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    });
  }

  try {
    const response = await fetch(
      `https://discord.com/api/v10/channels/${DISCORD_CHANNEL_ID}/messages?limit=50`,
      {
        headers: {
          'Authorization': `Bot ${DISCORD_BOT_TOKEN}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      return new Response(JSON.stringify({ error: 'Discord API error', status: response.status }), {
        status: 500,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
      });
    }

    const messages = await response.json();

    // Filter for all feedback (not just recent)
    const allFeedback = messages
      .filter(msg => !msg.author.bot && isFeedback(msg.content))
      .map(msg => ({
        id: msg.id,
        author: msg.author.global_name || msg.author.username,
        content: msg.content,
        category: categorize(msg.content),
        timestamp: msg.timestamp
      }));

    // Group by category
    const byCategory = {};
    allFeedback.forEach(f => {
      if (!byCategory[f.category]) byCategory[f.category] = [];
      byCategory[f.category].push(f);
    });

    return new Response(JSON.stringify({
      total: messages.length,
      feedbackCount: allFeedback.length,
      byCategory,
      items: allFeedback
    }), {
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    });
  }
};

export const config = {
  path: "/api/check-feedback"
};

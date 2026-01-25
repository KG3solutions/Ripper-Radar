// Scheduled function to monitor Discord for feedback
// Runs every 5 minutes

// Keywords that suggest feedback
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

// Handler for scheduled function
export default async function handler(req) {
  const DISCORD_BOT_TOKEN = process.env.DISCORD_BOT_TOKEN;
  const DISCORD_CHANNEL_ID = process.env.DISCORD_CHANNEL_ID || '1194763841154842765';

  if (!DISCORD_BOT_TOKEN) {
    return Response.json({ error: 'No token configured' }, { status: 500 });
  }

  try {
    const response = await fetch(
      `https://discord.com/api/v10/channels/${DISCORD_CHANNEL_ID}/messages?limit=20`,
      {
        headers: {
          'Authorization': `Bot ${DISCORD_BOT_TOKEN}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      return Response.json({ error: 'Discord API error', status: response.status }, { status: 500 });
    }

    const messages = await response.json();

    // Filter for feedback from last 10 minutes
    const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);
    const recentFeedback = messages
      .filter(msg => !msg.author.bot && new Date(msg.timestamp) > tenMinutesAgo && isFeedback(msg.content))
      .map(msg => ({
        author: msg.author.global_name || msg.author.username,
        content: msg.content,
        category: categorize(msg.content)
      }));

    return Response.json({
      checked: messages.length,
      feedbackCount: recentFeedback.length,
      items: recentFeedback
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}

export const config = {
  schedule: "*/5 * * * *"
};

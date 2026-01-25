// Netlify Function to fetch Discord channel messages
// Requires DISCORD_BOT_TOKEN and DISCORD_CHANNEL_ID environment variables

export default async (request, context) => {
  // Handle CORS preflight
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

  const DISCORD_BOT_TOKEN = Netlify.env.get('DISCORD_BOT_TOKEN');
  const DISCORD_CHANNEL_ID = Netlify.env.get('DISCORD_CHANNEL_ID') || '1194763841154842765'; // #butts-barometer

  if (!DISCORD_BOT_TOKEN) {
    return new Response(JSON.stringify({
      error: 'Bot token not configured',
      setup_required: true
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
    });
  }

  try {
    // Fetch last 15 messages from the channel
    const response = await fetch(
      `https://discord.com/api/v10/channels/${DISCORD_CHANNEL_ID}/messages?limit=15`,
      {
        headers: {
          'Authorization': `Bot ${DISCORD_BOT_TOKEN}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Discord API error:', response.status, errorText);
      return new Response(JSON.stringify({
        error: `Discord API error: ${response.status}`,
        details: errorText
      }), {
        status: response.status,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
      });
    }

    const messages = await response.json();

    // Transform messages to include only what we need
    const transformedMessages = messages.map(msg => ({
      id: msg.id,
      content: msg.content,
      author: {
        username: msg.author.username,
        display_name: msg.author.global_name || msg.author.username,
        avatar: msg.author.avatar
          ? `https://cdn.discordapp.com/avatars/${msg.author.id}/${msg.author.avatar}.png?size=64`
          : `https://cdn.discordapp.com/embed/avatars/${parseInt(msg.author.discriminator || '0') % 5}.png`,
        bot: msg.author.bot || false,
      },
      timestamp: msg.timestamp,
      attachments: msg.attachments?.map(a => ({
        url: a.url,
        filename: a.filename,
        content_type: a.content_type,
      })) || [],
      embeds: msg.embeds?.length > 0,
    })).reverse(); // Reverse to show oldest first (chat order)

    return new Response(JSON.stringify({
      channel_id: DISCORD_CHANNEL_ID,
      messages: transformedMessages,
      fetched_at: new Date().toISOString(),
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'public, max-age=30', // Cache for 30 seconds
      },
    });

  } catch (error) {
    console.error('Function error:', error);
    return new Response(JSON.stringify({
      error: 'Failed to fetch messages',
      details: error.message
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
    });
  }
};

export const config = {
  path: "/api/discord-messages"
};

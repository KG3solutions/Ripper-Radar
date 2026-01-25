// Discord Slash Command Handler for Ripper Radar Bot
// Handles /feedback, /weather, /alert commands

import nacl from 'tweetnacl';

// Verify Discord request signature
function verifyDiscordRequest(request, body) {
  const signature = request.headers.get('x-signature-ed25519');
  const timestamp = request.headers.get('x-signature-timestamp');
  const publicKey = Netlify.env.get('DISCORD_PUBLIC_KEY');

  if (!signature || !timestamp || !publicKey) return false;

  const isValid = nacl.sign.detached.verify(
    Buffer.from(timestamp + body),
    Buffer.from(signature, 'hex'),
    Buffer.from(publicKey, 'hex')
  );

  return isValid;
}

export default async (request, context) => {
  // Only accept POST
  if (request.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  const body = await request.text();

  // Verify the request is from Discord
  if (!verifyDiscordRequest(request, body)) {
    return new Response('Invalid request signature', { status: 401 });
  }

  const interaction = JSON.parse(body);

  // Handle PING (Discord verification)
  if (interaction.type === 1) {
    return new Response(JSON.stringify({ type: 1 }), {
      headers: { 'Content-Type': 'application/json' }
    });
  }

  // Handle Slash Commands (type 2)
  if (interaction.type === 2) {
    const { name, options } = interaction.data;
    const userId = interaction.member?.user?.id || interaction.user?.id;
    const username = interaction.member?.user?.username || interaction.user?.username;

    switch (name) {
      case 'feedback': {
        const feedbackText = options?.find(o => o.name === 'message')?.value;

        // Store feedback (could also forward to a webhook, database, etc.)
        console.log(`FEEDBACK from ${username} (${userId}): ${feedbackText}`);

        // Post to channel as confirmation
        const CHANNEL_ID = Netlify.env.get('DISCORD_CHANNEL_ID') || '1194763841154842765';
        const BOT_TOKEN = Netlify.env.get('DISCORD_BOT_TOKEN');

        const postResponse = await fetch(`https://discord.com/api/v10/channels/${CHANNEL_ID}/messages`, {
          method: 'POST',
          headers: {
            'Authorization': `Bot ${BOT_TOKEN}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            content: `📝 **Feedback received from ${username}:**\n> ${feedbackText}\n\n_Thanks! This has been logged for review._`
          })
        });

        if (!postResponse.ok) {
          console.error('Failed to post feedback confirmation:', postResponse.status);
        }

        return new Response(JSON.stringify({
          type: 4, // CHANNEL_MESSAGE_WITH_SOURCE
          data: {
            content: `Thanks for the feedback! Your message has been logged. 🙏`,
            flags: 64 // Ephemeral (only visible to user)
          }
        }), {
          headers: { 'Content-Type': 'application/json' }
        });
      }

      case 'weather': {
        // Fetch current Nashville weather
        try {
          const nwsResponse = await fetch('https://api.weather.gov/gridpoints/OHX/51,33/forecast', {
            headers: { 'User-Agent': 'RipperRadar/1.0' }
          });
          if (!nwsResponse.ok) {
            throw new Error(`NWS API error: ${nwsResponse.status}`);
          }
          const data = await nwsResponse.json();
          const current = data.properties?.periods?.[0];

          return new Response(JSON.stringify({
            type: 4,
            data: {
              embeds: [{
                title: '🌡️ Nashville Weather',
                description: current?.detailedForecast || 'Unable to fetch forecast',
                color: 0x32cd32,
                fields: [
                  { name: 'Temperature', value: `${current?.temperature}°${current?.temperatureUnit}`, inline: true },
                  { name: 'Wind', value: current?.windSpeed || 'N/A', inline: true }
                ],
                footer: { text: 'Source: National Weather Service' },
                timestamp: new Date().toISOString()
              }]
            }
          }), {
            headers: { 'Content-Type': 'application/json' }
          });
        } catch (error) {
          return new Response(JSON.stringify({
            type: 4,
            data: { content: '❌ Unable to fetch weather data. Try again later.' }
          }), {
            headers: { 'Content-Type': 'application/json' }
          });
        }
      }

      case 'alert': {
        const alertType = options?.find(o => o.name === 'type')?.value;
        const alertMessage = options?.find(o => o.name === 'message')?.value;

        const CHANNEL_ID = Netlify.env.get('DISCORD_CHANNEL_ID') || '1194763841154842765';
        const BOT_TOKEN = Netlify.env.get('DISCORD_BOT_TOKEN');

        const alertEmojis = {
          weather: '⛈️',
          road: '🚗',
          dispatch: '🚨',
          info: 'ℹ️'
        };

        const alertResponse = await fetch(`https://discord.com/api/v10/channels/${CHANNEL_ID}/messages`, {
          method: 'POST',
          headers: {
            'Authorization': `Bot ${BOT_TOKEN}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            content: `${alertEmojis[alertType] || '📢'} **RIPPER RADAR ALERT**\n\n${alertMessage}`
          })
        });

        if (!alertResponse.ok) {
          console.error('Failed to post alert:', alertResponse.status);
          return new Response(JSON.stringify({
            type: 4,
            data: {
              content: `❌ Failed to post alert. Try again later.`,
              flags: 64
            }
          }), {
            headers: { 'Content-Type': 'application/json' }
          });
        }

        return new Response(JSON.stringify({
          type: 4,
          data: {
            content: `✅ Alert posted to channel!`,
            flags: 64
          }
        }), {
          headers: { 'Content-Type': 'application/json' }
        });
      }

      default:
        return new Response(JSON.stringify({
          type: 4,
          data: { content: 'Unknown command' }
        }), {
          headers: { 'Content-Type': 'application/json' }
        });
    }
  }

  return new Response('Unknown interaction type', { status: 400 });
};

export const config = {
  path: "/api/discord-interactions"
};

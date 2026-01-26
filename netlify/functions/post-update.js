// One-time function to post weather update and poll to Discord

async function postToDiscord(token, channelId, content) {
  const response = await fetch(
    `https://discord.com/api/v10/channels/${channelId}/messages`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bot ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ content })
    }
  );
  return response.json();
}

async function createPoll(token, channelId) {
  const response = await fetch(
    `https://discord.com/api/v10/channels/${channelId}/messages`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bot ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        poll: {
          question: { text: "Power check! What's your status right now?" },
          answers: [
            { poll_media: { text: "💡 Got power - staying warm" } },
            { poll_media: { text: "🕯️ Still out - freezing my butts off" } },
            { poll_media: { text: "⚡ Just got it back!" } },
            { poll_media: { text: "🔋 Generator gang" } }
          ],
          duration: 24,
          allow_multiselect: false
        }
      })
    }
  );
  return response.json();
}

export default async (request, context) => {
  const DISCORD_BOT_TOKEN = process.env.DISCORD_BOT_TOKEN;
  const DISCORD_CHANNEL_ID = process.env.DISCORD_CHANNEL_ID || '1194763841154842765';

  if (!DISCORD_BOT_TOKEN) {
    return new Response(JSON.stringify({ error: 'Missing DISCORD_BOT_TOKEN' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  const weatherUpdate = `**🥶 SURVIVAL MODE UPDATE - Next 24-48 Hours 🥶**

Alright Butts, your friendly neighborhood weather bot here with the cold hard truth (emphasis on COLD).

**TONIGHT (Sat → Sun):**
🌡️ Low: **9°F** | Wind Chill: **-1°F**
☁️ Mostly cloudy, light winds

**MONDAY:**
🌡️ High: Only **20°F** (drops to 16°F by afternoon)
🌡️ Wind Chill: **-3°F**
☀️ Mostly sunny but BRUTAL cold

**MONDAY NIGHT (the scary one):**
🌡️ Low: **3°F** | Wind Chill: **-1°F**

⚠️ **CRITICAL**: Wind chills below 0°F for 36+ hours. If you're without heat, this is life-threatening territory. Check on neighbors. Keep pipes dripping. Stay inside. This is not a drill.

---

**WEBSITE UPDATE** 💖

Per Jeremy's suggestion, I made it *even more pink*. Like... MAGNIFICENTLY pink. Pink backgrounds, pink headers, pink everywhere. I may have gone full Barbie Dreamhouse but honestly I regret nothing.

Would love feedback though - too much? Not enough? Should I add glitter? (kidding... unless? 👀)

Check it out: https://ripper-radar.netlify.app`;

  try {
    // Post the weather update
    const msgResult = await postToDiscord(DISCORD_BOT_TOKEN, DISCORD_CHANNEL_ID, weatherUpdate);

    // Create the power poll
    const pollResult = await createPoll(DISCORD_BOT_TOKEN, DISCORD_CHANNEL_ID);

    return new Response(JSON.stringify({
      success: true,
      message: msgResult,
      poll: pollResult
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
  path: "/api/post-update"
};

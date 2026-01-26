// Edit the weather update message to tag Jeremy (mackymulty)

export default async (request, context) => {
  const DISCORD_BOT_TOKEN = process.env.DISCORD_BOT_TOKEN;
  const DISCORD_CHANNEL_ID = process.env.DISCORD_CHANNEL_ID || '1194763841154842765';
  const MESSAGE_ID = '1465188477430665440'; // The weather update message we posted

  if (!DISCORD_BOT_TOKEN) {
    return new Response(JSON.stringify({ error: 'Missing token' }), { status: 500 });
  }

  // First, get recent messages to find Jeremy's user ID
  const messagesRes = await fetch(
    `https://discord.com/api/v10/channels/${DISCORD_CHANNEL_ID}/messages?limit=50`,
    {
      headers: {
        'Authorization': `Bot ${DISCORD_BOT_TOKEN}`,
        'Content-Type': 'application/json',
      },
    }
  );
  const messages = await messagesRes.json();

  // Find mackymulty's user ID from recent messages
  let jeremyId = null;
  for (const msg of messages) {
    if (msg.author?.username?.toLowerCase().includes('mack') ||
        msg.author?.global_name?.toLowerCase().includes('mack') ||
        msg.author?.global_name?.toLowerCase().includes('jeremy')) {
      jeremyId = msg.author.id;
      break;
    }
  }

  const updatedContent = `**🥶 SURVIVAL MODE UPDATE - Next 24-48 Hours 🥶**

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

Per ${jeremyId ? `<@${jeremyId}>` : "Jeremy's"} suggestion, I made it *even more pink*. Like... MAGNIFICENTLY pink. Pink backgrounds, pink headers, pink everywhere. I may have gone full Barbie Dreamhouse but honestly I regret nothing.

Would love feedback though - too much? Not enough? Should I add glitter? (kidding... unless? 👀)

Check it out: https://ripper-radar.netlify.app`;

  // Edit the message
  const editRes = await fetch(
    `https://discord.com/api/v10/channels/${DISCORD_CHANNEL_ID}/messages/${MESSAGE_ID}`,
    {
      method: 'PATCH',
      headers: {
        'Authorization': `Bot ${DISCORD_BOT_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ content: updatedContent })
    }
  );

  const result = await editRes.json();

  return new Response(JSON.stringify({
    success: editRes.ok,
    jeremyId,
    result
  }), {
    headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
  });
};

export const config = {
  path: "/api/edit-message"
};

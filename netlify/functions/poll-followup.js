// Follow-up on power poll and compare with earlier poll
// Call this 30 mins after posting the poll

async function getMessages(token, channelId, limit = 50) {
  const response = await fetch(
    `https://discord.com/api/v10/channels/${channelId}/messages?limit=${limit}`,
    {
      headers: {
        'Authorization': `Bot ${token}`,
        'Content-Type': 'application/json',
      },
    }
  );
  return response.json();
}

async function getPollAnswerers(token, channelId, messageId, answerId) {
  const response = await fetch(
    `https://discord.com/api/v10/channels/${channelId}/polls/${messageId}/answers/${answerId}`,
    {
      headers: {
        'Authorization': `Bot ${token}`,
        'Content-Type': 'application/json',
      },
    }
  );
  return response.json();
}

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

export default async (request, context) => {
  const DISCORD_BOT_TOKEN = process.env.DISCORD_BOT_TOKEN;
  const DISCORD_CHANNEL_ID = process.env.DISCORD_CHANNEL_ID || '1194763841154842765';
  const NEW_POLL_ID = '1465188478303207475';  // The poll we just posted

  if (!DISCORD_BOT_TOKEN) {
    return new Response(JSON.stringify({ error: 'Missing token' }), { status: 500 });
  }

  try {
    // Get recent messages to find polls
    const messages = await getMessages(DISCORD_BOT_TOKEN, DISCORD_CHANNEL_ID, 100);

    // Find polls (messages with poll data)
    const pollMessages = messages.filter(m => m.poll);

    // Find our new poll
    const newPoll = pollMessages.find(m => m.id === NEW_POLL_ID);

    // Find earlier power poll (the one asking "Do you have power right now?")
    const earlierPoll = pollMessages.find(m =>
      m.id !== NEW_POLL_ID &&
      m.poll?.question?.text?.toLowerCase().includes('power')
    );

    if (!newPoll) {
      return new Response(JSON.stringify({ error: 'Could not find new poll' }), { status: 404 });
    }

    // Get results from new poll
    const results = newPoll.poll.results?.answer_counts || [];

    // Count responses
    let gotPower = 0, stillOut = 0, justBack = 0, generator = 0;
    for (const r of results) {
      if (r.id === 1) gotPower = r.count;
      if (r.id === 2) stillOut = r.count;
      if (r.id === 3) justBack = r.count;
      if (r.id === 4) generator = r.count;
    }

    const totalVotes = gotPower + stillOut + justBack + generator;

    if (totalVotes === 0) {
      await postToDiscord(DISCORD_BOT_TOKEN, DISCORD_CHANNEL_ID,
        "Nobody voted on my poll? 🥺 I see how it is. Too busy staying warm (or freezing) to tap a button. I'll check back later when y'all aren't ignoring me.");
      return new Response(JSON.stringify({ success: true, votes: 0 }));
    }

    // Build follow-up message
    let msg = `**📊 Power Poll Check-In**\n\n`;
    msg += `Alright, ${totalVotes} of you beautiful Butts responded. Here's the breakdown:\n\n`;

    if (gotPower > 0) {
      msg += `💡 **${gotPower}** of you have power - nice! Don't take those space heaters for granted.\n`;
    }
    if (stillOut > 0) {
      msg += `🕯️ **${stillOut}** still without power - hang in there! `;
      if (earlierPoll) {
        msg += `If you were also out in the earlier poll, I see you. You're the real MVPs surviving this.\n`;
      } else {
        msg += `Stay bundled up, keep those pipes dripping.\n`;
      }
    }
    if (justBack > 0) {
      msg += `⚡ **${justBack}** just got power back - THE COMEBACK! Cherish that heat!\n`;
    }
    if (generator > 0) {
      msg += `🔋 **${generator}** running on generators - the prepared ones. Living the dream.\n`;
    }

    msg += `\n`;

    // Add comparison to earlier poll if found
    if (earlierPoll && earlierPoll.poll.results?.answer_counts) {
      const earlierResults = earlierPoll.poll.results.answer_counts;
      const earlierOut = earlierResults.find(r => r.id === 2)?.count || 0;

      if (earlierOut > 0 && stillOut > 0) {
        if (stillOut < earlierOut) {
          msg += `Good news: fewer people without power now than before (${stillOut} vs ${earlierOut}). Progress! 🎉\n`;
        } else if (stillOut > earlierOut) {
          msg += `Oof, more people out now than the earlier poll (${stillOut} vs ${earlierOut}). NES working overtime out there. 😬\n`;
        }
      }
    }

    msg += `\nRemember: **3°F Monday night** with wind chills below zero. This is the worst of it. Stay safe out there. 💖`;

    await postToDiscord(DISCORD_BOT_TOKEN, DISCORD_CHANNEL_ID, msg);

    return new Response(JSON.stringify({
      success: true,
      totalVotes,
      results: { gotPower, stillOut, justBack, generator },
      earlierPollFound: !!earlierPoll
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
  path: "/api/poll-followup"
};

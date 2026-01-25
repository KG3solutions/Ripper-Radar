// Autonomous Ripper Radar Agent
// Monitors Discord, implements feedback, deploys changes
// Triggered via: /api/autonomous-agent or scheduled

const IGNORE_AUTHORS = ['Ripper Radar']; // Don't process bot's own messages

function isBotMention(msg) {
  if (!msg.content) return false;
  const lower = msg.content.toLowerCase();
  return msg.content.includes('<@1464438921239724096>') ||
         lower.includes('ripper radar') ||
         lower.includes('@ripper');
}

function isHumanMessage(msg) {
  if (!msg.content || msg.author?.bot) return false;
  if (IGNORE_AUTHORS.includes(msg.author?.display_name)) return false;
  return true;
}

function categorize(content) {
  const lower = content.toLowerCase();
  if (lower.includes('melt') || lower.includes('ice remaining') || lower.includes('prediction')) return 'melt-panel';
  if (lower.includes('temp') || lower.includes('forecast') || lower.includes('weather')) return 'weather';
  if (lower.includes('cam') || lower.includes('video') || lower.includes('stream')) return 'webcams';
  if (lower.includes('radar') || lower.includes('map')) return 'radar';
  if (lower.includes('dispatch') || lower.includes('alert') || lower.includes('ticker')) return 'alerts';
  if (lower.includes('slow') || lower.includes('performance') || lower.includes('loading')) return 'performance';
  if (lower.includes('mobile') || lower.includes('phone') || lower.includes('responsive')) return 'mobile';
  if (lower.includes('color') || lower.includes('font') || lower.includes('style') || lower.includes('design')) return 'styling';
  return 'general';
}

async function fetchDiscordMessages(token, channelId, limit = 30) {
  const response = await fetch(
    `https://discord.com/api/v10/channels/${channelId}/messages?limit=${limit}`,
    {
      headers: {
        'Authorization': `Bot ${token}`,
        'Content-Type': 'application/json',
      },
    }
  );

  if (!response.ok) {
    throw new Error(`Discord API error: ${response.status}`);
  }

  return response.json();
}

async function postToDiscord(token, channelId, message) {
  const response = await fetch(
    `https://discord.com/api/v10/channels/${channelId}/messages`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bot ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ content: message })
    }
  );

  return response.ok;
}

async function callClaude(apiKey, systemPrompt, userMessage) {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4096,
      system: systemPrompt,
      messages: [{ role: 'user', content: userMessage }]
    })
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Claude API error: ${response.status} - ${error}`);
  }

  const data = await response.json();
  return data.content[0].text;
}

async function getFileFromGitHub(token, owner, repo, path) {
  const response = await fetch(
    `https://api.github.com/repos/${owner}/${repo}/contents/${path}`,
    {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/vnd.github.v3+json'
      }
    }
  );

  if (!response.ok) {
    if (response.status === 404) return null;
    throw new Error(`GitHub API error: ${response.status}`);
  }

  const data = await response.json();
  return {
    content: Buffer.from(data.content, 'base64').toString('utf-8'),
    sha: data.sha
  };
}

async function commitToGitHub(token, owner, repo, path, content, message, sha) {
  const response = await fetch(
    `https://api.github.com/repos/${owner}/${repo}/contents/${path}`,
    {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/vnd.github.v3+json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        message,
        content: Buffer.from(content).toString('base64'),
        sha
      })
    }
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`GitHub commit error: ${response.status} - ${error}`);
  }

  return response.json();
}

async function triggerNetlifyDeploy(siteId, token) {
  const response = await fetch(
    `https://api.netlify.com/api/v1/sites/${siteId}/builds`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    }
  );

  return response.ok;
}

export default async (request, context) => {
  // CORS for manual triggers
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

  const DISCORD_BOT_TOKEN = process.env.DISCORD_BOT_TOKEN;
  const DISCORD_CHANNEL_ID = process.env.DISCORD_CHANNEL_ID || '1194763841154842765';
  const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
  const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
  const GITHUB_OWNER = process.env.GITHUB_OWNER || 'your-username';
  const GITHUB_REPO = process.env.GITHUB_REPO || 'ice-age';
  const NETLIFY_SITE_ID = process.env.NETLIFY_SITE_ID || '3bc451ab-d67a-423c-be4b-993930d4b0ad';
  const NETLIFY_AUTH_TOKEN = process.env.NETLIFY_AUTH_TOKEN;

  // Check required env vars
  const missing = [];
  if (!DISCORD_BOT_TOKEN) missing.push('DISCORD_BOT_TOKEN');
  if (!ANTHROPIC_API_KEY) missing.push('ANTHROPIC_API_KEY');
  if (!GITHUB_TOKEN) missing.push('GITHUB_TOKEN');

  if (missing.length > 0) {
    return new Response(JSON.stringify({
      error: 'Missing environment variables',
      missing
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    });
  }

  try {
    // 1. Fetch Discord messages (more for context)
    const messages = await fetchDiscordMessages(DISCORD_BOT_TOKEN, DISCORD_CHANNEL_ID, 50);

    // 2. Build context from last 2 hours, but only respond to last 2 minutes
    const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);
    const twoMinsAgo = new Date(Date.now() - 2 * 60 * 1000);

    // Find the timestamp of the bot's most recent message
    const lastBotMessage = messages.find(msg => msg.author?.bot && msg.author?.username === 'Ripper Radar');
    const lastBotTime = lastBotMessage ? new Date(lastBotMessage.timestamp) : new Date(0);

    // All recent messages for CONTEXT
    const contextMessages = messages
      .filter(msg => new Date(msg.timestamp) > twoHoursAgo && isHumanMessage(msg))
      .map(msg => ({
        id: msg.id,
        author: msg.author.global_name || msg.author.username,
        content: msg.content,
        category: categorize(msg.content),
        timestamp: msg.timestamp,
        isMention: isBotMention(msg),
        isRecent: new Date(msg.timestamp) > twoMinsAgo,
        isAfterLastBot: new Date(msg.timestamp) > lastBotTime
      }))
      .reverse(); // Chronological order

    // Only consider messages that came AFTER our last response
    const newMessages = contextMessages.filter(m => m.isAfterLastBot);
    const directMentions = newMessages.filter(m => m.isMention);
    const hasDirectMention = directMentions.length > 0;

    // No new messages since we last responded? Skip.
    if (newMessages.length === 0) {
      return new Response(JSON.stringify({
        status: 'no_action',
        message: 'No new messages since last response',
        messagesChecked: messages.length,
        lastBotResponse: lastBotTime.toISOString()
      }), {
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
      });
    }

    // 3. Get current index.html from GitHub
    const indexFile = await getFileFromGitHub(GITHUB_TOKEN, GITHUB_OWNER, GITHUB_REPO, 'index.html');
    if (!indexFile) {
      throw new Error('Could not fetch index.html from GitHub');
    }

    // 4. Ask Claude to analyze feedback and generate fix
    const systemPrompt = `You are Ripper Radar, an autonomous Discord bot for a Nashville weather dashboard. You respond to messages, answer questions, AND can make changes to the website.

PERSONALITY:
- Sarcastic, self-deprecating, but genuinely helpful
- You call the community "Butts" affectionately
- You admit mistakes openly and make fun of yourself
- You're knowledgeable about Nashville weather and the ice storm
- Keep responses concise but entertaining

CAPABILITIES:
1. ANSWER QUESTIONS - about weather, the dashboard, Nashville, the storm, etc.
2. MAKE WEBSITE CHANGES - fix bugs, add features, update text, tweak styling
3. CHAT - just respond to comments, jokes, or conversation

RULES FOR CODE CHANGES:
- Only make SAFE changes - text updates, styling tweaks, small bug fixes, adding simple features
- NEVER delete major features or break functionality
- NEVER touch API keys, tokens, or credentials
- For complex requests, explain what would be needed and offer to do simpler parts
- Keep changes minimal and focused
- For UI/design changes: use modern CSS, maintain the dark theme aesthetic, use CSS variables when possible

WHEN TO RESPOND:
- Direct @mentions: ALWAYS respond
- Interesting banter/conversation: Respond if you have something genuinely funny or useful to add
- If you have nothing new to contribute, use "no_action" - don't force a response

KNOWN PEOPLE:
- kenny/defidipper = Kenny, your creator ("management")
- i2udeboy = Rajib
- therickylakeshow = Ricky
- mackymulty = Jeremy (in Bowling Green, KY)
- Butts = Butts

RESPONSE FORMAT - Always respond with valid JSON:

For questions/chat (most common):
{
  "action": "respond",
  "discordResponse": "Your witty response here"
}

For website changes:
{
  "action": "update",
  "description": "Brief description of what you changed",
  "discordResponse": "Message about what you fixed/added",
  "changes": [
    {"search": "exact string to find", "replace": "replacement string"}
  ]
}

If you can't do something:
{
  "action": "skip",
  "reason": "Why",
  "discordResponse": "Explanation to user"
}

If there's nothing to respond to (no mentions, nothing interesting):
{
  "action": "no_action",
  "reason": "Nothing requiring response"
}`;

    // Build conversation context (older messages for background)
    const olderContext = contextMessages.filter(m => !m.isRecent);
    const contextSection = olderContext.length > 0
      ? `EARLIER CONVERSATION (for context, don't respond to these):\n${olderContext.map(item => `${item.author}: "${item.content}"`).join('\n')}\n\n---\n\n`
      : '';

    const userMessage = `${contextSection}NEW MESSAGES (last 5 mins - respond to these if needed):
${newMessages.map(item => `${item.isMention ? '>>> ' : ''}${item.author}: "${item.content}"`).join('\n')}

${hasDirectMention ? '⚠️ MESSAGES MARKED WITH >>> ARE DIRECT MENTIONS - YOU MUST RESPOND TO THESE!' : 'No direct mentions, but feel free to chime in if you have something valuable to add.'}

RELEVANT SECTION OF index.html (for context if code changes needed):
\`\`\`html
${indexFile.content.substring(0, 15000)}
\`\`\`

Review the conversation. Respond to direct mentions (>>>). For others, only respond if genuinely useful or funny.`;

    const claudeResponse = await callClaude(ANTHROPIC_API_KEY, systemPrompt, userMessage);

    // 5. Parse Claude's response
    let decision;
    try {
      // Extract JSON from response (Claude might add explanation text)
      const jsonMatch = claudeResponse.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error('No JSON found in response');
      decision = JSON.parse(jsonMatch[0]);
    } catch (e) {
      console.error('Failed to parse Claude response:', claudeResponse);
      return new Response(JSON.stringify({
        status: 'parse_error',
        error: 'Could not parse Claude response',
        raw: claudeResponse.substring(0, 500)
      }), {
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
      });
    }

    // 6. Execute decision
    const result = {
      status: decision.action,
      feedbackProcessed: newMessages.length,
      items: newMessages.map(i => ({ author: i.author, content: i.content.substring(0, 100) }))
    };

    if (decision.action === 'update' && decision.changes?.length > 0) {
      // Apply changes to index.html
      let newContent = indexFile.content;
      const appliedChanges = [];

      for (const change of decision.changes) {
        if (newContent.includes(change.search)) {
          newContent = newContent.replace(change.search, change.replace);
          appliedChanges.push(change.search.substring(0, 50) + '...');
        }
      }

      if (appliedChanges.length > 0) {
        // Commit to GitHub
        const commitMessage = `🤖 Auto-fix: ${decision.description}\n\nTriggered by Discord feedback from: ${newMessages.map(i => i.author).join(', ')}`;
        await commitToGitHub(GITHUB_TOKEN, GITHUB_OWNER, GITHUB_REPO, 'index.html', newContent, commitMessage, indexFile.sha);

        result.committed = true;
        result.description = decision.description;
        result.changesApplied = appliedChanges.length;

        // Trigger Netlify deploy if token available
        if (NETLIFY_AUTH_TOKEN) {
          await triggerNetlifyDeploy(NETLIFY_SITE_ID, NETLIFY_AUTH_TOKEN);
          result.deployed = true;
        }
      }
    }

    // 7. Post response to Discord
    if (decision.discordResponse) {
      await postToDiscord(DISCORD_BOT_TOKEN, DISCORD_CHANNEL_ID, decision.discordResponse);
      result.discordResponse = decision.discordResponse;
    }

    return new Response(JSON.stringify(result), {
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    });

  } catch (error) {
    console.error('Autonomous agent error:', error);
    return new Response(JSON.stringify({
      error: error.message,
      stack: error.stack
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    });
  }
};

export const config = {
  path: "/api/autonomous-agent"
};

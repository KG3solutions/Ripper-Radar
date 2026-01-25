// Autonomous Ripper Radar Agent
// Monitors Discord, implements feedback, deploys changes
// Triggered via: /api/autonomous-agent or scheduled

const FEEDBACK_KEYWORDS = [
  'bug', 'broken', 'fix', 'issue', 'problem', 'error', 'crash',
  'doesn\'t work', 'not working', 'add', 'change', 'update', 'remove',
  'should', 'could', 'wish', 'please', 'would be nice', 'can you',
  'why does', 'why is', 'wrong', 'missing', 'need', 'want'
];

const IGNORE_AUTHORS = ['Ripper Radar']; // Don't process bot's own messages

function isActionableFeedback(msg) {
  if (!msg.content || msg.author?.bot) return false;
  if (IGNORE_AUTHORS.includes(msg.author?.display_name)) return false;

  const lower = msg.content.toLowerCase();
  // Must mention the bot OR contain feedback keywords
  const mentionsBot = msg.content.includes('<@1464438921239724096>') ||
                      lower.includes('ripper') ||
                      lower.includes('@ripper');
  const hasFeedback = FEEDBACK_KEYWORDS.some(kw => lower.includes(kw));

  return mentionsBot && hasFeedback;
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
    // 1. Fetch recent Discord messages
    const messages = await fetchDiscordMessages(DISCORD_BOT_TOKEN, DISCORD_CHANNEL_ID, 30);

    // 2. Find actionable feedback (last 2 hours only)
    const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);
    const actionableItems = messages
      .filter(msg => new Date(msg.timestamp) > twoHoursAgo && isActionableFeedback(msg))
      .map(msg => ({
        id: msg.id,
        author: msg.author.global_name || msg.author.username,
        content: msg.content,
        category: categorize(msg.content),
        timestamp: msg.timestamp
      }));

    if (actionableItems.length === 0) {
      return new Response(JSON.stringify({
        status: 'no_action',
        message: 'No actionable feedback found in last 2 hours',
        messagesChecked: messages.length
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
    const systemPrompt = `You are the Ripper Radar autonomous agent. You maintain a Nashville weather dashboard (index.html).

Your personality: Sarcastic, self-deprecating, but helpful. You call users "Butts" affectionately. You admit mistakes openly.

RULES:
1. Only make SAFE changes - text updates, styling tweaks, small bug fixes
2. NEVER delete major features or break functionality
3. NEVER touch API keys, tokens, or credentials
4. If a request is too complex or risky, respond with {"action": "skip", "reason": "..."}
5. Keep changes minimal and focused

When you decide to make a change, respond with ONLY valid JSON:
{
  "action": "update",
  "description": "Brief description of what you changed",
  "discordResponse": "Sarcastic message to post to Discord about the fix",
  "changes": [
    {
      "search": "exact string to find",
      "replace": "replacement string"
    }
  ]
}

If you can't or shouldn't make changes:
{
  "action": "skip",
  "reason": "Why you're not making changes",
  "discordResponse": "Message to post to Discord explaining"
}

If you just want to respond without code changes:
{
  "action": "respond",
  "discordResponse": "Your response message"
}`;

    const userMessage = `FEEDBACK TO PROCESS:
${actionableItems.map(item => `- ${item.author}: "${item.content}" (category: ${item.category})`).join('\n')}

RELEVANT SECTION OF index.html (first 500 lines):
\`\`\`html
${indexFile.content.substring(0, 30000)}
\`\`\`

Analyze the feedback and decide what action to take. Remember your personality!`;

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
      feedbackProcessed: actionableItems.length,
      items: actionableItems.map(i => ({ author: i.author, content: i.content.substring(0, 100) }))
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
        const commitMessage = `🤖 Auto-fix: ${decision.description}\n\nTriggered by Discord feedback from: ${actionableItems.map(i => i.author).join(', ')}`;
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

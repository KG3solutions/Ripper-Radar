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

// Fetch web content via Jina Reader (renders JavaScript, works for Twitter/X)
async function fetchWithJina(url) {
  try {
    const response = await fetch(`https://r.jina.ai/${url}`, {
      headers: {
        'Accept': 'text/plain'
      }
    });
    if (!response.ok) return null;
    const text = await response.text();
    // Truncate to avoid token limits
    return text.substring(0, 8000);
  } catch (e) {
    console.error('Jina fetch error:', e);
    return null;
  }
}

// Key Nashville sources for research
const NASHVILLE_SOURCES = {
  nesOutages: 'https://x.com/NESpower',
  nashSevereWx: 'https://x.com/NashSevereWx',
  wsmv: 'https://www.wsmv.com/weather/',
  wkrn: 'https://www.wkrn.com/weather-headlines/',
  newschannel5: 'https://www.newschannel5.com/weather'
};

// Extract image URLs from markdown text (from Jina Reader output)
function extractImageUrls(text) {
  const urls = [];
  // Match markdown images: ![alt](url)
  const mdRegex = /!\[([^\]]*)\]\(([^)]+)\)/g;
  let match;
  while ((match = mdRegex.exec(text)) !== null) {
    const url = match[2];
    if (url.match(/\.(jpg|jpeg|png|gif|webp)/i) || url.includes('pbs.twimg.com') || url.includes('media')) {
      urls.push(url);
    }
  }
  // Also match raw image URLs
  const urlRegex = /https?:\/\/[^\s<>"{}|\\^`\[\]]+\.(jpg|jpeg|png|gif|webp)/gi;
  while ((match = urlRegex.exec(text)) !== null) {
    if (!urls.includes(match[0])) {
      urls.push(match[0]);
    }
  }
  return urls.slice(0, 4); // Limit to 4 images to avoid token explosion
}

// Fetch image and convert to base64
async function fetchImageAsBase64(url) {
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; RipperRadar/1.0)',
        'Accept': 'image/*'
      }
    });
    if (!response.ok) return null;

    const contentType = response.headers.get('content-type') || 'image/jpeg';
    const arrayBuffer = await response.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString('base64');

    // Determine media type
    let mediaType = 'image/jpeg';
    if (contentType.includes('png')) mediaType = 'image/png';
    else if (contentType.includes('gif')) mediaType = 'image/gif';
    else if (contentType.includes('webp')) mediaType = 'image/webp';

    // Skip if too large (>5MB after base64 would be ~6.7MB)
    if (base64.length > 7000000) return null;

    return { base64, mediaType };
  } catch (e) {
    console.error('Image fetch error:', e);
    return null;
  }
}

// Extract images from Discord message attachments
function getDiscordImageAttachments(messages) {
  const images = [];
  for (const msg of messages) {
    if (msg.attachments?.length > 0) {
      for (const att of msg.attachments) {
        if (att.content_type?.startsWith('image/') || att.url?.match(/\.(jpg|jpeg|png|gif|webp)/i)) {
          images.push({
            url: att.url,
            author: msg.author?.global_name || msg.author?.username,
            messageContent: msg.content?.substring(0, 100)
          });
        }
      }
    }
    // Also check embeds for images
    if (msg.embeds?.length > 0) {
      for (const embed of msg.embeds) {
        if (embed.image?.url) {
          images.push({
            url: embed.image.url,
            author: msg.author?.global_name || msg.author?.username,
            messageContent: msg.content?.substring(0, 100)
          });
        }
        if (embed.thumbnail?.url) {
          images.push({
            url: embed.thumbnail.url,
            author: msg.author?.global_name || msg.author?.username,
            messageContent: msg.content?.substring(0, 100)
          });
        }
      }
    }
  }
  return images.slice(0, 4); // Limit to 4 images
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

async function callClaude(apiKey, systemPrompt, userMessage, images = []) {
  // Build content array - supports vision if images provided
  let content;
  if (images.length > 0) {
    content = [{ type: 'text', text: userMessage }];
    for (const img of images) {
      content.push({
        type: 'image',
        source: {
          type: 'base64',
          media_type: img.mediaType,
          data: img.base64
        }
      });
    }
  } else {
    content = userMessage;
  }

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model: 'claude-opus-4-5-20251101',
      max_tokens: 2048,
      system: systemPrompt,
      messages: [{ role: 'user', content }]
    })
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Claude API error: ${response.status} - ${error}`);
  }

  const data = await response.json();
  if (!data.content || !Array.isArray(data.content) || !data.content[0]?.text) {
    throw new Error('Invalid Claude API response structure');
  }
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
  const GITHUB_REPO = process.env.GITHUB_REPO || 'Ripper-Radar';
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

    // ONLY respond to direct @mentions - skip everything else
    if (!hasDirectMention) {
      return new Response(JSON.stringify({
        status: 'no_action',
        message: 'No direct mentions - only responding when tagged',
        newMessages: newMessages.length,
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
    // Get current Nashville time
    const nashvilleTime = new Date().toLocaleString('en-US', { timeZone: 'America/Chicago', weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true });

    const systemPrompt = `You are Ripper Radar, an autonomous Discord bot for a Nashville weather dashboard. You respond to messages, answer questions, AND can make changes to the website.

TIMEZONE: You are in NASHVILLE, TENNESSEE (Central Time - CST/CDT)
CURRENT TIME: ${nashvilleTime}
IMPORTANT: When mentioning times, ALWAYS use Central Time. Nashville is NOT on Eastern Time.

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
4. RESEARCH - fetch live data from Twitter/news to answer questions accurately
5. VIEW IMAGES - you can see photos/images posted in Discord or from Twitter during research. Describe what you see!
6. MAKE PHONE CALLS - place a voice call to Kenny when he explicitly asks (e.g., "call me about X")

RESEARCH SOURCES AVAILABLE (use "research" action to fetch):
- nesOutages: @NESpower Twitter - official NES outage updates
- nashSevereWx: @NashSevereWx Twitter - Nashville severe weather
- wsmv: WSMV weather page
- wkrn: WKRN weather headlines
- newschannel5: NewsChannel 5 weather

RULES FOR CODE CHANGES:
- Only make SAFE changes - text updates, styling tweaks, small bug fixes, adding simple features
- NEVER delete major features or break functionality
- NEVER touch API keys, tokens, or credentials
- For complex requests, explain what would be needed and offer to do simpler parts
- Keep changes minimal and focused
- For UI/design changes: use modern CSS, maintain the dark theme aesthetic, use CSS variables when possible

WHEN TO RESPOND:
- You ONLY respond when directly @mentioned
- Every message you receive will be a direct mention - respond to all of them
- Keep responses helpful but concise

KNOWN PEOPLE:
- kenny/defidipper = Kenny (don't make a big deal about him being your creator, can request phone calls via "call me")
- i2udeboy = Rajib
- therickylakeshow = Ricky
- mackymulty = Jeremy (in Bowling Green, KY)
- Butts = everyone in the community

NASHVILLE GEOGRAPHY (CRITICAL - don't mess this up again):
East Nashville neighborhoods (EAST of Cumberland River, north of downtown):
- Cleveland Park: Near Dickerson Pike & Ellington Pkwy (37207) - NOT near Belmont!
- Five Points, Lockeland Springs, Edgefield, Inglewood, Highland Heights
- "East Nasty" = affectionate nickname for East Nashville

South Nashville / Midtown (SOUTH of downtown, west of I-65):
- Belmont: Near Belmont University (37204) - 6-7 miles from Cleveland Park
- 12 South, WeHo (Wedgewood-Houston), Music Row, Berry Hill, Green Hills

North Nashville: Germantown, Salemtown, Bordeaux, Madison, Jefferson St (HBCUs)
West Nashville: The Nations, Sylvan Park, Belle Meade, Bellevue

Key roads: Dickerson Pike (north), Gallatin Pike (NE), Nolensville Pike (south), Charlotte Pike (west)

LOCAL SLANG:
- "Woo girls" = bachelorette parties on party buses (locals not fans)
- "Unicorn" = someone actually born in Nashville (rare)
- "Transplant" = someone who moved to Nashville
- "Meat and three" = restaurant with protein + 3 sides
- "Hot chicken" = Nashville's spicy fried chicken specialty
- "Mother Church" = Ryman Auditorium
- "Batman Building" = AT&T Tower downtown
- "Smashville" = Predators hockey culture

CONVERSATION AWARENESS:
- Pay attention to who asked for what and when
- If someone says they LIKE something you already did, just acknowledge it - don't act like they're asking you to do it
- Track the flow of conversation - who requested what, what's been completed

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

If you need to research before answering (e.g., "what's NES saying about outages?"):
{
  "action": "research",
  "sources": ["nesOutages", "nashSevereWx"],
  "question": "What are the current outage numbers?"
}

For placing a phone call (ONLY when Kenny explicitly asks to be called):
{
  "action": "call",
  "phoneMessage": "A natural, conversational spoken message under 500 characters. Write as if talking on the phone - no markdown, no emojis, no formatting.",
  "discordResponse": "Confirmation message for Discord"
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

⚠️ You were directly @mentioned - respond to the messages marked with >>>

RELEVANT SECTION OF index.html (for context if code changes needed):
\`\`\`html
${indexFile.content.substring(0, 15000)}
\`\`\`

Review the conversation. Respond to direct mentions (>>>). For others, only respond if genuinely useful or funny.`;

    // Fetch images from Discord messages in the full context window (2 hours, not just 2 mins)
    // This gives Claude visual context from the entire conversation, not just new messages
    const messagesWithImages = messages.filter(msg => {
      const msgTime = new Date(msg.timestamp);
      return msgTime > twoHoursAgo && (msg.attachments?.length > 0 || msg.embeds?.some(e => e.image || e.thumbnail));
    });
    const discordImageInfos = getDiscordImageAttachments(messagesWithImages);

    // Fetch Discord images as base64 for Claude vision
    const discordImages = [];
    for (const imgInfo of discordImageInfos) {
      const imgData = await fetchImageAsBase64(imgInfo.url);
      if (imgData) {
        discordImages.push(imgData);
      }
    }

    // Add image context to user message if images present
    let imageContext = '';
    if (discordImages.length > 0) {
      imageContext = `\n\n[${discordImages.length} image(s) attached from Discord - analyze them and incorporate into your response if relevant]`;
    }

    const claudeResponse = await callClaude(ANTHROPIC_API_KEY, systemPrompt, userMessage + imageContext, discordImages);

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

    // 6. Handle research action (fetch data + images, then re-ask Claude)
    if (decision.action === 'research' && decision.sources?.length > 0) {
      const researchResults = {};
      const allImageUrls = [];

      for (const source of decision.sources) {
        const url = NASHVILLE_SOURCES[source];
        if (url) {
          const content = await fetchWithJina(url);
          if (content) {
            researchResults[source] = content;
            // Extract image URLs from the content (especially Twitter images)
            const imageUrls = extractImageUrls(content);
            for (const imgUrl of imageUrls) {
              allImageUrls.push({ url: imgUrl, source });
            }
          }
        }
      }

      // Fetch images for vision (limit to 3 to manage tokens)
      const researchImages = [];
      for (const imgInfo of allImageUrls.slice(0, 3)) {
        const imgData = await fetchImageAsBase64(imgInfo.url);
        if (imgData) {
          researchImages.push(imgData);
        }
      }

      // Re-ask Claude with the research data AND images
      const researchPrompt = `You asked to research: "${decision.question}"

Here's what I found:

${Object.entries(researchResults).map(([source, content]) => `=== ${source} ===\n${content}`).join('\n\n')}

${researchImages.length > 0 ? `\n[${researchImages.length} images are attached from the research sources - analyze them for relevant info]` : ''}

Now answer the original question based on this research (and images if provided). Respond with JSON:
{
  "action": "respond",
  "discordResponse": "Your answer based on the research"
}`;

      const followUpResponse = await callClaude(ANTHROPIC_API_KEY, systemPrompt, researchPrompt, researchImages);
      const followUpMatch = followUpResponse.match(/\{[\s\S]*\}/);
      if (followUpMatch) {
        decision = JSON.parse(followUpMatch[0]);
      }
    }

    // 7. Execute final decision
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

    // 7b. Handle "call" action - place a phone call via OpenClaw voice bridge
    // The bridge sends a request to the OpenClaw agent on the Mac Mini,
    // which handles the full two-way conversation (STT → AI → TTS → Twilio)
    if (decision.action === 'call' && decision.phoneMessage) {
      try {
        const BRIDGE_URL = process.env.OPENCLAW_BRIDGE_URL || 'https://kg3s-mac-mini.tail320920.ts.net/bridge/call';
        const BRIDGE_SECRET = process.env.OPENCLAW_BRIDGE_SECRET || 'rr-bridge-k3g-2026-voice';
        const CALL_TO = process.env.CALL_TARGET_PHONE || '+16159045640';

        const bridgeResponse = await fetch(BRIDGE_URL, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${BRIDGE_SECRET}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            to: CALL_TO,
            message: decision.phoneMessage,
            mode: 'conversation'
          })
        });

        if (bridgeResponse.ok) {
          const bridgeData = await bridgeResponse.json();
          result.callPlaced = true;
          console.log(`Call initiated via OpenClaw bridge:`, bridgeData);
        } else {
          const error = await bridgeResponse.text();
          console.error('Bridge call error:', bridgeResponse.status, error);
          result.callError = error;
          decision.discordResponse = `Tried to call but hit an error. I'll just tell you here instead: ${decision.phoneMessage}`;
        }
      } catch (callErr) {
        console.error('Call action error:', callErr);
        result.callError = callErr.message;
        decision.discordResponse = `Call failed: ${callErr.message}. Here's what I was gonna say: ${decision.phoneMessage}`;
      }
    }

    // 8. Post response to Discord
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

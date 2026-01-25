# Discord Bot Setup for Butt's Barometer

This guide walks you through setting up a Discord bot to display #butts-barometer channel messages on the storm dashboard.

## Step 1: Create a Discord Application & Bot

1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Click **"New Application"**
3. Name it something like "Storm Dashboard Bot"
4. Go to the **"Bot"** tab in the left sidebar
5. Click **"Add Bot"**
6. Under the bot's username, click **"Reset Token"** and copy the token
   - **SAVE THIS TOKEN** - you'll need it for Netlify

## Step 2: Enable Required Intents

Still in the Bot tab:
1. Scroll down to **"Privileged Gateway Intents"**
2. Enable **"MESSAGE CONTENT INTENT"** - this is required to read message content
3. Save changes

## Step 3: Invite Bot to Your Server

1. Go to the **"OAuth2"** tab → **"URL Generator"**
2. Under **"Scopes"**, check:
   - `bot`
3. Under **"Bot Permissions"**, check:
   - `Read Messages/View Channels`
   - `Read Message History`
4. Copy the generated URL at the bottom
5. Open the URL in your browser and add the bot to your server

## Step 4: Get Channel ID

1. In Discord, go to **User Settings** → **Advanced** → Enable **"Developer Mode"**
2. Right-click on **#butts-barometer** channel
3. Click **"Copy Channel ID"**
4. Save this ID

## Step 5: Configure Netlify Environment Variables

In your Netlify dashboard:
1. Go to your site → **Site Settings** → **Environment Variables**
2. Add these variables:

| Key | Value |
|-----|-------|
| `DISCORD_BOT_TOKEN` | The bot token from Step 1 |
| `DISCORD_CHANNEL_ID` | The channel ID from Step 4 |

3. **Redeploy** the site for changes to take effect

## Step 6: Deploy to Netlify

```bash
# If not already connected to Netlify
netlify init

# Deploy
netlify deploy --prod
```

Or just push to your connected Git repository.

## Troubleshooting

### "Bot token not configured"
- Make sure `DISCORD_BOT_TOKEN` is set in Netlify environment variables
- Redeploy after adding environment variables

### "Missing Access" or 403 errors
- Make sure the bot has been added to the server
- Verify the bot has permission to read the channel
- Check that the channel ID is correct

### "MESSAGE_CONTENT" errors
- Enable MESSAGE CONTENT INTENT in Discord Developer Portal
- The bot needs this to read message text (Discord privacy requirement)

### Messages not updating
- The dashboard auto-refreshes every 30 seconds
- Click the refresh button to manually update
- Check browser console for errors

## File Structure

```
ice-age/
├── nashville-storm-dashboard.html   # Main dashboard
├── netlify.toml                      # Netlify configuration
├── netlify/
│   └── functions/
│       └── discord-messages.js       # Serverless function
└── DISCORD_BOT_SETUP.md             # This file
```

## Security Notes

- Never commit your bot token to version control
- The bot token is stored securely in Netlify's environment variables
- The serverless function acts as a proxy, so your token is never exposed to the browser

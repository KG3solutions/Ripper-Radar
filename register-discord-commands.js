#!/usr/bin/env node
// Run this ONCE to register slash commands with Discord
// Usage: DISCORD_BOT_TOKEN=xxx DISCORD_APP_ID=xxx node register-discord-commands.js

const BOT_TOKEN = process.env.DISCORD_BOT_TOKEN;
const APP_ID = process.env.DISCORD_APP_ID || '1464438921239724096'; // Your bot's application ID

if (!BOT_TOKEN) {
  console.error('Missing DISCORD_BOT_TOKEN environment variable');
  process.exit(1);
}

const commands = [
  {
    name: 'feedback',
    description: 'Send feedback about Ripper Radar',
    options: [
      {
        name: 'message',
        description: 'Your feedback message',
        type: 3, // STRING
        required: true
      }
    ]
  },
  {
    name: 'weather',
    description: 'Get current Nashville weather conditions'
  },
  {
    name: 'alert',
    description: 'Post an alert to the channel (admin only)',
    options: [
      {
        name: 'type',
        description: 'Type of alert',
        type: 3, // STRING
        required: true,
        choices: [
          { name: 'Weather Alert', value: 'weather' },
          { name: 'Road Conditions', value: 'road' },
          { name: 'Dispatch/Emergency', value: 'dispatch' },
          { name: 'General Info', value: 'info' }
        ]
      },
      {
        name: 'message',
        description: 'Alert message',
        type: 3, // STRING
        required: true
      }
    ]
  }
];

async function registerCommands() {
  const url = `https://discord.com/api/v10/applications/${APP_ID}/commands`;

  const response = await fetch(url, {
    method: 'PUT',
    headers: {
      'Authorization': `Bot ${BOT_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(commands)
  });

  if (response.ok) {
    const data = await response.json();
    console.log('✅ Successfully registered commands:');
    data.forEach(cmd => console.log(`  - /${cmd.name}`));
  } else {
    const error = await response.text();
    console.error('❌ Failed to register commands:', response.status, error);
  }
}

registerCommands();

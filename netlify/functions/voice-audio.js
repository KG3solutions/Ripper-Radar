// Serves ElevenLabs TTS audio to Twilio's <Play> verb
// Called by Twilio when a call connects - generates speech and returns audio/mpeg

import { getStore } from "@netlify/blobs";
import { createHmac } from "crypto";

export default async (request, context) => {
  const url = new URL(request.url);
  const id = url.searchParams.get('id');
  const token = url.searchParams.get('token');

  if (!id || !token) {
    return new Response('Missing parameters', { status: 400 });
  }

  // Validate HMAC token
  const secret = process.env.VOICE_AUTH_SECRET;
  if (!secret) {
    console.error('VOICE_AUTH_SECRET not configured');
    return new Response('Server misconfigured', { status: 500 });
  }

  const expectedToken = createHmac('sha256', secret).update(id).digest('hex');
  if (token !== expectedToken) {
    return new Response('Unauthorized', { status: 401 });
  }

  // Read message from Netlify Blobs
  const store = getStore("voice-messages");
  const messageData = await store.get(id, { type: "json" });

  if (!messageData) {
    return new Response('Message not found', { status: 404 });
  }

  // Generate audio via ElevenLabs TTS
  const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;
  const ELEVENLABS_VOICE_ID = process.env.ELEVENLABS_VOICE_ID || 'QJrONwNzATN7Bgq1GgqK';

  const ttsResponse = await fetch(
    `https://api.elevenlabs.io/v1/text-to-speech/${ELEVENLABS_VOICE_ID}?output_format=mp3_44100_128`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'xi-api-key': ELEVENLABS_API_KEY
      },
      body: JSON.stringify({
        text: messageData.text,
        model_id: 'eleven_multilingual_v2',
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.75
        }
      })
    }
  );

  if (!ttsResponse.ok) {
    const err = await ttsResponse.text();
    console.error('ElevenLabs TTS error:', ttsResponse.status, err);
    return new Response('TTS generation failed', { status: 502 });
  }

  const audioBuffer = await ttsResponse.arrayBuffer();

  // Cleanup: delete the blob (one-time use)
  await store.delete(id).catch(() => {});

  return new Response(audioBuffer, {
    headers: {
      'Content-Type': 'audio/mpeg',
      'Cache-Control': 'no-cache, no-store'
    }
  });
};

export const config = {
  path: "/api/voice-audio"
};

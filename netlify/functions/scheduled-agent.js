// Scheduled trigger for autonomous agent
// Runs every 5 minutes

export default async function handler(req) {
  try {
    // Call the autonomous agent endpoint
    const response = await fetch('https://ripper-radar.netlify.app/api/autonomous-agent');
    const result = await response.json();

    console.log('Scheduled agent run:', JSON.stringify(result));

    return Response.json({
      triggered: true,
      timestamp: new Date().toISOString(),
      result
    });
  } catch (error) {
    console.error('Scheduled agent error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}

export const config = {
  schedule: "*/5 * * * *"
};

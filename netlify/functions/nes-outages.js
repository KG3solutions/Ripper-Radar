// Proxy for NES Outage API - fetches live outage data from Utilisocial
// Endpoint: https://utilisocial.io/datacapable/v2/p/NES/map/events

export default async (request, context) => {
  // CORS
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });
  }

  try {
    console.log('Fetching NES outage data from Utilisocial API...');

    const response = await fetch(
      'https://utilisocial.io/datacapable/v2/p/NES/map/events',
      {
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'RipperRadar/1.0'
        }
      }
    );

    if (!response.ok) {
      throw new Error(`NES API error: ${response.status}`);
    }

    const rawData = await response.json();

    // Process and enrich the data
    const now = Date.now();
    const outages = (rawData || []).map(outage => ({
      id: outage.id,
      title: outage.title || 'Outage',
      status: outage.status || 'Unknown',
      numPeople: outage.numPeople || 0,
      cause: outage.cause || 'Unknown',
      latitude: outage.latitude,
      longitude: outage.longitude,
      startTime: outage.startTime,
      lastUpdatedTime: outage.lastUpdatedTime,
      // Calculated fields
      durationMinutes: outage.startTime ? Math.round((now - outage.startTime) / 60000) : null,
      durationHours: outage.startTime ? ((now - outage.startTime) / 3600000).toFixed(1) : null,
      isAssigned: outage.status === 'Assigned',
      isLongOutage: outage.startTime ? (now - outage.startTime) > 4 * 3600000 : false, // > 4 hours
    }));

    // Calculate summary stats
    const totalOutages = outages.length;
    const totalAffected = outages.reduce((sum, o) => sum + o.numPeople, 0);
    const assignedOutages = outages.filter(o => o.isAssigned).length;
    const unassignedOutages = outages.filter(o => !o.isAssigned).length;
    const assignedAffected = outages.filter(o => o.isAssigned).reduce((sum, o) => sum + o.numPeople, 0);
    const unassignedAffected = outages.filter(o => !o.isAssigned).reduce((sum, o) => sum + o.numPeople, 0);
    const longOutages = outages.filter(o => o.isLongOutage).length;

    // Group by cause
    const causeBreakdown = {};
    outages.forEach(o => {
      const cause = o.cause || 'Unknown';
      if (!causeBreakdown[cause]) {
        causeBreakdown[cause] = { count: 0, affected: 0 };
      }
      causeBreakdown[cause].count++;
      causeBreakdown[cause].affected += o.numPeople;
    });

    // Calculate average duration
    const outagesWithDuration = outages.filter(o => o.durationMinutes !== null);
    const avgDurationMinutes = outagesWithDuration.length > 0
      ? Math.round(outagesWithDuration.reduce((sum, o) => sum + o.durationMinutes, 0) / outagesWithDuration.length)
      : 0;

    const result = {
      timestamp: new Date().toISOString(),
      source: 'NES Utilisocial API',
      summary: {
        totalOutages,
        totalAffected,
        assignedOutages,
        unassignedOutages,
        assignedAffected,
        unassignedAffected,
        longOutages,
        avgDurationMinutes,
        crewCoveragePercent: totalOutages > 0 ? Math.round((assignedOutages / totalOutages) * 100) : 100
      },
      causeBreakdown,
      outages
    };

    console.log(`NES API: ${totalOutages} outages, ${totalAffected} affected, ${assignedOutages} assigned`);

    return new Response(JSON.stringify(result, null, 2), {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'public, max-age=60' // Cache 1 minute
      }
    });

  } catch (error) {
    console.error('NES API proxy error:', error);
    return new Response(JSON.stringify({
      error: 'Failed to fetch NES outage data',
      details: error.message,
      timestamp: new Date().toISOString()
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  }
};

export const config = {
  path: "/api/nes-outages"
};

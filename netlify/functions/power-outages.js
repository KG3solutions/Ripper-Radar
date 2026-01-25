// Power Outage data from ORNL ODIN (Open Data for Infrastructure in the Nation)
// Tracks storm impact along the path toward Nashville

// States along the storm path (west to east toward Nashville)
// API returns full state names, not abbreviations
const STORM_PATH_STATES = ['Mississippi', 'Alabama', 'Tennessee', 'Kentucky', 'Georgia', 'Arkansas', 'Louisiana'];
const STATE_ABBREV = {
  'Mississippi': 'MS',
  'Alabama': 'AL',
  'Tennessee': 'TN',
  'Kentucky': 'KY',
  'Georgia': 'GA',
  'Arkansas': 'AR',
  'Louisiana': 'LA'
};

// Key counties to monitor (storm path toward Nashville)
const KEY_COUNTIES = {
  'MS': ['Hinds', 'Madison', 'Rankin', 'DeSoto', 'Lee', 'Lauderdale', 'Lowndes', 'Oktibbeha'],
  'AL': ['Jefferson', 'Madison', 'Morgan', 'Tuscaloosa', 'Colbert', 'Lauderdale', 'Limestone', 'Marshall', 'DeKalb'],
  'TN': ['Davidson', 'Williamson', 'Rutherford', 'Wilson', 'Sumner', 'Robertson', 'Montgomery', 'Shelby', 'Maury', 'Cheatham', 'Dickson'],
  'KY': ['Warren', 'Simpson', 'Logan', 'Christian', 'Todd', 'Trigg'],
  'GA': ['Dade', 'Walker', 'Catoosa', 'Whitfield', 'Murray', 'Floyd', 'Chattooga'],
  'AR': ['Pulaski', 'Craighead', 'Washington', 'Benton'],
  'LA': ['East Baton Rouge', 'Orleans', 'Jefferson', 'Caddo']
};

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
    // Fetch county-level outage data from ORNL ODIN
    const response = await fetch(
      'https://ornl.opendatasoft.com/api/explore/v2.1/catalog/datasets/odin-real-time-outages-county/records?limit=100&order_by=metersaffected%20desc',
      {
        headers: {
          'Accept': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`ODIN API error: ${response.status}`);
    }

    const data = await response.json();

    // Filter for storm path states and convert to abbreviations for frontend
    const stormPathOutages = data.results
      .filter(record => STORM_PATH_STATES.includes(record.state))
      .map(record => {
        const abbrev = STATE_ABBREV[record.state];
        return {
          state: abbrev, // Use abbreviation for frontend compatibility
          stateFull: record.state,
          county: record.county,
          metersAffected: record.metersaffected || 0,
          totalMeters: record.numberofmeters || 0,
          percentOut: record.numberofmeters > 0
            ? ((record.metersaffected / record.numberofmeters) * 100).toFixed(1)
            : 0,
          utility: record.utilityname || 'Unknown',
          reportedStart: record.reportedstarttime,
          estimatedRestore: record.estimatedrestorationtime,
          isKeyCounty: KEY_COUNTIES[abbrev]?.includes(record.county) || false
        };
      });

    // Get abbreviations for grouping (frontend expects abbreviations)
    const STATE_ABBREVS = Object.values(STATE_ABBREV); // ['MS', 'AL', 'TN', 'AR', 'LA']

    // Group by state abbreviation
    const byState = {};
    STATE_ABBREVS.forEach(abbrev => {
      byState[abbrev] = stormPathOutages
        .filter(o => o.state === abbrev)
        .sort((a, b) => b.metersAffected - a.metersAffected);
    });

    // Calculate state totals
    const stateTotals = {};
    STATE_ABBREVS.forEach(abbrev => {
      const stateOutages = byState[abbrev];
      stateTotals[abbrev] = {
        totalAffected: stateOutages.reduce((sum, o) => sum + o.metersAffected, 0),
        totalMeters: stateOutages.reduce((sum, o) => sum + o.totalMeters, 0),
        countyCount: stateOutages.filter(o => o.metersAffected > 0).length
      };
      stateTotals[abbrev].percentOut = stateTotals[abbrev].totalMeters > 0
        ? ((stateTotals[abbrev].totalAffected / stateTotals[abbrev].totalMeters) * 100).toFixed(1)
        : 0;
    });

    // Overall stats
    const totalAffected = stormPathOutages.reduce((sum, o) => sum + o.metersAffected, 0);
    const timestamp = new Date().toISOString();

    return new Response(JSON.stringify({
      timestamp,
      totalAffected,
      stormPath: STATE_ABBREVS, // Return abbreviations for frontend
      stateTotals,
      byState,
      topOutages: stormPathOutages
        .filter(o => o.metersAffected > 1000)
        .slice(0, 20)
    }), {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'public, max-age=300' // Cache for 5 minutes
      }
    });

  } catch (error) {
    return new Response(JSON.stringify({
      error: 'Failed to fetch outage data',
      details: error.message
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
  path: "/api/power-outages"
};

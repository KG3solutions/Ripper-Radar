// Scheduled agent to fetch and update outage data every 30 minutes
// Data sources: ORNL ODIN API for utility-level outages

const UTILITIES = {
  'NES': {
    name: 'Nashville Electric Service',
    searchTerms: ['Nashville Electric', 'NES'],
    customers: 470000,
    type: 'municipal'
  },
  'MTE': {
    name: 'Middle Tennessee Electric',
    searchTerms: ['Middle Tennessee Electric', 'MTE'],
    customers: 345000,
    type: 'cooperative'
  },
  'CEMC': {
    name: 'Cumberland Electric Membership',
    searchTerms: ['Cumberland Electric', 'CEMC'],
    customers: 130000,
    type: 'cooperative'
  },
  'Dickson': {
    name: 'Dickson Electric System',
    searchTerms: ['Dickson Electric', 'DES'],
    customers: 30000,
    type: 'cooperative'
  },
  'DREMC': {
    name: 'Duck River Electric',
    searchTerms: ['Duck River Electric', 'DREMC'],
    customers: 75000,
    type: 'cooperative'
  },
  'Columbia': {
    name: 'Columbia Power & Water',
    searchTerms: ['Columbia Power', 'Columbia Electric'],
    customers: 40000,
    type: 'municipal'
  }
};

// Fetch utility-level data from ORNL ODIN
async function fetchODINUtilityData() {
  try {
    const response = await fetch(
      'https://ornl.opendatasoft.com/api/explore/v2.1/catalog/datasets/odin-real-time-outages-utility/records?limit=100&where=state%3D%22Tennessee%22&order_by=metersaffected%20desc',
      { headers: { 'Accept': 'application/json' } }
    );

    if (!response.ok) {
      throw new Error(`ODIN API error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('ODIN fetch error:', error);
    return null;
  }
}

// Match ODIN utility names to our tracked utilities
function matchUtility(odinName) {
  const upperName = odinName.toUpperCase();
  for (const [key, util] of Object.entries(UTILITIES)) {
    for (const term of util.searchTerms) {
      if (upperName.includes(term.toUpperCase())) {
        return key;
      }
    }
  }
  return null;
}

// Process and aggregate outage data
function processOutageData(odinData) {
  const utilityData = {};
  const timestamp = new Date().toISOString();

  // Initialize all tracked utilities
  for (const [key, util] of Object.entries(UTILITIES)) {
    utilityData[key] = {
      name: util.name,
      type: util.type,
      totalCustomers: util.customers,
      outages: 0,
      restored: 0,
      percentOut: 0,
      percentRestored: 100,
      lastUpdated: timestamp,
      source: 'estimated'
    };
  }

  // Process ODIN data
  if (odinData && odinData.results) {
    for (const record of odinData.results) {
      const utilKey = matchUtility(record.utilityname || '');
      if (utilKey && utilityData[utilKey]) {
        utilityData[utilKey].outages = record.metersaffected || 0;
        utilityData[utilKey].source = 'ODIN';

        const total = utilityData[utilKey].totalCustomers;
        utilityData[utilKey].percentOut = total > 0
          ? ((utilityData[utilKey].outages / total) * 100).toFixed(2)
          : 0;
        utilityData[utilKey].percentRestored = (100 - parseFloat(utilityData[utilKey].percentOut)).toFixed(2);
      }
    }
  }

  return {
    timestamp,
    utilities: utilityData,
    summary: {
      totalTracked: Object.keys(utilityData).length,
      totalOutages: Object.values(utilityData).reduce((sum, u) => sum + u.outages, 0),
      totalCustomers: Object.values(utilityData).reduce((sum, u) => sum + u.totalCustomers, 0)
    }
  };
}

// Main handler - can be called on schedule or via HTTP
export default async (request, context) => {
  // CORS for direct API calls
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
    console.log('Outage Data Agent: Fetching utility data...');

    // Fetch from ODIN
    const odinData = await fetchODINUtilityData();

    // Process and aggregate
    const processedData = processOutageData(odinData);

    console.log(`Outage Data Agent: Processed ${processedData.summary.totalTracked} utilities, ${processedData.summary.totalOutages} total outages`);

    // Return the data
    return new Response(JSON.stringify(processedData, null, 2), {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'public, max-age=300' // Cache 5 min
      }
    });

  } catch (error) {
    console.error('Outage Data Agent error:', error);
    return new Response(JSON.stringify({
      error: 'Failed to fetch outage data',
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

// Netlify scheduled function config
// Note: Scheduled functions cannot have custom paths - use the function name as endpoint
export const config = {
  schedule: "@hourly" // Run every hour (Netlify's minimum for free tier)
};

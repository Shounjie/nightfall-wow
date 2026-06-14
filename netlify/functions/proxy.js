// Nightfall — CORS proxy (Netlify Function)
// Path: netlify/functions/proxy.js
//
// Why this exists:
// Browsers block direct calls from your app to raider.io and wowhead.com
// (CORS). This function runs on Netlify's server, makes the call for you,
// and returns the result with the right headers so your app can read it.
//
// Your app calls:  /api/raiderio?region=eu&realm=ysondre&name=Kram%C3%ABr&fields=gear
//            and:  /api/wowhead?item=12345
// (the redirects in netlify.toml map /api/* to this function)

exports.handler = async (event) => {
  const cors = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type"
  };

  // Preflight
  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 204, headers: cors, body: "" };
  }

  try {
    const params = event.queryStringParameters || {};
    const target = params.target; // "raiderio" or "wowhead"

    let upstreamUrl;

    if (target === "raiderio") {
      const { region, realm, name, fields } = params;
      upstreamUrl =
        "https://raider.io/api/v1/characters/profile" +
        `?region=${encodeURIComponent(region)}` +
        `&realm=${encodeURIComponent(realm)}` +
        `&name=${encodeURIComponent(name)}` +
        `&fields=${encodeURIComponent(fields || "gear,mythic_plus_scores_by_season:current")}`;
    } else if (target === "wowhead") {
      const id = params.item;
      upstreamUrl = `https://www.wowhead.com/item=${encodeURIComponent(id)}&xml`;
    } else {
      return {
        statusCode: 400,
        headers: cors,
        body: JSON.stringify({ message: "Unknown target. Use target=raiderio or target=wowhead." })
      };
    }

    const resp = await fetch(upstreamUrl, {
      headers: { "User-Agent": "Nightfall-App/1.0 (gear optimizer)" }
    });

    const contentType = resp.headers.get("content-type") || "text/plain";
    const body = await resp.text();

    return {
      statusCode: resp.status,
      headers: { ...cors, "Content-Type": contentType },
      body
    };
  } catch (err) {
    return {
      statusCode: 500,
      headers: cors,
      body: JSON.stringify({ message: "Proxy error: " + err.message })
    };
  }
};

// Nightfall — CORS proxy (Netlify Function)
// Handles two routes:
//   /api/raiderio?region=eu&realm=ysondre&name=Kram%C3%ABr&fields=gear
//   /api/wowhead?item=12345

// Origines autorisées à appeler le proxy depuis un navigateur (anti-relais CORS).
const ALLOWED_ORIGINS = [
  "https://nightfall-wow.netlify.app"
];
// Régions WoW valides (allowlist d'entrée — durcit la surface du proxy).
const VALID_REGIONS = ["us", "eu", "kr", "tw", "cn"];

exports.handler = async (event) => {
  const origin = (event.headers && (event.headers.origin || event.headers.Origin)) || "";
  const allowOrigin = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
  const cors = {
    "Access-Control-Allow-Origin": allowOrigin,
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Vary": "Origin"
  };

  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 204, headers: cors, body: "" };
  }

  try {
    const params = event.queryStringParameters || {};
    // Detect route from the path OR from explicit target param
    const path = event.path || "";
    const target = params.target ||
      (path.includes("raiderio") ? "raiderio" :
       path.includes("wowhead")  ? "wowhead"  : null);

    let upstreamUrl;

    if (target === "raiderio") {
      const { region, realm, name, fields } = params;
      if (!region || !realm || !name) {
        return { statusCode: 400, headers: cors, body: JSON.stringify({ message: "Missing region, realm or name" }) };
      }
      if (!VALID_REGIONS.includes(String(region).toLowerCase())) {
        return { statusCode: 400, headers: cors, body: JSON.stringify({ message: "Invalid region" }) };
      }
      upstreamUrl =
        "https://raider.io/api/v1/characters/profile" +
        `?region=${encodeURIComponent(region)}` +
        `&realm=${encodeURIComponent(realm)}` +
        `&name=${encodeURIComponent(name)}` +
        `&fields=${encodeURIComponent(fields || "gear,mythic_plus_scores_by_season:current")}`;

    } else if (target === "wowhead") {
      const id = params.item;
      if (!id) {
        return { statusCode: 400, headers: cors, body: JSON.stringify({ message: "Missing item id" }) };
      }
      upstreamUrl = `https://www.wowhead.com/item=${encodeURIComponent(id)}&xml`;

    } else {
      return {
        statusCode: 400,
        headers: cors,
        body: JSON.stringify({ message: "Unknown route. Use /api/raiderio or /api/wowhead" })
      };
    }

    const resp = await fetch(upstreamUrl, {
      headers: { "User-Agent": "Nightfall-WoW/1.0" }
    });
    const contentType = resp.headers.get("content-type") || "text/plain";
    const body = await resp.text();

    return { statusCode: resp.status, headers: { ...cors, "Content-Type": contentType }, body };

  } catch (err) {
    return { statusCode: 500, headers: cors, body: JSON.stringify({ message: "Proxy error: " + err.message }) };
  }
};

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type"
};
const json = (data, status=200) => new Response(JSON.stringify(data), {status, headers:{...cors,"Content-Type":"application/json; charset=utf-8"}});
export default {
  async fetch(request, env) {
    if (request.method === "OPTIONS") return new Response(null, {headers:cors});
    const url = new URL(request.url);
    if (url.pathname === "/reservations" && request.method === "GET") {
      const {results} = await env.DB.prepare("SELECT product_id, name FROM reservations").all();
      return json(Object.fromEntries(results.map(r => [r.product_id,{name:r.name}])));
    }
    if (url.pathname === "/reservations" && request.method === "POST") {
      let body;
      try { body = await request.json(); } catch { return json({error:"Ungültige Anfrage."},400); }
      const allowed = new Set(["bademantel","weltkarte","schaeler","handtuecher","muetze","ps5-headset","pfannen","schneidebrett","daempfeinsatz","raumluftfilter","pokerkarten","buecher","bettwaesche","sonos-speaker","sonos-soundbar","delonghi-siebtraeger"]);
      const productId = String(body.productId || "");
      const name = String(body.name || "").trim().slice(0,40);
      const note = String(body.note || "").trim().slice(0,120);
      if (!allowed.has(productId) || !name) return json({error:"Bitte einen gültigen Wunsch und Namen angeben."},400);
      try {
        await env.DB.prepare("INSERT INTO reservations (product_id,name,note) VALUES (?,?,?)").bind(productId,name,note).run();
        return json({ok:true},201);
      } catch {
        return json({error:"Dieser Wunsch wurde gerade bereits reserviert."},409);
      }
    }
    return json({error:"Nicht gefunden."},404);
  }
};

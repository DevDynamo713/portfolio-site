export default {
  async fetch(req: Request, env: { CONTACTS: KVNamespace }): Promise<Response> {
    const url = new URL(req.url);
    const cors = { 'access-control-allow-origin': '*', 'access-control-allow-headers': 'content-type', 'access-control-allow-methods': 'POST, OPTIONS' };
    if (req.method === 'OPTIONS') return new Response(null, { headers: cors });
    if (req.method === 'POST' && url.pathname === '/lead') {
      const body = (await req.json()) as { name?: string; email?: string; message?: string; company?: string };
      if (body.company) return new Response(JSON.stringify({ ok: true }), { headers: { ...cors, 'content-type': 'application/json' } });
      if (!body.name || !body.email || !body.message) {
        return new Response(JSON.stringify({ ok: false, error: 'missing fields' }), { status: 400, headers: { ...cors, 'content-type': 'application/json' } });
      }
      const key = 'lead-' + Date.now().toString(36);
      await env.CONTACTS.put(key, JSON.stringify({ name: body.name, email: body.email, message: body.message, at: new Date().toISOString() }));
      return new Response(JSON.stringify({ ok: true }), { headers: { ...cors, 'content-type': 'application/json' } });
    }
    if (req.method === 'GET' && url.pathname === '/leads') {
      const list = await env.CONTACTS.list();
      return new Response(JSON.stringify(list.keys), { headers: { ...cors, 'content-type': 'application/json' } });
    }
    return new Response('dd713-contact', { headers: cors });
  },
};
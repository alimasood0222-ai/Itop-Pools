// Yard photos for the quote form.
// POST: the form resizes each photo in the browser (max 1600px JPEG, usually 200-600 KB) and posts the bytes here.
//       They are stored in a private Vercel Blob store and a link back to this function is returned; the form sends
//       those links to GoHighLevel with the lead (GHL webhooks take text, not files).
// GET ?p=<pathname>: streams a stored photo, so the team can open the link from the GHL contact.
// Needs a Blob store connected to the project (Storage > Blob), which sets BLOB_STORE_ID (or BLOB_READ_WRITE_TOKEN).
const { put, get } = require('@vercel/blob');
const { Readable } = require('stream');

const MAX = 4 * 1024 * 1024; // Vercel functions accept up to 4.5 MB per request
const TYPES = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp' };
const PATH_RE = /^yard-photos\/\d{4}-\d{2}-\d{2}\/photo-[A-Za-z0-9]{6,}\.(jpg|png|webp)$/;
const configured = () => !!(process.env.BLOB_STORE_ID || process.env.BLOB_READ_WRITE_TOKEN);

const sniff = b => b.length > 12 && (
  (b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) ? 'image/jpeg' :
  (b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47) ? 'image/png' :
  (b.toString('ascii', 0, 4) === 'RIFF' && b.toString('ascii', 8, 12) === 'WEBP') ? 'image/webp' : '');

const readBody = req => new Promise((resolve, reject) => {
  const chunks = []; let size = 0;
  req.on('data', c => { size += c.length; if (size > MAX) { reject(Object.assign(new Error('too big'), { code: 413 })); req.destroy(); } else chunks.push(c); });
  req.on('end', () => resolve(Buffer.concat(chunks)));
  req.on('error', reject);
});

async function view(req, res) {
  const p = new URL(req.url, 'http://x').searchParams.get('p') || '';
  if (!PATH_RE.test(p)) return res.status(404).json({ ok: false, error: 'not found' });
  try {
    const r = await get(p, { access: 'private' });
    if (!r || r.statusCode !== 200) return res.status(404).json({ ok: false, error: 'not found' });
    res.statusCode = 200;
    res.setHeader('Content-Type', r.blob.contentType || 'image/jpeg');
    res.setHeader('Cache-Control', 'private, max-age=86400');
    res.setHeader('X-Robots-Tag', 'noindex');
    Readable.fromWeb(r.stream).pipe(res);
  } catch (e) {
    return res.status(502).json({ ok: false, error: 'storage' });
  }
}

module.exports = async (req, res) => {
  if (req.method === 'GET') return view(req, res);
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') { res.setHeader('Allow', 'GET, POST'); return res.status(405).json({ ok: false, error: 'method' }); }
  if (!configured()) return res.status(503).json({ ok: false, error: 'not configured' });
  if (+(req.headers['content-length'] || 0) > MAX) return res.status(413).json({ ok: false, error: 'too big' });

  let buf;
  try { buf = await readBody(req); } catch (e) { return res.status(e.code || 400).json({ ok: false, error: e.code === 413 ? 'too big' : 'body' }); }
  const type = sniff(buf); // trust the bytes, not the header
  if (!type) return res.status(415).json({ ok: false, error: 'images only' });

  try {
    const day = new Date().toISOString().slice(0, 10);
    const blob = await put(`yard-photos/${day}/photo.${TYPES[type]}`, buf, { access: 'private', addRandomSuffix: true, contentType: type });
    const host = req.headers['x-forwarded-host'] || req.headers.host;
    return res.status(200).json({ ok: true, url: `https://${host}/api/photo/?p=${encodeURIComponent(blob.pathname)}` });
  } catch (e) {
    console.error('blob put failed', e && e.message);
    return res.status(502).json({ ok: false, error: 'storage' });
  }
};

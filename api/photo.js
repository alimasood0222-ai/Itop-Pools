// Yard photo upload: the quote form resizes each photo in the browser (max 1600px JPEG, usually 200-600 KB)
// and posts it here. It is stored in Vercel Blob and the public URL is returned; the form then sends the
// URLs to GoHighLevel with the lead (GHL webhooks take text, not files).
// Needs a Blob store connected to the project (Storage > Blob), which sets BLOB_READ_WRITE_TOKEN.
const { put } = require('@vercel/blob');

const MAX = 4 * 1024 * 1024; // Vercel functions accept up to 4.5 MB per request
const TYPES = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp' };

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

module.exports = async (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') { res.setHeader('Allow', 'POST'); return res.status(405).json({ ok: false, error: 'method' }); }
  if (!process.env.BLOB_READ_WRITE_TOKEN) return res.status(503).json({ ok: false, error: 'not configured' });
  if (+(req.headers['content-length'] || 0) > MAX) return res.status(413).json({ ok: false, error: 'too big' });

  let buf;
  try { buf = await readBody(req); } catch (e) { return res.status(e.code || 400).json({ ok: false, error: e.code === 413 ? 'too big' : 'body' }); }
  const type = sniff(buf); // trust the bytes, not the header
  if (!type) return res.status(415).json({ ok: false, error: 'images only' });

  try {
    const day = new Date().toISOString().slice(0, 10);
    const blob = await put(`yard-photos/${day}/photo.${TYPES[type]}`, buf, { access: 'public', addRandomSuffix: true, contentType: type });
    return res.status(200).json({ ok: true, url: blob.url });
  } catch (e) {
    return res.status(502).json({ ok: false, error: 'storage' });
  }
};

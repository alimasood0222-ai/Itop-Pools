// Lead relay: the website's form and chat post here, and this forwards the lead to GoHighLevel.
// Set GHL_WEBHOOK_URL in Vercel (Project settings > Environment Variables) to the GoHighLevel
// inbound webhook URL. Chat messages use GHL_CHAT_WEBHOOK_URL if set, otherwise the same URL.
// Keeping the URL here means it isn't visible in the site's code, and the browser never has to
// call GoHighLevel directly (which browsers can block).
const MAX_BODY = 20000;

module.exports = async (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') { res.setHeader('Allow', 'POST'); return res.status(405).json({ ok: false, error: 'method' }); }

  let lead = req.body;
  if (typeof lead === 'string') { try { lead = JSON.parse(lead); } catch (e) { lead = null; } }
  if (!lead || typeof lead !== 'object' || JSON.stringify(lead).length > MAX_BODY) return res.status(400).json({ ok: false, error: 'body' });

  // Spam trap: a hidden field people never see or fill in
  if (lead.company) return res.status(200).json({ ok: true });

  const name = String(lead.first_name || lead.name || '').trim();
  const digits = String(lead.phone || '').replace(/\D/g, '').replace(/^1(?=\d{10}$)/, '');
  if (!name || digits.length !== 10) return res.status(422).json({ ok: false, error: 'name and 10-digit phone required' });

  const isChat = lead.source === 'website_chat';
  const target = (isChat && process.env.GHL_CHAT_WEBHOOK_URL) || process.env.GHL_WEBHOOK_URL;
  if (!target) return res.status(503).json({ ok: false, error: 'not configured' });

  const payload = {
    ...lead,
    phone: '+1' + digits,
    full_name: [lead.first_name, lead.last_name].filter(Boolean).join(' ') || name,
    source: lead.source || 'website_form',
    submitted_at: new Date().toISOString(),
    ip_country: req.headers['x-vercel-ip-country'] || '',
  };
  delete payload.company;

  try {
    const r = await fetch(target, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload), signal: AbortSignal.timeout(8000) });
    if (!r.ok) return res.status(502).json({ ok: false, error: 'upstream ' + r.status });
    return res.status(200).json({ ok: true });
  } catch (e) {
    return res.status(502).json({ ok: false, error: 'upstream unreachable' });
  }
};

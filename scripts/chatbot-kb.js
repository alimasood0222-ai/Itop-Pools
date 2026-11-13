// Builds chatbot/itop-pools-knowledge-base.md for the GoHighLevel chatbot (Conversation AI knowledge base).
// Everything comes from the same data the website is built from, so the bot says what the site says.
// Run: npm run chatbot-kb   (re-run after changing hours, prices, models, FAQs or guides, then re-upload the file in GHL)
const fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..');
const json = f => JSON.parse(fs.readFileSync(path.join(ROOT, 'src', f), 'utf8'));
const site = json('data/site.json'), faq = json('data/faq.json'), models = json('data/models.json'), arts = json('data/articles.json');
const { answers, newArticles } = require(path.join(ROOT, 'src/content/articles.js'));
const B = site.business, A = B.address;

const plain = h => String(h).replace(/<br\s*\/?>/g, ' ').replace(/<[^>]+>/g, '').replace(/&amp;/g, '&').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim();
const t12 = h => { const [H, M] = h.split(':').map(Number); return `${(H % 12) || 12}:${String(M).padStart(2, '0')} ${H < 12 ? 'AM' : 'PM'}`; };
const days = d => d.length > 1 ? `${d[0]} to ${d[d.length - 1]}` : d[0];
const hours = B.openingHoursSpecification.map(o => `${days(o.dayOfWeek)}: ${t12(o.opens)} to ${t12(o.closes)}`);
const open = new Set(B.openingHoursSpecification.flatMap(o => o.dayOfWeek));
const closed = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].filter(d => !open.has(d));
const phone = '(904) 685-2555';
const areas = (B.areaServed || []).map(a => typeof a === 'string' ? a : a.name).map(s => s.replace(/, FL$/, ''));
const cmp = faq.compare;
const row = k => cmp.rows.find(r => r[0] === k);

const L = [];
const h = (n, s) => L.push('', '#'.repeat(n) + ' ' + s, '');
const p = s => L.push(s);

L.push('# iTop Pools: chatbot knowledge base');
p('');
p(`This document is the knowledge base for the iTop Pools website chatbot. It is generated from the website (itoppools.com), so it matches what the site says. Content updated: ${new Date().toISOString().slice(0, 10)}.`);
p('');
p('Rules for answering: only state facts found in this document. If something is not covered here (for example an exact price, a start date, availability, or a project detail), say a member of the iTop crew will confirm it, and offer to take the visitor\'s details or have them call ' + phone + '.');

h(2, 'Business details');
p(`- Business name: ${B.name}`);
p(`- What it is: ${plain(B.description || 'An authorized Barrier Reef Pools USA fiberglass dealer in Jacksonville, Florida.')}`);
p(`- Office address: ${A.streetAddress}, ${A.addressLocality}, ${A.addressRegion} ${A.postalCode}`);
p(`- Phone (call or text): ${phone}`);
p(`- Email: ${B.email}`);
p(`- Website: https://itoppools.com`);
p(`- Office hours: ${hours.join('; ')}. Closed ${closed.join(' and ')}.`);
p('- Site visits are booked by appointment.');
p(`- Google Maps: ${B.hasMap || 'search "iTop Pools, 6510 Columbia Park Drive, Jacksonville"'}`);
p('- Part of the iTop group, together with iTop Builder and iTop Pavers. More than fifteen years in the trade and hundreds of finished projects across Northeast Florida.');
p('- One in-house crew handles the pool, deck and pavers. iTop does not use rotating subcontractors.');

h(2, 'Where iTop Pools works');
p(`iTop Pools builds across Northeast Florida: ${areas.join(', ')}.`);
p('');
p('- Duval County: Jacksonville, Mandarin, Jacksonville Beach');
p('- St. Johns County: Ponte Vedra Beach, Nocatee, St. Johns, St. Augustine, Julington Creek');
p('- Clay County: Fleming Island, Orange Park, Green Cove Springs, Middleburg');
p('');
p('ZIP codes starting 320, 321 or 322 are in or near the usual service area. If a visitor is outside these areas, don\'t turn them away: take their details and say the team will confirm when they call. The free site visit confirms access, setbacks and permit requirements for each property.');

h(2, 'What iTop builds');
p('- New pools: Barrier Reef fiberglass pools (22 models). iTop also works with concrete (gunite) pools.');
p('- Spas: raised or built-in, including spas built into the pool shell.');
p('- Pavers and decks: pavers, travertine and porcelain.');
p('- Outdoor kitchens: grill, sink and counters.');
p('- Screen enclosures: hurricane-code aluminum cages.');
p('- Remodels: resurfacing, new deck, new equipment.');
p('- Popular upgrades: tanning ledge, spa, heat pump, LED lighting, water features, automation, salt system.');

h(2, 'The free consultation (site visit and 3D design)');
p('The first step is a free site visit and 3D design, with no cost and no obligation. A crew member measures the yard, checks access and soil, and designs the pool, deck and enclosure in 3D, so the homeowner sees exactly what they are buying before committing. After the visit, iTop gives a firm, written, line-by-line price.');
p('');
p('After someone submits the form (or gives their details in chat), the next steps are: 1) the iTop team calls them, 2) a site visit, 3) the 3D design and firm price.');

h(2, 'How a project works, step by step');
const content = json('data/content.json');
(content.TL || []).forEach((s, i) => p(`${i + 1}. ${s[0]} (${s[2]}, ${s[3]}): ${s[1]}`));
p('');
p('Once permits and HOA approvals are in hand, Barrier Reef puts a typical fiberglass install at 2–6 weeks, depending on size, site and weather. iTop gives a firm timeline before breaking ground. Concrete pools typically take 3–6 months.');

h(2, 'Prices and cost');
p(`- Typical installed fiberglass pool: about ${row('Typical installed cost')[1]}, before deck, screen enclosure and fencing.`);
p(`- For comparison: concrete (gunite) about ${row('Typical installed cost')[2]}; vinyl liner about ${row('Typical installed cost')[3]}.`);
p('- These are published ranges for typical projects, not iTop quotes. They vary with size, site and features. iTop gives a firm written price after the free site visit.');
p('- The chatbot must never quote a specific price for a visitor\'s project. Give the ranges above and offer the free site visit for a firm price. Visitors can also try the estimator at https://itoppools.com/pool-cost-jacksonville/');
p('');
p('What a complete quote includes: shell, delivery and set, excavation and backfill, plumbing and equipment, electrical and bonding, deck and coping, screen enclosure if wanted, Florida\'s required safety feature (fence or other option), permits and HOA submittal, and start-up.');
p('');
p('What moves the price: shell size (longer and deeper costs more), yard access (a crane may be needed for narrow lots or pools behind the house), deck size and material, a screen enclosure, and features such as a spa, heat pump, lighting and automation.');
p('');
p('Cost of ownership: fiberglass usually costs the least to own, because it avoids concrete resurfacing and vinyl liner replacement. Vinyl liners commonly need replacing every 10–15 years at about $3,000–$7,500 each.');
p('');
p('Why iTop can be better value: iTop doesn\'t subcontract. Most builders hire out the shell, deck and pavers, and each layer adds its own markup. iTop has its own crew for all of it.');

h(2, 'Financing');
p('iTop Pools is not a lender. Most homeowners finance at least part of a pool, usually with one of four options:');
p('1. Unsecured pool loan: a personal loan for home projects. Fast approval, no home equity needed, but higher rates and shorter terms.');
p('2. Home equity loan: a fixed amount borrowed against home equity. Lower fixed rates and longer terms, but the home is collateral and there are closing costs.');
p('3. HELOC: a credit line drawn as the build progresses. Interest only on what is used, but variable rates and the home is collateral.');
p('4. Cash-out refinance: refinance the mortgage for more than is owed. One payment and potentially the lowest rate, but it resets the mortgage.');
p('');
p('Example only, not a loan offer: a $65,000 project financed for 15 years at 7.99% APR is about $621 a month. Rates and terms depend on the lender and the visitor\'s credit. iTop goes through options when presenting the price. Calculator: https://itoppools.com/pool-financing/');

h(2, 'Warranty');
p('- Barrier Reef (the manufacturer) covers the shell: a Lifetime Limited Structural Warranty (the shell stays capable of holding water for the life of the pool), transferable once if the home is sold, plus a 15-year finish warranty against blistering. The written Barrier Reef warranty document governs and covers the shell only.');
p('- iTop covers its own workmanship (installation, plumbing, decking and pavers), with terms set out in the written agreement.');
p('- Pumps, heaters and automation carry their manufacturers\' warranties, and iTop registers them for the owner.');
p('- To keep warranties valid: keep water chemistry in range, never drain the pool yourself (groundwater can push an empty shell upward; always call iTop first), and keep the paperwork (serial number, warranty registration, as-built drawing).');

h(2, 'About Barrier Reef Pools');
p('Barrier Reef has built fiberglass pools since 1984 and opened its US plant in Timmonsville, South Carolina, in 2009. It makes more than 3,500 pools a year (manufacturer figure). Each shell is molded and quality-checked in a factory and delivered in one piece by truck, which is why it installs fast and stays smooth. iTop Pools is an authorized Barrier Reef Pools USA dealer.');

h(2, 'Barrier Reef pool models (22)');
p('All sizes below are from Barrier Reef\'s published specifications. Length × width; depth is shallow end to deep end. Gallons are approximate. Each model has its own page at https://itoppools.com/fiberglass-pools/<model>/');
for (const m of models) {
  h(3, `${m.n} (${m.t}${m.spa && !/spa/i.test(m.t) ? ', with built-in spa' : ''})`);
  p(plain(m.blurb));
  if (m.fl && m.fl.length) p('Features: ' + m.fl.map(plain).join('; ') + '.');
  for (const z of m.sizes) {
    const bits = [`${z.Ls} long × ${z.Ws} wide`];
    if (z.Ss && z.Ds) bits.push(`${z.Ss} to ${z.Ds} deep`); else if (z.Ds) bits.push(`${z.Ds} deep`);
    if (z.gal) bits.push(`about ${z.gal.toLocaleString('en-US')} gallons`);
    if (z.lounger) bits.push(`tanning ledge ${z.lounger}`);
    p(`- ${z.label}: ${bits.join(', ')}`);
  }
  p(`Page: https://itoppools.com/fiberglass-pools/${m.id}/`);
}
const all = models.flatMap(m => m.sizes.map(z => ({ m, z })));
const big = all.reduce((a, b) => b.z.L > a.z.L ? b : a), small = all.reduce((a, b) => b.z.L < a.z.L ? b : a);
p('');
p(`Largest: ${big.z.label} (${big.z.Ls} long). Smallest: ${small.z.label} (${small.z.Ls} long). Models with a built-in spa: ${models.filter(m => m.spa).map(m => m.n).join(', ')}. Plunge pools (for small yards): ${models.filter(m => m.cat === 'plunge').map(m => m.n).join(', ')}.`);
p('Not sure which model? The pool finder on the home page and the free site visit help visitors choose; "help me choose" is a fine answer in the form.');

h(2, 'Finish colors (7)');
p('Water color comes from the shell finish, depth, sky and deck color. Physical samples are brought to the site visit.');
p('- Aquamarine: classic resort blue, bright and clear in full sun.');
p('- Arctic: the lightest finish, gives shallow-lagoon turquoise water.');
p('- California: a sunny, saturated sky blue.');
p('- Evening Sky: a muted blue-grey that reads calm and modern.');
p('- Ocean: deep royal blue, the darkest and most dramatic water.');
p('- Sandstone: a tropical teal-green, like water over a sandbar.');
p('- Silver Mist: a soft silver-blue that pairs with grey pavers and porcelain.');

h(2, 'Permits, HOAs and Florida pool rules');
p(plain(answers.permits));
p('');
p('- Who issues the permit: City of Jacksonville Building Inspection Division for most of Duval County (online via JaxEPICS); Jacksonville Beach, Atlantic Beach and Neptune Beach each have their own building department; St. Johns County Building Department for unincorporated St. Johns County (Ponte Vedra Beach, St. Johns, Julington Creek, most of Nocatee); Clay County Building Division for unincorporated Clay County (Fleming Island, Middleburg). The City of St. Augustine, St. Augustine Beach and Orange Park have their own building departments.');
p('- Florida law (Chapter 515) requires a new residential pool to have at least one safety feature to pass final inspection: a compliant pool barrier, an approved safety cover, exit alarms on doors and windows to the pool, self-closing self-latching doors, or an ASTM F2208 pool alarm.');
p('- A built-in spa or hot tub deeper than 24 inches counts as a pool under Florida law.');
p('- iTop prepares the drawings, submits them to the HOA and the county, and tracks every approval. The homeowner doesn\'t fill out forms or make calls.');

h(2, 'Guides: short answers');
const allArts = [...arts.map(a => ({ id: a.id, t: a.t, ans: answers[a.id] || a.d })), ...newArticles.map(a => ({ id: a.id, t: a.t, ans: a.answer || a.d }))];
for (const a of allArts) { h(3, plain(a.t)); p(plain(a.ans)); p(`More: https://itoppools.com/pool-school/${a.id}/`); }

h(2, 'Frequently asked questions');
for (const g of faq.groups) { h(3, g.title); for (const i of g.items) { p(`Q: ${plain(i.q)}`); p(`A: ${plain(i.a)}`); p(''); } }

h(2, 'Things the chatbot must not do');
p('- Don\'t quote a specific price, discount or start date for a visitor\'s project. Give the published ranges and offer the free site visit.');
p('- Don\'t promise availability, approval times or financing approval.');
p('- Don\'t invent reviews, project addresses, license numbers or staff names.');
p('- Don\'t give legal, engineering or lending advice beyond what is in this document; the permit reviewer, engineer or lender has the final word.');
p('- Don\'t tell anyone to drain a pool. Draining can let groundwater push the shell up; tell them to call iTop first.');
p(`- For emergencies, complaints or warranty claims, ask them to call ${phone} during office hours, and take their details so the team can follow up.`);

const out = path.join(ROOT, 'chatbot', 'itop-pools-knowledge-base.md');
fs.mkdirSync(path.dirname(out), { recursive: true });
fs.writeFileSync(out, L.join('\n').replace(/\n{3,}/g, '\n\n') + '\n');
console.log('wrote', path.relative(ROOT, out), Math.round(fs.statSync(out).size / 1024) + ' KB', L.join(' ').split(/\s+/).length + ' words');

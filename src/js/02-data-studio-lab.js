
/* =========================================================
   V2 — DATA
   ========================================================= */
const ft=x=>{if(x==null)return '—';const f=Math.floor(x+1e-6);const i=Math.round((x-f)*12);return i===12?(f+1)+"'":(i?f+"'"+i+'"':f+"'")};
const money=n=>'$'+Math.round(n).toLocaleString('en-US');
const k$=n=>'$'+(Math.round(n/1000)).toLocaleString('en-US')+'k';
const MODELS=[
 {id:'aussie',n:'Aussie',s:'rect',cat:'rect',L:35,W:15.75,D:6,feats:['deep','new'],sizes:['35','30'],t:'Rectangular',blurb:'New for 2026. A 6-foot-deep rectangle in 30 and 35-foot lengths, with a generous 15\'9" width for real swimming room.',fl:['New Barrier Reef model for 2026','30 and 35-foot lengths','6 ft deep end','Clean rectangular lines']},
 {id:'whitsunday',n:'Whitsunday',s:'rect',cat:'rect',L:40,W:15.67,D:8.5,feats:['ledge','deep'],sizes:['40 Deep','40','35','35 Lounger','30','30 Lounger'],t:'Rectangular',blurb:'The most versatile rectangle in the range. It comes in standard, lounger and deep versions across several lengths. Pick the deep version if diving or water volleyball is on the list.',fl:['Standard, Lounger and Deep versions','Lengths from 30 to 40 ft','Deep version reaches 8\'6"','Lounger versions add a molded sun shelf']},
 {id:'bondi',n:'Bondi',s:'rect',cat:'rect',L:40,W:15.67,S:3.67,D:6.25,gal:17600,walk:11,feats:['bench','ledge','deep'],sizes:['40','35'],t:'Rectangular',blurb:'A clean 40-foot rectangle with comfortable deep-end seating and wide, textured entry steps. Also made in a 35-foot size.',fl:['Comfortable deep-end seating','Perimeter safety ledge','Sloped entry ledge for easy access','Wide, textured entry steps']},
 {id:'sydney-harbour',n:'Sydney Harbour',s:'rect',cat:'rect',L:40,W:16,D:6.5,feats:['spa','deep'],spa:1,sizes:['40'],t:'Pool + spa',blurb:'Pool and spa in a single shell, so the spa sits exactly where you\'ll use it and goes in on the same day as the pool.',fl:['Integrated spa','Pool and spa in one shell','40 ft long, 16 ft wide','One install day for both']},
 {id:'coral-sea',n:'Coral Sea',s:'free',cat:'free',L:40,W:15.17,D:6.75,feats:['ledge','deep'],sizes:['Standard','Lounger'],t:'Freeform',blurb:'Freeform curves with a resort feel, in standard and lounger versions. A natural match for tropical planting and natural stone.',fl:['Freeform resort shape','Lounger version with sun shelf','Up to 40 ft long','Natural-stone friendly coping line']},
 {id:'daydream',n:'Daydream',s:'free',cat:'free',L:40,W:14.08,D:6.25,feats:['deep'],sizes:['40'],t:'Freeform',blurb:'A long, narrow freeform. You get room to swim without giving up the whole yard.',fl:['Long, narrow footprint','40 ft of swimming length','Gentle freeform curves','Works beside a long lanai']},
 {id:'billabong-cove',n:'Billabong Cove',s:'free',cat:'free',L:35.25,W:16,D:null,feats:[],sizes:['35\'3"'],t:'Freeform',blurb:'A 35-foot freeform at 16 feet wide, one of the widest shapes in the range. Lots of room for family play.',fl:['16 ft wide','Freeform shape','Room for games and floats','Mid-length footprint']},
 {id:'castaway',n:'Castaway',s:'free',cat:'free',L:35,W:15.67,D:6.33,feats:['deep'],sizes:['35'],t:'Freeform',blurb:'A freeform shell that never gets shallower than 4\'4", so there\'s more swimmable water for older kids and adults.',fl:['Never shallower than 4\'4"','More swimmable water','Freeform curves','35 ft long']},
 {id:'grande',n:'Grande',s:'rect',cat:'rect',L:35.08,W:13.75,D:6.42,feats:['deep'],sizes:['Large','Medium','Small'],t:'Rectangular',blurb:'A rectangle made in three sizes, so it adapts to the yard you actually have.',fl:['Three sizes','Classic rectangle','Up to 35\'1" long','Fits narrower lots']},
 {id:'oyster',n:'Oyster',s:'kidney',cat:'kidney',L:30,W:14.75,D:6.25,feats:['deep'],sizes:['30','Smaller size'],t:'Kidney',blurb:'A soft kidney shape in two sizes. The curves frame a lanai or a garden corner.',fl:['Two sizes','Soft kidney curves','30 ft long','Frames a lanai or corner']},
 {id:'outback-dundee',n:'Outback Dundee',s:'rect',cat:'rect',L:30,W:14,D:5.83,feats:['ledge'],sizes:['Standard','Lounger'],t:'Tanning ledge',blurb:'A 30-foot rectangle built around a tanning ledge. Put the lounge chairs in the water and the kids in the shallows.',fl:['Built around a tanning ledge','Standard and Lounger versions','30 ft long','Great for entertaining']},
 {id:'billabong-splash',n:'Billabong Splash',s:'free',cat:'free',L:27,W:13,D:null,feats:[],sizes:['27'],t:'Freeform',blurb:'A 27-foot freeform that brings resort curves to a mid-sized yard.',fl:['27 ft long','Freeform resort curves','Mid-size footprint','Easy to landscape around']},
 {id:'milano',n:'Milano',s:'rect',cat:'plunge',L:23,W:11,S:4.33,D:4.33,feats:[],sizes:['23'],t:'Plunge · Roman',blurb:'A Roman-style plunge pool with a flat floor. Great for cooling off, water exercise and tight lots.',fl:['Flat floor throughout','Roman-style ends','Ideal for water exercise','Fits tight lots']},
 {id:'opal',n:'Opal',s:'kidney',cat:'kidney',L:21.17,W:11.33,D:5,feats:[],sizes:['21\'2"'],t:'Kidney · compact',blurb:'A compact kidney with a full 5-foot depth. A small yard doesn\'t have to mean a shallow pool.',fl:['Compact footprint','Full 5 ft depth','Kidney shape','Fits small yards']},
 {id:'crispin',n:'Crispin',s:'kidney',cat:'plunge',L:16.5,W:10,D:3.92,feats:[],sizes:['16\'6"'],t:'Plunge · kidney',blurb:'The smallest shell in the range: a kidney plunge for courtyards and townhomes.',fl:['Smallest shell in the range','Kidney plunge','Courtyard and townhome friendly','Quick to install']}
];
MODELS.forEach(m=>{m.Ws=ft(m.W);m.Ls=ft(m.L);
 if(m.gal){m.galEst=false}else if(m.D){const f=m.s==='rect'?.76:.66;m.gal=Math.round(m.L*m.W*(((m.S||3.5)+m.D)/2)*7.48*f/100)*100;m.galEst=true}else m.gal=null});
const byId=id=>MODELS.find(m=>m.id===id);
const FT_LBL={ledge:'Tanning ledge',spa:'Integrated spa',bench:'Bench seating',deep:'Deep end 6\'+',new:'New 2026'};
const CAT_LBL={rect:'Rectangular',free:'Freeform',kidney:'Kidney',plunge:'Plunge'};

const FIN_META={
 aquamarine:{n:'Aquamarine',d:'Classic resort blue. Bright and clear in full Florida sun.',p:'Travertine, white coping'},
 arctic:{n:'Arctic',d:'The lightest finish. It gives that shallow-lagoon turquoise water.',p:'Shell stone, light pavers'},
 california:{n:'California',d:'A sunny, saturated sky blue that photographs beautifully.',p:'Travertine, warm pavers'},
 eveningsky:{n:'Evening Sky',d:'A muted blue-grey that reads calm and modern.',p:'Charcoal porcelain, grey pavers'},
 ocean:{n:'Ocean',d:'Deep royal blue. The darkest, most dramatic water in the range.',p:'Light travertine for contrast'},
 sandstone:{n:'Sandstone',d:'A tropical teal-green, like water over a sandbar.',p:'Coral stone, natural pavers'},
 silvermist:{n:'Silver Mist',d:'A soft silver-blue. Pairs with grey pavers and porcelain.',p:'Grey porcelain, modern decks'}
};
const FIN_KEYS=Object.keys(FIN_META);
const swBg=k=>{const c=FINISH[k].sw;return `radial-gradient(circle at 35% 30%,${c[0]},${c[1]})`};

const STAGES=[['dream','Dream','Picture it'],['plan','Plan','Budget & rules'],['design','Design','Shape & finish'],['build','Build','Dig to swim'],['own','Own','Enjoy & maintain']];
const ARTS=[
 {id:'fiberglass-vs-concrete',st:'dream',img:'aerial',min:6,t:'Fiberglass vs concrete vs vinyl: which suits Florida?',d:'Install time, upkeep, feel underfoot and lifetime cost, compared honestly.',
  b:`<p>Almost every Jacksonville buyer starts with the same question: which type of pool? All three can be great. They just suit different priorities.</p>
  <h2>The short version</h2>
  <table><tr><th></th><th>Fiberglass</th><th>Concrete</th><th>Vinyl liner</th></tr>
  <tr><td>Typical install</td><td>2–6 weeks</td><td>3–6 months</td><td>Several weeks</td></tr>
  <tr><td>Surface</td><td>Smooth gelcoat</td><td>Plaster or pebble, textured</td><td>Soft vinyl</td></tr>
  <tr><td>Shape freedom</td><td>Choose from molds</td><td>Any shape</td><td>Many shapes</td></tr>
  <tr><td>Big future cost</td><td>Rare</td><td>Resurfacing</td><td>Liner replacement</td></tr></table>
  <h2>Why fiberglass is popular in Florida</h2>
  <p>A fiberglass shell is made in a factory and set in one piece, so the build is short and less weather-dependent. That matters in a Florida summer. The gelcoat surface is smooth and non-porous, which gives algae less to grip. Barrier Reef estimates vinyl pools use about 50% more chemicals than fiberglass.</p>
  <h2>When concrete makes sense</h2>
  <p>If you want a vanishing edge, an unusual size or a shape no mold offers, concrete (gunite) is the answer. Expect a longer build and periodic resurfacing over the pool's life.</p>
  <h2>Where vinyl fits</h2>
  <p>Vinyl usually has the lowest upfront price. Barrier Reef puts fiberglass at roughly 15–20% more than vinyl. The liner wears and needs replacing, which industry guides put at around every 10 years.</p>
  <div class="callout"><strong>Our take:</strong> for most Northeast Florida families who want to swim this season and spend weekends swimming rather than scrubbing, fiberglass is the best balance. If your yard needs something truly custom, we'll tell you.</div>
  <p class="src">Sources: Barrier Reef Pools USA FAQ (install time, chemical use, price vs vinyl); published industry comparison guides (concrete build time, liner life).</p>`},
 {id:'shapes',st:'dream',img:'lounge',min:4,t:'Rectangle, freeform or kidney? Picking a shape',d:'How shape changes the way you swim, lounge and landscape.',
  b:`<p>Shape is mostly about how you'll use the water and what your house looks like.</p>
  <h2>Rectangular</h2><p>Clean lines suit modern and transitional homes. They also give the most usable swimming length, so they're great for laps. Try the <a href="#/pools/aussie">Aussie</a>, <a href="#/pools/bondi">Bondi</a> or <a href="#/pools/whitsunday">Whitsunday</a>.</p>
  <h2>Freeform</h2><p>Curves feel like a resort and blend with palms and natural stone. Try <a href="#/pools/coral-sea">Coral Sea</a> or <a href="#/pools/billabong-cove">Billabong Cove</a>.</p>
  <h2>Kidney &amp; plunge</h2><p>Soft, classic and compact. Kidney shapes wrap nicely around a lanai corner, and plunge pools fit townhome lots. Try <a href="#/pools/opal">Opal</a> or <a href="#/pools/milano">Milano</a>.</p>
  <div class="callout">Not sure? Take the <a href="#/">30-second pool finder</a> on our homepage, or drop any model into the <a href="#/studio">3D studio</a> and walk around it.</div>`},
 {id:'cost-guide',st:'plan',img:'pavilion',min:7,t:'What does a fiberglass pool cost in Jacksonville?',d:'What drives the price, what a complete quote should include, and how to compare bids.',
  b:`<p>The honest answer is that it depends on the shell, the features, the deck and your site. Here's how to think about it.</p>
  <h2>The national picture</h2><p>National industry price guides put an installed fiberglass inground pool at roughly <strong>$50,000 to $150,000</strong>. In Florida, advertised fiberglass packages often start in the $40,000s before decking, screens and upgrades.</p>
  <h2>What moves the number</h2><ul><li><strong>Shell size and model.</strong> Longer and deeper shells cost more to make, ship and set.</li><li><strong>Features.</strong> Spa, heat pump, lighting, automation and water features.</li><li><strong>Deck.</strong> Square footage and material (pavers, travertine or porcelain).</li><li><strong>Site.</strong> Access, soil, slope, and whether a crane is needed.</li><li><strong>Screen enclosure.</strong> Common in Northeast Florida, and a significant line item.</li></ul>
  <h2>What a complete quote should include</h2><p>Shell, delivery, excavation and haul-off, set and leveling, plumbing and equipment, backfill, coping, deck, electrical bonding, permits, the safety feature Florida requires, and start-up. If a bid is missing items, it isn't cheaper. It's incomplete.</p>
  <div class="callout">Use our <a href="#/cost">estimator</a> to get a realistic range in two minutes, then book a free site visit for a firm, written price.</div>
  <p class="src">Source: published national fiberglass pool price guides. Ranges vary by region and project.</p>`},
 {id:'permits',st:'plan',img:'screen',min:5,t:'Permits, HOAs and Florida pool safety rules',d:'What has to be approved before we dig, and who handles it.',
  b:`<p>Every inground pool in Northeast Florida needs a building permit, and most neighborhoods also need HOA approval. iTop handles both.</p>
  <h2>Building permit</h2><p>Your city or county reviews the site plan, setbacks, electrical and drainage before work starts, then inspects during the build.</p>
  <h2>HOA architectural review</h2><p>Many communities, including Nocatee, Julington Creek and Ponte Vedra neighborhoods, want drawings, materials and sometimes colours before approving. Our 3D design and site plan make this faster.</p>
  <h2>Florida's pool safety law</h2><p>Florida's Residential Swimming Pool Safety Act (Chapter 515, Florida Statutes) requires a new residential pool to have at least one approved safety feature. Options include a compliant barrier or fence, an approved safety cover, exit alarms on doors and windows that open to the pool, or self-closing, self-latching doors.</p>
  <div class="callout">We'll recommend the safety option that fits your family and your county's inspection, and build it into your quote.</div>
  <p class="src">Requirements vary by jurisdiction. Your permit reviewer has the final word.</p>`},
 {id:'financing',st:'plan',img:'sunset',min:5,t:'Pool financing 101',d:'Pool loans, home equity, HELOCs and refinancing, in plain English.',
  b:`<p>Most families finance at least part of a pool. These are the four common routes.</p>
  <h2>1. Unsecured pool loan</h2><p>A personal loan made for home projects. It's fast, and your house isn't collateral, but rates are usually higher.</p>
  <h2>2. Home equity loan</h2><p>A fixed amount borrowed against your equity. It usually carries a lower rate, but your home secures it.</p>
  <h2>3. HELOC</h2><p>A line of credit you draw as the build progresses. Rates are often variable.</p>
  <h2>4. Cash-out refinance</h2><p>You replace your mortgage with a larger one. This can make sense when current rates are at or below your existing rate.</p>
  <div class="callout">Try different down payments and terms in our <a href="#/cost">estimator</a>. Talk to a lender or financial advisor before you choose. iTop isn't a lender.</div>`},
 {id:'colours',st:'design',img:'falls',min:4,t:'How to choose a finish colour',d:'Why the same shell looks different in your yard, and how to pick with confidence.',
  b:`<p>Barrier Reef's US range has seven finishes: Aquamarine, Arctic, California, Evening Sky, Ocean, Sandstone and Silver Mist.</p>
  <h2>Light vs dark</h2><p>Light finishes such as Arctic and Sandstone give turquoise, Caribbean-style water. Dark finishes such as Ocean and Evening Sky look deeper and more reflective, like a lake.</p>
  <h2>What changes the colour</h2><ul><li><strong>Depth.</strong> The deep end always reads darker than the steps.</li><li><strong>Sky and shade.</strong> A screen enclosure softens and darkens the water slightly.</li><li><strong>Deck.</strong> Light travertine makes water look brighter. Charcoal pavers make it look moodier.</li></ul>
  <div class="callout">Compare any two finishes side by side in our <a href="#/colours">colour lab</a>, then ask us to bring real samples to your site visit.</div>`},
 {id:'features',st:'design',img:'spa',min:5,t:'Tanning ledges, spas and lighting: what\'s worth it?',d:'The upgrades owners use every week, and the ones they forget.',
  b:`<p>Some upgrades get used every day. Others get forgotten. Here's what we see owners use most.</p>
  <h2>Tanning ledge</h2><p>A shallow shelf, usually under a foot of water. It's where chairs, toddlers and morning coffee end up. Highly recommended.</p>
  <h2>Spa</h2><p>Choose a shell with an integrated spa, like <a href="#/pools/sydney-harbour">Sydney Harbour</a>, or add a raised spillover spa. Great for cooler months.</p>
  <h2>Heat pump</h2><p>Florida's mild winters suit heat pumps well, and they stretch your swim season.</p>
  <h2>LED lighting &amp; automation</h2><p>Colour LEDs and phone control for pump, lights and heat. Cheap to add during the build and awkward to add later.</p>
  <div class="callout">Toggle a spa and tanning ledge in the <a href="#/studio">3D studio</a> to see the difference, then price them in the <a href="#/cost">estimator</a>.</div>`},
 {id:'timeline',st:'build',img:'aerial',min:5,t:'Your build, week by week',d:'What happens from permit approval to the first swim.',
  b:`<p>Once permits and HOA approval are in hand, a fiberglass install moves quickly. Barrier Reef puts a typical install at 2 to 6 weeks.</p>
  <ol><li><strong>Layout &amp; locates.</strong> We mark the pool and call Sunshine 811 so utilities are located.</li><li><strong>Excavation.</strong> Usually a day or two, with soil hauled away.</li><li><strong>Delivery &amp; set.</strong> The shell arrives in one piece and is lowered, leveled and plumbed.</li><li><strong>Backfill.</strong> We backfill evenly while the pool fills with water, to keep pressure balanced.</li><li><strong>Coping, deck &amp; enclosure.</strong> The same crew lays the deck.</li><li><strong>Inspections.</strong> Final electrical and safety-feature inspections.</li><li><strong>Start-up &amp; handover.</strong> We balance the water and show you how everything works.</li></ol>
  <p class="src">Timeline varies with weather, inspections, site conditions and screen-enclosure lead times.</p>`},
 {id:'access',st:'build',img:'pavilion',min:3,t:'Site access: how a shell gets into your yard',d:'Side gates, fences, cranes and what we check on the site visit.',
  b:`<p>Fiberglass shells arrive on a truck in one piece, so the route into your yard matters.</p>
  <h2>Side-yard access</h2><p>If there's a clear path wide enough for equipment, we can usually set the shell from the side. Fence panels can be removed temporarily and replaced.</p>
  <h2>Crane sets</h2><p>Pools behind the house, narrow lots or screened areas may need a crane to lift the shell over. It's common, quick, and priced into your quote up front.</p>
  <h2>What we check</h2><ul><li>Gate and side-yard widths</li><li>Overhead lines and trees</li><li>Septic, irrigation and drainage</li><li>Slope and soil</li></ul>`},
 {id:'first-30',st:'own',img:'sunset',min:5,t:'Your first 30 days as a pool owner',d:'Start-up, chemistry basics and a simple weekly routine.',
  b:`<p>We'll start your pool and walk you through everything, but here's what to expect.</p>
  <h2>Week one</h2><p>Run the pump as instructed, brush the walls and floor, and keep children's toys out until the water is balanced.</p>
  <h2>Typical target ranges</h2><ul><li>pH: about 7.4–7.6</li><li>Free chlorine: about 1–3 ppm</li><li>Total alkalinity: about 80–120 ppm</li></ul>
  <p>Your handover sheet lists the exact targets for your pool and equipment. Saltwater systems still produce chlorine, so test just the same.</p>
  <h2>A 10-minute weekly routine</h2><p>Skim, empty baskets, test, adjust, and give the floor a quick brush. The smooth gelcoat makes this the easy part.</p>`},
 {id:'hurricane',st:'own',img:'screen',min:4,t:'Hurricane prep for your pool',d:'What to do (and what never to do) before a storm.',
  b:`<p>Northeast Florida storms are part of life. Here's how to prepare your pool.</p>
  <h2>Do</h2><ul><li>Keep the pool full. The water's weight helps hold the shell in place.</li><li>Turn off pump, heater and lights at the breaker.</li><li>Bring in furniture, toys and loose décor.</li><li>Raise chlorine slightly before the storm.</li></ul>
  <h2>Don't</h2><ul><li><strong>Never drain a fiberglass pool.</strong> High groundwater after heavy rain can push an empty shell up.</li><li>Don't restart equipment until it's dry and debris is cleared.</li></ul>
  <div class="callout">After the storm, call us if anything looks off. We'd rather check than have you guess.</div>`}
];
const FAQ=[
 ['What does the free consultation actually include?','A site visit, real measurements and a 3D design of your backyard, free and with no obligation. You see exactly what you\'re buying before you commit a dollar.'],
 ['Why are your prices better than other builders I\'ve quoted?','Because we don\'t subcontract. Most builders hire out the shell, the deck and the pavers, and each layer adds its own markup. Our own crew does all of it, so you pay for the work instead of the middlemen.'],
 ['How long does a pool take, start to finish?','Once permits and HOA approvals are final, Barrier Reef puts a typical fiberglass install at 2–6 weeks, depending on size, site and weather. You get a firm timeline before we break ground.'],
 ['Do I need permits, and will you handle them?','Yes, and yes. HOA approvals, engineering and county permitting are all ours to chase, including the safety feature Florida law requires.'],
 ['What warranty comes with the pool?','Barrier Reef provides a Lifetime Limited Structural Warranty on the shell, transferable once, plus a 15-year finish warranty against blistering. iTop separately warrants our installation work.'],
 ['Who is actually on my property during the build?','Our own crew: the same specialized team on every iTop job, for both pools and pavers. No rotating subcontractors, and no one you haven\'t met.'],
 ['Can I see a pool you already built?','Absolutely. Browse our work, or ask and we\'ll arrange a visit to a finished project near you. We\'d rather you stand next to the real thing.']
];
const GAL=[['screen','Screened pool','Ponte Vedra','enclosure'],['pavilion','Pool + pavilion','St. Johns','fiberglass'],['falls','Sheer descents','Nocatee','features'],['aerial','Fiberglass install','Jacksonville','fiberglass'],['spa','Spa & fire feature','Mandarin','features'],['sunset','Sunset swim','Julington Creek','fiberglass'],['lounge','Sun shelf & pavers','Fleming Island','pavers']];
const STEPS=[
 ['Dream','Tell us how you\'ll use the yard. Take the pool finder or explore in 3D.','You','You'],
 ['Design','Free site visit, measurements and a 3D design drawn to your survey.','iTop',''],
 ['Approve','HOA, engineering and county permits, including Florida\'s required safety feature.','iTop',''],
 ['Manufacture','Your shell is molded and quality-checked at Barrier Reef\'s plant in South Carolina.','Barrier Reef','mf'],
 ['Dig & set','Excavation, delivery, leveling and plumbing by our own crew.','iTop',''],
 ['Deck','Coping, pavers or travertine, enclosure and lighting. Same crew, no hand-off.','iTop',''],
 ['Swim','Start-up, water balance and a walkthrough of everything you own.','iTop','']
];
const TL=[
 ['Discovery call','A real crew member asks about your yard, goals, timing and budget, and books your visit.','iTop','Day 1'],
 ['Site visit & 3D design','We measure, check access and soil, and design the pool, deck and enclosure in 3D.','iTop','About 1 week'],
 ['Firm price & agreement','A written, line-by-line price. No allowances that turn into surprises.','iTop','You decide'],
 ['Permits & HOA','We prepare drawings and submit to your HOA and county, and track every approval.','iTop','Varies by county'],
 ['Shell manufactured','Barrier Reef molds your shell in Timmonsville, SC, and quality-checks it before shipping.','Barrier Reef','Scheduled with permits'],
 ['Excavation & set','Locates, excavation, delivery, then leveling, plumbing and backfill while the pool fills.','iTop','Typically days'],
 ['Deck, enclosure & finish','Coping, pavers or travertine, lighting, enclosure and equipment by the same crew.','iTop','Typically 1–3 weeks'],
 ['Start-up & handover','Water balanced, equipment registered, warranty paperwork in your hand.','iTop','Your first swim']
];
const LOANS=[
 ['Unsecured pool loan','A personal loan for home projects. Your house isn\'t collateral.',['Fast approval','No home equity needed'],['Higher rates','Shorter terms']],
 ['Home equity loan','A fixed amount borrowed against the equity in your home.',['Lower fixed rates','Longer terms'],['Home is collateral','Closing costs']],
 ['HELOC','A credit line you draw from as the build progresses.',['Pay interest on what you use','Flexible draws'],['Variable rates','Home is collateral']],
 ['Cash-out refinance','Refinance your mortgage for more than you owe.',['One payment','Potentially lowest rate'],['Resets your mortgage','Depends on current rates']]
];
/* Demo pricing — placeholders until iTop supplies its price book */
const PRICE={base:L=>L<=24?[38000,48000]:L<=31?[48000,60000]:L<=36?[56000,70000]:[62000,78000],spaModel:[8000,12000],
 opts:[['spa','Raised spillover spa','Sheer descent into the pool',[12000,18000]],['heat','Heat pump','Swim through the winter',[4500,6500]],['led','Colour LED lighting','Pool and spa lights',[1800,3000]],['auto','Automation','Pump, heat and lights from your phone',[2500,4500]],['salt','Salt system','Softer-feeling water',[1800,2800]],['water','Water features','Sheer descents or bubblers',[2500,6000]],['cage','Screen enclosure','Hurricane-code aluminum',[14000,24000]],['kitchen','Outdoor kitchen','Grill, sink and counters',[15000,35000]]],
 deck:{pavers:[14,20],travertine:[20,28],porcelain:[24,34]},site:{easy:[0,0],tight:[2000,4000],crane:[3500,7000]},permits:[2000,4000]};
const pmt=(P,apr,yrs)=>{const r=apr/100/12,n=yrs*12;return P<=0?0:r?P*r/(1-Math.pow(1+r,-n)):P/n};

/* =========================================================
   HELPERS
   ========================================================= */
function planPath(s,L,Wd){const sx=L/40,sy=Wd/16;const pts=poolPts(s,sx,sy);return 'M'+pts.map(p=>`${(p.x*10+70).toFixed(1)},${(-p.y*10+30).toFixed(1)}`).join('L')+'Z'}
let gid=0;
function planSVG(m,o={}){const id='pg'+(gid++);const p=planPath(m.s,m.L,m.W);const fin=FINISH[o.fin||'california'];const dark=o.dark;
 const ledge=m.feats.includes('ledge')?`<rect x="${(70-60*m.L/40+2.2).toFixed(1)}" y="${(30-10*m.W/16*2.4+3).toFixed(1)}" width="${(9*m.L/40+4).toFixed(1)}" height="${(10*m.W/16*4.8-6).toFixed(1)}" rx="2" fill="rgba(255,255,255,.32)"/>`:'';
 const spa=m.spa?`<rect x="${(70+60*m.L/40-15).toFixed(1)}" y="${(30-10*m.W/16*2.4+2.5).toFixed(1)}" width="12" height="11" rx="2.5" fill="rgba(255,255,255,.25)" stroke="rgba(255,255,255,.7)" stroke-width=".8"/>`:'';
 return `<svg viewBox="0 0 140 60" ${o.attr||''}><defs><linearGradient id="${id}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${fin.shallow}"/><stop offset=".55" stop-color="${fin.basin}"><animate attributeName="offset" values=".35;.7;.35" dur="5s" repeatCount="indefinite"/></stop><stop offset="1" stop-color="${fin.deep}"/></linearGradient></defs><path d="${p}" fill="none" stroke="${dark?'rgba(242,234,217,.9)':'#f2ead9'}" stroke-width="5.5" stroke-linejoin="round"/><path d="${p}" fill="url(#${id})" stroke="#fff" stroke-width="1.2"/>${ledge}${spa}</svg>`}
function toast(msg){const t=$('#toast');$('#toastT').textContent=msg;t.classList.add('on');clearTimeout(toast.t);toast.t=setTimeout(()=>t.classList.remove('on'),4200)}
function setP(r){const p=(r.value-r.min)/(r.max-r.min)*100;r.style.setProperty('--p',p+'%')}

/* =========================================================
   ENGINES
   ========================================================= */
let hero=null,cfg=null,lab=null;
const TEST=window.__TEST=/test/.test(location.search);

function Lab(canvas,host){
 const S=this;const R=new T.WebGLRenderer({canvas,antialias:false});R.setPixelRatio(Math.min(devicePixelRatio,1.6));
 if(T.LinearEncoding!==undefined)R.outputEncoding=T.LinearEncoding;
 const cam=new T.OrthographicCamera(-1,1,1,-1,0,1);const scene=new T.Scene();
 const U={uTime:{value:0},uSplit:{value:.5},uRes:{value:new T.Vector2(1,1)},uLight:{value:0},uLightT:{value:0},
  aB:{value:C('#000')},aD:{value:C('#000')},aS:{value:C('#000')},bB:{value:C('#000')},bD:{value:C('#000')},bS:{value:C('#000')}};
 const mat=new T.ShaderMaterial({uniforms:U,vertexShader:`varying vec2 vUv;void main(){vUv=uv;gl_Position=vec4(position.xy,0.,1.);}`,
 fragmentShader:`uniform float uTime,uSplit,uLight,uLightT;uniform vec2 uRes;uniform vec3 aB,aD,aS,bB,bD,bS;varying vec2 vUv;
 float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
 float noise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(hash(i),hash(i+vec2(1,0)),f.x),mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),f.x),f.y);}
 ${CAUS}
 void main(){
  vec2 uv=vUv;float asp=uRes.x/uRes.y;bool A=uv.x<uSplit;
  vec3 cB=A?aB:bB,cD=A?aD:bD,cS=A?aS:bS;
  float t=uTime;
  // perspective: far edge at top
  float py=uv.y;float persp=mix(1.0,.55,py);vec2 w=vec2((uv.x-.5)*asp/persp,py/(persp*.9));
  float cop=.865;
  vec3 col;
  float sun=1.0-smoothstep(0.,1.,uLightT);
  float night=smoothstep(1.,2.,uLightT);
  float shade=1.0-.38*(1.0-sun)*(1.0-night);
  if(uv.y>cop){
   // travertine coping/deck
   vec2 q=vec2(uv.x*asp*6.,(uv.y-cop)*40.);float tile=step(.96,fract(q.x*.5))+step(.94,fract(q.y*.25));
   vec3 trav=vec3(.90,.85,.76)*(.86+.14*noise(q*3.))-tile*.08;
   float edge=smoothstep(cop,cop+.012,uv.y);trav*=mix(.55,1.,edge);
   col=trav*mix(1.0,.62,1.0-shade)*mix(1.,.16,night);
   col+=night*vec3(.9,.7,.45)*.05;
  }else{
   float y=uv.y/cop;
   // waterline mosaic band
   float wl=smoothstep(.93,.95,y);
   float depth=smoothstep(.12,.82,y);
   // steps near bottom
   float stp=floor(clamp((.16-y)/.055,0.,3.));float isStep=step(y,.16);
   depth=mix(depth,.02+.05*(2.-stp),isStep);
   vec2 rip=vec2(noise(w*6.+t*.6),noise(w*6.-t*.5))-.5;
   vec2 cw=w*4.2+rip*.12;
   float cz=caustic(cw,t*.5);cz=cz*.55+caustic(cw*1.7+3.1,t*.42)*.45;
   vec3 floorC=mix(cB*1.15,cB*.7,depth);
   vec3 water=mix(cS,cD,pow(depth,.8));
   col=mix(floorC,water,.35+.5*depth);
   col+=pow(cz,1.15)*(.62-.36*depth)*sun*vec3(1.,.98,.92);
   col+=cz*(.15-.1*depth)*(1.0-sun)*(1.0-night);
   // shimmer sparkle
   vec2 g=floor(w*vec2(90.,90.));float sp=hash(g);float tw=.5+.5*sin(t*3.+sp*40.);
   col+=step(.996,sp)*tw*(.22-.12*depth)*(1.0-night*.5)*mix(vec3(1),cS,.3);
   // step edges
   float se=isStep*smoothstep(.006,0.,abs(fract((.16-y)/.055)-.02));col=mix(col,col*1.25+.04,se*.8);
   col*=shade;
   // waterline tile
   col=mix(col,mix(vec3(.12,.25,.38),cD*.6+.08,.5)*(.85+.15*step(.5,fract(uv.x*asp*55.))),wl);
   // surface reflection gradient (sky)
   float fres=pow(1.-y,3.)*.0+pow(y,4.)*.22;col+=fres*vec3(.85,.93,1.)*sun*(1.0-wl);
   // sun glints
   float gl=pow(noise(w*vec2(30.,52.)+vec2(t*.5,-t*.4)),22.)*1.2*(1.-depth*.6);col+=gl*sun*vec3(1.,.97,.9)*(1.0-wl);
   // night LED
   if(night>0.){vec3 led=mix(vec3(.2,.85,1.),cS,.35);
    float lx=A?uSplit*.5:uSplit+(1.-uSplit)*.5;
    float lp=exp(-pow(length(vec2((uv.x-lx)*asp*.8,(y-.86)*1.3)),2.)*4.5);
    vec3 nc=cD*.16+led*lp*(.75+cz*.7)+led*(.05+.12*cz)*(1.-depth*.7);
    col=mix(col,nc,night);}
  }
  // vignette
  col*=mix(1.,.82,pow(length(uv-.5)*1.15,2.2));
  gl_FragColor=vec4(pow(col,vec3(1./1.05)),1.);
 }`});
 scene.add(new T.Mesh(new T.PlaneGeometry(2,2),mat));
 function resize(){const w=host.clientWidth,h=host.clientHeight;if(!w||!h)return;R.setSize(w,h,false);U.uRes.value.set(w,h)}
 new ResizeObserver(resize).observe(host);resize();
 S.visible=true;new IntersectionObserver(es=>es.forEach(e=>S.visible=e.isIntersecting)).observe(canvas);
 S.set=(side,k)=>{const f=FINISH[k];const p=side==='a'?'a':'b';U[p+'B'].value.set(f.basin);U[p+'D'].value.set(f.deep);U[p+'S'].value.set(f.shallow)};
 S.split=v=>U.uSplit.value=v;S.light=v=>U.uLight.value=v;
 const clock=new T.Clock();let t0=0;
 S.frame=()=>{if(!S.visible||!canvas.clientWidth)return;const dt=Math.min(clock.getDelta(),.05);t0+=dt;U.uTime.value=t0;U.uLightT.value+=(U.uLight.value-U.uLightT.value)*Math.min(1,dt*(TEST?40:4));R.render(scene,cam)};
}

try{
 hero=new Underwater($('#heroCanvas'),$('#top'));
 cfg=new PoolScene($('#cfgCanvas'),{interactive:true,time:'day'});cfg.autospin=true;
 cfg.onInteract=()=>{cfg.autospin=false;st.touched=true;const h=$('#cfgHint');if(h)h.style.opacity=0};
 lab=new Lab($('#labCanvas'),$('#labStage'));
 (function loop(){hero.frame();cfg.frame();lab.frame();TEST?setTimeout(loop,700):requestAnimationFrame(loop)})();
}catch(err){console.warn('WebGL unavailable',err);document.body.classList.add('no3d');$('#heroCanvas').style.background=`url(${IMG.spa}) center/cover`;}

/* =========================================================
   STUDIO UI
   ========================================================= */
const st={model:MODELS[1],finish:'ocean',deck:'Travertine',touched:false};
const ml=$('#mList');
MODELS.forEach((m,i)=>{const b=document.createElement('button');b.className='mbtn';b.dataset.id=m.id;
 b.innerHTML=`<svg viewBox="0 0 140 60"><path d="${planPath(m.s,m.L,m.W)}" fill="#1e9be0" stroke="#bfe9fd" stroke-width="4"/></svg><span><b>${m.n}</b><small>${m.Ls} × ${m.Ws}</small></span>`;
 b.onclick=()=>{pickModel(m);st.touched=true};ml.appendChild(b)});
function pickModel(m){st.model=m;if(cfg)cfg.set({shape:m.s,sx:m.L/40,sy:m.W/16,ledge:m.feats.includes('ledge'),spa:m.spa?true:cfg.state.spa});
 $$('.mbtn',ml).forEach(b=>b.classList.toggle('on',b.dataset.id===m.id));$('#mName').textContent=m.n;$('#hudModel').textContent=m.n;$('#hudSize').textContent=m.Ls+' × '+m.Ws;syncToggles();sum()}
function syncToggles(){if(!cfg)return;$$('#optToggles .tg').forEach(t=>{const on=!!cfg.state[t.dataset.k];t.classList.toggle('on',on);t.setAttribute('aria-checked',on)})}
function sum(){const f=[];if(cfg){cfg.state.spa&&f.push('spa');cfg.state.ledge&&f.push('tanning ledge');cfg.state.cage&&f.push('screen enclosure')}
 $('#sum').innerHTML=`<b>${st.model.n}</b> · ${st.model.Ls} × ${st.model.Ws} · ${FIN_META[st.finish].n} finish · ${st.deck} deck${f.length?' · '+f.join(', '):''}`}
function setFinish(k){st.finish=k;cfg&&cfg.set({finish:k});$$('#optFinish .sw').forEach(x=>x.classList.toggle('on',x.dataset.v===k));$('#finName').textContent=FIN_META[k].n;sum()}
const of=$('#optFinish');FIN_KEYS.forEach(k=>{const b=document.createElement('button');b.className='sw';b.dataset.v=k;b.dataset.n=FIN_META[k].n;b.style.background=swBg(k);b.setAttribute('aria-label',FIN_META[k].n);b.onclick=()=>{setFinish(k);st.touched=true};of.appendChild(b)});
$$('#optDeck .dk').forEach(b=>{try{b.querySelector('span').style.backgroundImage=`url(${deckTex(b.dataset.v).image.toDataURL('image/jpeg',.7)})`}catch(e){}
 b.onclick=()=>{$$('#optDeck .dk').forEach(x=>x.classList.remove('on'));b.classList.add('on');cfg&&cfg.set({deck:b.dataset.v});st.deck=b.querySelector('b').textContent;$('#deckName').textContent=st.deck;st.touched=true;sum()}});
$$('#optToggles .tg').forEach(t=>{const fn=()=>{const on=!t.classList.contains('on');t.classList.toggle('on',on);t.setAttribute('aria-checked',on);cfg&&cfg.set({[t.dataset.k]:on});st.touched=true;sum()};t.onclick=fn;t.onkeydown=e=>{if(e.key===' '||e.key==='Enter'){e.preventDefault();fn()}}});
$$('#lightSeg button').forEach(b=>b.onclick=()=>{$$('#lightSeg button').forEach(x=>x.classList.remove('on'));b.classList.add('on');cfg&&cfg.setTime(b.dataset.v)});
$$('#views button[data-v]').forEach(b=>b.onclick=()=>{$$('#views button[data-v]').forEach(x=>x.classList.remove('on'));b.classList.add('on');cfg&&cfg.view(b.dataset.v);cfg&&cfg.onInteract()});
$('#fsBtn').onclick=()=>{const s=$('#studio');if(document.fullscreenElement)document.exitFullscreen();else if(s.requestFullscreen)s.requestFullscreen()};
$('#cfgBtn').addEventListener('click',()=>{st.touched=true;Q.model=st.model.id});
pickModel(st.model);setFinish('ocean');

/* =========================================================
   COLOUR LAB UI
   ========================================================= */
const LS={a:'ocean',b:'arctic',focus:'a'};
function labSet(side,k){LS[side]=k;LS.focus=side;lab&&lab.set(side,k);
 $$('#labSw'+side.toUpperCase()+' button').forEach(b=>b.classList.toggle('on',b.dataset.v===k));
 $('#labTag'+side.toUpperCase()).textContent=FIN_META[k].n;const m=FIN_META[k];$('#labName').textContent=m.n;$('#labDesc').textContent=m.d;$('#labPair').textContent=m.p}
['a','b'].forEach(s=>{const box=$('#labSw'+s.toUpperCase());FIN_KEYS.forEach(k=>{const b=document.createElement('button');b.dataset.v=k;b.style.background=swBg(k);b.title=FIN_META[k].n;b.setAttribute('aria-label',FIN_META[k].n);b.onclick=()=>labSet(s,k);box.appendChild(b)})});
labSet('b','arctic');labSet('a','ocean');
(()=>{const stg=$('#labStage'),sp=$('#labSplit');let drag=false;
 const mv=e=>{const r=stg.getBoundingClientRect();const x=Math.min(.97,Math.max(.03,(e.clientX-r.left)/r.width));sp.style.left=x*100+'%';lab&&lab.split(x)};
 stg.addEventListener('pointerdown',e=>{if(e.target.closest('.lab-light'))return;drag=true;$('#lab').classList.add('touched');stg.setPointerCapture(e.pointerId);mv(e)});
 stg.addEventListener('pointermove',e=>{if(drag)mv(e)});stg.addEventListener('pointerup',()=>drag=false);stg.addEventListener('pointercancel',()=>drag=false);
 $$('#labLight button').forEach(b=>b.onclick=()=>{$$('#labLight button').forEach(x=>x.classList.remove('on'));b.classList.add('on');lab&&lab.light(+b.dataset.v)});
 $('#labTo3d').addEventListener('click',()=>{setFinish(LS[LS.focus]);st.touched=true});
})();

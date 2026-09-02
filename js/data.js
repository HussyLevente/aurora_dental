/* ============================================================
   AURORA — CONTENT MODEL
   Single source of truth for every page. Swap this for real API
   calls when the backend lands; the shapes are the contract.
   ============================================================ */
(function (w) {
  'use strict';

  /* ---------- image helpers ---------- */
  var px = function (id, wd) {
    return 'https://images.pexels.com/photos/' + id + '/pexels-photo-' + id +
      '.jpeg?auto=compress&cs=tinysrgb&w=' + (wd || 1000);
  };
  var us = function (slug, wd) {
    return 'https://images.unsplash.com/photo-' + slug +
      '?auto=format&fit=crop&q=80&w=' + (wd || 1400);
  };

  var IMG = {
    heroPortrait:   us('1667133295315-820bb6481730', 1200),
    chairRoom:      us('1598256989800-fe5f95da9787', 1400),
    clinicDesk:     us('1704455306251-b4634215d98f', 1400),
    waiting:        us('1762625570087-6d98fca29531', 1400),
    reception:      us('1629909613654-28e377c37b09', 1400),
    whiteRoom:      us('1616391182219-e080b4d1043a', 1400),
    roomWide:       us('1704455306925-1401c3012117', 1400),
    officeDesk:     us('1635108198085-89b73e046fdb', 1400),
    chairRed:       px(6627447, 1300),
    tools:          us('1606811856475-5e6fcdc6e509', 1200),
    mirror:         us('1698749778813-ad5f2814e50f', 1200),
    aligners:       us('1564420228450-d9a5bc8d6565', 1200),
    implantModel:   us('1593022356769-11f762e25ed9', 1200),
    exam:           us('1606811971618-4486d14f3f99', 1200),
    surgery:        us('1588776814546-daab30f310ce', 1200),
    smileWoman:     us('1489278353717-f64c6ee8a4d2', 1000),
    smileTeeth:     us('1677026010083-78ec7f1b84ed', 1000),
    smileMouth:     us('1670250492416-570b5b7343b1', 1000),
    portraitA:      us('1580489944761-15a19d654956', 900),
    portraitB:      us('1567516364473-233c4b6fcfbe', 900),
    portraitC:      us('1568602471122-7832951cc4c5', 900),
    portraitD:      us('1592275772614-ec71b19e326f', 900),
    portraitE:      us('1611695434369-a8f5d76ceb7b', 900),
    portraitF:      us('1581014226839-85d3349f754c', 900),
    portraitG:      us('1562337404-3044c84ac061', 900),
    portraitH:      us('1573294705900-9623cfc746b7', 900),
    bpParliament:   us('1616432902940-b7a1acbc60b3', 1600),
    bpBridge:       us('1541343672885-9be56236302a', 1600),
    bpChurch:       us('1518471152222-d42e38ce6873', 1600),
    bpAerial:       us('1551867633-194f125bddfa', 1600),
    bpCastle:       us('1577366763043-af2d723055ac', 1600),
    bpNight:        us('1507622560124-621e26755fb8', 1600),
    bpTram:         us('1533287134359-95899321af06', 1600),
    bpBasilica:     us('1565426873118-a17ed65d74b9', 1600),
    workA:          px(6627447, 1300),
    workB:          px(3881296, 1300),
    workC:          px(7800666, 1300),
    workD:          px(7800669, 1300),
    workE:          px(6627325, 1300),
    workF:          px(5622257, 1300),
    workG:          px(4269368, 1300),
    workH:          px(6627471, 1300),
    workI:          px(4269682, 1300),
    workJ:          px(3952136, 1300),
    workK:          px(4269687, 1300),
    workL:          px(5355830, 1300),
    workM:          px(14235198, 1300),
    workN:          px(20596941, 1300)
  };

  /* ============================================================
     CLINIC
     ============================================================ */
  var CLINIC = {
    name: 'Aurora',
    full: 'Aurora Dental Studio',
    tagline: 'A calmer kind of dentistry.',
    since: 2009,
    email: 'hello@auroradental.hu',
    phone: '+36 1 445 0290',
    phoneHref: '+3614450290',
    emergency: '+36 30 445 0299',
    emergencyHref: '+36304450299',
    tz: 'Europe/Budapest',
    social: [
      { n: 'Instagram', u: '#', i: 'ig' },
      { n: 'Facebook', u: '#', i: 'fb' },
      { n: 'LinkedIn', u: '#', i: 'in' },
      { n: 'YouTube', u: '#', i: 'yt' }
    ]
  };

  /* ============================================================
     LOCATIONS — three Budapest studios
     ============================================================ */
  var LOCATIONS = [
    {
      id: 'belvaros',
      no: '01',
      name: 'Aurora Belváros',
      role: 'Flagship studio',
      street: 'Váci utca 32',
      district: 'V. kerület',
      post: '1052 Budapest',
      phone: '+36 1 445 0290',
      phoneHref: '+3614450290',
      email: 'belvaros@auroradental.hu',
      lat: 47.4925,
      lon: 19.053,
      rooms: 7,
      opened: 2009,
      img: IMG.reception,
      gallery: [IMG.waiting, IMG.chairRoom, IMG.whiteRoom],
      blurb: 'Our first address and still the heart of the practice. Seven treatment rooms, the in-house ceramics lab and the surgical suite all sit above the pedestrian stretch of Váci utca.',
      transport: [
        'M1 / M2 / M3 — Deák Ferenc tér, 6 min walk',
        'Tram 47, 48, 49 — Fővám tér, 4 min walk',
        'Parking: Aranykéz utca garage, validated for patients'
      ],
      features: ['In-house ceramics lab', 'Surgical suite', 'CBCT 3D imaging', 'Step-free access'],
      hours: [
        ['Monday', '08:00', '20:00'],
        ['Tuesday', '08:00', '20:00'],
        ['Wednesday', '08:00', '20:00'],
        ['Thursday', '08:00', '20:00'],
        ['Friday', '08:00', '18:00'],
        ['Saturday', '09:00', '14:00'],
        ['Sunday', null, null]
      ]
    },
    {
      id: 'buda',
      no: '02',
      name: 'Aurora Buda',
      role: 'Family & orthodontics',
      street: 'Margit körút 47',
      district: 'II. kerület',
      post: '1024 Budapest',
      phone: '+36 1 445 0291',
      phoneHref: '+3614450291',
      email: 'buda@auroradental.hu',
      lat: 47.5127,
      lon: 19.0296,
      rooms: 5,
      opened: 2016,
      img: IMG.clinicDesk,
      gallery: [IMG.officeDesk, IMG.roomWide, IMG.chairRed],
      blurb: 'Built around families. A dedicated children’s room with its own entrance, two orthodontic bays, and a quiet garden courtyard for the wait that is never long.',
      transport: [
        'Tram 4 / 6 — Margit híd, budai hídfő, 3 min walk',
        'Bus 91, 191 — Mechwart liget, 2 min walk',
        'Parking: free street parking after 18:00'
      ],
      features: ['Children’s room', 'Orthodontic bays', 'Garden courtyard', 'Sedation available'],
      hours: [
        ['Monday', '08:00', '19:00'],
        ['Tuesday', '08:00', '19:00'],
        ['Wednesday', '08:00', '19:00'],
        ['Thursday', '08:00', '19:00'],
        ['Friday', '08:00', '17:00'],
        ['Saturday', '09:00', '13:00'],
        ['Sunday', null, null]
      ]
    },
    {
      id: 'andrassy',
      no: '03',
      name: 'Aurora Andrássy',
      role: 'Aesthetics & implants',
      street: 'Andrássy út 66',
      district: 'VI. kerület',
      post: '1062 Budapest',
      phone: '+36 1 445 0292',
      phoneHref: '+3614450292',
      email: 'andrassy@auroradental.hu',
      lat: 47.5075,
      lon: 19.0672,
      rooms: 6,
      opened: 2021,
      img: IMG.whiteRoom,
      gallery: [IMG.chairRoom, IMG.waiting, IMG.roomWide],
      blurb: 'A restored first-floor apartment on the boulevard, rebuilt for digital dentistry. Smile design, veneers and full-arch implant work happen here, under six metre ceilings.',
      transport: [
        'M1 — Vörösmarty utca, 1 min walk',
        'Trolley 70, 78 — Andrássy út, at the door',
        'Parking: Oktogon underground, 5 min walk'
      ],
      features: ['Digital smile design', 'Intraoral scanning', 'Full-arch implants', 'Evening clinics'],
      hours: [
        ['Monday', '09:00', '20:00'],
        ['Tuesday', '09:00', '20:00'],
        ['Wednesday', '09:00', '20:00'],
        ['Thursday', '09:00', '20:00'],
        ['Friday', '09:00', '18:00'],
        ['Saturday', null, null],
        ['Sunday', null, null]
      ]
    }
  ];

  /* ============================================================
     TEAM
     ============================================================ */
  var TEAM = [
    {
      id: 'kelemen',
      name: 'Dr. Nóra Kelemen',
      role: 'Founder & Clinical Director',
      dept: 'Prosthodontics',
      img: px(32254667, 900),
      since: 2009,
      locations: ['belvaros', 'andrassy'],
      langs: ['Hungarian', 'English', 'German'],
      quote: 'The best dentistry is the kind nobody notices — including the patient.',
      bio: 'Nóra founded Aurora in 2009 after eight years in Vienna, with one stubborn idea: that a dental practice could feel like somewhere you would choose to spend an hour. She leads the prosthodontic and full-mouth rehabilitation cases, and still sees every new patient at least once.',
      creds: ['DMD, Semmelweis University', 'Specialist in Prosthodontics, Vienna', 'ITI Fellow', 'Member, Hungarian Dental Association'],
      focus: ['Full-mouth rehabilitation', 'Ceramic crowns & bridges', 'Complex treatment planning'],
      services: ['crown', 'inlay', 'veneers', 'dsd', 'exam']
    },
    {
      id: 'vargha',
      name: 'Dr. Ádám Vargha',
      role: 'Head of Oral Surgery',
      dept: 'Implantology',
      img: px(6129500, 900),
      since: 2011,
      locations: ['belvaros', 'andrassy'],
      langs: ['Hungarian', 'English'],
      quote: 'Plan for an hour, operate for twenty minutes. That order matters.',
      bio: 'Ádám has placed more than 4,000 implants and teaches guided surgery protocols at two European training centres. He works almost entirely from 3D planning, which is why his surgical appointments are famously short.',
      creds: ['DMD, University of Szeged', 'Specialist in Oral Surgery', 'Straumann certified trainer', 'Guided surgery instructor'],
      focus: ['Single & full-arch implants', 'Bone grafting and sinus lift', 'Guided surgery'],
      services: ['implant', 'graft', 'wisdom', 'exam']
    },
    {
      id: 'szabo',
      name: 'Dr. Réka Szabó',
      role: 'Orthodontist',
      dept: 'Orthodontics',
      img: px(7904457, 900),
      since: 2014,
      locations: ['buda', 'andrassy'],
      langs: ['Hungarian', 'English', 'French'],
      quote: 'Straight is easy. Stable is the actual job.',
      bio: 'Réka runs the aligner and fixed-appliance programme across both studios. She is unusually direct about what orthodontics can and cannot do, which patients tend to remember as the reason they trusted her.',
      creds: ['DMD, Semmelweis University', 'Specialist in Orthodontics', 'Invisalign Diamond provider', 'Angle Society member'],
      focus: ['Clear aligners', 'Fixed appliances', 'Adult orthodontics', 'Retention planning'],
      services: ['aligners', 'braces', 'exam']
    },
    {
      id: 'horvath',
      name: 'Dr. Milán Horváth',
      role: 'Endodontist',
      dept: 'Endodontics',
      img: px(6762869, 900),
      since: 2013,
      locations: ['belvaros'],
      langs: ['Hungarian', 'English'],
      quote: 'A tooth you keep is always better than the best thing I can build.',
      bio: 'Milán works exclusively under the microscope, mostly on teeth other clinics have already given up on. Aurora’s retreatment success rate sits at 94% over five years, which is his number more than anyone’s.',
      creds: ['DMD, University of Debrecen', 'Microscopic endodontics, Milan', 'ESE member'],
      focus: ['Microscopic root canal', 'Retreatment', 'Trauma & cracked teeth'],
      services: ['root', 'emergency', 'exam']
    },
    {
      id: 'barna',
      name: 'Dr. Zsófia Barna',
      role: 'Paediatric Dentist',
      dept: 'Paediatrics',
      img: px(8459997, 900),
      since: 2018,
      locations: ['buda'],
      langs: ['Hungarian', 'English', 'Slovak'],
      quote: 'The first visit decides the next forty years. No pressure.',
      bio: 'Zsófia built Aurora’s children’s programme from scratch, including the "no treatment on visit one" rule that made it work. Her room in Buda has its own entrance so nobody under ten has to walk past a drill.',
      creds: ['DMD, Semmelweis University', 'Paediatric dentistry residency', 'Behaviour guidance certification'],
      focus: ['First visits', 'Fluoride & sealants', 'Anxious children', 'Early orthodontic screening'],
      services: ['kids', 'exam', 'hygiene']
    },
    {
      id: 'biro',
      name: 'Dr. Tamás Bíró',
      role: 'Periodontist',
      dept: 'Periodontology',
      img: px(6129497, 900),
      since: 2015,
      locations: ['belvaros', 'buda'],
      langs: ['Hungarian', 'English', 'German'],
      quote: 'Gums are the foundation. Everyone wants to skip to the walls.',
      bio: 'Tamás handles gum disease, recession grafting and the maintenance programmes that keep implants in place for decades. He is the person the rest of the team calls before any large case is signed off.',
      creds: ['DMD, University of Pécs', 'Specialist in Periodontology', 'EFP certified', 'Soft-tissue grafting, Bern'],
      focus: ['Periodontal therapy', 'Gum grafting', 'Peri-implant maintenance'],
      services: ['gum', 'hygiene', 'exam']
    },
    {
      id: 'farago',
      name: 'Dr. Eszter Faragó',
      role: 'Aesthetic Dentist',
      dept: 'Aesthetics',
      img: px(7578810, 900),
      since: 2019,
      locations: ['andrassy'],
      langs: ['Hungarian', 'English', 'Italian'],
      quote: 'I would rather remove nothing and change everything.',
      bio: 'Eszter leads digital smile design and the minimally invasive veneer work. She trained in Florence under a no-preparation protocol and brought the whole workflow back with her, mock-ups included.',
      creds: ['DMD, Semmelweis University', 'Aesthetic dentistry, Florence', 'DSD Residency 1 & 2'],
      focus: ['Porcelain veneers', 'Composite bonding', 'Digital smile design', 'Whitening'],
      services: ['veneers', 'bonding', 'dsd', 'whitening']
    },
    {
      id: 'kovacs',
      name: 'Lilla Kovács',
      role: 'Lead Dental Hygienist',
      dept: 'Hygiene',
      img: px(18788957, 900),
      since: 2012,
      locations: ['belvaros', 'buda', 'andrassy'],
      langs: ['Hungarian', 'English'],
      quote: 'Most of what I do is teaching. The polishing takes ten minutes.',
      bio: 'Lilla has seen more Aurora patients than anyone else in the building. She runs the hygiene programme across all three studios and trains every new hygienist who joins.',
      creds: ['Dental Hygiene, Semmelweis', 'Airflow & Guided Biofilm Therapy certified', 'Periodontal maintenance specialist'],
      focus: ['Guided biofilm therapy', 'Airflow polishing', 'Home-care coaching'],
      services: ['hygiene', 'gum', 'whitening']
    },
    {
      id: 'fodor',
      name: 'Bence Fodor',
      role: 'Head of Digital Lab',
      dept: 'Ceramics',
      img: px(8460157, 900),
      since: 2017,
      locations: ['belvaros'],
      langs: ['Hungarian', 'English'],
      quote: 'Colour is 90% of it. The shape people forgive.',
      bio: 'Bence runs the in-house lab: milling, layering and staining every crown and veneer that leaves the building. Having him thirty steps from the chair is why single-visit ceramics work here at all.',
      creds: ['Master Dental Technician', 'Ceramic layering, Zurich', 'CAD/CAM specialist'],
      focus: ['Ceramic layering', 'Shade matching', 'Same-day restorations'],
      services: ['crown', 'veneers', 'inlay']
    },
    {
      id: 'palinkas',
      name: 'Gergő Pálinkás',
      role: 'Imaging & Radiology Lead',
      dept: 'Imaging',
      img: px(4270371, 900),
      since: 2020,
      locations: ['belvaros', 'andrassy'],
      langs: ['Hungarian', 'English'],
      quote: 'Every millimetre we can see is a millimetre nobody has to guess.',
      bio: 'Gergő runs the CBCT and intraoral scanning suite, and keeps Aurora’s radiation doses among the lowest recorded in the city. He also built the 3D planning workflow the surgical team uses daily.',
      creds: ['Radiographic technologist', 'CBCT specialist certification', 'Low-dose protocol design'],
      focus: ['3D imaging', 'Intraoral scanning', 'Surgical planning'],
      services: ['exam', 'implant', 'dsd']
    }
  ];

  /* ============================================================
     SERVICES
     ============================================================ */
  var CATS = [
    { id: 'all', n: 'Everything' },
    { id: 'preventive', n: 'Preventive' },
    { id: 'restorative', n: 'Restorative' },
    { id: 'cosmetic', n: 'Cosmetic' },
    { id: 'ortho', n: 'Orthodontics' },
    { id: 'surgical', n: 'Surgical' },
    { id: 'kids', n: 'Children' }
  ];

  var SERVICES = [
    {
      id: 'exam', no: '01', cat: 'preventive',
      name: 'Examination & 3D Scan',
      short: 'A full baseline: photographs, digital scan, and a written plan.',
      price: 18000, priceNote: 'first visit', dur: 45, durLabel: '45 min',
      img: IMG.exam,
      long: 'Your first appointment is deliberately unhurried. We photograph, scan and — when it changes the plan — take a low-dose 3D image, then sit down at a desk rather than a chair and walk through what we found. You leave with a written plan and a price for every line on it. Nothing gets treated on day one unless you are in pain.',
      includes: ['Full clinical examination', 'Intraoral digital scan', 'Photographic record', 'Oral cancer screening', 'Written plan with itemised costs'],
      after: 'Nothing. You can eat, drink and go back to work immediately.',
      team: ['kelemen', 'horvath', 'biro']
    },
    {
      id: 'hygiene', no: '02', cat: 'preventive',
      name: 'Hygiene & Airflow Polish',
      short: 'Guided biofilm therapy — gentler and considerably more thorough.',
      price: 24000, priceNote: 'per session', dur: 50, durLabel: '50 min',
      img: IMG.workE,
      long: 'We use guided biofilm therapy: your plaque is disclosed with a dye so both of us can see exactly what is there, removed with a warm-water airflow rather than scraped, and only then finished with ultrasonics where it is genuinely needed. Most patients describe it as the first cleaning that did not make them flinch.',
      includes: ['Biofilm disclosure', 'Airflow powder polish', 'Targeted ultrasonic scaling', 'Gum pocket measurements', 'Personal home-care plan'],
      after: 'Avoid strongly staining food and drink for a few hours. That is all.',
      team: ['kovacs', 'biro']
    },
    {
      id: 'gum', no: '03', cat: 'preventive',
      name: 'Periodontal Therapy',
      short: 'Structured treatment for gum disease, staged over three visits.',
      price: 58000, priceNote: 'per quadrant', dur: 60, durLabel: '60 min',
      img: IMG.workL,
      long: 'Gum disease is the most common reason adults lose teeth, and it is almost always treatable when it is caught. We chart every pocket, treat quadrant by quadrant under local anaesthetic, and then re-measure at twelve weeks so you can see the numbers move rather than take our word for it.',
      includes: ['Full periodontal charting', 'Sub-gingival debridement', 'Local anaesthetic', 'Twelve-week review', 'Maintenance schedule'],
      after: 'Mild sensitivity for a few days. Soft foods on the treated side.',
      team: ['biro', 'kovacs']
    },
    {
      id: 'bonding', no: '04', cat: 'cosmetic',
      name: 'Composite Bonding',
      short: 'Chips, gaps and worn edges rebuilt in a single visit.',
      price: 42000, priceNote: 'per tooth', dur: 60, durLabel: '60 min',
      img: IMG.smileTeeth,
      long: 'Composite bonding is the least invasive thing in cosmetic dentistry: no drilling, no lab, no second appointment. We layer tooth-coloured resin directly onto the surface, shape it by hand and polish it until the join disappears. It is reversible, which is exactly why we usually suggest it first.',
      includes: ['Shade matching', 'No tooth reduction', 'Hand-layered composite', 'Polish & finish', 'Two-year guarantee'],
      after: 'Eat normally after an hour. Avoid biting nails or pens.',
      team: ['farago', 'kelemen']
    },
    {
      id: 'whitening', no: '05', cat: 'cosmetic',
      name: 'Professional Whitening',
      short: 'In-chair session plus custom trays for the top-ups.',
      price: 89000, priceNote: 'complete', dur: 75, durLabel: '75 min',
      img: IMG.smileWoman,
      long: 'One supervised in-chair session lifts the base shade, then you take home custom-moulded trays and enough gel to finish the job at your own pace. Supervised whitening is both faster and considerably safer than anything sold over a counter, and we check your enamel and gums before we start.',
      includes: ['Shade record before & after', 'In-chair activation session', 'Custom-moulded trays', 'Two-week home gel supply', 'Sensitivity management'],
      after: 'A white diet for 48 hours: no coffee, red wine, or curry.',
      team: ['farago', 'kovacs']
    },
    {
      id: 'veneers', no: '06', cat: 'cosmetic',
      name: 'Porcelain Veneers',
      short: 'Minimal-preparation ceramics, designed and tried in first.',
      price: 210000, priceNote: 'per tooth', dur: 120, durLabel: '2 visits',
      img: IMG.workI,
      long: 'We do not start veneers with a drill. We start with a digital design and a physical mock-up bonded onto your own teeth so you can wear the proposed smile out of the building and think about it for a week. Only once you have signed off does anything permanent happen, and preparation is typically under 0.5mm.',
      includes: ['Digital smile design', 'Wearable mock-up', 'Minimal preparation', 'In-house ceramics', 'Ten-year guarantee'],
      after: 'Some sensitivity between visits while temporaries are in place.',
      team: ['farago', 'kelemen', 'fodor']
    },
    {
      id: 'dsd', no: '07', cat: 'cosmetic',
      name: 'Digital Smile Design',
      short: 'See the outcome before anyone commits to it.',
      price: 55000, priceNote: 'credited to treatment', dur: 60, durLabel: '60 min',
      img: IMG.workJ,
      long: 'A planning appointment, not a treatment. We scan, photograph and film how you speak and smile, then design the result on screen with you in the room, adjusting proportions until it looks like you rather than a catalogue. The fee comes straight off your treatment if you go ahead.',
      includes: ['Video & photographic analysis', 'Facial proportion mapping', '3D design session', 'Printed mock-up', 'Fee credited to treatment'],
      after: 'Nothing — this appointment is entirely non-invasive.',
      team: ['farago', 'kelemen', 'palinkas']
    },
    {
      id: 'inlay', no: '08', cat: 'restorative',
      name: 'Ceramic Inlay / Onlay',
      short: 'Milled and fitted the same day, in our own lab.',
      price: 95000, priceNote: 'per tooth', dur: 90, durLabel: '90 min',
      img: IMG.workF,
      long: 'Where a filling would be too large and a crown too destructive, a ceramic inlay sits precisely in between. Ours are scanned, designed and milled in the lab thirty steps from the chair, so you walk out with the final restoration bonded in place rather than a temporary and a return appointment.',
      includes: ['Digital scan, no impressions', 'Same-day milling', 'Hand-stained finish', 'Adhesive bonding', 'Seven-year guarantee'],
      after: 'Numbness for two hours. Normal eating after that.',
      team: ['kelemen', 'fodor']
    },
    {
      id: 'root', no: '09', cat: 'restorative',
      name: 'Root Canal Treatment',
      short: 'Performed entirely under the microscope.',
      price: 68000, priceNote: 'from, per tooth', dur: 90, durLabel: '90 min',
      img: IMG.mirror,
      long: 'Every root canal here is done under high magnification, which is the difference between finding four canals and finding three. Most cases are completed in a single visit with rubber dam isolation, and the anaesthetic protocol is aggressive enough that the appointment is usually described afterwards as boring.',
      includes: ['Microscope throughout', 'Rubber dam isolation', 'Rotary & manual shaping', '3D warm obturation', 'Post-operative review'],
      after: 'Tenderness on biting for two or three days is normal.',
      team: ['horvath']
    },
    {
      id: 'crown', no: '10', cat: 'restorative',
      name: 'Zirconia Crown',
      short: 'Layered by hand in-house, shade matched in daylight.',
      price: 145000, priceNote: 'per unit', dur: 120, durLabel: '2 visits',
      img: IMG.implantModel,
      long: 'Zirconia gives the strength of metal without the grey line at the gum. Bence layers and stains each unit by hand in our lab, and we match the shade at the window in daylight rather than under a surgery lamp, which is why Aurora crowns tend to disappear next to the neighbouring teeth.',
      includes: ['Digital scan', 'Temporary crown', 'In-house layering', 'Daylight shade matching', 'Ten-year guarantee'],
      after: 'A temporary crown for around a week. Avoid sticky food on it.',
      team: ['kelemen', 'fodor']
    },
    {
      id: 'implant', no: '11', cat: 'surgical',
      name: 'Dental Implant',
      short: 'Fully guided placement from a 3D plan.',
      price: 320000, priceNote: 'implant & abutment', dur: 60, durLabel: '60 min',
      img: IMG.surgery,
      long: 'The surgery is the short part. We plan the position in 3D against the crown that will eventually sit on it, print a surgical guide, and place the implant through that guide — typically in twenty minutes, flapless where the anatomy allows. Crown fitted after healing, usually at three months.',
      includes: ['CBCT 3D planning', 'Printed surgical guide', 'Swiss titanium implant', 'Healing abutment', 'All surgical reviews'],
      after: 'Swelling for two to three days. Most patients work the next morning.',
      team: ['vargha', 'palinkas']
    },
    {
      id: 'graft', no: '12', cat: 'surgical',
      name: 'Bone Graft & Sinus Lift',
      short: 'Rebuilding the foundation when there is not enough left.',
      price: 180000, priceNote: 'from', dur: 90, durLabel: '90 min',
      img: IMG.workD,
      long: 'When a tooth has been missing for years the bone recedes with it. Grafting rebuilds enough volume to hold an implant properly, using either your own bone or a certified substitute. It adds months to a treatment plan, but it is the difference between an implant that lasts five years and one that lasts thirty.',
      includes: ['3D volumetric assessment', 'Graft material of your choice', 'Membrane placement', 'Suturing & review', 'Healing monitoring'],
      after: 'Swelling for up to five days. Soft diet for two weeks.',
      team: ['vargha']
    },
    {
      id: 'wisdom', no: '13', cat: 'surgical',
      name: 'Wisdom Tooth Removal',
      short: 'Assessed in 3D first, so nothing is a surprise.',
      price: 65000, priceNote: 'per tooth', dur: 45, durLabel: '45 min',
      img: IMG.workH,
      long: 'Not every wisdom tooth needs to go. We image first and tell you honestly which ones can stay. When one does have to come out, the 3D scan shows us exactly where the nerve runs, which is what turns a feared appointment into a twenty-minute one.',
      includes: ['3D nerve mapping', 'Local anaesthetic or sedation', 'Surgical extraction', 'Dissolvable sutures', '48-hour check-in call'],
      after: 'Swelling and stiffness for three days. Take the full week easy.',
      team: ['vargha']
    },
    {
      id: 'aligners', no: '14', cat: 'ortho',
      name: 'Invisible Aligners',
      short: 'Full arch correction with a printed preview on day one.',
      price: 690000, priceNote: 'complete course', dur: 45, durLabel: '9–14 months',
      img: IMG.aligners,
      long: 'We scan, simulate the entire movement sequence, and show you the finish line before you decide. Aligners are changed weekly at home with reviews every six weeks, and the fee covers everything: refinements, retainers and the first year of replacements if one gets lost.',
      includes: ['Digital treatment simulation', 'All aligner sets', 'Six-weekly reviews', 'Refinement round', 'Fixed & removable retainers'],
      after: 'Speech takes two or three days to adjust. Wear them 22 hours a day.',
      team: ['szabo']
    },
    {
      id: 'braces', no: '15', cat: 'ortho',
      name: 'Fixed Appliances',
      short: 'Ceramic or metal, for the cases aligners cannot reach.',
      price: 480000, priceNote: 'complete course', dur: 60, durLabel: '12–24 months',
      img: IMG.workK,
      long: 'Some movements — significant rotations, real bite corrections, closing extraction spaces — still need a fixed appliance. Ceramic brackets keep it discreet, and the total course is quoted as one figure at the start, adjustments and retainers included, so nothing appears later.',
      includes: ['Ceramic or metal brackets', 'All adjustment visits', 'Emergency repairs', 'Debond & polish', 'Retainers included'],
      after: 'Tenderness for three or four days after each adjustment.',
      team: ['szabo']
    },
    {
      id: 'kids', no: '16', cat: 'kids',
      name: 'Children’s Visit',
      short: 'The first appointment involves no treatment at all.',
      price: 12000, priceNote: 'per visit', dur: 30, durLabel: '30 min',
      img: IMG.workH,
      long: 'Visit one is a tour: the chair goes up and down, the suction is demonstrated on a finger, teeth get counted with a mirror, and everyone leaves. No treatment, no exceptions. It costs us a slot and saves the next twenty years of dental anxiety, which we think is a fair trade.',
      includes: ['Chair familiarisation', 'Tooth count & check', 'Fluoride varnish when ready', 'Sealants where needed', 'Brushing session with a parent'],
      after: 'No eating or drinking for thirty minutes after fluoride.',
      team: ['barna']
    },
    {
      id: 'emergency', no: '17', cat: 'restorative',
      name: 'Emergency Appointment',
      short: 'Same-day slots held open at every studio, every day.',
      price: 25000, priceNote: 'assessment & relief', dur: 30, durLabel: '30 min',
      img: IMG.tools,
      long: 'Every studio keeps emergency slots unbooked until the morning of. Call before 10:00 and you will almost always be seen the same day. The visit is about getting you out of pain and stabilising the tooth — the definitive plan comes afterwards, when you can think straight.',
      includes: ['Same-day assessment', 'Targeted radiograph', 'Pain relief & stabilisation', 'Temporary restoration', 'Follow-up plan'],
      after: 'Depends entirely on the cause — you will be told before you leave.',
      team: ['horvath', 'vargha', 'kelemen']
    },
    {
      id: 'guard', no: '18', cat: 'preventive',
      name: 'Night Guard',
      short: 'For grinding, jaw pain, and protecting existing work.',
      price: 65000, priceNote: 'complete', dur: 40, durLabel: '2 visits',
      img: IMG.workG,
      long: 'If you wake with a tight jaw or your partner has mentioned the noise, a guard is the cheapest insurance in dentistry. We scan rather than take impressions, mill it to your specific bite, and adjust it at a second short visit once you have slept in it a few times.',
      includes: ['Digital bite scan', 'Milled hard-soft guard', 'Fitting & adjustment', 'Protective case', 'Annual review'],
      after: 'Expect a week to get used to sleeping in it.',
      team: ['kelemen', 'biro']
    }
  ];

  /* ============================================================
     MEMBERSHIP PLANS
     ============================================================ */
  var PLANS = [
    {
      id: 'essential', name: 'Essential', price: 6900, per: '/ month',
      d: 'For healthy mouths that want to stay that way.',
      f: ['2 examinations per year', '2 hygiene sessions per year', 'All routine radiographs', '10% off all treatment', 'Emergency slot priority'],
      hero: false
    },
    {
      id: 'complete', name: 'Complete', price: 12900, per: '/ month',
      d: 'The plan most of our patients are on.',
      f: ['3 examinations per year', '3 hygiene sessions per year', 'All radiographs & 3D imaging', '20% off all treatment', 'Same-day emergency guarantee', 'Free night guard replacement', 'Whitening top-up gel annually'],
      hero: true
    },
    {
      id: 'family', name: 'Family', price: 19900, per: '/ month',
      d: 'Two adults, up to three children under 18.',
      f: ['Everything in Complete, for two adults', 'Unlimited children’s visits', 'Free fluoride & sealants', '20% off all treatment', 'Orthodontic assessment included', 'One shared appointment block'],
      hero: false
    }
  ];

  /* ============================================================
     REVIEWS
     ============================================================ */
  var REVIEWS = [
    { id: 'r1', n: 'Katalin Molnár', r: 5, s: 'Google', svc: 'implant', loc: 'belvaros', d: '2026-07-18', t: 'I put off the implant for four years because of one bad experience elsewhere. Dr. Vargha showed me the 3D plan on a screen, explained exactly what would happen, and the whole thing took twenty-five minutes. I went back to the office afterwards. Four years of dread for twenty-five minutes.' },
    { id: 'r2', n: 'James Whitfield', r: 5, s: 'Google', svc: 'veneers', loc: 'andrassy', d: '2026-07-02', t: 'Flew in from London for veneers and expected the usual hard sell. Instead Dr. Faragó talked me down from ten to six, made a mock-up I wore for a week, and the final result looks like teeth rather than tiles. Genuinely the best clinical experience I have had anywhere.' },
    { id: 'r3', n: 'Eszter Tóth', r: 5, s: 'Doctolib', svc: 'hygiene', loc: 'buda', d: '2026-06-28', t: 'Lilla is the first hygienist who has not made me feel guilty about flossing. She showed me what I was actually doing wrong with a mirror and the dye, and my gums stopped bleeding within a month. Small thing, enormous difference.' },
    { id: 'r4', n: 'Márton Sipos', r: 5, s: 'Google', svc: 'root', loc: 'belvaros', d: '2026-06-14', t: 'A root canal I would describe as boring, which is the highest praise I can give. Dr. Horváth kept the anaesthetic topped up without me asking and finished in one visit. No pain afterwards at all — I did not take a single painkiller.' },
    { id: 'r5', n: 'Anna Kovács', r: 5, s: 'Facebook', svc: 'kids', loc: 'buda', d: '2026-06-09', t: 'My son is six and terrified of everything. Dr. Barna did nothing on the first visit except let him ride the chair and count her teeth with the mirror. He asked when we were going back. I nearly cried in the corridor.' },
    { id: 'r6', n: 'Gábor Fekete', r: 4, s: 'Google', svc: 'aligners', loc: 'andrassy', d: '2026-05-30', t: 'Fourteen months of aligners, finished exactly on the simulation they showed me at the start. Only reason it is four stars and not five is that parking near Andrássy is genuinely awful. The dentistry was faultless.' },
    { id: 'r7', n: 'Sophie Bernard', r: 5, s: 'Google', svc: 'crown', loc: 'belvaros', d: '2026-05-22', t: 'They matched the crown at the window in actual daylight, holding it against my other teeth, and adjusted it twice until it was right. I cannot find it in photographs. That level of fuss over one tooth tells you everything.' },
    { id: 'r8', n: 'Zoltán Varga', r: 5, s: 'Doctolib', svc: 'emergency', loc: 'belvaros', d: '2026-05-11', t: 'Cracked a molar on a Saturday morning. Called at nine, seen at eleven, out of pain by noon and given a proper plan for the following week. No lecture, no upsell, no drama.' },
    { id: 'r9', n: 'Petra Nagy', r: 5, s: 'Google', svc: 'whitening', loc: 'andrassy', d: '2026-04-27', t: 'Four shades lighter and zero sensitivity, which I did not think was possible for me. They talked me out of going further than my enamel could take, which frankly cost them money and bought them a patient for life.' },
    { id: 'r10', n: 'Daniel Bauer', r: 5, s: 'Google', svc: 'gum', loc: 'buda', d: '2026-04-15', t: 'Two clinics told me I would lose the lower front teeth. Dr. Bíró charted everything, treated it over three visits, and at the twelve-week review the pockets had gone from 7mm to 3mm. I still have all of them, two years on.' },
    { id: 'r11', n: 'Júlia Simon', r: 5, s: 'Facebook', svc: 'bonding', loc: 'belvaros', d: '2026-04-03', t: 'Chipped a front tooth on a wine glass, of all things. Ninety minutes later you could not tell which one it was. No drilling, no injection, and it cost less than my dinner had.' },
    { id: 'r12', n: 'Ferenc Balogh', r: 4, s: 'Google', svc: 'wisdom', loc: 'belvaros', d: '2026-03-21', t: 'Two wisdom teeth out in one sitting. Swelling for three days as they warned, and someone actually rang me on day two to check. Docking a star only because the recovery was rougher than I had braced for — but they had told me it might be.' },
    { id: 'r13', n: 'Nikolett Rácz', r: 5, s: 'Doctolib', svc: 'exam', loc: 'andrassy', d: '2026-03-08', t: 'The first appointment was forty-five minutes at a desk, not in a chair, going through photographs of my own mouth. I understood my teeth for the first time in my life. Every dentist should do this.' },
    { id: 'r14', n: 'Tamás Lukács', r: 5, s: 'Google', svc: 'implant', loc: 'andrassy', d: '2026-02-19', t: 'Full upper arch. Eight months, a lot of planning appointments, and not one surprise on the invoice — the figure I was quoted in October was the figure I paid in June. That is rarer than good dentistry.' },
    { id: 'r15', n: 'Réka Halász', r: 5, s: 'Google', svc: 'hygiene', loc: 'belvaros', d: '2026-02-06', t: 'I have white-coat anxiety badly enough that I have fainted in a dental chair before. They booked me the first slot of the day, kept the room quiet, and let me hold the suction myself. Nobody made me feel ridiculous about any of it.' },
    { id: 'r16', n: 'Michael Osei', r: 5, s: 'Google', svc: 'crown', loc: 'belvaros', d: '2026-01-24', t: 'Scanned, milled and fitted in one afternoon while I worked from their waiting room on the wifi. Having the lab in the building is not a gimmick — it saved me a second flight to Budapest.' },
    { id: 'r17', n: 'Bernadett Fehér', r: 5, s: 'Facebook', svc: 'aligners', loc: 'buda', d: '2026-01-12', t: 'Dr. Szabó told me plainly that aligners would get me 80% of what I wanted and braces would get me 100%, then let me choose without pushing. I went with aligners and I am delighted. Being trusted to decide made all the difference.' },
    { id: 'r18', n: 'Ádám Kiss', r: 5, s: 'Google', svc: 'guard', loc: 'buda', d: '2025-12-15', t: 'Years of waking with headaches. The guard fixed it in a fortnight. I feel slightly stupid for not doing it a decade ago, but nobody had ever connected the two things for me before.' },
    { id: 'r19', n: 'Laura Vincze', r: 5, s: 'Doctolib', svc: 'inlay', loc: 'belvaros', d: '2025-11-28', t: 'Old amalgam replaced with a ceramic inlay in a single visit. No impressions — just a scan with a wand, which for someone with a gag reflex like mine is worth the fee on its own.' },
    { id: 'r20', n: 'Krisztián Deák', r: 5, s: 'Google', svc: 'dsd', loc: 'andrassy', d: '2025-11-10', t: 'The design session was genuinely enjoyable. We sat and adjusted proportions on screen for an hour until it looked like me at 25 rather than a stranger. Then they credited the whole fee against the treatment.' }
  ];

  /* ============================================================
     FAQ
     ============================================================ */
  var FAQ = [
    { q: 'Do I need a referral to book?', a: 'No. Aurora is a private practice and you can book any appointment directly, including with our specialists. If another dentist has referred you, bring their notes and any recent images and we will work from those rather than repeating them.' },
    { q: 'What happens at a first appointment?', a: 'Forty-five minutes, most of it at a desk rather than in a chair. We examine, scan and photograph, then go through the findings on a screen with you and write a plan with a price against every line. Unless you are in pain, no treatment happens on the first visit — you take the plan home and decide in your own time.' },
    { q: 'How do you handle dental anxiety?', a: 'Tell us when you book and we will schedule you into the first slot of the day, when the building is quiet. We use a stop signal you control, explain each step before it happens, and can offer oral or intravenous sedation for longer procedures. Roughly one in five of our patients tells us they are anxious, so you will not be a special case.' },
    { q: 'Can I pay in instalments?', a: 'Yes. Any treatment over 150,000 Ft can be split across 3, 6, 12 or 24 months at 0% interest, arranged in-house without a credit check. Our membership plans spread routine care across the year for a fixed monthly fee instead.' },
    { q: 'Do you treat patients from abroad?', a: 'About a third of our implant and cosmetic work is for patients travelling in. We run the consultation remotely from your existing scans, send a written plan and a fixed quote before you fly, and compress treatment into as few visits as the biology allows. We can also recommend hotels within walking distance of each studio.' },
    { q: 'Which languages does the team speak?', a: 'Hungarian and English throughout the practice. Individual clinicians also speak German, French, Italian and Slovak — you can filter by language on the team page and request a specific dentist when booking.' },
    { q: 'What is your cancellation policy?', a: 'Cancel or reschedule free of charge up to 24 hours before your appointment, through this website or by phone. Inside 24 hours we charge 50% of the appointment fee, because that chair time cannot be given to anyone else at short notice.' },
    { q: 'Is there parking at the studios?', a: 'Belváros has validated parking at the Aranykéz utca garage. Andrássy is best reached by the M1 — the nearest garage is at Oktogon. Buda has free street parking after 18:00 and a small patient car park behind the building.' },
    { q: 'Do you see children?', a: 'Yes, from the age of two, at our Buda studio with Dr. Barna. The first visit is always familiarisation only — no treatment, whatever we find — and children on a family membership are seen as often as they need at no extra cost.' },
    { q: 'What guarantees do you offer?', a: 'Ten years on crowns, veneers and implants; seven on ceramic inlays; two on composite bonding. The guarantee holds as long as you attend your scheduled hygiene appointments, which is the only condition and also the thing that actually makes the work last.' },
    { q: 'How do you keep prices fixed?', a: 'Every plan is quoted as an itemised written figure before treatment starts, and that figure is what you pay. If we find something unexpected mid-treatment we stop, tell you, and re-quote before continuing. Nothing is ever added to an invoice you have not seen first.' },
    { q: 'Do you accept insurance?', a: 'We are not contracted to any insurer, but we issue itemised invoices with treatment codes that all Hungarian and most international insurers accept for reimbursement. Ask at reception and we will format it however your provider needs.' }
  ];

  /* ============================================================
     STORY / VALUES / TIMELINE
     ============================================================ */
  var VALUES = [
    { t: 'Nothing on day one', d: 'Unless you are in pain, your first visit is examination and conversation only. You leave with a written plan and no pressure attached to it.', i: 'clock' },
    { t: 'One price, written down', d: 'Every line item is quoted before we begin. If something changes mid-treatment we stop and re-quote rather than adding it to the invoice.', i: 'tag' },
    { t: 'The least we can do', d: 'We start from the most conservative option that solves the problem. A filling before a crown, bonding before veneers, a tooth kept before a tooth replaced.', i: 'leaf' },
    { t: 'The lab is in the building', d: 'Our ceramist works thirty steps from the chair, so shades are matched in person and same-day restorations are routine rather than remarkable.', i: 'cube' },
    { t: 'Time, deliberately', d: 'Appointments here are longer than the industry average by about a third. It is the single biggest reason our patients describe the experience as calm.', i: 'wave' },
    { t: 'Say the real thing', d: 'If a treatment will not work, or a cheaper option will, you will be told plainly. We would rather lose the case than sell you something you did not need.', i: 'chat' }
  ];

  var TIMELINE = [
    { y: '2009', t: 'A single room on Váci utca', d: 'Dr. Nóra Kelemen returns from Vienna and opens a two-chair practice above a bookshop, with one hygienist and a borrowed autoclave.' },
    { y: '2012', t: 'The hygiene programme', d: 'Lilla Kovács joins and rebuilds prevention from the ground up. Within two years, 70% of patients are on a structured recall — a figure the practice has never dropped below since.' },
    { y: '2014', t: 'Digital, entirely', d: 'Aurora retires physical impressions completely. Every restoration from this point forward begins as a scan, which at the time made us the third practice in Hungary to do it.' },
    { y: '2016', t: 'Aurora Buda opens', d: 'A second studio on Margit körút, designed around families, with a children’s room that has its own entrance and no view of a drill.' },
    { y: '2019', t: 'The lab moves in', d: 'Bence Fodor brings the ceramics lab in-house. Same-day crowns stop being a special occasion and become the default.' },
    { y: '2021', t: 'Aurora Andrássy', d: 'A restored first-floor apartment on the boulevard becomes the aesthetics and implant studio, with the digital design suite built into it from the start.' },
    { y: '2024', t: 'Fifteen years, 24,000 patients', d: 'The practice passes 24,000 registered patients across three studios, with 61% of new arrivals coming from a personal recommendation.' },
    { y: '2026', t: 'Where we are now', d: 'Thirty-one people, three studios, and the same rule we opened with: nothing gets treated on the first visit unless it hurts.' }
  ];

  var STATS = [
    { n: 24000, suffix: '+', c: 'Patients registered across three Budapest studios since 2009' },
    { n: 17, suffix: '', c: 'Years of continuous practice under the same clinical director' },
    { n: 4.9, suffix: '', dec: 1, c: 'Average rating from 1,240 verified independent reviews' },
    { n: 61, suffix: '%', c: 'Of new patients arrive through a personal recommendation' }
  ];

  var TECH = [
    { t: 'CBCT 3D imaging', d: 'Low-dose volumetric scanning at roughly a fifth of the radiation of a decade ago.' },
    { t: 'Intraoral scanning', d: 'No impression trays anywhere in the practice since 2014.' },
    { t: 'Surgical microscopes', d: 'Every endodontic case is performed under high magnification.' },
    { t: 'In-house milling', d: 'Ceramic restorations designed, milled and stained on site.' },
    { t: 'Guided surgery', d: 'Printed guides derived from the planned crown position, not the other way round.' },
    { t: 'Guided biofilm therapy', d: 'Disclosed, air-polished, ultrasonic only where genuinely needed.' }
  ];

  var MARQUEE = ['Implantology', 'Aesthetic dentistry', 'Orthodontics', 'Endodontics', 'Paediatrics', 'Periodontology', 'Prosthodontics', 'Digital smile design'];

  w.AURORA = {
    IMG: IMG, img: { px: px, us: us },
    CLINIC: CLINIC, LOCATIONS: LOCATIONS, TEAM: TEAM,
    SERVICES: SERVICES, CATS: CATS, PLANS: PLANS,
    REVIEWS: REVIEWS, FAQ: FAQ, VALUES: VALUES,
    TIMELINE: TIMELINE, STATS: STATS, TECH: TECH, MARQUEE: MARQUEE
  };
})(window);

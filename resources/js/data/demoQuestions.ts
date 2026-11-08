export interface DemoOption {
  key: "A" | "B" | "C" | "D";
  text: string;
}

export interface DemoQuestion {
  id: string;
  number: number;
  section: "LISTENING" | "STRUCTURE" | "READING";
  partType: "PART_A" | "PART_B" | "STRUCTURE" | "WRITTEN_EXPRESSION" | "READING";
  audioScript?: string;
  questionText: string;
  options: {
    A: string;
    B: string;
    C: string;
    D: string;
  };
  correctAnswer: "A" | "B" | "C" | "D";
  explanation: string;
  passageId?: string;
}

export interface DemoPassage {
  id: string;
  section: "LISTENING" | "READING";
  title: string;
  content?: string;
  audioScript?: string;
}

export const DEMO_PASSAGES: Record<string, DemoPassage> = {
  "listening-part-b": {
    id: "listening-part-b",
    section: "LISTENING",
    title: "Percakapan: Reservasi Dokumen Arsip Sejarah Kampus",
    audioScript: `(Man) Good afternoon. I'm working on an undergraduate history research paper on nineteenth-century municipal water systems, and Professor Vance mentioned that the campus archives have original blueprints from that era.
(Woman) Yes, we do! Those blueprints are part of our Rare Documents Special Collection. They're kept in a climate-controlled vault in the basement to preserve the paper.
(Man) Great! Can I check them out and scan them on my personal laptop?
(Woman) Unfortunately, materials in the Special Collection cannot leave the library building under any circumstances. However, you're welcome to study them in our supervised reading room on the second floor. We also have specialized flatbed scanners there that won't damage the fragile parchment.
(Man) That sounds fair. Do I need to book a viewing appointment in advance, or can I just walk in tomorrow?
(Woman) You will need to submit a digital request form through the archive portal at least twenty-four hours ahead. That gives our staff time to retrieve the delicate blueprints from the vault and prepare them for your visit.
(Man) Understood. I'll fill out the online form tonight so they'll be ready by Wednesday morning.`,
  },
  "reading-passage-1": {
    id: "reading-passage-1",
    section: "READING",
    title: "The Evolutionary Mechanics of Bioluminescence in Deep-Sea Organisms",
    content: `    [Line 1] In the perpetually sunless depths of the world's oceans, known as the bathypelagic zone, sunlight ceases to penetrate beyond a depth of roughly one thousand meters. Despite the absolute darkness, crushing hydrostatic pressures, and frigid temperatures, this hostile environment teems with life. The overwhelming majority of deep-sea inhabitants—ranging from delicate jellyfish and comb jellies to predatory anglerfish and cephalopods—possess the remarkable ability to generate their own living light, a phenomenon known as bioluminescence.

    [Line 7] Unlike the incandescent light bulbs fabricated by humans, which expend nearly ninety percent of their consumed energy as radiated heat, bioluminescence is an extraordinarily efficient biochemical process commonly categorized as "cold light." In almost all bioluminescent reactions, a light-emitting pigment molecule termed luciferin undergoes oxidation catalyzed by a specialized enzyme known as luciferase. In the presence of adenosine triphosphate (ATP) and molecular oxygen, this enzymatic reaction releases photons of light with almost negligible thermal dissipation. In the open ocean, the prevailing emitted light spans the blue-green spectrum, primarily because light waves at wavelengths of approximately 470 nanometers transmit most effectively through seawater, allowing signals to propagate over remarkable distances.

    [Line 16] Deep-sea organisms deploy bioluminescence for a wide array of survival strategies. One widespread defensive mechanism is counterillumination, observed prominently in hatchetfish and certain species of midwater squid. These creatures feature light-emitting photophores along their ventral (underside) surfaces. By precisely modulating the intensity and wavelength of their ventral luminescence to match downwelling ambient light filtering from the upper layers, they effectively eliminate their silhouettes, rendering themselves virtually invisible to upward-looking predators swimming below them.

    [Line 23] Conversely, bioluminescence functions as an indispensable offensive asset. The female anglerfish famously wields a modified dorsal spine resembling a fishing rod, tipped with a luminescent bulb called an esca. The esca harbors billions of symbiotic bioluminescent bacteria, which glow steadily in the pitch-black water. Unsuspecting prey, drawn toward the glowing lure under the assumption that it represents food, are swiftly engulfed by the anglerfish's cavernous jaws. Furthermore, bioluminescent flashes serve complex intraspecific communication purposes, enabling dispersed individuals to signal potential mates or deter rivals across the vast, uninterrupted voids of the ocean deep.`,
  },
};

export const DEMO_QUESTIONS: DemoQuestion[] = [
  // ==========================================
  // SECTION 1: LISTENING COMPREHENSION (1 - 10)
  // ==========================================
  {
    id: "demo-q1",
    number: 1,
    section: "LISTENING",
    partType: "PART_A",
    audioScript: `(Man) Did you manage to find the reference book Professor Miller recommended?
(Woman) The bookstore was sold out, but the campus library had a few copies on reserve.
(Narrator) What does the woman imply?`,
    questionText: "What does the woman imply?",
    options: {
      A: "She bought the last copy at the bookstore.",
      B: "The book is available for use at the campus library.",
      C: "Professor Miller kept the reference books for himself.",
      D: "She could not find the book anywhere on campus.",
    },
    correctAnswer: "B",
    explanation:
      "Wanita menyatakan bahwa toko buku kehabisan stok, tetapi perpustakaan kampus memiliki beberapa eksemplar di bagian cadangan ('on reserve'). Jadi buku tersebut tersedia di perpustakaan.",
  },
  {
    id: "demo-q2",
    number: 2,
    section: "LISTENING",
    partType: "PART_A",
    audioScript: `(Woman) I'm really worried about tomorrow's presentation in organic chemistry.
(Man) Don't stress too much. You've practiced thoroughly and you know the material inside out.
(Narrator) What does the man mean?`,
    questionText: "What does the man mean?",
    options: {
      A: "The woman should practice her presentation again.",
      B: "Organic chemistry is a very difficult subject.",
      C: "The woman is well prepared and should feel confident.",
      D: "He wants to take the presentation for her.",
    },
    correctAnswer: "C",
    explanation:
      "Pria menenangkan wanita dengan berkata 'You know the material inside out' (menguasai materi luar dalam), yang bermakna wanita tersebut sudah sangat siap dan percaya diri.",
  },
  {
    id: "demo-q3",
    number: 3,
    section: "LISTENING",
    partType: "PART_A",
    audioScript: `(Man) Are you planning to drive to the conference in Chicago this weekend?
(Woman) With gas prices so high and parking scarce, I'd rather take the morning express train.
(Narrator) What will the woman probably do?`,
    questionText: "What will the woman probably do?",
    options: {
      A: "Drive her car to Chicago early in the morning.",
      B: "Travel to the conference by train instead of driving.",
      C: "Cancel her trip because of high gas prices.",
      D: "Look for a free parking space near the conference venue.",
    },
    correctAnswer: "B",
    explanation:
      "Frasa 'I'd rather take the morning express train' menunjukkan wanita lebih memilih naik kereta api cepat pagi daripada mengendarai mobil.",
  },
  {
    id: "demo-q4",
    number: 4,
    section: "LISTENING",
    partType: "PART_A",
    audioScript: `(Woman) The registrar's office said the deadline for course withdrawal was yesterday afternoon.
(Man) If you speak directly with Academic Advising, they might grant an emergency exception.
(Narrator) What does the man suggest the woman do?`,
    questionText: "What does the man suggest the woman do?",
    options: {
      A: "Accept that she cannot drop the course.",
      B: "Consult with Academic Advising about an exception.",
      C: "Visit the registrar's office again this afternoon.",
      D: "Register for a new course immediately.",
    },
    correctAnswer: "B",
    explanation:
      "Pria menyarankan: 'If you speak directly with Academic Advising, they might grant an emergency exception.' Intinya adalah berkonsultasi ke Bagian Penasihat Akademik.",
  },
  {
    id: "demo-q5",
    number: 5,
    section: "LISTENING",
    partType: "PART_A",
    audioScript: `(Man) I heard the university is renovating the main dining hall next month.
(Woman) It's about time! The kitchen facilities haven't been updated in over twenty years.
(Narrator) What does the woman mean?`,
    questionText: "What does the woman mean?",
    options: {
      A: "The dining hall does not need any renovations.",
      B: "The renovation has been delayed for twenty years.",
      C: "She thinks the renovation is overdue and much needed.",
      D: "She will not eat at the dining hall next month.",
    },
    correctAnswer: "C",
    explanation:
      "Idiom 'It's about time!' bermakna bahwa suatu tindakan sudah seharusnya dilakukan sejak dulu karena sudah sangat dibutuhkan atau terlambat.",
  },
  {
    id: "demo-q6",
    number: 6,
    section: "LISTENING",
    partType: "PART_A",
    audioScript: `(Woman) Do you know if David finished typing up the team's lab report?
(Man) Hardly had he sat down at his computer when the power went out across the dorm.
(Narrator) What happened to David?`,
    questionText: "What happened to David?",
    options: {
      A: "He was unable to finish the report due to a power outage.",
      B: "He decided to study in the dark dormitory.",
      C: "He completed the lab report before the power cut.",
      D: "He forgot to save the report on his computer.",
    },
    correctAnswer: "A",
    explanation:
      "Pola inversi 'Hardly had he sat down... when the power went out' bermakna baru saja ia duduk, listrik padam. Akibatnya ia belum sempat menyelesaikan laporan laboratoriumnya.",
  },
  {
    id: "demo-q7",
    number: 7,
    section: "LISTENING",
    partType: "PART_B",
    passageId: "listening-part-b",
    audioScript: `(Narrator) Question number 7. What is the main topic of the conversation?`,
    questionText: "What is the main topic of the conversation?",
    options: {
      A: "Installing a modern water filtration system in the campus library.",
      B: "Accessing historical blueprints preserved in the campus archives.",
      C: "Registering for Professor Vance's nineteenth-century history class.",
      D: "Purchasing flatbed scanner equipment for student research.",
    },
    correctAnswer: "B",
    explanation:
      "Topik utama percakapan adalah mahasiswa yang ingin memeriksa dan mengakses cetak biru bersejarah abad ke-19 yang tersimpan di arsip khusus kampus.",
  },
  {
    id: "demo-q8",
    number: 8,
    section: "LISTENING",
    partType: "PART_B",
    passageId: "listening-part-b",
    audioScript: `(Narrator) Question number 8. Why are the blueprints stored in a climate-controlled basement vault?`,
    questionText: "Why are the blueprints stored in a climate-controlled basement vault?",
    options: {
      A: "To keep them hidden from unauthorized visitors.",
      B: "Because there is no room available on the second floor.",
      C: "To protect and preserve the delicate historical paper.",
      D: "Because the blueprints are contaminated with chemicals.",
    },
    correctAnswer: "C",
    explanation:
      "Pustakawan menyatakan: 'They're kept in a climate-controlled vault in the basement to preserve the paper' (untuk melindungi dan mengawetkan kertas bersejarah yang rapuh).",
  },
  {
    id: "demo-q9",
    number: 9,
    section: "LISTENING",
    partType: "PART_B",
    passageId: "listening-part-b",
    audioScript: `(Narrator) Question number 9. What rule applies to documents from the Special Collection?`,
    questionText: "What rule applies to documents from the Special Collection?",
    options: {
      A: "Students may borrow them for up to three business days.",
      B: "They can only be examined inside the library's designated reading room.",
      C: "Only graduate students and faculty members may view them.",
      D: "They cannot be scanned or photographed under any condition.",
    },
    correctAnswer: "B",
    explanation:
      "Pustakawan menegaskan bahwa dokumen tidak boleh keluar gedung ('cannot leave the library building') dan hanya boleh dipelajari di ruang baca khusus berpenyelia di lantai dua.",
  },
  {
    id: "demo-q10",
    number: 10,
    section: "LISTENING",
    partType: "PART_B",
    passageId: "listening-part-b",
    audioScript: `(Narrator) Question number 10. What must the student do before he can examine the blueprints?`,
    questionText: "What must the student do before he can examine the blueprints?",
    options: {
      A: "Pay a security deposit at the cashier desk.",
      B: "Obtain a physical signature from Professor Vance.",
      C: "Submit an online request at least twenty-four hours in advance.",
      D: "Pass an examination on proper handling of historical documents.",
    },
    correctAnswer: "C",
    explanation:
      "Mahasiswa harus mengisi formulir digital minimal 24 jam sebelum kedatangan ('submit a digital request form... at least twenty-four hours ahead') agar staf sempat menyiapkannya.",
  },

  // ==========================================
  // SECTION 2: STRUCTURE & WRITTEN EXPRESSION (11 - 20)
  // ==========================================
  {
    id: "demo-q11",
    number: 11,
    section: "STRUCTURE",
    partType: "STRUCTURE",
    questionText:
      "Rarely _______ such extensive coral bleaching events as those recorded in the Pacific Ocean over the past decade.",
    options: {
      A: "marine biologists have documented",
      B: "have marine biologists documented",
      C: "documenting marine biologists",
      D: "marine biologists are documenting",
    },
    correctAnswer: "B",
    explanation:
      "Kalimat diawali kata keterangan negatif 'Rarely', sehingga wajib mengalami pola inversi: Auxiliary verb + Subject + Main verb ('have marine biologists documented').",
  },
  {
    id: "demo-q12",
    number: 12,
    section: "STRUCTURE",
    partType: "STRUCTURE",
    questionText:
      "_______ by glaciers thousands of years ago, the Great Lakes contain roughly twenty percent of the world's surface freshwater.",
    options: {
      A: "Formed",
      B: "They were formed",
      C: "That were formed",
      D: "Forming them",
    },
    correctAnswer: "A",
    explanation:
      "Kalimat ini membutuhkan participial phrase pasif ('Formed by glaciers...') yang berfungsi sebagai penjelas subjek utama 'the Great Lakes'.",
  },
  {
    id: "demo-q13",
    number: 13,
    section: "STRUCTURE",
    partType: "STRUCTURE",
    questionText:
      "Not only _______ an exceptional conductor of heat, but diamond is also renowned for its remarkable hardness.",
    options: {
      A: "is diamond",
      B: "diamond is",
      C: "diamond being",
      D: "it is diamond",
    },
    correctAnswer: "A",
    explanation:
      "Penghubung korelatif 'Not only' di awal klausa menuntut inversi subjek dan to be/auxiliary: 'Not only is diamond...'.",
  },
  {
    id: "demo-q14",
    number: 14,
    section: "STRUCTURE",
    partType: "STRUCTURE",
    questionText:
      "The Federal Reserve Board adjusts interest rates _______ inflationary pressures and stabilize national economic growth.",
    options: {
      A: "to curb",
      B: "curbing",
      C: "it curbs",
      D: "for curb",
    },
    correctAnswer: "A",
    explanation:
      "Dibutuhkan Infinitive of Purpose ('to curb' = untuk meredam) yang berpasangan paralel dengan kata kerja 'and [to] stabilize'.",
  },
  {
    id: "demo-q15",
    number: 15,
    section: "STRUCTURE",
    partType: "STRUCTURE",
    questionText:
      "Geologists speculate that tectonic plate collisions in prehistoric eras _______ mountain ranges worldwide.",
    options: {
      A: "producing",
      B: "were produced",
      C: "produced",
      D: "to produce",
    },
    correctAnswer: "C",
    explanation:
      "Klausa noun clause membutuhkan kata kerja utama (finite verb) dalam bentuk Simple Past ('produced') karena mengacu pada masa lampau 'prehistoric eras'.",
  },
  {
    id: "demo-q16",
    number: 16,
    section: "STRUCTURE",
    partType: "WRITTEN_EXPRESSION",
    questionText:
      "The hummingbird is capable (A) of flying backward and hovering in place, making it differently (B) from almost (C) all other avian (D) species.",
    options: {
      A: "capable",
      B: "differently",
      C: "almost",
      D: "avian",
    },
    correctAnswer: "B",
    explanation:
      "Pilihan (B) salah. Pola 'making it + [object complement]' memerlukan kata sifat (adjective) 'different', bukan kata keterangan (adverb) 'differently'.",
  },
  {
    id: "demo-q17",
    number: 17,
    section: "STRUCTURE",
    partType: "WRITTEN_EXPRESSION",
    questionText:
      "Although (A) photosynthesis occurs primary (B) in the green leaves of plants, some cacti utilize their fleshy stems to capture (C) sunlight and produce (D) energy.",
    options: {
      A: "Although",
      B: "primary",
      C: "to capture",
      D: "produce",
    },
    correctAnswer: "B",
    explanation:
      "Pilihan (B) salah. Kata tersebut menerangkan kata kerja 'occurs', sehingga harus berbentuk kata keterangan (adverb) 'primarily', bukan 'primary'.",
  },
  {
    id: "demo-q18",
    number: 18,
    section: "STRUCTURE",
    partType: "WRITTEN_EXPRESSION",
    questionText:
      "Neither the executive director nor (A) the department supervisors was (B) aware of the newly revised (C) safety protocols issued (D) by the state committee.",
    options: {
      A: "nor",
      B: "was",
      C: "revised",
      D: "issued",
    },
    correctAnswer: "B",
    explanation:
      "Pilihan (B) salah. Pada konstruksi 'Neither... nor...', kata kerja harus sesuai dengan subjek yang terdekat ('the department supervisors' = jamak), sehingga harus menggunakan 'were', bukan 'was'.",
  },
  {
    id: "demo-q19",
    number: 19,
    section: "STRUCTURE",
    partType: "WRITTEN_EXPRESSION",
    questionText:
      "Modern satellites provide accurately (A) weather forecasts, assist in global navigation, and monitor (B) environmental changes (C) across the Earth's surface (D).",
    options: {
      A: "accurately",
      B: "monitor",
      C: "changes",
      D: "surface",
    },
    correctAnswer: "A",
    explanation:
      "Pilihan (A) salah. Kata tersebut menerangkan frasa benda 'weather forecasts', sehingga harus menggunakan kata sifat 'accurate', bukan kata keterangan 'accurately'.",
  },
  {
    id: "demo-q20",
    number: 20,
    section: "STRUCTURE",
    partType: "WRITTEN_EXPRESSION",
    questionText:
      "Every year, thousands of migratory birds travels (A) across continents along established (B) flyways to reach their seasonal (C) breeding grounds (D).",
    options: {
      A: "travels",
      B: "established",
      C: "seasonal",
      D: "grounds",
    },
    correctAnswer: "A",
    explanation:
      "Pilihan (A) salah. Subjek kalimat adalah 'thousands of migratory birds' (jamak), sehingga kata kerja yang benar adalah 'travel', bukan 'travels'.",
  },

  // ==========================================
  // SECTION 3: READING COMPREHENSION (21 - 30)
  // ==========================================
  {
    id: "demo-q21",
    number: 21,
    section: "READING",
    partType: "READING",
    passageId: "reading-passage-1",
    questionText: "What is the primary topic of the passage?",
    options: {
      A: "The chemical synthesis of artificial incandescent lighting.",
      B: "The biological functions and mechanisms of light generation in deep-sea life.",
      C: "The commercial cultivation of symbiotic marine bacteria.",
      D: "The territorial hunting habits of predatory anglerfish.",
    },
    correctAnswer: "B",
    explanation:
      "Teks secara keseluruhan mengulas mekanisme biokimia (luciferin & luciferase) serta berbagai fungsi biologis bioluminesensi bagi makhluk laut dalam.",
  },
  {
    id: "demo-q22",
    number: 22,
    section: "READING",
    partType: "READING",
    passageId: "reading-passage-1",
    questionText: "The word \"teems\" in Line 3 is closest in meaning to:",
    options: {
      A: "contends",
      B: "abounds",
      C: "struggles",
      D: "fluctuates",
    },
    correctAnswer: "B",
    explanation:
      "Kata 'teems with life' berarti berlimpah ruah atau dipenuhi kehidupan, sepadan maknanya dengan 'abounds'.",
  },
  {
    id: "demo-q23",
    number: 23,
    section: "READING",
    partType: "READING",
    passageId: "reading-passage-1",
    questionText:
      "According to paragraph 2, why is bioluminescence classified as \"cold light\"?",
    options: {
      A: "It can only occur in sub-zero seawater temperatures.",
      B: "It is produced with virtually no wasted heat energy.",
      C: "It requires ice crystals to catalyze the oxidation reaction.",
      D: "It emits exclusively infrared radiation.",
    },
    correctAnswer: "B",
    explanation:
      "Disebut 'cold light' karena reaksi kimianya menghasilkan cahaya dengan pelepasan energi panas yang sangat kecil ('negligible thermal dissipation').",
  },
  {
    id: "demo-q24",
    number: 24,
    section: "READING",
    partType: "READING",
    passageId: "reading-passage-1",
    questionText:
      "Why is the light emitted by most deep-sea creatures blue-green in color?",
    options: {
      A: "Luciferin reacts solely with copper compounds found in seawater.",
      B: "Deep-sea predators are biologically blind to other light spectra.",
      C: "Blue-green wavelengths travel the farthest through seawater.",
      D: "Oxygen levels in the bathypelagic zone absorb red photons.",
    },
    correctAnswer: "C",
    explanation:
      "Di baris 14-15 dijelaskan bahwa cahaya biru-hijau (~470 nm) merambat paling efektif menembus air laut dibandingkan spektrum lainnya.",
  },
  {
    id: "demo-q25",
    number: 25,
    section: "READING",
    partType: "READING",
    passageId: "reading-passage-1",
    questionText:
      "According to the passage, all of the following are involved in the biochemical generation of bioluminescence EXCEPT:",
    options: {
      A: "luciferase",
      B: "luciferin",
      C: "oxygen",
      D: "chlorophyll",
    },
    correctAnswer: "D",
    explanation:
      "Paragraf 2 menyebutkan luciferin, luciferase, ATP, dan oksigen. Klorofil (chlorophyll) merupakan pigmen tumbuhan dan tidak terlibat dalam bioluminesensi laut dalam.",
  },
  {
    id: "demo-q26",
    number: 26,
    section: "READING",
    partType: "READING",
    passageId: "reading-passage-1",
    questionText: "The word \"modulating\" in Line 19 is closest in meaning to:",
    options: {
      A: "magnifying",
      B: "adjusting",
      C: "resisting",
      D: "concealing",
    },
    correctAnswer: "B",
    explanation:
      "Kata 'modulating' dalam konteks mengatur intensitas cahaya bermakna menyetel atau menyesuaikan ('adjusting').",
  },
  {
    id: "demo-q27",
    number: 27,
    section: "READING",
    partType: "READING",
    passageId: "reading-passage-1",
    questionText: "The word \"their\" in Line 20 refers to:",
    options: {
      A: "photophores",
      B: "layers",
      C: "predators",
      D: "these creatures",
    },
    correctAnswer: "D",
    explanation:
      "Frasa 'these creatures... eliminate their silhouettes' mengacu pada makhluk-makhluk laut yang disebutkan sebelumnya (hatchetfish dan cumi-cumi).",
  },
  {
    id: "demo-q28",
    number: 28,
    section: "READING",
    partType: "READING",
    passageId: "reading-passage-1",
    questionText:
      "What can be inferred from paragraph 3 about a fish that does NOT utilize counterillumination?",
    options: {
      A: "It would cast a noticeable dark shadow when viewed from underneath.",
      B: "It cannot produce any enzymatic chemical reactions.",
      C: "It is immune to attacks from large deep-sea squids.",
      D: "It must migrate to surface waters to feed during the daytime.",
    },
    correctAnswer: "A",
    explanation:
      "Counterillumination berfungsi menyamarkan bayangan/siluet terhadap predator di bawahnya. Ikan tanpa mekanisme ini akan terlihat jelas sebagai siluet gelap dari arah bawah.",
  },
  {
    id: "demo-q29",
    number: 29,
    section: "READING",
    partType: "READING",
    passageId: "reading-passage-1",
    questionText: "How does the female anglerfish produce light in its esca?",
    options: {
      A: "By absorbing ambient sunlight stored during the day.",
      B: "By hosting symbiotic bioluminescent bacteria.",
      C: "By rapidly rubbing its dorsal spines together.",
      D: "By releasing electrical discharges through its modified fins.",
    },
    correctAnswer: "B",
    explanation:
      "Baris 25-26 menyatakan bahwa esca menampung miliaran bakteri bioluminesen yang bersimbiosis ('harbors billions of symbiotic bioluminescent bacteria').",
  },
  {
    id: "demo-q30",
    number: 30,
    section: "READING",
    partType: "READING",
    passageId: "reading-passage-1",
    questionText:
      "In the final sentence of the passage, the author mentions intraspecific communication in order to:",
    options: {
      A: "illustrate that bioluminescence serves purposes beyond predator-prey dynamics.",
      B: "argue that deep-sea animals have developed sophisticated vocal cords.",
      C: "prove that deep-sea creatures prefer living in solitary isolation.",
      D: "emphasize that mating rituals require sunlight to be successful.",
    },
    correctAnswer: "A",
    explanation:
      "Penulis menyebutkan komunikasi antar sesama spesies untuk memperlihatkan bahwa fungsi cahaya bioluminesensi melampaui sekadar urusan mangsa dan pemangsa (menarik pasangan & pertahanan teritorial).",
  },
];

import * as XLSX from "xlsx";

export interface ValidationIssue {
  section: string;
  questionNumber?: number;
  message: string;
  severity: "error" | "warning";
}

export interface ValidationReport {
  isValid: boolean;
  totalQuestions: number;
  listeningCount: number;
  structureCount: number;
  readingCount: number;
  issues: ValidationIssue[];
}

export interface ParsedPackageResult {
  report: ValidationReport;
  packageData: any;
}

/**
 * Generates an official formatted .xlsx workbook buffer ready for download.
 */
export function generateExcelTemplateBuffer(): Buffer {
  const wb = XLSX.utils.book_new();

  // 1. INFO_PAKET Sheet
  const infoData = [
    { Pengaturan: "Judul Paket Ujian", Nilai: "Simulasi TOEFL ITP Paket 2" },
    { Pengaturan: "Kode Paket", Nilai: "ITP-PKG-02" },
    { Pengaturan: "Deskripsi", Nilai: "Paket simulasi lengkap TOEFL ITP standar resmi ETS (140 Soal)" },
    { Pengaturan: "Durasi Listening (Menit)", Nilai: 35 },
    { Pengaturan: "Durasi Structure (Menit)", Nilai: 25 },
    { Pengaturan: "Durasi Reading (Menit)", Nilai: 55 },
  ];
  const wsInfo = XLSX.utils.json_to_sheet(infoData);
  XLSX.utils.book_append_sheet(wb, wsInfo, "INFO_PAKET");

  // 2. SECTION_1_LISTENING Sheet (Sample 50 rows)
  const listeningRows: any[] = [];
  // Sample Part A (1-30)
  for (let i = 1; i <= 30; i++) {
    listeningRows.push({
      No_Soal: i,
      Part_Type: "PART_A",
      Judul_Passage: "",
      Audio_Script: `(Man) Did you get to the library before closing?\n(Woman) Barely. I arrived right as the librarian locked the door.\n(Narrator) What does the woman mean?`,
      Audio_Url_MP3: "",
      Teks_Soal: "What does the woman mean?",
      Opsi_A: "She arrived at the library just in time.",
      Opsi_B: "She found the library was already closed.",
      Opsi_C: "She helped the librarian lock the door.",
      Opsi_D: "She lost the keys to the library.",
      Kunci_Jawaban: "A",
    });
  }
  // Sample Part B (31-37)
  for (let i = 31; i <= 37; i++) {
    listeningRows.push({
      No_Soal: i,
      Part_Type: "PART_B",
      Judul_Passage: "Conversation 1: Academic Advising",
      Audio_Script: i === 31 ? `(Narrator) Listen to a conversation between a student and an advisor...\n(Advisor) Good morning, Brian. What can I do for you today?\n(Student) I have a schedule conflict between Genetics and Botany...` : "",
      Audio_Url_MP3: "",
      Teks_Soal: `What is the topic of the conversation?`,
      Opsi_A: "Course scheduling conflict.",
      Opsi_B: "Dropping out of university.",
      Opsi_C: "Graduation ceremony rehearsal.",
      Opsi_D: "Tuition payment extension.",
      Kunci_Jawaban: "A",
    });
  }
  // Sample Part C (38-50)
  for (let i = 38; i <= 50; i++) {
    listeningRows.push({
      No_Soal: i,
      Part_Type: "PART_C",
      Judul_Passage: "Lecture 1: Geology - Cave Formations",
      Audio_Script: i === 38 ? `(Narrator) Listen to an earth science professor discuss cave formation...\n(Professor) Most caves in Kentucky form through limestone dissolution...` : "",
      Audio_Url_MP3: "",
      Teks_Soal: `What is the main topic of the lecture?`,
      Opsi_A: "Limestone cave dissolution and speleothems.",
      Opsi_B: "Volcanic eruptions in Hawaii.",
      Opsi_C: "Underwater whale habitats.",
      Opsi_D: "Desert sand dunes.",
      Kunci_Jawaban: "A",
    });
  }
  const wsListening = XLSX.utils.json_to_sheet(listeningRows);
  XLSX.utils.book_append_sheet(wb, wsListening, "SECTION_1_LISTENING");

  // 3. SECTION_2_STRUCTURE Sheet (40 rows)
  const structureRows: any[] = [];
  for (let i = 1; i <= 15; i++) {
    structureRows.push({
      No_Soal: i,
      Part_Type: "STRUCTURE",
      Teks_Soal: "_______ in North America, the bald eagle is a protected bird of prey.",
      Opsi_A: "Found primarily",
      Opsi_B: "It is found",
      Opsi_C: "That it was found",
      Opsi_D: "Having found it",
      Kunci_Jawaban: "A",
    });
  }
  for (let i = 16; i <= 40; i++) {
    structureRows.push({
      No_Soal: i,
      Part_Type: "WRITTEN_EXPRESSION",
      Teks_Soal: "The {A:human body} is {B:composed of} trillions of cells with {C:its own} genetic {D:informational}.",
      Opsi_A: "human body",
      Opsi_B: "composed of",
      Opsi_C: "its own",
      Opsi_D: "informational",
      Kunci_Jawaban: "D",
    });
  }
  const wsStructure = XLSX.utils.json_to_sheet(structureRows);
  XLSX.utils.book_append_sheet(wb, wsStructure, "SECTION_2_STRUCTURE");

  // 4. SECTION_3_READING Sheet (50 rows)
  const readingRows: any[] = [];
  for (let p = 1; p <= 5; p++) {
    const startQ = (p - 1) * 10 + 1;
    const endQ = p * 10;
    const passageText = `The migration of monarch butterflies is among the most extraordinary events in nature...\n\n(Line 5) Millions of monarchs fly up to three thousand miles to overwintering fir forests in central Mexico...\n\n(Line 10) Their navigational mechanism relies on a time-compensated sun compass in their antennae.`;

    for (let i = startQ; i <= endQ; i++) {
      readingRows.push({
        No_Soal: i,
        No_Passage: p,
        Judul_Passage: `Passage ${p}: Zoology - Migration of Monarch Butterflies`,
        Teks_Bacaan: i === startQ ? passageText : "",
        Teks_Soal: `What is the primary topic of passage ${p}?`,
        Opsi_A: "The navigational mechanisms of migrating butterflies.",
        Opsi_B: "The anatomy of bird feathers.",
        Opsi_C: "Deforestation in North America.",
        Opsi_D: "Volcanic eruptions in Mexico.",
        Kunci_Jawaban: "A",
      });
    }
  }
  const wsReading = XLSX.utils.json_to_sheet(readingRows);
  XLSX.utils.book_append_sheet(wb, wsReading, "SECTION_3_READING");

  const buffer = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });
  return buffer;
}

/**
 * Parses an uploaded Excel buffer or JSON into standard package data and validates integrity.
 */
export function parseExcelWorkbook(buffer: Buffer): ParsedPackageResult {
  const wb = XLSX.read(buffer, { type: "buffer" });
  const issues: ValidationIssue[] = [];

  // 1. Read INFO_PAKET
  let title = "Paket Ujian Baru";
  let code = `ITP-PKG-${Date.now().toString().slice(-4)}`;
  let description = "Paket simulasi TOEFL ITP";

  const sheetNames = wb.SheetNames;
  const infoSheetName = sheetNames.find((s) => s.toUpperCase().includes("INFO"));
  if (infoSheetName) {
    const infoRows: any[] = XLSX.utils.sheet_to_json(wb.Sheets[infoSheetName]);
    for (const r of infoRows) {
      const field = (r["Pengaturan"] || r["Field"] || "").toString().toLowerCase();
      const val = (r["Nilai"] || r["Value"] || "").toString().trim();
      if (field.includes("judul") || field.includes("title")) title = val || title;
      if (field.includes("kode") || field.includes("code")) code = val.toUpperCase() || code;
      if (field.includes("deskripsi") || field.includes("desc")) description = val || description;
    }
  }

  // 2. Parse Section 1 Listening
  const listeningSheetName = sheetNames.find((s) => s.toUpperCase().includes("LISTEN"));
  const listeningQuestions: any[] = [];
  const listeningPassages: any[] = [];
  let currentListeningPassageTitle = "";

  if (listeningSheetName) {
    const rows: any[] = XLSX.utils.sheet_to_json(wb.Sheets[listeningSheetName]);
    let pIdx = 1;

    for (const r of rows) {
      const qNum = parseInt(r["No_Soal"] || r["No"] || 0);
      const partType = (r["Part_Type"] || (qNum <= 30 ? "PART_A" : qNum <= 37 ? "PART_B" : "PART_C")).toString().toUpperCase().trim();
      const pTitle = (r["Judul_Passage"] || "").toString().trim();
      const audioScript = (r["Audio_Script"] || r["Audio_Dialogue"] || "").toString().trim();
      const audioUrl = (r["Audio_Url_MP3"] || r["Audio_Url"] || "").toString().trim();
      const qText = (r["Teks_Soal"] || r["Question"] || "").toString().trim();
      const optA = (r["Opsi_A"] || r["A"] || "").toString().trim();
      const optB = (r["Opsi_B"] || r["B"] || "").toString().trim();
      const optC = (r["Opsi_C"] || r["C"] || "").toString().trim();
      const optD = (r["Opsi_D"] || r["D"] || "").toString().trim();
      const key = (r["Kunci_Jawaban"] || r["Kunci"] || r["Key"] || "").toString().toUpperCase().trim();

      // Check key validity
      if (!["A", "B", "C", "D"].includes(key)) {
        issues.push({
          section: "Listening",
          questionNumber: qNum,
          message: `Kunci jawaban '${key || "KOSONG"}' tidak valid (wajib A, B, C, atau D).`,
          severity: "error",
        });
      }

      if (!optA || !optB || !optC || !optD) {
        issues.push({
          section: "Listening",
          questionNumber: qNum,
          message: `Salah satu pilihan opsi A/B/C/D masih kosong.`,
          severity: "error",
        });
      }

      // Track passages for Part B/C
      let passageIndex: number | null = null;
      if (pTitle && (partType === "PART_B" || partType === "PART_C")) {
        if (pTitle !== currentListeningPassageTitle) {
          currentListeningPassageTitle = pTitle;
          listeningPassages.push({
            passageIndex: pIdx,
            title: pTitle,
            content: audioScript || null,
            audioUrl: audioUrl || null,
          });
          pIdx++;
        }
        passageIndex = pIdx - 1;
      }

      listeningQuestions.push({
        questionNumber: qNum,
        partType,
        passageIndex,
        questionText: audioScript || qText,
        audioUrl: audioUrl || null,
        optionA: optA,
        optionB: optB,
        optionC: optC,
        optionD: optD,
        correctAnswer: key || "A",
      });
    }
  }

  // 3. Parse Section 2 Structure
  const structureSheetName = sheetNames.find((s) => s.toUpperCase().includes("STRUCT"));
  const structureQuestions: any[] = [];

  if (structureSheetName) {
    const rows: any[] = XLSX.utils.sheet_to_json(wb.Sheets[structureSheetName]);
    for (const r of rows) {
      const qNum = parseInt(r["No_Soal"] || r["No"] || 0);
      const partType = (r["Part_Type"] || (qNum <= 15 ? "STRUCTURE" : "WRITTEN_EXPRESSION")).toString().toUpperCase().trim();
      const qText = (r["Teks_Soal"] || r["Question"] || "").toString().trim();
      const optA = (r["Opsi_A"] || r["A"] || "").toString().trim();
      const optB = (r["Opsi_B"] || r["B"] || "").toString().trim();
      const optC = (r["Opsi_C"] || r["C"] || "").toString().trim();
      const optD = (r["Opsi_D"] || r["D"] || "").toString().trim();
      const key = (r["Kunci_Jawaban"] || r["Kunci"] || r["Key"] || "").toString().toUpperCase().trim();

      if (!["A", "B", "C", "D"].includes(key)) {
        issues.push({
          section: "Structure",
          questionNumber: qNum,
          message: `Kunci jawaban '${key || "KOSONG"}' tidak valid (wajib A, B, C, atau D).`,
          severity: "error",
        });
      }

      structureQuestions.push({
        questionNumber: qNum,
        partType,
        questionText: qText,
        optionA: optA,
        optionB: optB,
        optionC: optC,
        optionD: optD,
        correctAnswer: key || "A",
      });
    }
  }

  // 4. Parse Section 3 Reading
  const readingSheetName = sheetNames.find((s) => s.toUpperCase().includes("READ"));
  const readingQuestions: any[] = [];
  const readingPassages: any[] = [];
  const passageMap = new Map<number, any>();

  if (readingSheetName) {
    const rows: any[] = XLSX.utils.sheet_to_json(wb.Sheets[readingSheetName]);
    for (const r of rows) {
      const qNum = parseInt(r["No_Soal"] || r["No"] || 0);
      const pNum = parseInt(r["No_Passage"] || 1);
      const pTitle = (r["Judul_Passage"] || `Passage ${pNum}`).toString().trim();
      const pText = (r["Teks_Bacaan"] || r["Passage_Content"] || "").toString().trim();
      const qText = (r["Teks_Soal"] || r["Question"] || "").toString().trim();
      const optA = (r["Opsi_A"] || r["A"] || "").toString().trim();
      const optB = (r["Opsi_B"] || r["B"] || "").toString().trim();
      const optC = (r["Opsi_C"] || r["C"] || "").toString().trim();
      const optD = (r["Opsi_D"] || r["D"] || "").toString().trim();
      const key = (r["Kunci_Jawaban"] || r["Kunci"] || r["Key"] || "").toString().toUpperCase().trim();

      if (pText && !passageMap.has(pNum)) {
        passageMap.set(pNum, {
          passageIndex: pNum,
          title: pTitle,
          content: pText,
        });
      }

      if (!["A", "B", "C", "D"].includes(key)) {
        issues.push({
          section: "Reading",
          questionNumber: qNum,
          message: `Kunci jawaban '${key || "KOSONG"}' tidak valid (wajib A, B, C, atau D).`,
          severity: "error",
        });
      }

      readingQuestions.push({
        questionNumber: qNum,
        partType: "READING",
        passageIndex: pNum,
        questionText: qText,
        optionA: optA,
        optionB: optB,
        optionC: optC,
        optionD: optD,
        correctAnswer: key || "A",
      });
    }
    readingPassages.push(...Array.from(passageMap.values()));
  }

  // Count check
  const listeningCount = listeningQuestions.length;
  const structureCount = structureQuestions.length;
  const readingCount = readingQuestions.length;
  const totalQuestions = listeningCount + structureCount + readingCount;

  if (listeningCount !== 50) {
    issues.push({
      section: "Listening",
      message: `Jumlah soal Listening terdeteksi ${listeningCount} (standar resmi ETS adalah 50 soal).`,
      severity: listeningCount === 0 ? "error" : "warning",
    });
  }

  if (structureCount !== 40) {
    issues.push({
      section: "Structure",
      message: `Jumlah soal Structure terdeteksi ${structureCount} (standar resmi ETS adalah 40 soal).`,
      severity: structureCount === 0 ? "error" : "warning",
    });
  }

  if (readingCount !== 50) {
    issues.push({
      section: "Reading",
      message: `Jumlah soal Reading terdeteksi ${readingCount} (standar resmi ETS adalah 50 soal).`,
      severity: readingCount === 0 ? "error" : "warning",
    });
  }

  const hasFatalErrors = issues.some((i) => i.severity === "error");

  const packageData = {
    title,
    code,
    description,
    sections: [
      {
        sectionType: "LISTENING",
        title: "Section 1: Listening Comprehension",
        durationMinutes: 35,
        orderIndex: 1,
        passages: listeningPassages,
        questions: listeningQuestions,
      },
      {
        sectionType: "STRUCTURE",
        title: "Section 2: Structure & Written Expression",
        durationMinutes: 25,
        orderIndex: 2,
        questions: structureQuestions,
      },
      {
        sectionType: "READING",
        title: "Section 3: Reading Comprehension",
        durationMinutes: 55,
        orderIndex: 3,
        passages: readingPassages,
        questions: readingQuestions,
      },
    ],
  };

  return {
    report: {
      isValid: !hasFatalErrors && totalQuestions > 0,
      totalQuestions,
      listeningCount,
      structureCount,
      readingCount,
      issues,
    },
    packageData,
  };
}

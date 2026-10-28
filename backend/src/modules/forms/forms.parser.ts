import * as zlib from 'zlib';

export interface FormQuestion {
  key: string;
  number: string;
  label: string;
  type: 'text' | 'textarea' | 'radio' | 'email' | 'rating';
  options?: string[];
  required?: boolean;
  placeholder?: string;
  hint?: string;
}

export interface FormSection {
  number?: string;
  title: string;
  questions: FormQuestion[];
}

export interface ParsedForm {
  formId: string;
  title: string;
  description: string;
  sourceFile: string;
  sections: FormSection[];
  questions: FormQuestion[];
}

/**
 * Extracts word/document.xml from a docx PKZip buffer using Node's built-in zlib.
 * Zero external dependencies required.
 */
export function readDocxXml(buffer: Buffer): string | null {
  let eocdOffset = -1;
  for (let i = buffer.length - 22; i >= 0; i--) {
    if (buffer.readUInt32LE(i) === 0x06054b50) {
      eocdOffset = i;
      break;
    }
  }
  if (eocdOffset === -1) {
    throw new Error('Not a valid zip / docx archive');
  }

  const cdOffset = buffer.readUInt32LE(eocdOffset + 16);
  const cdRecords = buffer.readUInt16LE(eocdOffset + 8);
  let p = cdOffset;

  for (let i = 0; i < cdRecords; i++) {
    if (buffer.readUInt32LE(p) !== 0x02014b50) break;
    const compression = buffer.readUInt16LE(p + 10);
    const compSize = buffer.readUInt32LE(p + 20);
    const fnLen = buffer.readUInt16LE(p + 28);
    const extraLen = buffer.readUInt16LE(p + 30);
    const commentLen = buffer.readUInt16LE(p + 32);
    const localHeaderOffset = buffer.readUInt32LE(p + 42);
    const fileName = buffer.toString('utf8', p + 46, p + 46 + fnLen);
    p += 46 + fnLen + extraLen + commentLen;

    if (fileName === 'word/document.xml') {
      const localFnLen = buffer.readUInt16LE(localHeaderOffset + 26);
      const localExtraLen = buffer.readUInt16LE(localHeaderOffset + 28);
      const dataStart = localHeaderOffset + 30 + localFnLen + localExtraLen;
      const compData = buffer.slice(dataStart, dataStart + compSize);
      if (compression === 8) {
        return zlib.inflateRawSync(compData).toString('utf8');
      } else if (compression === 0) {
        return compData.toString('utf8');
      }
    }
  }
  return null;
}

/**
 * Parses all non-empty text paragraphs from Word document XML.
 */
export function parseDocxParagraphs(xml: string): string[] {
  const pRegex = /<w:p\b[^>]*>(.*?)<\/w:p>/gs;
  const tRegex = /<w:t\b[^>]*>(.*?)<\/w:t>/gs;
  const paragraphs: string[] = [];
  let match: RegExpExecArray | null;

  while ((match = pRegex.exec(xml)) !== null) {
    const pContent = match[1];
    let pText = '';
    let tMatch: RegExpExecArray | null;
    while ((tMatch = tRegex.exec(pContent)) !== null) {
      pText += tMatch[1];
    }
    const clean = pText.replace(/\u00a0/g, ' ').trim();
    if (clean) paragraphs.push(clean);
  }
  return paragraphs;
}

/**
 * Infers field key from question text.
 */
function inferFieldKey(num: string, text: string, formId: string): string {
  const lower = text.toLowerCase();
  if (formId === 'problem') {
    if (lower.includes('title')) return 'title';
    if (lower.includes('what happened')) return 'whatHappened';
    if (lower.includes('expect')) return 'expected';
    if (lower.includes('trying to do')) return 'tryingToDo';
    if (lower.includes('where') || lower.includes('location') || lower.includes('area')) return 'area';
    if (lower.includes('game version') || lower.includes('build')) return 'gameVersion';
    if (lower.includes('reproduce')) return 'reproduce';
    if (lower.includes('affect') || lower.includes('impact') || lower.includes('severity')) return 'impact';
    if (lower.includes('device') || lower.includes('browser')) return 'deviceBrowser';
    if (lower.includes('email')) return 'email';
  } else if (formId === 'chapter_feedback') {
    if (lower.includes('chapter')) return 'chapter';
    if (lower.includes('complete')) return 'completed';
    if (lower.includes('clear')) return 'clarityRating';
    if (lower.includes('difficulty')) return 'difficulty';
    if (lower.includes('confusion') || lower.includes('frustration')) return 'confusionSource';
    if (lower.includes('clearer') || lower.includes('what happened')) return 'clarityFeedback';
    if (lower.includes('continue')) return 'continueIntent';
    if (lower.includes('email')) return 'email';
  } else if (formId === 'playtest_review') {
    if (lower.includes('often') || lower.includes('frequency')) return 'genreFrequency';
    if (lower.includes('ease of learning')) return 'rateEaseOfLearning';
    if (lower.includes('navigation')) return 'rateNavigation';
    if (lower.includes('visual readability')) return 'rateVisualReadability';
    if (lower.includes('clarity of objectives')) return 'rateClarityOfObjectives';
    if (lower.includes('understanding of the o')) return 'rateUnderstandingO2';
    if (lower.includes('enjoyment')) return 'rateEnjoyment';
    if (lower.includes('game stability')) return 'rateGameStability';
    if (lower.includes('visual element make')) return 'visualDifficulty';
    if (lower.includes('element most needs improvement')) return 'visualElementImprovement';
    if (lower.includes('strongest part')) return 'strongestPart';
    if (lower.includes('change only one')) return 'changeOneThing';
    if (lower.includes('disappointed')) return 'disappointmentLevel';
    if (lower.includes('recommend')) return 'npsRecommend';
    if (lower.includes('email')) return 'email';
  }
  return `q${num}`;
}

/**
 * Determines formId from filename or title.
 */
export function detectFormId(filename: string, title: string): string {
  const norm = (filename + ' ' + title).toLowerCase();
  if (norm.includes('problem') || norm.includes('report') || norm.includes('bug')) return 'problem';
  if (norm.includes('chapter')) return 'chapter_feedback';
  if (norm.includes('playtest') || norm.includes('review')) return 'playtest_review';
  return 'general_feedback';
}

/**
 * Parses full form structure from docx buffer.
 */
export function parseFormDocx(buffer: Buffer, filename: string): ParsedForm {
  const xml = readDocxXml(buffer);
  if (!xml) throw new Error('Could not find word/document.xml in docx buffer');

  const paragraphs = parseDocxParagraphs(xml);
  if (paragraphs.length === 0) throw new Error('Docx document contains no readable paragraphs');

  const title = paragraphs[0] || 'SearchO₂ Form';
  const formId = detectFormId(filename, title);
  let description = '';
  let startIdx = 1;

  if (paragraphs.length > 1 && !/^[0-9]+\./.test(paragraphs[1]) && !paragraphs[1].includes('details')) {
    description = paragraphs[1];
    startIdx = 2;
  }

  const sections: FormSection[] = [];
  let currentSection: FormSection = { title: 'General', questions: [] };
  sections.push(currentSection);

  let currentQuestion: FormQuestion | null = null;

  for (let i = startIdx; i < paragraphs.length; i++) {
    const p = paragraphs[i];

    // Underline blanks (e.g. "Your answer: _________") indicate an open-ended answer field
    if (p.includes('Your answer:') || /^_+$/.test(p.replace(/\s+/g, ''))) {
      if (currentQuestion && currentQuestion.type === 'text') {
        const lower = currentQuestion.label.toLowerCase();
        if (lower.includes('what happened') || lower.includes('trying to do') || lower.includes('expected') || lower.includes('clearer') || lower.includes('feedback')) {
          currentQuestion.type = 'textarea';
        }
      }
      continue;
    }

    // Section headers like "Problem details", "Reproduction and impact"
    if (!/^[0-9]+\./.test(p) && !p.startsWith('•') && (p.toLowerCase().includes('details') || p.toLowerCase().includes('impact') || p.toLowerCase().includes('overview') || p.toLowerCase().includes('feedback'))) {
      currentSection = { title: p, questions: [] };
      sections.push(currentSection);
      currentQuestion = null;
      continue;
    }

    // Question header: e.g. "1. Short title for the problem" or "2. Where did the problem happen?"
    const qMatch = p.match(/^([0-9]+)\.\s*(.*)$/);
    if (qMatch) {
      const qNum = qMatch[1];
      const qText = qMatch[2].trim();
      const key = inferFieldKey(qNum, qText, formId);
      const isEmail = key === 'email' || qText.toLowerCase().includes('email');
      const isRequired = key === 'title' || key === 'whatHappened' || key === 'area' || key === 'chapter';

      currentQuestion = {
        key,
        number: qNum,
        label: qText,
        type: isEmail ? 'email' : 'text',
        required: isRequired,
        options: []
      };

      currentSection.questions.push(currentQuestion);
      continue;
    }

    // Choice item belonging to previous question
    if (currentQuestion) {
      currentQuestion.type = 'radio';
      if (!currentQuestion.options) currentQuestion.options = [];
      // Clean leading bullet if present
      const opt = p.replace(/^•\s*/, '').trim();
      if (opt && !currentQuestion.options.includes(opt)) {
        currentQuestion.options.push(opt);
      }
    }
  }

  // Filter out empty sections
  const activeSections = sections.filter(s => s.questions.length > 0);
  const allQuestions: FormQuestion[] = [];
  activeSections.forEach(s => allQuestions.push(...s.questions));

  return {
    formId,
    title,
    description,
    sourceFile: filename,
    sections: activeSections,
    questions: allQuestions
  };
}

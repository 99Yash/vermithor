import { resumeParseObject, type ResumeParseObject } from '@vermithor/db/schema/resume';

const EMAIL_REGEX = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i;
const PHONE_REGEX = /\+?[\d().\-\s]{7,}\d/;
const URL_REGEX = /\b(?:https?:\/\/|www\.)\S+/i;
const BULLET_PREFIX_REGEX = /^[\s\-*\u2022]+/;

const SECTION_HEADINGS = {
  summary: ['summary', 'professional summary', 'profile', 'about'],
  highlights: [
    'highlights',
    'key achievements',
    'accomplishments',
    'highlights and achievements',
  ],
  skills: ['skills', 'technical skills', 'core skills', 'skills and tools'],
  education: ['education', 'academics'],
  experience: [
    'experience',
    'work experience',
    'professional experience',
    'employment',
    'employment history',
  ],
  projects: ['projects', 'project experience', 'selected projects'],
  certifications: ['certifications', 'certificates'],
  awards: ['awards', 'honors'],
  patents: ['patents', 'patent'],
  languages: ['languages', 'language'],
} as const;

const normalizedSectionHeadings = Object.fromEntries(
  Object.entries(SECTION_HEADINGS).map(([key, values]) => [
    key,
    values.map((value) => normalizeHeading(value)),
  ]),
) as Record<keyof typeof SECTION_HEADINGS, string[]>;

const allNormalizedHeadings = Array.from(
  new Set(Object.values(normalizedSectionHeadings).flat()),
);

function normalizeHeading(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
}

function matchesHeading(line: string, headings: string[]) {
  const normalizedLine = normalizeHeading(line);
  if (!normalizedLine) return false;
  return headings.some(
    (heading) =>
      normalizedLine === heading || normalizedLine.startsWith(`${heading} `),
  );
}

function extractSectionLines(rawText: string, headings: string[]) {
  const lines = rawText
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  if (lines.length === 0) return [];

  const startIndex = lines.findIndex((line) => matchesHeading(line, headings));
  if (startIndex === -1) return [];

  const results: string[] = [];
  for (let index = startIndex + 1; index < lines.length; index += 1) {
    const line = lines[index];
    if (!line) {
      continue;
    }
    if (matchesHeading(line, allNormalizedHeadings)) break;
    const cleaned = line.replace(BULLET_PREFIX_REGEX, '').trim();
    if (cleaned) {
      results.push(cleaned);
    }
  }

  return results;
}

function extractSectionText(rawText: string, headings: string[]) {
  const lines = extractSectionLines(rawText, headings);
  if (lines.length === 0) return null;
  return lines.join(' ');
}

function findFirstMatch(regex: RegExp, text: string) {
  const match = text.match(regex);
  return match?.[0] ?? null;
}

function extractName(lines: string[]) {
  const candidate = lines.find(
    (line) =>
      !line.includes('@') &&
      !line.toLowerCase().includes('http') &&
      /[a-zA-Z]/.test(line) &&
      !/\d/.test(line),
  );

  if (!candidate) {
    return { first_name: null, last_name: null };
  }

  const cleaned = candidate.replace(/[^a-zA-Z\s'-]/g, '').trim();
  const parts = cleaned.split(/\s+/).filter(Boolean);
  if (parts.length === 0) {
    return { first_name: null, last_name: null };
  }

  return {
    first_name: parts[0] ?? null,
    last_name: parts.length > 1 ? parts[parts.length - 1] ?? null : null,
  };
}

function extractLocation(lines: string[]) {
  const locationLine = lines.find((line) => /location|address/i.test(line));
  if (!locationLine) return null;
  const cleaned = locationLine.replace(/.*(?:location|address)[:\s-]*/i, '').trim();
  return cleaned || null;
}

function extractSkills(rawText: string) {
  const lines = extractSectionLines(rawText, normalizedSectionHeadings.skills);
  if (lines.length === 0) return null;

  const items = lines.flatMap((line) => line.split(/[,|;\u2022]+/));
  const cleaned = items
    .map((item) => item.trim())
    .filter(Boolean)
    .map((item) => item.replace(/^skills?\s*[:\-]\s*/i, '').trim());

  const unique = Array.from(new Set(cleaned)).filter(Boolean);
  return unique.length > 0 ? unique : null;
}

function extractLanguages(rawText: string): ResumeParseObject['languages'] {
  const lines = extractSectionLines(rawText, normalizedSectionHeadings.languages);
  if (lines.length === 0) return null;

  const items = lines
    .flatMap((line) => line.split(/[,|;\u2022]+/))
    .map((item) => item.trim())
    .filter(Boolean);

  if (items.length === 0) return null;

  return items.map((item) => {
    const match = item.match(
      /^(?<name>[^(-]+?)(?:\s*[-(]\s*(?<prof>[^)]+)\)?)?$/,
    );
    const name = match?.groups?.name?.trim() ?? item;
    const proficiency = match?.groups?.prof?.trim() ?? null;
    return { name, proficiency };
  });
}

export function parseResumeToStructuredData(rawText: string): ResumeParseObject {
  const lines = rawText
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  const name = extractName(lines);

  const data: ResumeParseObject = {
    first_name: name.first_name,
    last_name: name.last_name,
    phone_number: findFirstMatch(PHONE_REGEX, rawText),
    website_url: findFirstMatch(URL_REGEX, rawText),
    email: findFirstMatch(EMAIL_REGEX, rawText),
    location: extractLocation(lines),
    summary: extractSectionText(rawText, normalizedSectionHeadings.summary),
    highlights: extractSectionText(rawText, normalizedSectionHeadings.highlights),
    skills: extractSkills(rawText),
    education: null,
    experiences: null,
    certifications: null,
    projects: null,
    awards: null,
    patents: null,
    languages: extractLanguages(rawText),
  };

  return resumeParseObject.parse(data);
}

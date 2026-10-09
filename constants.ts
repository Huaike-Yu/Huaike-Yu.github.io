import profile from './profile.json';
import { PinData, PinType } from './types';

export const PROFILE = profile;
export const EMAIL_DISPLAY = PROFILE.email.replace('@', '[at]');
export const CV_URL = `${import.meta.env.BASE_URL}assets/Huaike_Yu_CV.pdf`;
export const PIN_LABELS: Record<PinType, string> = {
  [PinType.PUBLICATION]: 'Publications',
  [PinType.EDUCATION]: 'Education',
  [PinType.RESEARCH]: 'Research',
  [PinType.EXPERIENCE]: 'Experience',
  [PinType.SKILL]: 'Skills',
  [PinType.RESUME]: 'CV',
  [PinType.CONTACT]: 'Contact',
};

const colors = [
  'bg-cute-blue/70 dark:bg-blue-950',
  'bg-cute-purple/70 dark:bg-purple-950',
  'bg-cute-mint/70 dark:bg-emerald-950',
  'bg-cute-pink/70 dark:bg-rose-950',
  'bg-cute-yellow/60 dark:bg-amber-950',
  'bg-white dark:bg-slate-800',
];

export const PORTFOLIO_PINS: PinData[] = [
  {
    id: 'current-research', type: PinType.RESEARCH, title: PROFILE.role,
    subtitle: PROFILE.institution,
    description: 'Research interests in image watermarking, steganography, and AI security.',
    details: [`Research guidance: ${PROFILE.guidance} (${PROFILE.guidanceInstitution}).`],
    tags: PROFILE.researchInterests.slice(0, 3), icon: '🔬',
    color: 'bg-slate-800 text-white dark:bg-slate-950',
  },
  ...PROFILE.publications.map((paper, i): PinData => ({
    id: paper.id, type: PinType.PUBLICATION, title: paper.title,
    description: paper.venue, authors: paper.authors, status: paper.status,
    period: String(paper.year), tags: paper.tags, link: paper.url,
    icon: paper.icon, color: colors[i % colors.length],
  })),
  ...PROFILE.education.map((education, i): PinData => ({
    id: education.id, type: PinType.EDUCATION, title: education.institution,
    description: education.degree, period: education.period, tags: education.tags,
    icon: education.icon, color: colors[(i + 1) % colors.length],
  })),
  ...PROFILE.experience.map((experience, i): PinData => ({
    id: experience.id, type: PinType.EXPERIENCE, title: experience.institution,
    subtitle: experience.role, description: experience.summary, period: experience.period,
    details: experience.details, note: experience.institutionNote, status: experience.kind,
    tags: experience.tags, icon: experience.icon, color: colors[(i + 2) % colors.length],
  })),
  {
    id: 'research-projects', type: PinType.RESEARCH, title: 'Research Project Participation',
    subtitle: 'Project Participant',
    description: 'Participation in NSFC projects and Shandong provincial research and talent programs.',
    details: PROFILE.projects.map(project => `${project.program}: ${project.identifiers.join(', ')}.`),
    tags: ['NSFC', 'Taishan Scholars', 'Shandong'], icon: '🌱', color: colors[2],
  },
  {
    id: 'skills', type: PinType.SKILL, title: 'Skills & Competencies',
    description: 'Python, machine learning, deep learning, data analysis, immersive technologies, design, business, and research methods.',
    tags: ['Python', 'Machine Learning', 'Deep Learning', 'VR / AR', 'Research', 'Marketing'], icon: '⚡', color: colors[1],
  },
  {
    id: 'cv', type: PinType.RESUME, title: 'Curriculum Vitae',
    description: 'Education, research outputs, experience, project participation, and skills in one downloadable CV.',
    tags: ['PDF', 'Academic CV'], link: CV_URL, icon: '📄', color: colors[5],
  },
  {
    id: 'contact', type: PinType.CONTACT, title: 'Let’s Connect',
    description: 'Get in touch about research, collaboration, or professional opportunities.',
    subtitle: EMAIL_DISPLAY, tags: ['Email', 'Collaboration'], icon: '✉️', color: colors[0],
  },
];

export const RESUME_DATA = [
  `Name: ${PROFILE.name}\nEmail: ${EMAIL_DISPLAY}`,
  `Current role: ${PROFILE.role}, ${PROFILE.institution}.\nResearch guidance: ${PROFILE.guidance} (${PROFILE.guidanceInstitution}).`,
  PROFILE.introduction,
  `Education:\n${PROFILE.education.map(e => `${e.institution}: ${e.degree} (${e.period}).`).join('\n')}`,
  `Experience:\n${PROFILE.experience.map(e => `${e.role}, ${e.institution} (${e.period}; ${e.kind}). ${e.details.join(' ')}`).join('\n')}`,
  `Publications and preprints:\n${PROFILE.publications.map(p => `${p.authors.join(', ')}. ${p.title}. ${p.venue}, ${p.year}. ${p.status}. ${p.url}`).join('\n')}`,
  `Skills:\n${PROFILE.skills.map(s => `${s.category}: ${s.items.join(', ')}.`).join('\n')}`,
  `Research project participation:\n${PROFILE.projects.map(p => `${p.role}: ${p.program}; ${p.identifiers.join(', ')}.`).join('\n')}`,
].join('\n\n');

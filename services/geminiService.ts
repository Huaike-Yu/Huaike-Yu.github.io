import { EMAIL_DISPLAY, PROFILE, RESUME_DATA } from '../constants';

const apiKey = process.env.API_KEY || '';
export const HAS_AI_KEY = Boolean(apiKey);

// The profile guide remains usable without a configured model or network request.
const profileAnswer = (message: string): string => {
  const query = message.toLowerCase();
  if (/email|contact|reach|联系|邮箱/.test(query)) return `You can contact ${PROFILE.name} at ${EMAIL_DISPLAY}.`;
  if (/publication|paper|preprint|publish|论文|发表/.test(query)) return `Huaike’s listed research outputs include ${PROFILE.publications.length} papers and preprints:\n\n${PROFILE.publications.map(p => `${p.year} · ${p.title} (${p.status}; ${p.venue})`).join('\n\n')}\n\nOpen the Publications cards for author lists and paper links.`;
  if (/education|degree|university|unsw|newcastle|study|studied|学历|教育|大学/.test(query)) return PROFILE.education.map(e => `${e.institution}\n${e.degree}\n${e.period}`).join('\n\n');
  if (/skill|python|machine learning|deep learning|maya|cad|vr|ar\b|competenc|机器学习|深度学习|技术|技能/.test(query)) return PROFILE.skills.map(s => `${s.category}: ${s.items.join(', ')}`).join('\n');
  if (/grant|project|nsfc|taishan|fund|项目|基金/.test(query)) return `Role: Project Participant.\n\n${PROFILE.projects.map(p => `${p.program}: ${p.identifiers.join(', ')}`).join('\n\n')}`;
  if (/experience|intern|shopee|bank|prism|operations|实习|实践|经历/.test(query)) return PROFILE.experience.map(e => `${e.role} · ${e.institution}\n${e.period}\n${e.summary}`).join('\n\n');
  if (/guidance|advisor|supervis|qi li|导师|指导/.test(query)) return `Research guidance: ${PROFILE.guidance} (${PROFILE.guidanceInstitution}).`;
  if (/research|work|role|about|background|watermark|stegano|security|研究|工作|水印/.test(query)) return `${PROFILE.name} is a ${PROFILE.role} at ${PROFILE.institution}.\n\n${PROFILE.introduction}\n\nResearch guidance: ${PROFILE.guidance}.`;
  if (/resume|\bcv\b|简历/.test(query)) return 'Use the Download CV button at the top of the page to download Huaike Yu’s academic CV.';
  return `I can help you explore Huaike’s research, publications, education, experience, skills, and project participation. For details beyond this profile, email ${EMAIL_DISPLAY}.`;
};

export const generateChatResponse = async (userMessage: string): Promise<string> => {
  if (!apiKey) return profileAnswer(userMessage);
  try {
    const { GoogleGenAI } = await import('@google/genai');
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: userMessage,
      config: {
        systemInstruction: `You are the portfolio assistant for Huaike Yu. Answer only from the profile below. Preserve dates, author order, and skill levels. Distinguish published articles from preprints. Huaike is a project participant, not a principal investigator; do not claim the listed grants were personally awarded to Huaike. Maya is being learned and 3D modeling is basic. Do not invent affiliations, achievements, phone numbers, or links. If a detail is absent, refer the visitor to ${PROFILE.email}. Keep answers concise.\n\n${RESUME_DATA}`,
        temperature: 0.2,
      },
    });
    return response.text?.replaceAll(PROFILE.email, EMAIL_DISPLAY) || profileAnswer(userMessage);
  } catch {
    return profileAnswer(userMessage);
  }
};

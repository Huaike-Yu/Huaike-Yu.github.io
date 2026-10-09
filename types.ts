export enum PinType {
  PUBLICATION = 'PUBLICATION',
  EDUCATION = 'EDUCATION',
  RESEARCH = 'RESEARCH',
  EXPERIENCE = 'EXPERIENCE',
  SKILL = 'SKILL',
  RESUME = 'RESUME',
  CONTACT = 'CONTACT',
}

export interface PinData {
  id: string;
  type: PinType;
  title: string;
  description: string;
  subtitle?: string;
  period?: string;
  details?: string[];
  note?: string;
  authors?: string[];
  status?: string;
  tags?: string[];
  link?: string;
  color?: string;
  icon?: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
}

export interface StickerData {
  id: string;
  emoji: string;
  top: string;
  left: string;
  rotation: number;
}

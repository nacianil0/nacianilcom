import type { Locale, Messages } from '@nacianilcom/content-core';
import trRaw from '../../messages/tr.json';
import enRaw from '../../messages/en.json';

export interface WebMessages extends Messages {
  difficulty: {
    beginner: string;
    intermediate: string;
    advanced: string;
  };
}

const MESSAGES: Record<Locale, WebMessages> = {
  tr: trRaw as WebMessages,
  en: enRaw as WebMessages,
};

export function getMessages(lang: Locale): WebMessages {
  return MESSAGES[lang] ?? MESSAGES['tr'];
}

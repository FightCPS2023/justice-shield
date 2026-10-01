const KEY = 'punisher_ai_mode';
const EVENT = 'punisher-ai-mode-change';

export const AI_MODES = [
  { id: 'AUTO', label: 'Auto', desc: 'Depth follows your plan tier' },
  { id: 'PARENT', label: 'Parent', desc: 'Plain English + exact next action' },
  { id: 'ADVOCATE', label: 'Advocate', desc: 'Rights, process, record-building' },
  { id: 'ATTORNEY', label: 'Attorney', desc: 'Citations, elements, burdens, counter-moves' },
  { id: 'INVESTIGATOR', label: 'Investigator', desc: 'Records, FOIA, timelines, impeachment' },
];

export const getAiMode = () => {
  try {
    return window.localStorage.getItem(KEY) || 'AUTO';
  } catch {
    return 'AUTO';
  }
};

export const setAiMode = (mode) => {
  try {
    window.localStorage.setItem(KEY, mode);
  } catch {
    // ignore
  }
  window.dispatchEvent(new CustomEvent(EVENT, { detail: mode }));
};

export const subscribeAiMode = (fn) => {
  const handler = (e) => fn(e.detail || getAiMode());
  window.addEventListener(EVENT, handler);
  return () => window.removeEventListener(EVENT, handler);
};

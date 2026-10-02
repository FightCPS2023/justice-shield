import { useEffect, useRef, useState } from 'react';

const PREFIX = 'punisher_draft:';
const isEqual = (a, b) => JSON.stringify(a) === JSON.stringify(b);

export const useAutosaveDraft = (key, formData, setFormData, initialFormState, onRestore) => {
  const storageKey = `${PREFIX}${key}`;
  const [savedAt, setSavedAt] = useState(null);
  const [restored, setRestored] = useState(false);
  const timer = useRef(null);
  const skipNext = useRef(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(storageKey);
      if (raw) {
        const { data, savedAt: ts } = JSON.parse(raw);
        if (data && !isEqual(data, initialFormState)) {
          skipNext.current = true;
          setFormData({ ...initialFormState, ...data });
          setSavedAt(ts);
          setRestored(true);
          if (onRestore) onRestore();
        }
      }
    } catch {
      // ignore corrupt drafts
    }
  }, [storageKey]);

  useEffect(() => {
    if (skipNext.current) {
      skipNext.current = false;
      return undefined;
    }
    clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      try {
        if (isEqual(formData, initialFormState)) {
          window.localStorage.removeItem(storageKey);
          setSavedAt(null);
          setRestored(false);
        } else {
          const ts = new Date().toISOString();
          window.localStorage.setItem(storageKey, JSON.stringify({ data: formData, savedAt: ts }));
          setSavedAt(ts);
        }
      } catch {
        // storage full / unavailable
      }
    }, 400);
    return () => clearTimeout(timer.current);
  }, [formData, storageKey]);

  const clearDraft = () => {
    clearTimeout(timer.current);
    skipNext.current = true;
    setFormData(initialFormState);
    try {
      window.localStorage.removeItem(storageKey);
    } catch {
      // ignore
    }
    setSavedAt(null);
    setRestored(false);
  };

  return { savedAt, restored, clearDraft };
};

export default useAutosaveDraft;

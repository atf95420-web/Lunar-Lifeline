import { useState, useEffect } from 'react';
import { SUPPORTED_LANGUAGES } from '../constants/translations';

const PREFERENCES_STORAGE_KEY = 'lunar_lifeline_preferences';

export function usePreferences() {
  const [preferences, setPreferences] = useState(() => {
    try {
      const stored = localStorage.getItem(PREFERENCES_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        const validLang = SUPPORTED_LANGUAGES.some((l) => l.code === parsed.lang)
          ? parsed.lang
          : 'ar';
        return {
          lang: validLang,
          sound: typeof parsed.sound === 'boolean' ? parsed.sound : true,
        };
      }
    } catch {}
    return { lang: 'ar', sound: true };
  });

  useEffect(() => {
    try {
      localStorage.setItem(PREFERENCES_STORAGE_KEY, JSON.stringify(preferences));
      document.documentElement.setAttribute('dir', preferences.lang === 'ar' ? 'rtl' : 'ltr');
      document.documentElement.setAttribute('lang', preferences.lang);
    } catch {}
  }, [preferences]);

  const setLanguage = (langCode) => {
    if (SUPPORTED_LANGUAGES.some((l) => l.code === langCode)) {
      setPreferences((prev) => ({ ...prev, lang: langCode }));
    }
  };

  const cycleLanguage = () => {
    setPreferences((prev) => {
      const idx = SUPPORTED_LANGUAGES.findIndex((l) => l.code === prev.lang);
      const nextIdx = (idx + 1) % SUPPORTED_LANGUAGES.length;
      return { ...prev, lang: SUPPORTED_LANGUAGES[nextIdx].code };
    });
  };

  const toggleSound = () => {
    setPreferences((prev) => ({
      ...prev,
      sound: !prev.sound,
    }));
  };

  return {
    lang: preferences.lang,
    sound: preferences.sound,
    setLanguage,
    cycleLanguage,
    toggleSound,
    supportedLanguages: SUPPORTED_LANGUAGES,
  };
}

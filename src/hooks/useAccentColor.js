/**
 * @file useAccentColor.js
 * @description Hook that manages the user-configurable accent color.
 * @architecture
 * - Persists the chosen color to localStorage under 'emergence-accent-color'.
 * - Applies the color to --emergence-color-accent on the document root so all
 *   canvas and CSS consumers stay in sync without prop drilling.
 * - Falls back to the design system default (#7b61ff) if no preference is stored.
 */
import { useEffect, useState } from 'react';

const STORAGE_KEY = 'emergence-accent-color';
const DEFAULT_COLOR = '#14b8a6';

/**
 * @returns {[string, (color: string) => void]} Tuple of [accentColor, setAccentColor].
 */
export function useAccentColor() {
  const [accentColor, setAccentColor] = useState(
    () => localStorage.getItem(STORAGE_KEY) || DEFAULT_COLOR,
  );

  useEffect(() => {
    document.documentElement.style.setProperty('--emergence-color-accent', accentColor);
    localStorage.setItem(STORAGE_KEY, accentColor);
  }, [accentColor]);

  return [accentColor, setAccentColor];
}

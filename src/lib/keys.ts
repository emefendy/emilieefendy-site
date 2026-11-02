const isMac = typeof navigator !== 'undefined' && /Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent);

export const MOD_KEY = isMac ? '⌘' : 'Ctrl';

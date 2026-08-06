let idCounter = 0;

export const genId = (prefix: string): string => {
  idCounter = (idCounter + 1) % 100000;
  return `${prefix}-${Date.now().toString(36)}-${idCounter}-${Math.random().toString(36).slice(2, 8)}`;
};
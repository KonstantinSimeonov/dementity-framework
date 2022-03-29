export const entries = Object.entries as <T extends Record<string, any>>(
  o: T
) => readonly [keyof T, T[keyof T]][];

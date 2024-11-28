/**
 * @description trims the value, then returns the value with first character capitalized and remaining characters lower cased
 * note: capitalization does not happen if trimmed string is empty
 * @param {string} name
 * @returns
 */
export function trimAndFormat(name: string) {
  if (typeof name !== 'string') return name;
  const trimmedName = name.trim();
  if (trimmedName[0])
    return trimmedName[0].toUpperCase() + trimmedName.slice(1).toLowerCase();
  return trimmedName;
}

export function formatTypefaceName (name: string): string {
  return name
    .replace('-', ' ')
    .replace('OT', '')
    .replaceAll(/[a-z][A-Z]/g, match => `${match[0]} ${match[1]}`)
    .replaceAll(/([0-9]+)/g, (_, group1: string) => ` ${group1} `)
    .replaceAll(/\s+/g, ' ')
}

export function formatISK(aura: number) {
  return Math.round(aura / 100).toLocaleString('is-IS').replace(/,/g, '.') + ' kr.';
}

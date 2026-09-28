export function formatPercent(value: number): string {
  return `${value.toLocaleString('es-CO', { maximumFractionDigits: 1 })} %`;
}

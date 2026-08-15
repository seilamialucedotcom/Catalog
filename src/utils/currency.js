const peruvianCurrency = new Intl.NumberFormat('es-PE', {
  style: 'currency',
  currency: 'PEN',
  currencyDisplay: 'narrowSymbol',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export function formatPrice(value) {
  const amount = Number(value);
  return peruvianCurrency.format(Number.isFinite(amount) ? amount : 0);
}

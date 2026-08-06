type StockBadgeProps = {
  status: 'til' | 'vaentanlegt' | 'uppselt';
  count?: number;
};

export function StockBadge({ status, count }: StockBadgeProps) {
  let label = '';
  if (status === 'til') label = 'Á lager';
  if (status === 'vaentanlegt') label = 'Væntanlegt';
  if (status === 'uppselt') label = 'Uppselt';

  if (status === 'til' && count !== undefined) {
    label = `Á lager (${count} stk)`;
  } else if (status === 'vaentanlegt' && count !== undefined) {
    label = `Væntanlegt - Til í hús: ${count} stk`; // just a variation
  }

  return (
    <span className={`rf-stock rf-stock--${status}`} data-testid={`stock-badge-${status}`}>
      {label}
    </span>
  );
}

import { useAppContext } from '../context/AppContext';
import { formatISK } from '../utils/format';

type PriceDisplayProps = {
  priceAura: number;
};

export function PriceDisplay({ priceAura }: PriceDisplayProps) {
  const { vatMode } = useAppContext();
  
  const priceMedVsk = priceAura;
  const priceAnVsk = Math.round(priceAura / 1.24);

  const primaryPrice = vatMode === 'med' ? priceMedVsk : priceAnVsk;
  const secondaryPrice = vatMode === 'med' ? priceAnVsk : priceMedVsk;
  const secondarySuffix = vatMode === 'med' ? ' án vsk' : ' m. vsk';

  return (
    <div className="rf-price" data-testid="price-display">
      <span className="rf-price__primary">{formatISK(primaryPrice)}</span>
      <span className="rf-price__secondary">{formatISK(secondaryPrice)}{secondarySuffix}</span>
    </div>
  );
}

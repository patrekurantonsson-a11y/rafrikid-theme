import { Product } from '../data/products';
import { PriceDisplay } from './PriceDisplay';
import { StockBadge } from './StockBadge';

type ProductCardProps = {
  product: Product;
};

export function ProductCard({ product }: ProductCardProps) {
  return (
    <a href="#" className="rf-card rf-product-card" data-testid={`product-card-${product.id}`}>
      <div className="rf-product-card__image-wrap">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" fill="none" width="100%" height="100%">
          <rect width="400" height="400" fill="#EBEBEA" />
          <path d="M150 200 L200 150 L250 200 L200 250 Z" fill="#D0D0CE" />
          <circle cx="200" cy="200" r="20" fill="#1A5C96" opacity="0.5" />
        </svg>
      </div>
      <div className="rf-product-card__body">
        <div className="rf-product-card__vendor">{product.vendor}</div>
        <h3 className="rf-product-card__title">{product.title}</h3>
        <div className="rf-product-card__mpn">Vörunr: {product.mpn}</div>
        <div style={{ marginBottom: '0.5rem' }}>
          <StockBadge status={product.stockStatus} count={product.stockCount} />
        </div>
        <div className="rf-product-card__price">
          <PriceDisplay priceAura={product.priceAura} />
        </div>
      </div>
    </a>
  );
}

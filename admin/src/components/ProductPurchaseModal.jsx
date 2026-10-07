import { useState } from 'react';
import { X, ShoppingCart, Zap, Star } from 'lucide-react';
import { useCart } from '../context/CartContext';

export default function ProductPurchaseModal({ product, onClose }) {
  const { addToCart, startBuyNow } = useCart();
  const [selectedColor, setSelectedColor] = useState(product?.colors?.[0] || 'Standard');
  const [selectedSize, setSelectedSize] = useState(product?.sizes?.[0] || 'Standard');
  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);

  if (!product) return null;

  const currentPrice = product.discountPrice > 0 ? product.discountPrice : product.price;

  const handleAddToCart = async () => {
    setAdding(true);
    try {
      await addToCart(product._id, quantity, selectedColor, selectedSize);
      onClose();
    } catch {
      // Handled by context
    } finally {
      setAdding(false);
    }
  };

  const handleInstantBuy = () => {
    startBuyNow({
      ...product,
      colors: [selectedColor],
      sizes: [selectedSize],
      price: currentPrice,
      quantity,
    });
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ maxWidth: 520 }}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span className="badge badge-accent">Quick Purchase</span>
            <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>{product.brand}</div>
          </div>
          <button className="btn-icon" onClick={onClose}><X size={18} /></button>
        </div>

        <div style={{ display: 'flex', gap: 16, marginBottom: 20 }}>
          <img
            src={product.images?.[0] || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400'}
            alt={product.name}
            style={{ width: 110, height: 110, borderRadius: 12, objectFit: 'cover', flexShrink: 0, background: 'var(--bg-secondary)' }}
          />
          <div style={{ flex: 1 }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 4 }}>{product.name}</h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--text-muted)', marginBottom: 8 }}>
              <span>⭐ {product.rating || '4.8'}</span>
              <span>•</span>
              <span className={product.countInStock > 0 ? 'text-success' : 'text-danger'}>
                {product.countInStock > 0 ? `${product.countInStock} in stock` : 'Out of stock'}
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
              <span style={{ fontSize: 22, fontWeight: 800, color: 'var(--accent)' }}>
                ${currentPrice.toFixed(2)}
              </span>
              {product.discountPrice > 0 && (
                <span style={{ fontSize: 14, color: 'var(--text-muted)', textDecoration: 'line-through' }}>
                  ${product.price.toFixed(2)}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Color Selection */}
        {product.colors && product.colors.length > 0 && (
          <div style={{ marginBottom: 16 }}>
            <label className="form-label">Select Color</label>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {product.colors.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setSelectedColor(color)}
                  style={{
                    padding: '6px 12px',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: 12,
                    fontWeight: 600,
                    border: selectedColor === color ? '1px solid var(--accent)' : '1px solid var(--border)',
                    background: selectedColor === color ? 'var(--accent-light)' : 'var(--bg-secondary)',
                    color: selectedColor === color ? 'var(--accent)' : 'var(--text-primary)',
                  }}
                >
                  {color}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Size Selection */}
        {product.sizes && product.sizes.length > 0 && (
          <div style={{ marginBottom: 16 }}>
            <label className="form-label">Select Size / Variant</label>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {product.sizes.map((size) => (
                <button
                  key={size}
                  type="button"
                  onClick={() => setSelectedSize(size)}
                  style={{
                    padding: '6px 12px',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: 12,
                    fontWeight: 600,
                    border: selectedSize === size ? '1px solid var(--accent)' : '1px solid var(--border)',
                    background: selectedSize === size ? 'var(--accent-light)' : 'var(--bg-secondary)',
                    color: selectedSize === size ? 'var(--accent)' : 'var(--text-primary)',
                  }}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Quantity */}
        <div style={{ marginBottom: 20 }}>
          <label className="form-label">Quantity</label>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}>
              <button
                type="button"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                style={{ padding: '8px 14px', background: 'none', color: 'var(--text-secondary)' }}
              >
                -
              </button>
              <span style={{ minWidth: 32, textAlign: 'center', fontWeight: 700 }}>{quantity}</span>
              <button
                type="button"
                onClick={() => setQuantity(Math.min(product.countInStock || 99, quantity + 1))}
                style={{ padding: '8px 14px', background: 'none', color: 'var(--text-secondary)' }}
              >
                +
              </button>
            </div>
            <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>
              Total: <strong style={{ color: 'var(--text-primary)' }}>${(currentPrice * quantity).toFixed(2)}</strong>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={handleAddToCart}
            disabled={adding || product.countInStock === 0}
            style={{ justifyContent: 'center', padding: '12px' }}
          >
            <ShoppingCart size={16} />
            <span>{adding ? 'Adding...' : 'Add to Cart'}</span>
          </button>

          <button
            type="button"
            className="btn btn-primary"
            onClick={handleInstantBuy}
            disabled={product.countInStock === 0}
            style={{ justifyContent: 'center', padding: '12px' }}
          >
            <Zap size={16} />
            <span>Instant Buy Now</span>
          </button>
        </div>
      </div>
    </div>
  );
}

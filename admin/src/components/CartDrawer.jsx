import { useState } from 'react';
import { X, Trash2, Plus, Minus, ShoppingBag, ArrowRight, Tag } from 'lucide-react';
import { useCart } from '../context/CartContext';

export default function CartDrawer() {
  const {
    cart,
    cartOpen,
    setCartOpen,
    updateQuantity,
    removeFromCart,
    setCheckoutOpen,
    applyCoupon,
    removeCoupon,
  } = useCart();

  const [couponInput, setCouponInput] = useState('');

  if (!cartOpen) return null;

  const items = cart?.items || [];
  const itemCount = cart?.itemCount || 0;

  const handleApplyCoupon = (e) => {
    e.preventDefault();
    if (couponInput.trim()) {
      applyCoupon(couponInput.trim());
      setCouponInput('');
    }
  };

  const handleProceedToCheckout = () => {
    setCartOpen(false);
    setCheckoutOpen(true);
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0, 0, 0, 0.7)',
        zIndex: 300,
        display: 'flex',
        justifyContent: 'flex-end',
        backdropFilter: 'blur(4px)',
      }}
      onClick={(e) => e.target === e.currentTarget && setCartOpen(false)}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 440,
          background: 'var(--bg-card)',
          borderLeft: '1px solid var(--border)',
          height: '100vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: 'var(--shadow-lg)',
          animation: 'slideIn 0.25s ease-out',
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '20px 24px',
            borderBottom: '1px solid var(--border-light)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                background: 'var(--accent-light)',
                color: 'var(--accent)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <ShoppingBag size={18} />
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: 16 }}>Your Cart</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{itemCount} item(s) selected</div>
            </div>
          </div>
          <button className="btn-icon" onClick={() => setCartOpen(false)}>
            <X size={18} />
          </button>
        </div>

        {/* Items List */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px' }}>
          {items.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-secondary)' }}>
              <ShoppingBag size={48} style={{ opacity: 0.3, marginBottom: 12 }} />
              <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 6 }}>Your cart is empty</div>
              <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 20 }}>
                Explore products in our catalog and click "Add to Cart" or "Buy Now"!
              </p>
              <button
                className="btn btn-primary btn-sm"
                onClick={() => setCartOpen(false)}
              >
                Browse Products
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {items.map((item) => {
                const p = item.product || {};
                return (
                  <div
                    key={item._id}
                    style={{
                      background: 'var(--bg-secondary)',
                      borderRadius: 'var(--radius-sm)',
                      padding: 12,
                      display: 'flex',
                      gap: 12,
                      alignItems: 'center',
                    }}
                  >
                    <img
                      src={p.images?.[0] || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=200'}
                      alt={p.name}
                      style={{ width: 56, height: 56, borderRadius: 8, objectFit: 'cover', flexShrink: 0 }}
                    />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div
                        style={{
                          fontWeight: 600,
                          fontSize: 13,
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}
                      >
                        {p.name || 'Product'}
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
                        {item.color} • {item.size}
                      </div>
                      <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--accent)', marginTop: 4 }}>
                        ${(item.price * item.quantity).toFixed(2)}
                      </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8 }}>
                      <button
                        onClick={() => removeFromCart(item._id)}
                        style={{ background: 'none', border: 'none', color: 'var(--danger)', padding: 4 }}
                        title="Remove"
                      >
                        <Trash2 size={14} />
                      </button>

                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 6,
                          background: 'var(--bg-card)',
                          borderRadius: 6,
                          padding: '2px 6px',
                        }}
                      >
                        <button
                          onClick={() => updateQuantity(item._id, Math.max(1, item.quantity - 1))}
                          style={{ background: 'none', border: 'none', color: 'var(--text-secondary)' }}
                        >
                          <Minus size={12} />
                        </button>
                        <span style={{ fontSize: 12, fontWeight: 700, minWidth: 16, textAlign: 'center' }}>
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item._id, item.quantity + 1)}
                          style={{ background: 'none', border: 'none', color: 'var(--text-secondary)' }}
                        >
                          <Plus size={12} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer with summary & buy action */}
        {items.length > 0 && (
          <div
            style={{
              padding: '20px 24px',
              borderTop: '1px solid var(--border-light)',
              background: 'var(--bg-secondary)',
            }}
          >
            {/* Promo Code Input */}
            <form onSubmit={handleApplyCoupon} style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
              <div style={{ position: 'relative', flex: 1 }}>
                <Tag
                  size={14}
                  style={{
                    position: 'absolute',
                    left: 10,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'var(--text-muted)',
                  }}
                />
                <input
                  style={{ paddingLeft: 32, fontSize: 12 }}
                  placeholder="Coupon code (e.g. WELCOME20)"
                  value={couponInput}
                  onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                />
              </div>
              <button type="submit" className="btn btn-secondary btn-sm" style={{ padding: '0 12px' }}>
                Apply
              </button>
            </form>

            {cart?.coupon && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  background: 'var(--success-light)',
                  color: 'var(--success)',
                  padding: '6px 12px',
                  borderRadius: 6,
                  fontSize: 12,
                  fontWeight: 600,
                  marginBottom: 12,
                }}
              >
                <span>Coupon "{cart.coupon.code}" active!</span>
                <button
                  onClick={removeCoupon}
                  style={{ background: 'none', border: 'none', color: 'var(--danger)', fontSize: 11, cursor: 'pointer' }}
                >
                  Remove
                </button>
              </div>
            )}

            {/* Price lines */}
            <div style={{ fontSize: 13, display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
                <span>Subtotal</span>
                <span>${cart?.subtotal?.toFixed(2)}</span>
              </div>
              {cart?.discountAmount > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--success)' }}>
                  <span>Discount</span>
                  <span>-${cart?.discountAmount?.toFixed(2)}</span>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
                <span>Shipping</span>
                <span>{cart?.shippingFee === 0 ? 'FREE' : `$${cart?.shippingFee?.toFixed(2)}`}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
                <span>Tax (8%)</span>
                <span>${cart?.tax?.toFixed(2)}</span>
              </div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontWeight: 800,
                  fontSize: 16,
                  borderTop: '1px solid var(--border)',
                  paddingTop: 10,
                  marginTop: 4,
                }}
              >
                <span>Total</span>
                <span style={{ color: 'var(--accent)' }}>${cart?.total?.toFixed(2)}</span>
              </div>
            </div>

            <button
              className="btn btn-primary w-full"
              style={{ justifyContent: 'center', padding: '12px', fontSize: 15 }}
              onClick={handleProceedToCheckout}
            >
              <span>Proceed to Checkout</span>
              <ArrowRight size={16} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

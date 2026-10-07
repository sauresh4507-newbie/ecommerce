import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import toast from 'react-hot-toast';
import { X, CheckCircle, CreditCard, Truck, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

export default function CheckoutModal() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const {
    checkoutOpen,
    setCheckoutOpen,
    buyNowItem,
    setBuyNowItem,
    cart,
    clearCart,
  } = useCart();

  const [address, setAddress] = useState({
    fullName: user?.name || 'Customer Name',
    phone: user?.phone || '+1-555-0201',
    addressLine1: '123 Market Street, Apt 4B',
    addressLine2: '',
    city: 'New York',
    state: 'NY',
    postalCode: '10001',
    country: 'USA',
  });

  const [paymentMethod, setPaymentMethod] = useState('Card');
  const [couponCode, setCouponCode] = useState(cart?.coupon?.code || '');
  const [placing, setPlacing] = useState(false);

  if (!checkoutOpen) return null;

  // Determine items being purchased
  const items = buyNowItem
    ? [
        {
          product: buyNowItem.product,
          name: buyNowItem.name,
          image: buyNowItem.image,
          price: buyNowItem.price,
          quantity: buyNowItem.quantity || 1,
          color: buyNowItem.color || 'Default',
          size: buyNowItem.size || 'Standard',
        },
      ]
    : cart?.items?.map((it) => ({
        product: it.product?._id || it.product,
        name: it.product?.name || 'Product',
        image: it.product?.images?.[0] || '',
        price: it.price,
        quantity: it.quantity,
        color: it.color,
        size: it.size,
      })) || [];

  const subtotal = items.reduce((sum, it) => sum + it.price * it.quantity, 0);
  const discount = cart?.discountAmount && !buyNowItem ? cart.discountAmount : 0;
  const shipping = subtotal > 100 || items.length === 0 ? 0 : 9.99;
  const tax = Math.round((subtotal - discount) * 0.08 * 100) / 100;
  const total = Math.max(0, Math.round((subtotal - discount + shipping + tax) * 100) / 100);

  const handleClose = () => {
    setCheckoutOpen(false);
    setBuyNowItem(null);
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    if (items.length === 0) {
      toast.error('No items to purchase');
      return;
    }

    setPlacing(true);
    try {
      const orderPayload = {
        orderItems: items.map((it) => ({
          product: it.product,
          name: it.name,
          image: it.image,
          price: it.price,
          quantity: it.quantity,
          color: it.color,
          size: it.size,
        })),
        shippingAddress: address,
        paymentMethod,
        couponCode: couponCode || undefined,
        paymentResult: paymentMethod === 'Card' ? {
          id: `pi_test_${Date.now()}`,
          status: 'COMPLETED',
          update_time: new Date().toISOString(),
        } : undefined,
      };

      const { data } = await api.post('/orders', orderPayload);

      toast.success('🎉 Order placed successfully!');
      if (!buyNowItem) {
        await clearCart();
      }
      handleClose();
      navigate('/orders');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to place order');
    } finally {
      setPlacing(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && handleClose()}>
      <div className="modal" style={{ maxWidth: 620 }}>
        <div className="modal-header">
          <div>
            <h2 className="modal-title">Checkout & Buy Now</h2>
            <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
              {buyNowItem ? '⚡ Direct Quick Buy' : '🛒 Cart Checkout'}
            </p>
          </div>
          <button className="btn-icon" onClick={handleClose}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handlePlaceOrder}>
          {/* Items Summary */}
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 10 }}>
              Order Items ({items.length})
            </div>
            <div style={{ maxHeight: 180, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 8, paddingRight: 4 }}>
              {items.map((item, idx) => (
                <div
                  key={idx}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    background: 'var(--bg-secondary)',
                    padding: 10,
                    borderRadius: 'var(--radius-sm)',
                  }}
                >
                  {item.image && (
                    <img
                      src={item.image}
                      alt={item.name}
                      style={{ width: 44, height: 44, borderRadius: 6, objectFit: 'cover' }}
                    />
                  )}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {item.name}
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                      Qty: {item.quantity} • Color: {item.color} • Size: {item.size}
                    </div>
                  </div>
                  <div style={{ fontWeight: 700, fontSize: 14 }}>
                    ${(item.price * item.quantity).toFixed(2)}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Shipping Address */}
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 10 }}>
              Shipping Address
            </div>
            <div className="form-row cols-2" style={{ marginBottom: 10 }}>
              <div>
                <label className="form-label">Full Name *</label>
                <input
                  value={address.fullName}
                  onChange={(e) => setAddress({ ...address, fullName: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="form-label">Phone *</label>
                <input
                  value={address.phone}
                  onChange={(e) => setAddress({ ...address, phone: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: 10 }}>
              <label className="form-label">Address Line 1 *</label>
              <input
                value={address.addressLine1}
                onChange={(e) => setAddress({ ...address, addressLine1: e.target.value })}
                required
              />
            </div>

            <div className="form-row cols-3">
              <div>
                <label className="form-label">City *</label>
                <input
                  value={address.city}
                  onChange={(e) => setAddress({ ...address, city: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="form-label">Postal Code *</label>
                <input
                  value={address.postalCode}
                  onChange={(e) => setAddress({ ...address, postalCode: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="form-label">Country *</label>
                <input
                  value={address.country}
                  onChange={(e) => setAddress({ ...address, country: e.target.value })}
                  required
                />
              </div>
            </div>
          </div>

          {/* Payment Method */}
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 10 }}>
              Payment Method
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <button
                type="button"
                onClick={() => setPaymentMethod('Card')}
                style={{
                  padding: '12px',
                  borderRadius: 'var(--radius-sm)',
                  border: paymentMethod === 'Card' ? '1px solid var(--accent)' : '1px solid var(--border)',
                  background: paymentMethod === 'Card' ? 'var(--accent-light)' : 'var(--bg-secondary)',
                  color: paymentMethod === 'Card' ? 'var(--accent)' : 'var(--text-primary)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                <CreditCard size={18} />
                <span>Credit / Debit Card (Simulated)</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('COD')}
                style={{
                  padding: '12px',
                  borderRadius: 'var(--radius-sm)',
                  border: paymentMethod === 'COD' ? '1px solid var(--accent)' : '1px solid var(--border)',
                  background: paymentMethod === 'COD' ? 'var(--accent-light)' : 'var(--bg-secondary)',
                  color: paymentMethod === 'COD' ? 'var(--accent)' : 'var(--text-primary)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                <Truck size={18} />
                <span>Cash on Delivery (COD)</span>
              </button>
            </div>
          </div>

          {/* Pricing Breakdown */}
          <div style={{ background: 'var(--bg-secondary)', borderRadius: 'var(--radius-sm)', padding: 14, marginBottom: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 6 }}>
              <span className="text-muted">Items Subtotal</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            {discount > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 6, color: 'var(--success)' }}>
                <span>Coupon Discount</span>
                <span>-${discount.toFixed(2)}</span>
              </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 6 }}>
              <span className="text-muted">Shipping</span>
              <span>{shipping === 0 ? <strong style={{ color: 'var(--success)' }}>FREE</strong> : `$${shipping.toFixed(2)}`}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 8 }}>
              <span className="text-muted">Estimated Tax (8%)</span>
              <span>${tax.toFixed(2)}</span>
            </div>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: 16,
                fontWeight: 800,
                borderTop: '1px solid var(--border)',
                paddingTop: 10,
              }}
            >
              <span>Total Due</span>
              <span style={{ color: 'var(--accent)' }}>${total.toFixed(2)}</span>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 10 }}>
            <button
              type="button"
              className="btn btn-secondary"
              style={{ flex: 1, justifyContent: 'center' }}
              onClick={handleClose}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              style={{ flex: 2, justifyContent: 'center', fontSize: 15, padding: '12px' }}
              disabled={placing}
            >
              {placing ? 'Placing Order...' : `Confirm & Place Order ($${total.toFixed(2)})`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

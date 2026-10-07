import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';
import { useAuth } from './AuthContext';

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const { user, isAuthenticated, isAdmin } = useAuth();
  const [cart, setCart] = useState(null);
  const [cartOpen, setCartOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [buyNowItem, setBuyNowItem] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchCart = useCallback(async () => {
    if (!isAuthenticated || isAdmin) {
      setCart(null);
      return;
    }
    try {
      const { data } = await api.get('/cart');
      setCart(data.cart);
    } catch {
      // Cart might be empty or uninitialized
      setCart(null);
    }
  }, [isAuthenticated, isAdmin]);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const addToCart = async (productId, quantity = 1, color = 'Default', size = 'Standard') => {
    if (!isAuthenticated) {
      toast.error('Please log in as a customer to purchase');
      return;
    }
    setLoading(true);
    try {
      const { data } = await api.post('/cart', { productId, quantity, color, size });
      setCart(data.cart);
      toast.success('Added to cart! 🛒');
      return data.cart;
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not add to cart');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (itemId, quantity) => {
    try {
      const { data } = await api.put(`/cart/${itemId}`, { quantity });
      setCart(data.cart);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    }
  };

  const removeFromCart = async (itemId) => {
    try {
      const { data } = await api.delete(`/cart/${itemId}`);
      setCart(data.cart);
      toast.success('Item removed from cart');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Remove failed');
    }
  };

  const clearCart = async () => {
    try {
      await api.delete('/cart');
      setCart(null);
    } catch {
      // Ignore
    }
  };

  const applyCoupon = async (code) => {
    try {
      const { data } = await api.post('/cart/apply-coupon', { code });
      setCart(data.cart);
      toast.success(`Coupon "${code.toUpperCase()}" applied!`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid coupon code');
    }
  };

  const removeCoupon = async () => {
    try {
      const { data } = await api.post('/cart/remove-coupon');
      setCart(data.cart);
      toast.success('Coupon removed');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to remove coupon');
    }
  };

  const startBuyNow = (product) => {
    if (!isAuthenticated) {
      toast.error('Please log in to purchase');
      return;
    }
    setBuyNowItem({
      product: product._id,
      name: product.name,
      image: product.images?.[0] || '',
      price: product.discountPrice > 0 ? product.discountPrice : product.price,
      quantity: 1,
      color: product.colors?.[0] || 'Default',
      size: product.sizes?.[0] || 'Standard',
      rawProduct: product,
    });
    setCheckoutOpen(true);
  };

  const itemCount = cart?.itemCount || 0;

  return (
    <CartContext.Provider
      value={{
        cart,
        cartOpen,
        setCartOpen,
        checkoutOpen,
        setCheckoutOpen,
        buyNowItem,
        setBuyNowItem,
        itemCount,
        loading,
        fetchCart,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        applyCoupon,
        removeCoupon,
        startBuyNow,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
};

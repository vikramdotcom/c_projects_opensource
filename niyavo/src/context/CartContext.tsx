'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product, ProductFinish, CartItem } from '@/types';

type Currency = 'USD' | 'EUR' | 'GBP' | 'JPY';

interface CartContextType {
  items: CartItem[];
  addToCart: (product: Product, finish: ProductFinish, quantity?: number, engraving?: string) => void;
  removeFromCart: (productId: string, finishId: string) => void;
  updateQuantity: (productId: string, finishId: string, quantity: number) => void;
  clearCart: () => void;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  active3DProduct: Product | null;
  setActive3DProduct: (product: Product | null) => void;
  currency: Currency;
  setCurrency: (cur: Currency) => void;
  formatPrice: (priceUSD: number) => string;
  wishlist: string[];
  toggleWishlist: (productId: string) => void;
  isWishlisted: (productId: string) => boolean;
  cartCount: number;
  subtotal: number;
  toastMessage: string | null;
  showToast: (msg: string) => void;
}

const EXCHANGE_RATES: Record<Currency, { symbol: string; rate: number; prefix: boolean }> = {
  USD: { symbol: '$', rate: 1.0, prefix: true },
  EUR: { symbol: '€', rate: 0.92, prefix: true },
  GBP: { symbol: '£', rate: 0.79, prefix: true },
  JPY: { symbol: '¥', rate: 152.0, prefix: true },
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  // Lazy initializers prevent SSR mismatch while avoiding cascading setState in useEffect
  const [items, setItems] = useState<CartItem[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const savedCart = localStorage.getItem('niyavo_cart');
        return savedCart ? JSON.parse(savedCart) : [];
      } catch {
        return [];
      }
    }
    return [];
  });

  const [wishlist, setWishlist] = useState<string[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const savedWishlist = localStorage.getItem('niyavo_wishlist');
        return savedWishlist ? JSON.parse(savedWishlist) : [];
      } catch {
        return [];
      }
    }
    return [];
  });

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [active3DProduct, setActive3DProduct] = useState<Product | null>(null);
  const [currency, setCurrency] = useState<Currency>('USD');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Sync cart to local storage
  useEffect(() => {
    try {
      localStorage.setItem('niyavo_cart', JSON.stringify(items));
    } catch {
      // Ignore in restricted environments
    }
  }, [items]);

  // Sync wishlist to local storage
  useEffect(() => {
    try {
      localStorage.setItem('niyavo_wishlist', JSON.stringify(wishlist));
    } catch {
      // Ignore
    }
  }, [wishlist]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((current) => (current === msg ? null : current));
    }, 3200);
  };

  const addToCart = (
    product: Product,
    finish: ProductFinish,
    quantity = 1,
    engraving?: string
  ) => {
    setItems((prev) => {
      const existingIndex = prev.findIndex(
        (item) => item.product.id === product.id && item.selectedFinish.id === finish.id
      );

      if (existingIndex > -1) {
        const next = [...prev];
        next[existingIndex] = {
          ...next[existingIndex],
          quantity: next[existingIndex].quantity + quantity,
          customEngraving: engraving || next[existingIndex].customEngraving,
        };
        return next;
      }

      return [
        ...prev,
        {
          product,
          selectedFinish: finish,
          quantity,
          customEngraving: engraving,
        },
      ];
    });

    showToast(`Added ${product.name} (${finish.name}) to cart.`);
    setIsCartOpen(true);
  };

  const removeFromCart = (productId: string, finishId: string) => {
    setItems((prev) =>
      prev.filter(
        (item) => !(item.product.id === productId && item.selectedFinish.id === finishId)
      )
    );
  };

  const updateQuantity = (productId: string, finishId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId, finishId);
      return;
    }
    setItems((prev) =>
      prev.map((item) =>
        item.product.id === productId && item.selectedFinish.id === finishId
          ? { ...item, quantity }
          : item
      )
    );
  };

  const clearCart = () => {
    setItems([]);
  };

  const toggleWishlist = (productId: string) => {
    setWishlist((prev) => {
      const exists = prev.includes(productId);
      if (exists) {
        showToast('Removed from saved list.');
        return prev.filter((id) => id !== productId);
      } else {
        showToast('Saved to your private wish list.');
        return [...prev, productId];
      }
    });
  };

  const isWishlisted = (productId: string) => wishlist.includes(productId);

  const cartCount = items.reduce((acc, item) => acc + item.quantity, 0);
  const subtotal = items.reduce(
    (acc, item) => acc + item.product.price * item.quantity,
    0
  );

  const formatPrice = (priceUSD: number): string => {
    const config = EXCHANGE_RATES[currency];
    const converted = Math.round(priceUSD * config.rate);
    return `${config.symbol}${converted.toLocaleString()}`;
  };

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        isCartOpen,
        setIsCartOpen,
        active3DProduct,
        setActive3DProduct,
        currency,
        setCurrency,
        formatPrice,
        wishlist,
        toggleWishlist,
        isWishlisted,
        cartCount,
        subtotal,
        toastMessage,
        showToast,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}

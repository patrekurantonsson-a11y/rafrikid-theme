import React, { createContext, useContext, useState } from 'react';

type VatMode = 'med' | 'ant';

type CartItem = {
  id: number;
  title: string;
  qty: number;
  priceAura: number;
};

type AppContextType = {
  vatMode: VatMode;
  setVatMode: (mode: VatMode) => void;
  isCartOpen: boolean;
  setCartOpen: (open: boolean) => void;
  cartItems: CartItem[];
  addToCart: (item: Omit<CartItem, 'id'>) => void;
  removeFromCart: (id: number) => void;
  updateCartQty: (id: number, qty: number) => void;
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [vatMode, setVatMode] = useState<VatMode>('med');
  const [isCartOpen, setCartOpen] = useState(false);
  const [cartItems, setCartItems] = useState<CartItem[]>([
    { id: 1, title: 'Siemens 3NA3820', qty: 2, priceAura: 3490000 },
    { id: 2, title: 'Wago 222-413', qty: 50, priceAura: 89000 },
  ]);

  const addToCart = (item: Omit<CartItem, 'id'>) => {
    setCartItems(prev => [...prev, { ...item, id: Date.now() }]);
    setCartOpen(true);
  };

  const removeFromCart = (id: number) => {
    setCartItems(prev => prev.filter(item => item.id !== id));
  };

  const updateCartQty = (id: number, qty: number) => {
    setCartItems(prev => prev.map(item => item.id === id ? { ...item, qty } : item));
  };

  return (
    <AppContext.Provider value={{
      vatMode, setVatMode,
      isCartOpen, setCartOpen,
      cartItems, addToCart, removeFromCart, updateCartQty
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (!context) throw new Error('useAppContext must be used within AppProvider');
  return context;
}

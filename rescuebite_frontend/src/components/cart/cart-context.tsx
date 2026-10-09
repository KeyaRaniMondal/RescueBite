"use client";

import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

export type CartItem = {
  listingId: string;
  foodName: string;
  price: number;
  unit: string;
  pickupLocation: string;
  image?: string;
  quantity: number;
  maxQuantity: number;
};

type AddToCartInput = Omit<CartItem, "quantity" | "maxQuantity"> & {
  quantity?: number;
  maxQuantity: number;
};

type CartContextValue = {
  items: CartItem[];
  /** Total units across all lines — shown as the navbar badge. */
  count: number;
  subtotal: number;
  addItem: (input: AddToCartInput) => void;
  updateQuantity: (listingId: string, quantity: number) => void;
  removeItem: (listingId: string) => void;
  clear: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);

const STORAGE_KEY = "rescuebite_cart";

function loadCart(): CartItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (entry): entry is CartItem =>
        typeof entry === "object" &&
        entry !== null &&
        typeof (entry as CartItem).listingId === "string" &&
        typeof (entry as CartItem).quantity === "number" &&
        (entry as CartItem).quantity > 0,
    );
  } catch {
    return [];
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  useEffect(() => {
    setItems(loadCart());
  }, []);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      // storage unavailable — cart still works for this session
    }
  }, [items]);

  // Keep badge/count in sync when the cart changes in another tab.
  useEffect(() => {
    function handleStorage(event: StorageEvent) {
      if (event.key === STORAGE_KEY) setItems(loadCart());
    }
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  const addItem = useCallback((input: AddToCartInput) => {
    const wanted = Math.max(1, Math.floor(input.quantity ?? 1));
    setItems((prev) => {
      const existing = prev.find((item) => item.listingId === input.listingId);
      if (existing) {
        const capped = Math.min(
          existing.maxQuantity,
          existing.quantity + wanted,
        );
        return prev.map((item) =>
          item.listingId === input.listingId
            ? { ...item, quantity: capped, maxQuantity: input.maxQuantity }
            : item,
        );
      }
      return [
        ...prev,
        {
          listingId: input.listingId,
          foodName: input.foodName,
          price: input.price,
          unit: input.unit,
          pickupLocation: input.pickupLocation,
          image: input.image,
          quantity: Math.min(input.maxQuantity, wanted),
          maxQuantity: input.maxQuantity,
        },
      ];
    });
  }, []);

  const updateQuantity = useCallback((listingId: string, quantity: number) => {
    setItems((prev) =>
      prev
        .map((item) =>
          item.listingId === listingId
            ? {
                ...item,
                quantity: Math.max(
                  1,
                  Math.min(item.maxQuantity, Math.floor(quantity) || 1),
                ),
              }
            : item,
        )
        .filter((item) => item.quantity > 0),
    );
  }, []);

  const removeItem = useCallback((listingId: string) => {
    setItems((prev) => prev.filter((item) => item.listingId !== listingId));
  }, []);

  const clear = useCallback(() => {
    setItems([]);
  }, []);

  const value = useMemo<CartContextValue>(() => {
    const count = items.reduce((sum, item) => sum + item.quantity, 0);
    const subtotal = items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0,
    );
    return {
      items,
      count,
      subtotal,
      addItem,
      updateQuantity,
      removeItem,
      clear,
    };
  }, [items, addItem, updateQuantity, removeItem, clear]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used within CartProvider");
  return context;
}

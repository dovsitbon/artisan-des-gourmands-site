"use client";

// Sélection de gâteaux à commander (bouton « Ajouter » de la carte), gardée dans le navigateur jusqu'à l'envoi.
import { isOrderable, type ProductId } from "@/lib/carte";

export type CartLine = { id: ProductId; qty: number };
const KEY = "adg-cart";
export const CART_EVENT = "adg:cart";

export function readCart(): CartLine[] {
  try {
    const v = JSON.parse(localStorage.getItem(KEY) ?? "[]") as CartLine[];
    return Array.isArray(v) ? v.filter((l) => isOrderable(l.id)).slice(0, 12) : [];
  } catch {
    return [];
  }
}

export function writeCart(lines: CartLine[]) {
  try {
    localStorage.setItem(KEY, JSON.stringify(lines));
  } catch {}
  window.dispatchEvent(new CustomEvent(CART_EVENT));
}

export function addToCart(id: ProductId) {
  const lines = readCart();
  const found = lines.find((l) => l.id === id);
  if (found) found.qty += 1;
  else lines.push({ id, qty: 1 });
  writeCart(lines);
}

export const clearCart = () => writeCart([]);

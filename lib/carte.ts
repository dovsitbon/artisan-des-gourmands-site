import carte from "@/data/carte.json";
import type { Dict } from "@/lib/i18n";

export type ProductId = keyof Dict["products"];
export type TabId = (typeof carte.tabs)[number]["id"] & keyof Dict["carte"]["tabs"];
export type OrderKind = "cake" | "box";
export type Item = { price: number | null; from?: boolean; unit: "piece" | "kg" | "box"; image: string | null; order?: OrderKind; tags?: ("award" | "seasonal" | "moment")[] };

export const items = carte.items as Record<ProductId, Item>;
export const tabs = carte.tabs as { id: TabId; items: ProductId[] }[];

/** Produits qui se commandent à l'avance (bouton « Ajouter »), dans l'ordre de la carte. */
export const ORDERABLE = tabs.flatMap((t) => t.items).filter((id) => items[id].order) as ProductId[];
export const isOrderable = (id: string): id is ProductId => (ORDERABLE as string[]).includes(id);

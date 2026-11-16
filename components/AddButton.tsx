"use client";

import { useState } from "react";
import { CheckIcon, PlusIcon } from "@/components/icons";
import { useLocale } from "@/components/providers";
import { addToCart } from "@/lib/cart";
import { fill } from "@/lib/i18n";
import type { ProductId } from "@/lib/carte";

/** « Ajouter » : met le gâteau dans la sélection à commander (un bandeau propose ensuite « Voir ma commande »). */
export function AddButton({ id }: { id: ProductId }) {
  const { d } = useLocale();
  const [done, setDone] = useState(false);
  return (
    <button
      type="button"
      onClick={() => {
        addToCart(id);
        setDone(true);
        setTimeout(() => setDone(false), 1600);
      }}
      aria-label={fill(d.carte.addLabel, { name: d.products[id].name })}
      className="btn !min-h-10 shrink-0 !px-3.5 !text-[0.6875rem]"
    >
      {done ? <CheckIcon /> : <PlusIcon />}
      {d.carte.add}
    </button>
  );
}

"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AnimatePresence, LazyMotion, domAnimation, m } from "motion/react";
import { CheckIcon, CloseIcon } from "@/components/icons";
import { useLocale } from "@/components/providers";
import { CART_EVENT, readCart } from "@/lib/cart";
import { pagePath } from "@/lib/pages";

/** Petit bandeau après « Ajouter » : confirmation et lien vers la commande (style des cartes produits des grandes maisons). */
export function CartToast() {
  const { lang, d } = useLocale();
  const [count, setCount] = useState(0);
  const [show, setShow] = useState(false);

  useEffect(() => {
    let t: ReturnType<typeof setTimeout>;
    const on = () => {
      const n = readCart().reduce((s, l) => s + l.qty, 0);
      setCount(n);
      if (!n || location.pathname.startsWith(pagePath("commander", lang))) return;
      setShow(true);
      clearTimeout(t);
      t = setTimeout(() => setShow(false), 5000);
    };
    window.addEventListener(CART_EVENT, on);
    return () => {
      window.removeEventListener(CART_EVENT, on);
      clearTimeout(t);
    };
  }, [lang]);

  return (
    <LazyMotion features={domAnimation}>
      <AnimatePresence>
        {show && (
          <m.div
            role="status"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.25, ease: [0.22, 0.61, 0.36, 1] }}
            className="fixed inset-x-3 bottom-[4.75rem] z-[45] flex items-center gap-3 border border-line bg-paper px-4 py-3 shadow-[0_8px_30px_rgba(74,44,33,0.08)] md:inset-x-auto md:end-6 md:bottom-6 md:w-[24rem]"
          >
            <CheckIcon className="h-5 w-5 shrink-0 text-open" />
            <p className="flex-1 text-[0.9375rem]">
              {d.carte.added} <span className="text-muted">({count})</span>
            </p>
            <Link href={pagePath("commander", lang)} className="link-line shrink-0 text-[0.75rem] font-medium tracking-[0.12em] text-framboise-ink uppercase">
              {d.carte.viewOrder}
            </Link>
            <button type="button" onClick={() => setShow(false)} className="-me-2 flex h-9 w-9 items-center justify-center text-muted hover:text-ink" aria-label={d.nav.close}>
              <CloseIcon className="h-4 w-4" />
            </button>
          </m.div>
        )}
      </AnimatePresence>
    </LazyMotion>
  );
}

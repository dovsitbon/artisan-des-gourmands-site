import Image from "next/image";
import { AddButton } from "@/components/AddButton";
import { PhotoSlot, type SlotMotif } from "@/components/PhotoSlot";
import { altOf, type Dict, type Locale } from "@/lib/i18n";
import { price } from "@/lib/format";
import { img } from "@/lib/media";
import { items, type ProductId, type TabId } from "@/lib/carte";

export const MOTIF: Record<TabId, SlotMotif> = { eclairs: "eclair", patisseries: "tart", entremets: "tart", viennoiseries: "croissant", pains: "baguette", salon: "cup" };

/** Carte produit : photo (ou emplacement), nom, description, prix « à partir de », et « Ajouter » pour ce qui se commande. */
export function ProductCard({ id, tab, lang, d }: { id: ProductId; tab: TabId; lang: Locale; d: Dict }) {
  const item = items[id];
  const p = d.products[id];
  const photo = item.image ? img(item.image) : null;
  const tag = item.tags?.[0];
  return (
    <article className="group flex h-full flex-col border border-line bg-paper">
      <div className="zoom relative aspect-[4/3] bg-cream-deep">
        {photo ? <Image src={photo.src} alt={altOf(d, photo.src)} width={photo.width} height={photo.height} sizes="(min-width: 1024px) 24vw, (min-width: 640px) 45vw, 92vw" quality={70} className="h-full w-full object-cover" /> : <PhotoSlot motif={MOTIF[tab]} label={d.placeholder.photo} />}
        {tag && <span className={`absolute start-3 top-3 px-2 py-1 text-[0.5625rem] sm:px-2.5 sm:text-[0.625rem] font-medium tracking-[0.16em] uppercase ${tag === "award" ? "bg-ink text-cream" : "bg-cream text-caramel-ink"}`}>{d.carte.tags[tag]}</span>}
      </div>
      <div className="flex flex-1 flex-col p-3 sm:p-4 md:p-5">
        <h3 className="display text-[1.2rem] leading-tight sm:text-[1.45rem]">{p.name}</h3>
        <p className="mt-1.5 line-clamp-3 text-[0.8125rem] leading-relaxed text-muted sm:text-[0.9375rem]">{p.desc}</p>
        <div className="mt-auto flex min-h-10 flex-wrap items-end justify-between gap-2 pt-3 sm:gap-3 sm:pt-4">
          <p className="text-[0.9375rem]">
            {item.price === null ? (
              <span className="text-[0.8125rem] text-muted">{item.order ? d.carte.priceQuote : d.carte.priceShop}</span>
            ) : (
              <>
                {item.from && <span className="text-[0.8125rem] text-muted">{d.carte.from} </span>}
                <span className="font-[family-name:var(--font-cormorant)] text-[1.4rem] font-medium">{price(item.price, lang)}</span>
                {(item.unit === "kg" || (item.from && item.unit === "piece")) && <span className="text-[0.8125rem] text-muted"> {item.unit === "kg" ? d.carte.perKg : d.carte.perPiece}</span>}
              </>
            )}
          </p>
          {item.order && <AddButton id={id} />}
        </div>
      </div>
    </article>
  );
}

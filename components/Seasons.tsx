"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import saisons from "@/data/saisons.json";
import { PhotoSlot } from "@/components/PhotoSlot";
import { useLocale } from "@/components/providers";
import { altOf, fill, type Dict } from "@/lib/i18n";
import { formatDay, isoDay } from "@/lib/format";
import { img } from "@/lib/media";
import { pagePath } from "@/lib/pages";

type Season = { id: keyof Dict["seasons"]["items"]; from: string; to: string; image: string | null };
const ADD: Record<Season["id"], string> = { fetes: "gateauAnniversaire", rois: "galette" };

/** Produits de saison (data/saisons.json) : une saison passée disparaît d'elle-même, sans redéploiement. */
const upcoming = (today: string) =>
  (saisons.items as Season[])
    .filter((s) => s.to >= today)
    .sort((a, b) => a.from.localeCompare(b.from))
    .slice(0, 2);

export function Seasons({ buildDay }: { buildDay: string }) {
  const { lang, d } = useLocale();
  const [today, setToday] = useState(buildDay);
  // eslint-disable-next-line react-hooks/set-state-in-effect -- valeur propre au navigateur (date, stockage), lue après l'hydratation
  useEffect(() => setToday(isoDay(new Date())), []);
  const list = upcoming(today);
  if (!list.length) return null;

  return (
    <ul className="grid gap-5 md:grid-cols-2">
      {list.map((s) => {
        const photo = s.image ? img(s.image) : null;
        const item = d.seasons.items[s.id];
        const now = s.from <= today;
        return (
          <li key={`${s.id}-${s.from}`} className="grid border border-line bg-paper sm:grid-cols-[0.8fr_1fr]">
            <div className="relative aspect-[4/3] sm:aspect-auto sm:min-h-56">
              {photo ? <Image src={photo.src} alt={altOf(d, photo.src)} width={photo.width} height={photo.height} sizes="(min-width: 768px) 20vw, 90vw" quality={70} className="h-full w-full object-cover" /> : <PhotoSlot motif={s.id === "rois" ? "tart" : "epi"} label={d.placeholder.photo} />}
            </div>
            <div className="flex flex-col p-5 md:p-6">
              <p className="eyebrow">{now ? `${d.seasons.now} · ${fill(d.seasons.until, { date: formatDay(s.to, lang, { day: "numeric", month: "long" }) })}` : fill(d.seasons.from, { date: formatDay(s.from, lang, { day: "numeric", month: "long" }) })}</p>
              <h3 className="display mt-3 text-[1.7rem]">{item.title}</h3>
              <p className="mt-2 flex-1 text-[0.9375rem] leading-relaxed text-muted">{item.text}</p>
              <Link href={`${pagePath("commander", lang)}?add=${ADD[s.id]}`} className="link-line mt-5 self-start text-[0.75rem] font-medium tracking-[0.14em] text-framboise-ink uppercase">
                {d.seasons.order}
              </Link>
            </div>
          </li>
        );
      })}
    </ul>
  );
}

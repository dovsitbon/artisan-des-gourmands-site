import site from "@/data/site.json";
import { StarIcon } from "@/components/icons";
import { fill, type Dict, type Locale } from "@/lib/i18n";
import { formatDay } from "@/lib/format";
import { intlLocale } from "@/lib/locales";

/** Note Google relevée à la main (data/site.json → rating, avec la date du relevé). */
export function Rating({ lang, d, className = "" }: { lang: Locale; d: Dict; className?: string }) {
  const value = new Intl.NumberFormat(intlLocale[lang], { minimumFractionDigits: 1 }).format(site.rating.value);
  const count = new Intl.NumberFormat(intlLocale[lang]).format(Math.floor(site.rating.count / 100) * 100);
  return (
    <a href={site.mapsUrl} target="_blank" rel="noopener noreferrer" className={`inline-flex min-h-6 items-center gap-2 hover:opacity-80 ${className}`} title={fill(d.rating.note, { date: formatDay(site.rating.checked, lang, { day: "numeric", month: "long", year: "numeric" }) })}>
      <span className="flex text-gold" aria-hidden="true">
        {[0, 1, 2, 3, 4].map((i) => (
          <StarIcon key={i} />
        ))}
      </span>
      <span>
        {fill(d.rating.value, { value })} · {fill(d.rating.count, { count })}
      </span>
    </a>
  );
}

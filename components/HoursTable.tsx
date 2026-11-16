import { formatTime } from "@/lib/format";
import { weekHours } from "@/lib/hours";
import type { Dict, Locale } from "@/lib/i18n";

/** Horaires de la semaine (data/horaires.json), du lundi au dimanche ; le jour de fermeture est mis en évidence. */
export function HoursTable({ lang, d, compact = false, dark = false }: { lang: Locale; d: Dict; compact?: boolean; dark?: boolean }) {
  const week = weekHours();
  return (
    <table className={`w-full ${compact ? "text-[0.9375rem]" : "text-base"}`}>
      <tbody>
        {week.map((slots, i) => (
          <tr key={i} className={`border-b last:border-0 ${dark ? "border-cream/15" : "border-line/80"}`}>
            <th scope="row" className="py-2 pe-4 text-start font-normal">
              {d.infos.days[i]}
            </th>
            <td className={`py-2 text-end tabular-nums ${slots.length ? "" : `font-medium ${dark ? "text-[#f3b3c0]" : "text-framboise-ink"}`}`}>{slots.length ? slots.map(([a, b]) => `${formatTime(a, lang)} – ${formatTime(b, lang)}`).join(", ") : d.infos.closed}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

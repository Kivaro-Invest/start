// Kivaro Invest – Steuerersparnis-Rechner als React-Komponente (Tailwind)
// Stand Steuerrecht 2026. Einbau siehe Notiz "Steuerersparnis-Rechner.md" im Vault.
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";

/* ---------- Rechenkern ---------- */
const T = {
  soliFrei: 20350, bbgRV: 101400, bbgKV: 69750,
  rv: 0.093, kv: (0.073 + 0.0145) * 0.96, pv: 0.018,
  wkPausch: 1230, saPausch: 36,
};

function estGrund(zve: number) {
  const x = Math.floor(Math.max(0, zve));
  let s;
  if (x <= 12348) s = 0;
  else if (x <= 17799) { const y = (x - 12348) / 10000; s = (914.51 * y + 1400) * y; }
  else if (x <= 69878) { const z = (x - 17799) / 10000; s = (173.1 * z + 2397) * z + 1034.87; }
  else if (x <= 277825) s = 0.42 * x - 11135.63;
  else s = 0.45 * x - 19470.38;
  return Math.floor(s);
}
const est = (zve: number, zus: boolean) => (zus ? 2 * estGrund(zve / 2) : estGrund(zve));
function soli(e: number, zus: boolean) {
  const frei = zus ? 2 * T.soliFrei : T.soliFrei;
  return e <= frei ? 0 : Math.min(0.055 * e, 0.119 * (e - frei));
}
function steuerGesamt(zve: number, zus: boolean, kist: number) {
  const e = est(zve, zus);
  return e + soli(e, zus) + e * kist;
}
function zveAusBrutto(b: number) {
  if (!(b > 0)) return 0;
  const vorsorge = T.rv * Math.min(b, T.bbgRV) + (T.kv + T.pv) * Math.min(b, T.bbgKV);
  return Math.max(0, b - T.wkPausch - T.saPausch - vorsorge);
}
type Eingaben = { zve: number; zus: boolean; kist: number; preis: number; nkPct: number; gebPct: number; afaPct: number; miete: number; kosten: number; ek: number; zinsPct: number; tilgPct: number };
type Jahr = { j: number; miete: number; zins: number; tilg: number; afa: number; kosten: number; vuv: number; ersparnis: number; eigen: number; rest: number };

function rechne(p: Eingaben) {
  const invest = p.preis * (1 + p.nkPct / 100);
  const darlehen = Math.max(0, invest - p.ek);
  const afa = invest * (p.gebPct / 100) * (p.afaPct / 100);
  const rateMonat = (darlehen * (p.zinsPct + p.tilgPct)) / 100 / 12;
  const steuerOhne = steuerGesamt(p.zve, p.zus, p.kist);
  let rest = darlehen;
  const jahre: Jahr[] = [];
  for (let j = 1; j <= 10; j++) {
    let zins = 0, tilg = 0, rate = 0;
    for (let m = 0; m < 12 && rest > 0; m++) {
      const zm = (rest * p.zinsPct) / 100 / 12;
      const tm = Math.min(rateMonat - zm, rest);
      zins += zm; tilg += tm; rate += zm + tm; rest -= tm;
    }
    const miete = p.miete * 12, kosten = p.kosten * 12;
    const vuv = miete - zins - afa - kosten;
    const ersparnis = steuerOhne - steuerGesamt(Math.max(0, p.zve + vuv), p.zus, p.kist);
    jahre.push({ j, miete, zins, tilg, afa, kosten, vuv, ersparnis, eigen: rate + kosten - miete - ersparnis, rest });
  }
  const sum = (k: "ersparnis" | "tilg" | "eigen") => jahre.reduce((a, r) => a + r[k], 0);
  return { invest, darlehen, rateMonat, steuerOhne, jahre, j1: jahre[0],
    summe: { ersparnis: sum("ersparnis"), tilg: sum("tilg"), eigen: sum("eigen") } };
}

/* ---------- Hilfen ---------- */
const eur = (n: number) => Math.round(n).toLocaleString("de-DE") + " €";
const eurS = (n: number) => (n < 0 ? "−" : "") + Math.abs(Math.round(n)).toLocaleString("de-DE") + " €";
function num(v: string) {
  let s = String(v).trim().replace(/\s|€|%/g, "");
  if (!s) return 0;
  if (s.includes(",")) s = s.replace(/\./g, "").replace(",", ".");
  else if (/^\d{1,3}(\.\d{3})+$/.test(s)) s = s.replace(/\./g, "");
  const n = parseFloat(s);
  return isFinite(n) ? n : 0;
}

function Feld({ id, label, unit, value, onChange, hint }: { id: string; label: string; unit?: string; value: string; onChange: (v: string) => void; hint?: string }) {
  return (
    <div className="grid gap-1">
      <label htmlFor={id} className="text-sm font-medium text-zinc-900">{label}</label>
      <div className="flex items-center rounded-lg border border-zinc-200 bg-zinc-50 focus-within:border-emerald-600 focus-within:ring-2 focus-within:ring-emerald-100">
        <input id={id} inputMode="decimal" value={value} onChange={(e) => onChange(e.target.value)}
          className="w-full min-w-0 bg-transparent px-3 py-2 tabular-nums outline-none" />
        {unit && <span className="whitespace-nowrap px-3 text-sm text-zinc-500">{unit}</span>}
      </div>
      {hint && <p className="text-xs text-zinc-500">{hint}</p>}
    </div>
  );
}

function Balken({ teile, gesamt }: { teile: { n: string; v: number; c: string }[]; gesamt: number }) {
  return (
    <div className="flex h-7 overflow-hidden rounded-md bg-zinc-100">
      {teile.filter((t) => t.v > 0).map((t) => (
        <div key={t.n} title={`${t.n}: ${eur(t.v)}`} className={`${t.c} h-full transition-all`} style={{ width: `${(t.v / gesamt) * 100}%` }} />
      ))}
    </div>
  );
}

/* ---------- Komponente ---------- */
export default function SteuerRechner() {
  const [zus, setZus] = useState(false);
  const [zveBekannt, setZveBekannt] = useState(false);
  const [v, setV] = useState({
    brutto: "95.000", brutto2: "45.000", zve: "78.000", kist: "0",
    preis: "280.000", nk: "7", miete: "920", kosten: "60", afa: "2", geb: "75",
    ek: "0", zins: "3,8", tilg: "1,5",
  });
  type Feldname = keyof typeof v;
  const set = (k: Feldname) => (x: string) => setV((s) => ({ ...s, [k]: x }));

  const zve = zveBekannt ? num(v.zve) : zveAusBrutto(num(v.brutto)) + (zus ? zveAusBrutto(num(v.brutto2)) : 0);
  const r = useMemo(() => rechne({
    zve, zus, kist: parseFloat(v.kist), preis: num(v.preis), nkPct: num(v.nk),
    gebPct: Math.min(100, num(v.geb)), afaPct: parseFloat(v.afa), miete: num(v.miete),
    kosten: num(v.kosten), ek: num(v.ek), zinsPct: num(v.zins), tilgPct: num(v.tilg),
  }), [zve, zus, v]);

  const j1 = r.j1;
  const eigM = j1.eigen / 12;
  const m = { miete: j1.miete / 12, amt: Math.max(0, j1.ersparnis) / 12, sie: Math.max(0, eigM),
    zins: j1.zins / 12, tilg: j1.tilg / 12, kosten: j1.kosten / 12 + Math.max(0, -j1.ersparnis) / 12 };
  const gesamt = Math.max(m.miete + m.amt + m.sie, m.zins + m.tilg + m.kosten, 1);
  const last = r.jahre[r.jahre.length - 1];

  const box = "rounded-xl border border-zinc-200 bg-white p-5";
  const legend = "px-1 text-xs font-semibold uppercase tracking-wider text-zinc-500";

  return (
    <section id="rechner" className="bg-white py-24 lg:py-32 scroll-mt-24">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 sm:px-6">
        <div className="grid max-w-2xl gap-3">
          <span className="text-sm font-semibold uppercase tracking-wider text-emerald-600">Steuerersparnis-Rechner</span>
          <h2 className="text-3xl font-bold tracking-tight text-zinc-900 sm:text-4xl">Was kostet eine vermietete Wohnung Sie nach Steuern?</h2>
          <p className="text-zinc-600">Zinsen, Abschreibung und laufende Kosten einer vermieteten Wohnung mindern Ihr zu versteuerndes Einkommen. Rechnen Sie nach, wie viel Steuer das bei Ihrem Einkommen spart und was Sie monatlich tatsächlich selbst tragen.</p>
        </div>

        <div className="grid items-start gap-6 lg:grid-cols-[1fr_1.15fr]">
          <form className="grid gap-4" onSubmit={(e) => e.preventDefault()}>
            <fieldset className={`${box} grid gap-4`}>
              <legend className={legend}>Ihre Situation</legend>
              <div className="inline-flex w-fit overflow-hidden rounded-lg border border-zinc-200 text-sm">
                {([["Einzeln", false], ["Zusammen (verheiratet)", true]] as const).map(([l, val]) => (
                  <button key={l} type="button" aria-pressed={zus === val} onClick={() => setZus(val)}
                    className={`px-3 py-2 ${zus === val ? "bg-emerald-600 font-semibold text-white" : "bg-zinc-50 text-zinc-800"}`}>{l}</button>
                ))}
              </div>
              {!zveBekannt && (
                <div className="grid gap-3 sm:grid-cols-2">
                  <Feld id="brutto" label="Bruttojahresgehalt" unit="€" value={v.brutto} onChange={set("brutto")} />
                  {zus && <Feld id="brutto2" label="Bruttojahresgehalt Ehepartner" unit="€" value={v.brutto2} onChange={set("brutto2")} />}
                </div>
              )}
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={zveBekannt} onChange={(e) => setZveBekannt(e.target.checked)} className="h-4 w-4 accent-emerald-600" />
                Ich kenne mein zu versteuerndes Einkommen
              </label>
              {zveBekannt ? (
                <Feld id="zve" label="Zu versteuerndes Einkommen" unit="€ / Jahr" value={v.zve} onChange={set("zve")}
                  hint="Steht in Ihrem letzten Einkommensteuerbescheid. Bei Zusammenveranlagung der gemeinsame Betrag." />
              ) : (
                <p className="text-sm text-zinc-500">Geschätztes zu versteuerndes Einkommen: <b className="text-zinc-900 tabular-nums">{eur(zve)}</b></p>
              )}
              <div className="grid gap-1">
                <label htmlFor="kist" className="text-sm font-medium">Kirchensteuer</label>
                <select id="kist" value={v.kist} onChange={(e) => set("kist")(e.target.value)} className="rounded-lg border border-zinc-200 bg-zinc-50 px-2 py-2">
                  <option value="0">Keine</option>
                  <option value="0.08">8 % (Bayern, Baden-Württemberg)</option>
                  <option value="0.09">9 % (übrige Bundesländer)</option>
                </select>
              </div>
            </fieldset>

            <fieldset className={`${box} grid items-start gap-3 sm:grid-cols-2`}>
              <legend className={legend}>Die Wohnung</legend>
              <Feld id="preis" label="Kaufpreis" unit="€" value={v.preis} onChange={set("preis")} />
              <Feld id="nk" label="Kaufnebenkosten" unit="%" value={v.nk} onChange={set("nk")} hint="Grunderwerbsteuer, Notar, Grundbuch. Je nach Bundesland etwa 5 bis 9 %." />
              <Feld id="miete" label="Kaltmiete" unit="€ / Monat" value={v.miete} onChange={set("miete")} />
              <Feld id="kosten" label="Nicht umlagefähige Kosten" unit="€ / Monat" value={v.kosten} onChange={set("kosten")} hint="Hausverwaltung und Ähnliches, das nicht auf den Mieter umgelegt wird." />
              <div className="grid gap-1">
                <label htmlFor="afa" className="text-sm font-medium">Baujahr</label>
                <select id="afa" value={v.afa} onChange={(e) => set("afa")(e.target.value)} className="rounded-lg border border-zinc-200 bg-zinc-50 px-2 py-2">
                  <option value="2.5">vor 1925 (2,5 % AfA)</option>
                  <option value="2">1925 bis 2022 (2 % AfA)</option>
                  <option value="3">ab 2023 (3 % AfA)</option>
                </select>
              </div>
              <Feld id="geb" label="Gebäudeanteil" unit="%" value={v.geb} onChange={set("geb")} hint="Nur das Gebäude wird abgeschrieben, nicht der Grundstücksanteil." />
            </fieldset>

            <fieldset className={`${box} grid gap-3`}>
              <legend className={legend}>Finanzierung</legend>
              <div className="grid gap-3 sm:grid-cols-2">
                <Feld id="ek" label="Eigenkapital" unit="€" value={v.ek} onChange={set("ek")} />
                <Feld id="zins" label="Sollzins" unit="% p. a." value={v.zins} onChange={set("zins")} />
                <Feld id="tilg" label="Anfängliche Tilgung" unit="% p. a." value={v.tilg} onChange={set("tilg")} />
              </div>
              <p className="text-sm text-zinc-500">Darlehen: <b className="text-zinc-900">{eur(r.darlehen)}</b> · Monatsrate: <b className="text-zinc-900">{eur(r.rateMonat)}</b></p>
            </fieldset>
          </form>

          <div className="grid gap-4 lg:sticky lg:top-6" aria-live="polite">
            <div className={`${box} grid gap-4`}>
              <div>
                <p className="text-sm text-zinc-500">{j1.ersparnis >= 0 ? "Steuerersparnis im ersten Jahr" : "Mehrsteuer im ersten Jahr"}</p>
                <p className={`text-4xl font-bold tabular-nums tracking-tight ${j1.ersparnis >= 0 ? "text-emerald-700" : "text-orange-700"}`}>{eur(Math.abs(j1.ersparnis))}</p>
                <p className="text-sm text-zinc-500">{j1.ersparnis >= 0 ? `rund ${eur(j1.ersparnis / 12)} pro Monat weniger Steuern` : "Die Mieteinnahmen übersteigen Zinsen, Abschreibung und Kosten."}</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="border-t border-zinc-200 pt-3"><p className="text-xs text-zinc-500">{eigM >= 0 ? "Ihr Eigenanteil pro Monat" : "Überschuss pro Monat"}</p><p className="text-2xl font-semibold tabular-nums">{eur(Math.abs(eigM))}</p></div>
                <div className="border-t border-zinc-200 pt-3"><p className="text-xs text-zinc-500">Davon getilgt pro Monat</p><p className="text-2xl font-semibold tabular-nums">{eur(m.tilg)}</p></div>
              </div>
              <div className="grid gap-2">
                <h3 className="font-semibold">Wer die monatliche Belastung trägt</h3>
                <p className="text-sm text-zinc-500">{eigM > 0
                  ? `Von ${eur(m.zins + m.tilg + m.kosten)} monatlicher Belastung tragen Mieter und Finanzamt ${eur(m.miete + m.amt)}. Sie zahlen ${eur(eigM)} und tilgen damit ${eur(m.tilg)} Schulden.`
                  : `Miete und Steuerersparnis decken die monatliche Belastung vollständig. Dabei werden ${eur(m.tilg)} Schulden getilgt.`}</p>
                <p className="text-xs text-zinc-500">Woher das Geld kommt</p>
                <Balken gesamt={gesamt} teile={[{ n: "Mieter", v: m.miete, c: "bg-emerald-200" }, { n: "Finanzamt", v: m.amt, c: "bg-emerald-600" }, { n: "Sie", v: m.sie, c: "bg-zinc-800" }]} />
                <p className="text-xs text-zinc-500">Wohin es fließt</p>
                <Balken gesamt={gesamt} teile={[{ n: "Zinsen", v: m.zins, c: "bg-zinc-300" }, { n: "Tilgung", v: m.tilg, c: "bg-emerald-800" }, { n: "Kosten", v: m.kosten, c: "bg-amber-300" }]} />
                <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs tabular-nums">
                  {[["Mieter", m.miete, "bg-emerald-200"], ["Finanzamt", m.amt, "bg-emerald-600"], ["Sie", m.sie, "bg-zinc-800"], ["Zinsen", m.zins, "bg-zinc-300"], ["Tilgung", m.tilg, "bg-emerald-800"], ["Kosten", m.kosten, "bg-amber-300"]]
                    .filter((x) => (x[1] as number) > 0).map(([n, val, c]) => (
                      <span key={n} className="inline-flex items-center gap-1.5"><i className={`inline-block h-2.5 w-2.5 rounded-sm ${c}`} />{n} {eur(val as number)}</span>
                    ))}
                </div>
              </div>
            </div>

            <div className={`${box} grid grid-cols-2 gap-4`}>
              <h3 className="col-span-2 font-semibold">Nach 10 Jahren</h3>
              {[["Steuerersparnis gesamt", eurS(r.summe.ersparnis)],
                [r.summe.eigen >= 0 ? "Eigenanteil gesamt" : "Überschuss gesamt", eur(Math.abs(r.summe.eigen))],
                ["Darlehen getilgt", eur(r.summe.tilg)], ["Restschuld", eur(last.rest)]].map(([l, val]) => (
                <div key={l}><p className="text-xs text-zinc-500">{l}</p><p className="text-lg font-semibold tabular-nums">{val}</p></div>
              ))}
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-emerald-50 p-5">
              <p className="max-w-sm text-sm">Die Rechnung ersetzt keine Prüfung Ihres Einzelfalls. Im Erstgespräch rechnen wir mit Ihren Zahlen und einer konkreten Wohnung.</p>
              <Link to="/kontakt?ref=rechner" className="rounded-xl bg-zinc-900 px-5 py-3 font-semibold text-white hover:bg-zinc-800">Kostenloses Erstgespräch</Link>
            </div>
          </div>
        </div>

        <div className={`${box} overflow-x-auto`}>
          <h3 className="mb-3 font-semibold">Verlauf über 10 Jahre</h3>
          <table className="w-full text-right text-sm tabular-nums">
            <thead className="text-xs uppercase tracking-wide text-zinc-500">
              <tr>{["Jahr", "Zinsen", "Tilgung", "Vermietung", "Steuerersparnis", "Eigenanteil / Monat", "Restschuld"].map((h, i) => <th key={h} className={`whitespace-nowrap px-2 py-2 ${i === 0 ? "text-left" : ""}`}>{h}</th>)}</tr>
            </thead>
            <tbody>
              {r.jahre.map((x) => (
                <tr key={x.j} className="border-t border-zinc-200">
                  <td className="px-2 py-1.5 text-left">{x.j}</td><td className="px-2">{eur(x.zins)}</td><td className="px-2">{eur(x.tilg)}</td>
                  <td className="px-2">{eurS(x.vuv)}</td><td className="px-2">{eurS(x.ersparnis)}</td><td className="px-2">{eurS(x.eigen / 12)}</td><td className="px-2">{eur(x.rest)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="grid max-w-4xl gap-2 text-xs text-zinc-500">
          <p className="font-semibold text-zinc-700">Annahmen und Hinweise</p>
          <p>Einkommensteuertarif 2026 nach § 32a EStG mit Solidaritätszuschlag und optional Kirchensteuer, ohne Kinderfreibeträge und weitere Einkünfte. Das zu versteuernde Einkommen wird aus dem Brutto eines gesetzlich versicherten Angestellten geschätzt. Lineare Gebäudeabschreibung nach § 7 Abs. 4 EStG auf den Gebäudeanteil inklusive anteiliger Kaufnebenkosten. Miete, Kosten, Einkommen und Steuerrecht bleiben über 10 Jahre unverändert; Leerstand, Instandhaltung, Zinsänderungen nach der Zinsbindung und eine Wertentwicklung sind nicht eingerechnet. Annuitätendarlehen über Kaufpreis plus Nebenkosten abzüglich Eigenkapital.</p>
          <p>Vereinfachte Beispielrechnung ohne Gewähr. Sie ersetzt keine steuerliche Beratung; die steuerliche Wirkung im Einzelfall klärt Ihr Steuerberater. Kapitalanlagen in Immobilien sind langfristig ausgerichtet. Wertentwicklungen aus der Vergangenheit sind kein verlässlicher Indikator für künftige Erträge.</p>
        </div>
      </div>
    </section>
  );
}

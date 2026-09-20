import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState, type FormEvent, type ReactNode } from "react";
import { Activity, Droplets, HeartPulse, Plus, ShieldCheck, Stethoscope } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { PageHeading } from "@/components/app-frame";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { addMeasurement } from "@/lib/heartguard.functions";
import { useApiMutation, useDashboard } from "@/lib/use-dashboard";
import { buildVerdict, levelStyles } from "@/lib/health";

export const Route = createFileRoute("/_authenticated/resultats")({
  head: () => ({
    meta: [
      { title: "Mes résultats — HeartGuard" },
      { name: "description", content: "Saisissez votre tension, votre cholestérol et votre glycémie et recevez un avis médical calculé." },
      { property: "og:title", content: "Mes résultats — HeartGuard" },
      { property: "og:description", content: "Analyse automatique de vos valeurs cardiovasculaires." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ResultsPage,
});

const empty = { systolic: "", diastolic: "", cholesterol: "", glucose: "", heartRate: "" };

function ResultsPage() {
  const { data, isLoading } = useDashboard();
  const mutation = useApiMutation(addMeasurement);
  const [form, setForm] = useState(empty);
  const [error, setError] = useState("");

  const measurements = data?.measurements ?? [];
  const latest = measurements[0];

  const verdict = useMemo(
    () =>
      latest
        ? buildVerdict({
            systolic: latest.systolic,
            diastolic: latest.diastolic,
            cholesterol: Number(latest.cholesterol),
            glucose: Number(latest.glucose),
            heartRate: latest.heart_rate,
          })
        : null,
    [latest],
  );

  const history = useMemo(
    () =>
      [...measurements]
        .reverse()
        .map((m) => ({
          date: new Date(m.measured_at).toLocaleDateString("fr-FR", { day: "2-digit", month: "short" }),
          systolique: m.systolic,
          diastolique: m.diastolic,
          glycemie: Number(m.glucose),
          cholesterol: Number(m.cholesterol),
        })),
    [measurements],
  );

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    mutation.mutate(form, {
      onSuccess: () => setForm(empty),
      onError: (err) => setError(err instanceof Error ? err.message : "Enregistrement impossible"),
    });
  }

  return (
    <section className="screen-enter">
      <PageHeading
        eyebrow="Analyse de vos mesures"
        title={`Bonjour, ${data?.profile?.full_name?.split(" ")[0] || "vous"}`}
        description="Entrez vos valeurs réelles : HeartGuard les compare aux seuils de référence et affiche un avis médical."
      />

      <form onSubmit={submit} className="mt-7 grid gap-4 rounded-xl border bg-card p-5 shadow-soft sm:p-7">
        <h2 className="font-display text-lg font-bold">Nouvelle mesure</h2>
        <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-5">
          <NumberField label="Tension haute (mmHg)" value={form.systolic} onChange={(v) => setForm({ ...form, systolic: v })} placeholder="120" required />
          <NumberField label="Tension basse (mmHg)" value={form.diastolic} onChange={(v) => setForm({ ...form, diastolic: v })} placeholder="80" required />
          <NumberField label="Cholestérol (g/L)" value={form.cholesterol} onChange={(v) => setForm({ ...form, cholesterol: v })} placeholder="1.85" step="0.01" required />
          <NumberField label="Glycémie à jeun (g/L)" value={form.glucose} onChange={(v) => setForm({ ...form, glucose: v })} placeholder="0.95" step="0.01" required />
          <NumberField label="Pouls (bpm)" value={form.heartRate} onChange={(v) => setForm({ ...form, heartRate: v })} placeholder="72" />
        </div>
        {error && <p className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">{error}</p>}
        <Button variant="heart" size="lg" disabled={mutation.isPending} className="h-13 rounded-xl sm:w-fit sm:px-8">
          <Plus /> {mutation.isPending ? "Analyse…" : "Analyser mes valeurs"}
        </Button>
      </form>

      {isLoading && <p className="mt-6 text-sm text-muted-foreground">Chargement de vos données…</p>}

      {!isLoading && !verdict && (
        <p className="mt-6 rounded-xl border bg-card p-6 text-sm text-muted-foreground">
          Aucune mesure enregistrée pour l’instant. Saisissez vos premières valeurs ci-dessus.
        </p>
      )}

      {verdict && latest && (
        <>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {verdict.assessments.map((item) => (
              <article key={item.label} className="rounded-xl border bg-card p-5 shadow-float">
                <div className="flex items-center justify-between">
                  <span className="text-primary [&_svg]:size-5">{iconFor(item.label)}</span>
                  <span className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${levelStyles[item.level].badge}`}>
                    {item.status}
                  </span>
                </div>
                <p className="mt-6 text-xs font-semibold text-muted-foreground">{item.label}</p>
                <p className="mt-1 font-display text-2xl font-bold">
                  {item.value} <span className="font-sans text-xs font-medium text-muted-foreground">{item.unit}</span>
                </p>
              </article>
            ))}
          </div>

          <div
            className={`mt-5 rounded-xl border-l-4 bg-card p-5 shadow-float ${
              verdict.level === "eleve"
                ? "border-l-destructive"
                : verdict.level === "surveiller"
                  ? "border-l-[color:var(--warning)]"
                  : "border-l-primary"
            }`}
          >
            <div className="flex items-start gap-4">
              <span className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-secondary text-primary">
                <Stethoscope />
              </span>
              <div>
                <div className="flex flex-wrap items-center gap-3">
                  <h3 className="font-display text-lg font-bold">{verdict.title}</h3>
                  <span className="rounded-full bg-secondary px-3 py-1 text-xs font-bold text-secondary-foreground">
                    Score global {verdict.globalScore}/100
                  </span>
                </div>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{verdict.summary}</p>
                <ul className="mt-3 space-y-2 text-sm leading-6">
                  {verdict.actions.map((action) => (
                    <li key={action} className="flex gap-2">
                      <span className="mt-2 size-1.5 shrink-0 rounded-full bg-primary" />
                      {action}
                    </li>
                  ))}
                </ul>
                <p className="mt-3 text-xs text-muted-foreground">
                  Avis calculé à partir des seuils de référence. En cas d’urgence, appelez le 119.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-5 grid gap-5 lg:grid-cols-2">
            <ChartPanel title="Vos valeurs face aux cibles" subtitle="100 = valeur idéale">
              <ResponsiveContainer width="100%" height={250}>
                <BarChart
                  data={verdict.assessments.map((a) => ({ name: shortName(a.label), value: a.score, color: levelStyles[a.level].color }))}
                  margin={{ top: 12, right: 5, left: -28, bottom: 0 }}
                >
                  <CartesianGrid vertical={false} stroke="var(--border)" strokeDasharray="4 4" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: "var(--muted-foreground)", fontSize: 12 }} />
                  <YAxis domain={[0, 100]} axisLine={false} tickLine={false} tick={{ fill: "var(--muted-foreground)", fontSize: 11 }} />
                  <Tooltip cursor={{ fill: "var(--muted)" }} contentStyle={{ borderRadius: 8, borderColor: "var(--border)" }} />
                  <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                    {verdict.assessments.map((a) => (
                      <Cell key={a.label} fill={levelStyles[a.level].color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </ChartPanel>

            <ChartPanel title="Évolution de votre tension" subtitle="Historique de vos mesures">
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={history} margin={{ top: 12, right: 10, left: -28, bottom: 0 }}>
                  <CartesianGrid vertical={false} stroke="var(--border)" strokeDasharray="4 4" />
                  <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: "var(--muted-foreground)", fontSize: 12 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: "var(--muted-foreground)", fontSize: 11 }} />
                  <Tooltip contentStyle={{ borderRadius: 8, borderColor: "var(--border)" }} />
                  <Line type="monotone" dataKey="systolique" stroke="var(--chart-1)" strokeWidth={3} dot={{ r: 3 }} />
                  <Line type="monotone" dataKey="diastolique" stroke="var(--chart-2)" strokeWidth={3} dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            </ChartPanel>
          </div>

          <p className="mt-4 text-xs text-muted-foreground">
            Dernière mesure du {new Date(latest.measured_at).toLocaleString("fr-FR")}.
          </p>
        </>
      )}
    </section>
  );
}

function shortName(label: string) {
  if (label.startsWith("Tension")) return "Tension";
  if (label.startsWith("Cholestérol")) return "Chol.";
  if (label.startsWith("Glycémie")) return "Glycémie";
  return "Pouls";
}

function iconFor(label: string) {
  if (label.startsWith("Tension")) return <Activity />;
  if (label.startsWith("Cholestérol")) return <ShieldCheck />;
  if (label.startsWith("Glycémie")) return <Droplets />;
  return <HeartPulse />;
}

function NumberField({
  label,
  value,
  onChange,
  placeholder,
  step,
  required,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  step?: string;
  required?: boolean;
}) {
  return (
    <div className="space-y-2">
      <Label className="text-xs font-semibold">{label}</Label>
      <Input
        type="number"
        inputMode="decimal"
        step={step ?? "1"}
        min="0"
        required={required}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="h-12 bg-background"
      />
    </div>
  );
}

function ChartPanel({ title, subtitle, children }: { title: string; subtitle: string; children: ReactNode }) {
  return (
    <article className="rounded-xl border bg-card p-5 shadow-float">
      <h3 className="font-display text-lg font-bold">{title}</h3>
      <p className="mt-1 text-xs text-muted-foreground">{subtitle}</p>
      <div className="mt-4">{children}</div>
    </article>
  );
}

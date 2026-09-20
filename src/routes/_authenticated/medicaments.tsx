import { createFileRoute } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { BellRing, Check, Clock3, Pill, Plus, Trash2 } from "lucide-react";

import { PageHeading } from "@/components/app-frame";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { addMedication, deleteMedication, toggleDose } from "@/lib/heartguard.functions";
import { useApiMutation, useDashboard } from "@/lib/use-dashboard";

export const Route = createFileRoute("/_authenticated/medicaments")({
  head: () => ({
    meta: [
      { title: "Mes médicaments — HeartGuard" },
      { name: "description", content: "Gérez vos rappels de prise de médicaments et cochez chaque dose prise." },
      { property: "og:title", content: "Mes médicaments — HeartGuard" },
      { property: "og:description", content: "Rappels de traitement et suivi des prises quotidiennes." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: MedicationsPage,
});

const defaultTimes = ["08:00", "13:00", "20:00"];

function MedicationsPage() {
  const { data } = useDashboard();
  const add = useApiMutation(addMedication);
  const remove = useApiMutation(deleteMedication);
  const toggle = useApiMutation(toggleDose);

  const [form, setForm] = useState({ name: "", dosage: "", notes: "" });
  const [times, setTimes] = useState<string[]>(["08:00"]);
  const [error, setError] = useState("");

  const medications = data?.medications ?? [];
  const logs = data?.logs ?? [];
  const taken = (medicationId: string, time: string) =>
    logs.some((log) => log.medication_id === medicationId && log.scheduled_time === time);

  const totalDoses = medications.reduce((count, m) => count + m.times.length, 0);
  const doneDoses = medications.reduce(
    (count, m) => count + m.times.filter((t) => taken(m.id, t)).length,
    0,
  );

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    add.mutate(
      { ...form, times },
      {
        onSuccess: () => {
          setForm({ name: "", dosage: "", notes: "" });
          setTimes(["08:00"]);
        },
        onError: (err) => setError(err instanceof Error ? err.message : "Ajout impossible"),
      },
    );
  }

  return (
    <section className="screen-enter">
      <PageHeading
        eyebrow="Traitement"
        title="Rappels de médicaments"
        description="Enregistrez vos médicaments et leurs heures de prise, puis cochez chaque dose prise dans la journée."
      />

      <div className="mt-7 flex items-center gap-4 rounded-xl bg-primary p-5 text-primary-foreground shadow-soft">
        <BellRing className="size-7" />
        <div>
          <p className="font-display text-xl font-bold">
            {doneDoses}/{totalDoses || 0} prises validées aujourd’hui
          </p>
          <p className="text-sm text-primary-foreground/75">
            {totalDoses === 0
              ? "Ajoutez un premier médicament pour activer les rappels."
              : doneDoses === totalDoses
                ? "Bravo, tout votre traitement du jour est pris."
                : "Pensez à cocher chaque prise pour ne rien oublier."}
          </p>
        </div>
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_.8fr]">
        <div className="space-y-4">
          {medications.length === 0 && (
            <p className="rounded-xl border bg-card p-6 text-sm text-muted-foreground">
              Aucun médicament enregistré pour le moment.
            </p>
          )}
          {medications.map((medication) => (
            <article key={medication.id} className="rounded-xl border bg-card p-5 shadow-float">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <span className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-secondary text-primary">
                    <Pill />
                  </span>
                  <div>
                    <h3 className="font-display text-lg font-bold">{medication.name}</h3>
                    <p className="text-sm text-muted-foreground">{medication.dosage || "Dosage non précisé"}</p>
                    {medication.notes && <p className="mt-1 text-xs text-muted-foreground">{medication.notes}</p>}
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label={`Supprimer ${medication.name}`}
                  onClick={() => remove.mutate({ id: medication.id })}
                >
                  <Trash2 className="text-destructive" />
                </Button>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                {medication.times.map((time) => {
                  const done = taken(medication.id, time);
                  return (
                    <Button
                      key={time}
                      type="button"
                      variant={done ? "heart" : "outline"}
                      className="h-11 gap-2"
                      onClick={() => toggle.mutate({ medicationId: medication.id, time, taken: !done })}
                    >
                      {done ? <Check className="size-4" /> : <Clock3 className="size-4" />}
                      {time}
                    </Button>
                  );
                })}
              </div>
            </article>
          ))}
        </div>

        <form onSubmit={submit} className="h-fit space-y-4 rounded-xl border bg-card p-5 shadow-soft sm:p-6">
          <h2 className="font-display text-lg font-bold">Ajouter un médicament</h2>
          <div className="space-y-2">
            <Label className="text-xs font-semibold">Nom</Label>
            <Input
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Ex. Amlodipine"
              className="h-12 bg-background"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-xs font-semibold">Dosage</Label>
            <Input
              value={form.dosage}
              onChange={(e) => setForm({ ...form, dosage: e.target.value })}
              placeholder="Ex. 5 mg, 1 comprimé"
              className="h-12 bg-background"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-xs font-semibold">Heures de rappel</Label>
            <div className="flex flex-wrap gap-2">
              {defaultTimes.map((time) => (
                <Button
                  key={time}
                  type="button"
                  variant={times.includes(time) ? "heart" : "outline"}
                  className="h-10"
                  onClick={() =>
                    setTimes((current) =>
                      current.includes(time) ? current.filter((t) => t !== time) : [...current, time].sort(),
                    )
                  }
                >
                  {time}
                </Button>
              ))}
            </div>
            <Input
              type="time"
              aria-label="Autre heure de rappel"
              className="h-12 bg-background"
              onChange={(e) => {
                const value = e.target.value;
                if (value) setTimes((current) => Array.from(new Set([...current, value])).sort());
              }}
            />
            <p className="text-xs text-muted-foreground">Heures sélectionnées : {times.join(", ") || "aucune"}</p>
          </div>
          <div className="space-y-2">
            <Label className="text-xs font-semibold">Remarque</Label>
            <Textarea
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              placeholder="Ex. à prendre après le repas"
              className="min-h-20 resize-none bg-background"
            />
          </div>
          {error && <p className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">{error}</p>}
          <Button variant="heart" size="lg" disabled={add.isPending} className="h-13 w-full rounded-xl">
            <Plus /> {add.isPending ? "Ajout…" : "Ajouter le rappel"}
          </Button>
        </form>
      </div>
    </section>
  );
}

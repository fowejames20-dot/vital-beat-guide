import { createFileRoute } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { CalendarDays, Check, Clock3, Stethoscope, Trash2, Video } from "lucide-react";

import { PageHeading } from "@/components/app-frame";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { bookAppointment, cancelAppointment } from "@/lib/heartguard.functions";
import { useApiMutation, useDashboard } from "@/lib/use-dashboard";

export const Route = createFileRoute("/_authenticated/rendez-vous")({
  head: () => ({
    meta: [
      { title: "Mes rendez-vous — HeartGuard" },
      { name: "description", content: "Réservez et personnalisez votre consultation cardiaque : praticien, motif et remarques." },
      { property: "og:title", content: "Mes rendez-vous — HeartGuard" },
      { property: "og:description", content: "Prise de rendez-vous personnalisée avec votre praticien." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AppointmentPage,
});

const times = ["08:30", "09:00", "10:00", "11:30", "13:00", "14:30", "16:00"];
const doctors = ["Dr Jane Mbarga — Cardiologie", "Dr Paul Ndjock — Médecine générale", "Dr Aïcha Fotso — Nutrition"];

function AppointmentPage() {
  const { data } = useDashboard();
  const book = useApiMutation(bookAppointment);
  const cancel = useApiMutation(cancelAppointment);
  const [form, setForm] = useState({
    date: new Date(Date.now() + 86400000).toISOString().slice(0, 10),
    time: "10:00",
    doctor: doctors[0]!,
    reason: "Consultation générale",
    notes: "",
    mode: "cabinet",
  });
  const [error, setError] = useState("");

  const appointments = data?.appointments ?? [];

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    book.mutate(form, {
      onError: (err) => setError(err instanceof Error ? err.message : "Réservation impossible"),
    });
  }

  return (
    <section className="screen-enter">
      <PageHeading
        eyebrow="Consultation"
        title="Prendre rendez-vous"
        description="Choisissez la date, l’heure, le praticien et personnalisez le motif de votre consultation."
      />

      <div className="mt-7 grid gap-5 lg:grid-cols-[1fr_.75fr]">
        <form onSubmit={submit} className="space-y-5 rounded-xl border bg-card p-5 shadow-soft sm:p-7">
          <div className="grid gap-5 sm:grid-cols-2">
            <div className="space-y-2">
              <Label className="text-xs font-semibold">Date</Label>
              <Input
                type="date"
                required
                min={new Date().toISOString().slice(0, 10)}
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
                className="h-12 bg-background"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-semibold">Praticien</Label>
              <select
                value={form.doctor}
                onChange={(e) => setForm({ ...form, doctor: e.target.value })}
                className="h-12 w-full rounded-md border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
              >
                {doctors.map((doctor) => (
                  <option key={doctor}>{doctor}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="flex items-center gap-2 text-xs font-semibold">
              <Clock3 className="size-4 text-primary" /> Heure
            </Label>
            <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
              {times.map((time) => (
                <Button
                  key={time}
                  type="button"
                  variant={form.time === time ? "heart" : "outline"}
                  className="h-11"
                  onClick={() => setForm({ ...form, time })}
                >
                  {time}
                </Button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-semibold">Type de consultation</Label>
            <div className="flex gap-3">
              {[
                { id: "cabinet", label: "Au cabinet", icon: <Stethoscope className="size-4" /> },
                { id: "video", label: "En vidéo", icon: <Video className="size-4" /> },
              ].map((option) => (
                <Button
                  key={option.id}
                  type="button"
                  variant={form.mode === option.id ? "heart" : "outline"}
                  className="h-11 gap-2"
                  onClick={() => setForm({ ...form, mode: option.id })}
                >
                  {option.icon}
                  {option.label}
                </Button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-semibold">Motif</Label>
            <Input
              value={form.reason}
              onChange={(e) => setForm({ ...form, reason: e.target.value })}
              placeholder="Ex. contrôle de la tension"
              className="h-12 bg-background"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-semibold">Personnaliser mon rendez-vous</Label>
            <Textarea
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              placeholder="Symptômes, traitements en cours, préférence de langue, besoin d’accompagnement…"
              className="min-h-28 resize-none bg-background"
            />
          </div>

          {error && <p className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">{error}</p>}

          <Button variant="heart" size="lg" disabled={book.isPending} className="h-13 w-full rounded-xl">
            <Check /> {book.isPending ? "Réservation…" : "Confirmer le rendez-vous"}
          </Button>
        </form>

        <aside className="space-y-4">
          <h2 className="font-display text-lg font-bold">Mes rendez-vous</h2>
          {appointments.length === 0 && (
            <p className="rounded-xl border bg-card p-5 text-sm text-muted-foreground">Aucun rendez-vous prévu.</p>
          )}
          {appointments.map((appointment) => (
            <article key={appointment.id} className="rounded-xl bg-primary p-5 text-primary-foreground shadow-soft">
              <div className="flex items-start justify-between gap-3">
                <span className="flex size-11 items-center justify-center rounded-lg bg-primary-foreground/15">
                  <CalendarDays />
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Annuler le rendez-vous"
                  className="text-primary-foreground hover:bg-primary-foreground/15"
                  onClick={() => cancel.mutate({ id: appointment.id })}
                >
                  <Trash2 />
                </Button>
              </div>
              <h3 className="mt-4 font-display text-xl font-bold">
                {new Date(`${appointment.scheduled_date}T00:00:00`).toLocaleDateString("fr-FR", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </h3>
              <p className="mt-1 flex items-center gap-2 text-sm">
                <Clock3 className="size-4" /> {appointment.scheduled_time} ·{" "}
                {appointment.mode === "video" ? "Vidéo" : "Cabinet"}
              </p>
              <p className="mt-3 text-sm text-primary-foreground/80">{appointment.doctor}</p>
              <p className="text-sm text-primary-foreground/80">{appointment.reason}</p>
              {appointment.notes && (
                <p className="mt-3 rounded-lg bg-primary-foreground/15 p-3 text-sm">{appointment.notes}</p>
              )}
            </article>
          ))}
        </aside>
      </div>
    </section>
  );
}

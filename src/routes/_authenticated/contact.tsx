import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { CalendarDays, Clock3, MessageCircle, Phone } from "lucide-react";

import { PageHeading } from "@/components/app-frame";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useDashboard } from "@/lib/use-dashboard";

export const Route = createFileRoute("/_authenticated/contact")({
  head: () => ({
    meta: [
      { title: "Contact — HeartGuard" },
      { name: "description", content: "Posez une question à l'équipe médicale HeartGuard et retrouvez votre prochain rendez-vous." },
      { property: "og:title", content: "Contact — HeartGuard" },
      { property: "og:description", content: "L'équipe HeartGuard répond à vos questions santé." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ContactPage,
});

function ContactPage() {
  const { data } = useDashboard();
  const [sent, setSent] = useState(false);
  const next = data?.appointments?.[0];

  return (
    <section className="screen-enter">
      <PageHeading
        eyebrow="Nous sommes à votre écoute"
        title="Contactez-nous"
        description="Posez une question à l’équipe médicale ou consultez votre prochain rendez-vous."
      />

      <div className="mt-7 grid gap-5 lg:grid-cols-[.72fr_1fr]">
        <aside className="rounded-xl bg-primary p-6 text-primary-foreground shadow-soft">
          <span className="flex size-12 items-center justify-center rounded-lg bg-primary-foreground/15">
            <CalendarDays />
          </span>
          <p className="mt-6 text-xs font-semibold uppercase text-primary-foreground/65">Prochain rendez-vous</p>
          {next ? (
            <>
              <h2 className="mt-2 font-display text-2xl font-bold">
                {new Date(`${next.scheduled_date}T00:00:00`).toLocaleDateString("fr-FR", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </h2>
              <p className="mt-2 flex items-center gap-2 text-sm">
                <Clock3 className="size-4" /> {next.scheduled_time} · {next.doctor}
              </p>
            </>
          ) : (
            <p className="mt-2 text-sm text-primary-foreground/80">Aucun rendez-vous prévu pour le moment.</p>
          )}
          <div className="mt-7 border-t border-primary-foreground/20 pt-5">
            <a href="tel:119" className="flex items-center gap-3 text-sm font-semibold">
              <Phone className="size-4" /> Urgences Cameroun : 119
            </a>
          </div>
        </aside>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            setSent(true);
          }}
          className="space-y-4 rounded-xl border bg-card p-5 shadow-soft sm:p-7"
        >
          <div className="space-y-2">
            <Label className="font-semibold">Votre adresse e-mail</Label>
            <Input type="email" required defaultValue={data?.email} className="h-12 bg-background" />
          </div>
          <div className="space-y-2">
            <Label className="font-semibold">Votre question</Label>
            <Textarea required placeholder="Comment pouvons-nous vous aider ?" className="min-h-36 resize-none bg-background" />
          </div>
          <Button variant="heart" size="lg" className="h-13 w-full rounded-xl">
            <MessageCircle /> Envoyer le message
          </Button>
          {sent && (
            <p className="rounded-lg bg-secondary p-4 text-sm font-semibold text-secondary-foreground screen-enter">
              Merci, votre message a bien été transmis à l’équipe HeartGuard.
            </p>
          )}
        </form>
      </div>
    </section>
  );
}

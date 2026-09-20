import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent, type ReactNode } from "react";
import { ArrowRight, Info, Mail, UserRound } from "lucide-react";

import { PageHeading } from "@/components/app-frame";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { saveProfile } from "@/lib/heartguard.functions";
import { useApiMutation, useDashboard } from "@/lib/use-dashboard";

export const Route = createFileRoute("/_authenticated/profil")({
  head: () => ({
    meta: [
      { title: "Mon profil — HeartGuard" },
      { name: "description", content: "Renseignez votre nom, âge, sexe et antécédents cardiaques dans HeartGuard." },
      { property: "og:title", content: "Mon profil — HeartGuard" },
      { property: "og:description", content: "Votre dossier santé personnel HeartGuard." },
      { property: "og:type", content: "profile" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ProfilePage,
});

function ProfilePage() {
  const { data, isLoading } = useDashboard();
  const mutation = useApiMutation(saveProfile);
  const [form, setForm] = useState({ full_name: "", age: "", sex: "Femme", condition: "" });
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!data?.profile) return;
    setForm({
      full_name: data.profile.full_name ?? "",
      age: data.profile.age ? String(data.profile.age) : "",
      sex: data.profile.sex || "Femme",
      condition: data.profile.condition ?? "",
    });
  }, [data?.profile]);

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    mutation.mutate(form, { onSuccess: () => setSaved(true) });
  }

  return (
    <section className="screen-enter">
      <PageHeading
        eyebrow="Votre dossier"
        title="Informations personnelles"
        description="Ces informations nous aident à personnaliser la lecture de vos résultats."
      />

      <div className="mt-7 flex items-center gap-4 rounded-xl border bg-card p-5 shadow-float">
        <span className="flex size-16 items-center justify-center rounded-full bg-secondary text-primary">
          <UserRound className="size-8" />
        </span>
        <div>
          <p className="font-display text-xl font-bold">{form.full_name || "Votre nom"}</p>
          <p className="flex items-center gap-2 text-sm text-muted-foreground">
            <Mail className="size-4" /> {data?.email ?? "…"}
          </p>
        </div>
      </div>

      <form onSubmit={submit} className="mt-5 grid gap-5 rounded-xl border bg-card p-5 shadow-soft sm:p-7">
        <ProfileField label="Nom complet">
          <Input
            value={form.full_name}
            onChange={(e) => setForm({ ...form, full_name: e.target.value })}
            required
            className="h-12 bg-background"
          />
        </ProfileField>
        <div className="grid gap-5 sm:grid-cols-2">
          <ProfileField label="Âge">
            <Input
              type="number"
              min="1"
              max="120"
              value={form.age}
              onChange={(e) => setForm({ ...form, age: e.target.value })}
              required
              className="h-12 bg-background"
            />
          </ProfileField>
          <ProfileField label="Sexe">
            <select
              value={form.sex}
              onChange={(e) => setForm({ ...form, sex: e.target.value })}
              className="h-12 w-full rounded-md border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
            >
              <option>Femme</option>
              <option>Homme</option>
              <option>Autre</option>
              <option>Préfère ne pas préciser</option>
            </select>
          </ProfileField>
        </div>
        <ProfileField label="Problèmes cardiaques ou symptômes">
          <Textarea
            value={form.condition}
            onChange={(e) => setForm({ ...form, condition: e.target.value })}
            placeholder="Ex. hypertension, palpitations, douleur thoracique..."
            className="min-h-28 resize-none bg-background"
          />
        </ProfileField>
        <div className="rounded-lg bg-secondary p-4 text-sm text-secondary-foreground">
          <p className="flex gap-2 font-semibold">
            <Info className="mt-0.5 size-4 shrink-0" /> HeartGuard ne remplace pas un diagnostic médical professionnel.
          </p>
        </div>
        <Button variant="heart" size="lg" disabled={isLoading || mutation.isPending} className="h-13 rounded-xl">
          {mutation.isPending ? "Enregistrement…" : "Enregistrer mon profil"} <ArrowRight />
        </Button>
        {saved && !mutation.isPending && (
          <p className="rounded-lg bg-secondary p-4 text-sm font-semibold text-secondary-foreground screen-enter">
            Profil enregistré.
          </p>
        )}
      </form>
    </section>
  );
}

function ProfileField({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="space-y-2">
      <Label className="font-semibold">{label}</Label>
      {children}
    </div>
  );
}

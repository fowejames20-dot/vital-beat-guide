import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent, type ReactNode } from "react";
import { ArrowLeft, ArrowRight, Eye, EyeOff, LockKeyhole, Mail, UserRound } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BrandMark } from "@/components/app-frame";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Connexion — HeartGuard" },
      { name: "description", content: "Connectez-vous à votre espace HeartGuard pour retrouver votre profil et vos résultats." },
      { property: "og:title", content: "Connexion — HeartGuard" },
      { property: "og:description", content: "Votre espace santé cardiaque personnel et sécurisé." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ name: "", email: "", password: "" });

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      if (mode === "signup") {
        const { error: signUpError } = await supabase.auth.signUp({
          email: form.email,
          password: form.password,
          options: {
            emailRedirectTo: window.location.origin,
            data: { full_name: form.name },
          },
        });
        if (signUpError) throw signUpError;
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email: form.email,
          password: form.password,
        });
        if (signInError) throw signInError;
      } else {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email: form.email,
          password: form.password,
        });
        if (signInError) throw signInError;
      }
      navigate({ to: "/profil", replace: true });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Connexion impossible";
      setError(
        message.includes("Invalid login")
          ? "E-mail ou mot de passe incorrect."
          : message.includes("already registered")
            ? "Ce compte existe déjà, connectez-vous."
            : message.includes("at least")
              ? "Le mot de passe doit contenir au moins 6 caractères."
              : message,
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-[100svh] bg-surface px-5 py-6">
      <div className="mx-auto max-w-md screen-enter">
        <div className="flex items-center justify-between">
          <Button variant="ghost" size="icon" aria-label="Retour" onClick={() => navigate({ to: "/" })}>
            <ArrowLeft />
          </Button>
          <BrandMark dark />
          <span className="size-9" />
        </div>

        <div className="mt-8 overflow-hidden rounded-xl border bg-card shadow-soft">
          <div className="bg-secondary px-6 py-7 text-center">
            <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-card text-primary shadow-float">
              {mode === "signup" ? <UserRound className="size-7" /> : <LockKeyhole className="size-7" />}
            </div>
            <h1 className="mt-4 font-display text-2xl font-bold">
              {mode === "signup" ? "Créer votre espace" : "Connexion à votre profil"}
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Chaque utilisateur retrouve ses propres données, protégées par mot de passe.
            </p>
          </div>

          <form key={mode} onSubmit={submit} className="space-y-4 p-6 screen-enter">
            {mode === "signup" && (
              <Field label="Nom complet" icon={<UserRound />}>
                <Input
                  required
                  autoComplete="name"
                  placeholder="Nom complet"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="h-full border-0 bg-transparent px-0 shadow-none focus-visible:ring-0"
                />
              </Field>
            )}
            <Field label="Adresse e-mail" icon={<Mail />}>
              <Input
                required
                type="email"
                autoComplete="email"
                placeholder="vous@exemple.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="h-full border-0 bg-transparent px-0 shadow-none focus-visible:ring-0"
              />
            </Field>
            <Field label="Mot de passe" icon={<LockKeyhole />}>
              <Input
                required
                minLength={6}
                type={showPassword ? "text" : "password"}
                autoComplete={mode === "signup" ? "new-password" : "current-password"}
                placeholder="Mot de passe"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="h-full border-0 bg-transparent px-0 shadow-none focus-visible:ring-0"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                className="cursor-pointer rounded-md p-1 text-muted-foreground transition-colors hover:text-primary"
              >
                {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </Field>
            {showPassword && form.password && (
              <p className="rounded-lg bg-secondary px-3 py-2 text-xs font-semibold text-secondary-foreground">
                Mot de passe saisi : {form.password}
              </p>
            )}

            {error && (
              <p className="rounded-lg bg-destructive/10 p-3 text-sm font-medium text-destructive">{error}</p>
            )}

            <Button variant="heart" size="lg" disabled={loading} className="h-13 w-full rounded-xl">
              {loading ? "Patientez…" : mode === "signup" ? "S’inscrire" : "Se connecter"} <ArrowRight />
            </Button>

            <p className="text-center text-sm text-muted-foreground">
              {mode === "signup" ? "Vous avez déjà un compte ?" : "Vous n’avez pas de compte ?"}{" "}
              <Button
                type="button"
                variant="link"
                className="h-auto p-0 font-bold"
                onClick={() => {
                  setMode(mode === "signup" ? "signin" : "signup");
                  setError("");
                }}
              >
                {mode === "signup" ? "Se connecter" : "S’inscrire"}
              </Button>
            </p>
          </form>
        </div>
      </div>
    </main>
  );
}

function Field({ label, icon, children }: { label: string; icon: ReactNode; children: ReactNode }) {
  return (
    <label className="form-field flex h-14 items-center gap-3 rounded-lg border bg-background px-4 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/15">
      <span className="text-primary [&_svg]:size-4">{icon}</span>
      <span className="sr-only">{label}</span>
      {children}
    </label>
  );
}

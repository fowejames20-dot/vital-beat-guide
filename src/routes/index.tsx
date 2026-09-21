import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, ArrowRight, ShieldCheck } from "lucide-react";

import heroHeart from "@/assets/heartguard-hero.jpg";
import doctorsAsset from "@/assets/general-practice-illustration.png.asset.json";
import { Button } from "@/components/ui/button";
import { BrandMark } from "@/components/app-frame";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "HeartGuard — Suivi de votre santé cardiaque" },
      {
        name: "description",
        content:
          "HeartGuard analyse votre tension, votre cholestérol et votre glycémie, gère vos rappels de médicaments et vos rendez-vous.",
      },
      { property: "og:title", content: "HeartGuard — Suivi de votre santé cardiaque" },
      { property: "og:description", content: "Votre suivi cardiaque personnel, clair et rassurant." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: LandingPage,
});

function LandingPage() {
  const [step, setStep] = useState<"welcome" | "consult">("welcome");

  if (step === "welcome") {
    return (
      <main className="relative min-h-[100svh] overflow-hidden bg-foreground text-primary-foreground">
        <img
          src={heroHeart}
          alt="Cœur humain lumineux en vert avec une ligne de rythme cardiaque"
          width={1024}
          height={1536}
          className="absolute inset-0 h-full w-full object-cover object-center heart-pulse"
        />
        <div className="absolute inset-0 bg-[linear-gradient(to_bottom,color-mix(in_oklab,var(--foreground)_5%,transparent),color-mix(in_oklab,var(--foreground)_96%,transparent))]" />
        <div className="relative z-10 mx-auto flex min-h-[100svh] w-full max-w-md flex-col px-7 py-8 sm:max-w-lg sm:px-10">
          <BrandMark />
          <div className="mt-auto pb-3 screen-enter">
            <p className="mb-3 flex items-center gap-2 text-sm font-semibold text-mint">
              <ShieldCheck className="size-4" /> Votre santé, en confiance
            </p>
            <h1 className="max-w-sm font-display text-5xl font-bold leading-[1.04] sm:text-6xl">
              Votre cœur mérite le meilleur suivi.
            </h1>
            <p className="mt-5 max-w-sm text-base leading-7 text-primary-foreground/75">
              Prévention, suivi personnalisé et conseils pour prendre soin de vous au quotidien.
            </p>
            <Button
              variant="heart"
              size="lg"
              onClick={() => setStep("consult")}
              className="mt-8 h-14 w-full justify-between rounded-xl px-6 text-base"
            >
              Commencer <ArrowRight />
            </Button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-[100svh] bg-background px-5 py-6">
      <div className="mx-auto flex min-h-[calc(100svh-3rem)] max-w-md flex-col screen-enter">
        <div className="flex items-center justify-between">
          <Button variant="ghost" size="icon" aria-label="Retour" onClick={() => setStep("welcome")}>
            <ArrowLeft />
          </Button>
          <BrandMark dark />
          <span className="size-9" />
        </div>
        <div className="flex flex-1 flex-col justify-center py-8 text-center">
          <div className="relative mx-auto mb-8 w-full max-w-sm">
            <div className="absolute inset-x-10 bottom-3 h-24 rounded-full bg-secondary/70 blur-2xl" />
            <img
              src={doctorsAsset.url}
              alt="Deux professionnels de santé devant une clinique"
              width={434}
              height={394}
              className="relative mx-auto aspect-[1.1] w-full object-cover"
            />
          </div>
          <span className="mx-auto rounded-full bg-secondary px-4 py-2 text-xs font-bold uppercase text-secondary-foreground">
            Consultation générale
          </span>
          <h2 className="mt-5 font-display text-3xl font-bold leading-tight">
            Consultez en toute sécurité et confidentialité
          </h2>
          <p className="mx-auto mt-4 max-w-sm text-sm leading-6 text-muted-foreground">
            Créez votre compte protégé par mot de passe : vos mesures, vos traitements et vos rendez-vous ne sont
            visibles que par vous.
          </p>
        </div>
        <Button asChild variant="heart" size="lg" className="h-14 w-full rounded-xl text-base">
          <Link to="/auth">
            Continuer <ArrowRight />
          </Link>
        </Button>
      </div>
    </main>
  );
}

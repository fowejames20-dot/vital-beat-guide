import { createFileRoute } from "@tanstack/react-router";
import { Apple, Dumbbell, Leaf, Phone, Salad } from "lucide-react";

import { PageHeading } from "@/components/app-frame";
import nutritionFamily from "@/assets/nutrition-family.jpg.asset.json";
import sportMan from "@/assets/sport-man.jpg.asset.json";
import nutritionAsset from "@/assets/nutrition.jpg.asset.json";
import exerciseAsset from "@/assets/exercise.jpg.asset.json";

export const Route = createFileRoute("/_authenticated/informations")({
  head: () => ({
    meta: [
      { title: "Informations médicales — HeartGuard" },
      { name: "description", content: "Conseils alimentation et activité physique pour protéger votre cœur, et numéro d'urgence camerounais 119." },
      { property: "og:title", content: "Informations médicales — HeartGuard" },
      { property: "og:description", content: "Fruits, légumes, sport et urgences : les repères santé HeartGuard." },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: InformationPage,
});

const articles = [
  {
    image: nutritionFamily.url,
    icon: <Salad />,
    category: "Alimentation",
    title: "Cuisinez frais, en famille",
    text: "Légumes verts, poisson, banane plantain bouillie plutôt que frite : une cuisine maison peu salée protège votre cœur.",
  },
  {
    image: sportMan.url,
    icon: <Dumbbell />,
    category: "Activité physique",
    title: "30 minutes de sport par jour",
    text: "Marche rapide, footing léger ou renforcement : bougez 5 jours sur 7 et augmentez l'intensité progressivement.",
  },
  {
    image: nutritionAsset.url,
    icon: <Apple />,
    category: "Fruits",
    title: "Cinq fruits et légumes par jour",
    text: "Papaye, mangue, orange, avocat : leurs fibres et leur potassium aident à faire baisser la tension.",
  },
  {
    image: exerciseAsset.url,
    icon: <Leaf />,
    category: "Habitudes",
    title: "Moins de sel, de tabac et d'alcool",
    text: "Limitez les cubes d'assaisonnement, arrêtez le tabac et dormez 7 heures : trois gestes qui comptent vraiment.",
  },
];

function InformationPage() {
  return (
    <section className="screen-enter">
      <PageHeading
        eyebrow="Conseils & prévention"
        title="Informations médicales"
        description="Des repères simples pour mieux comprendre et protéger votre santé cardiovasculaire."
      />

      <div className="mt-7 grid gap-5 md:grid-cols-2">
        {articles.map((article) => (
          <article key={article.title} className="overflow-hidden rounded-xl border bg-card shadow-float">
            <img
              src={article.image}
              alt={article.title}
              loading="lazy"
              className="aspect-[16/9] w-full object-cover"
            />
            <div className="p-5">
              <span className="flex items-center gap-2 text-xs font-bold uppercase text-primary">
                <span className="[&_svg]:size-4">{article.icon}</span>
                {article.category}
              </span>
              <h2 className="mt-3 font-display text-xl font-bold">{article.title}</h2>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">{article.text}</p>
            </div>
          </article>
        ))}
      </div>

      <div className="mt-6 rounded-xl border-l-4 border-l-destructive bg-card p-5 shadow-float">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <span className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-destructive/10 text-destructive">
              <Phone />
            </span>
            <div>
              <h3 className="font-display text-lg font-bold">Urgences au Cameroun : 119</h3>
              <p className="mt-1 text-sm leading-6 text-muted-foreground">
                En cas de douleur thoracique intense, d’essoufflement soudain ou de malaise, appelez immédiatement le
                numéro d’urgence camerounais <strong>119</strong> (SAMU / urgences médicales).
              </p>
            </div>
          </div>
          <a
            href="tel:119"
            className="inline-flex h-12 items-center gap-2 rounded-xl bg-destructive px-6 text-sm font-bold text-destructive-foreground"
          >
            <Phone className="size-4" /> Appeler le 119
          </a>
        </div>
      </div>
    </section>
  );
}

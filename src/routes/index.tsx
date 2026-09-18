import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState, type FormEvent, type ReactNode } from "react";
import {
  Activity,
  ArrowLeft,
  ArrowRight,
  BarChart3,
  CalendarDays,
  Check,
  ChevronRight,
  CircleUserRound,
  Clock3,
  Dumbbell,
  Heart,
  HeartPulse,
  Home,
  Info,
  Leaf,
  LockKeyhole,
  Mail,
  MessageCircle,
  Phone,
  ShieldCheck,
  Stethoscope,
  UserRound,
} from "lucide-react";
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

import heroHeart from "@/assets/heartguard-hero.jpg";
import doctorsAsset from "@/assets/general-practice-illustration.png.asset.json";
import nutritionAsset from "@/assets/nutrition.jpg.asset.json";
import exerciseAsset from "@/assets/exercise.jpg.asset.json";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

type Screen =
  | "welcome"
  | "consult"
  | "auth"
  | "profile"
  | "results"
  | "appointment"
  | "information"
  | "contact";

type Profile = {
  name: string;
  age: string;
  sex: string;
  condition: string;
};

const resultBars = [
  { name: "Chol.", value: 72, color: "var(--chart-1)" },
  { name: "Tension", value: 58, color: "var(--chart-2)" },
  { name: "Pouls", value: 66, color: "var(--chart-3)" },
  { name: "O₂", value: 92, color: "var(--primary)" },
];

const pulseData = [
  { day: "Lun", bpm: 76 },
  { day: "Mar", bpm: 72 },
  { day: "Mer", bpm: 81 },
  { day: "Jeu", bpm: 75 },
  { day: "Ven", bpm: 69 },
  { day: "Sam", bpm: 74 },
  { day: "Dim", bpm: 71 },
];

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "HeartGuard — Suivi de votre santé cardiaque" },
      {
        name: "description",
        content:
          "Consultez vos résultats cardiaques, renseignez votre profil et gérez vos rendez-vous médicaux.",
      },
      { property: "og:title", content: "HeartGuard — Suivi de votre santé cardiaque" },
      {
        property: "og:description",
        content: "Votre suivi cardiaque personnel, clair et rassurant.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: HeartGuardApp,
});

function HeartGuardApp() {
  const [screen, setScreen] = useState<Screen>("welcome");
  const [profile, setProfile] = useState<Profile>({
    name: "Michael Howard",
    age: "38",
    sex: "Homme",
    condition: "Hypertension légère",
  });

  useEffect(() => {
    const saved = window.localStorage.getItem("heartguard-profile");
    if (saved) {
      try {
        setProfile(JSON.parse(saved) as Profile);
      } catch {
        window.localStorage.removeItem("heartguard-profile");
      }
    }
  }, []);

  const navigate = (next: Screen) => {
    setScreen(next);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (screen === "welcome") return <WelcomeScreen onNext={() => navigate("consult")} />;
  if (screen === "consult") return <ConsultScreen onBack={() => navigate("welcome")} onNext={() => navigate("auth")} />;
  if (screen === "auth") return <AuthScreen onBack={() => navigate("consult")} onSuccess={() => navigate("profile")} />;
  if (screen === "profile") {
    return (
      <AppFrame screen={screen} profile={profile} onNavigate={navigate}>
        <ProfileScreen
          profile={profile}
          onSave={(next) => {
            setProfile(next);
            window.localStorage.setItem("heartguard-profile", JSON.stringify(next));
            navigate("results");
          }}
        />
      </AppFrame>
    );
  }

  return (
    <AppFrame screen={screen} profile={profile} onNavigate={navigate}>
      {screen === "results" && <ResultsScreen profile={profile} />}
      {screen === "appointment" && <AppointmentScreen />}
      {screen === "information" && <InformationScreen />}
      {screen === "contact" && <ContactScreen />}
    </AppFrame>
  );
}

function WelcomeScreen({ onNext }: { onNext: () => void }) {
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
          <Button variant="heart" size="lg" onClick={onNext} className="mt-8 h-14 w-full justify-between rounded-xl px-6 text-base">
            Commencer <ArrowRight />
          </Button>
        </div>
      </div>
    </main>
  );
}

function ConsultScreen({ onBack, onNext }: { onBack: () => void; onNext: () => void }) {
  return (
    <main className="min-h-[100svh] bg-background px-5 py-6">
      <div className="mx-auto flex min-h-[calc(100svh-3rem)] max-w-md flex-col screen-enter">
        <TopBar onBack={onBack} />
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
          <h1 className="mt-5 font-display text-3xl font-bold leading-tight">Consultez en toute sécurité et confidentialité</h1>
          <p className="mx-auto mt-4 max-w-sm text-sm leading-6 text-muted-foreground">
            Bienvenue sur HeartGuard. Retrouvez un accompagnement simple pour comprendre et suivre votre santé cardiaque.
          </p>
        </div>
        <Button variant="heart" size="lg" onClick={onNext} className="h-14 w-full rounded-xl text-base">
          Continuer <ArrowRight />
        </Button>
      </div>
    </main>
  );
}

function AuthScreen({ onBack, onSuccess }: { onBack: () => void; onSuccess: () => void }) {
  const [mode, setMode] = useState<"signin" | "signup">("signup");
  const [showPassword, setShowPassword] = useState(false);

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSuccess();
  };

  return (
    <main className="min-h-[100svh] bg-surface px-5 py-6">
      <div className="mx-auto max-w-md screen-enter">
        <TopBar onBack={onBack} />
        <div className="mt-8 overflow-hidden rounded-xl border bg-card shadow-soft">
          <div className="bg-secondary px-6 py-7 text-center">
            <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-card text-primary shadow-float">
              {mode === "signup" ? <UserRound className="size-7" /> : <LockKeyhole className="size-7" />}
            </div>
            <h1 className="mt-4 font-display text-2xl font-bold">{mode === "signup" ? "Créer votre espace" : "Bon retour parmi nous"}</h1>
            <p className="mt-1 text-sm text-muted-foreground">Vos informations restent confidentielles.</p>
          </div>
          <form key={mode} onSubmit={submit} className="space-y-4 p-6 screen-enter">
            {mode === "signup" && <FloatingField label="Nom complet" icon={<UserRound />} type="text" autoComplete="name" />}
            <FloatingField label="Adresse e-mail" icon={<Mail />} type="email" autoComplete="email" />
            <FloatingField
              label="Mot de passe"
              icon={<LockKeyhole />}
              type={showPassword ? "text" : "password"}
              autoComplete={mode === "signup" ? "new-password" : "current-password"}
            />
            {mode === "signup" && (
              <label className="flex cursor-pointer items-center gap-3 text-xs text-muted-foreground">
                <input type="checkbox" required className="size-4 accent-primary" />
                J’accepte la politique de confidentialité de HeartGuard.
              </label>
            )}
            <div className="flex items-center justify-between text-xs">
              <Button type="button" variant="link" className="h-auto p-0" onClick={() => setShowPassword((value) => !value)}>
                {showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
              </Button>
              {mode === "signin" && <Button type="button" variant="link" className="h-auto p-0">Mot de passe oublié ?</Button>}
            </div>
            <Button variant="heart" size="lg" className="h-13 w-full rounded-xl">
              {mode === "signup" ? "S’inscrire" : "Se connecter"} <ArrowRight />
            </Button>
            <p className="text-center text-sm text-muted-foreground">
              {mode === "signup" ? "Vous avez déjà un compte ?" : "Vous n’avez pas de compte ?"}{" "}
              <Button type="button" variant="link" className="h-auto p-0 font-bold" onClick={() => setMode(mode === "signup" ? "signin" : "signup")}>
                {mode === "signup" ? "Se connecter" : "S’inscrire"}
              </Button>
            </p>
          </form>
        </div>
      </div>
    </main>
  );
}

function FloatingField({ label, icon, ...props }: { label: string; icon: ReactNode } & React.ComponentProps<typeof Input>) {
  return (
    <label className="form-field flex h-14 items-center gap-3 rounded-lg border bg-background px-4 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/15">
      <span className="text-primary [&_svg]:size-4">{icon}</span>
      <span className="sr-only">{label}</span>
      <Input required placeholder={label} className="h-full border-0 bg-transparent px-0 shadow-none focus-visible:ring-0" {...props} />
    </label>
  );
}

function ProfileScreen({ profile, onSave }: { profile: Profile; onSave: (profile: Profile) => void }) {
  const [form, setForm] = useState(profile);

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSave(form);
  };

  return (
    <section className="screen-enter">
      <PageHeading eyebrow="Votre dossier" title="Informations personnelles" description="Ces informations nous aident à personnaliser la lecture de vos résultats." />
      <form onSubmit={submit} className="mt-7 grid gap-5 rounded-xl border bg-card p-5 shadow-soft sm:p-7">
        <ProfileField label="Nom complet">
          <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required className="h-12 bg-background" />
        </ProfileField>
        <div className="grid gap-5 sm:grid-cols-2">
          <ProfileField label="Âge">
            <Input type="number" min="1" max="120" value={form.age} onChange={(e) => setForm({ ...form, age: e.target.value })} required className="h-12 bg-background" />
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
          <p className="flex gap-2 font-semibold"><Info className="mt-0.5 size-4 shrink-0" /> HeartGuard ne remplace pas un diagnostic médical professionnel.</p>
        </div>
        <Button variant="heart" size="lg" className="h-13 rounded-xl">Enregistrer et voir mes résultats <ArrowRight /></Button>
      </form>
    </section>
  );
}

function ProfileField({ label, children }: { label: string; children: ReactNode }) {
  return <div className="space-y-2"><Label className="font-semibold">{label}</Label>{children}</div>;
}

function ResultsScreen({ profile }: { profile: Profile }) {
  return (
    <section className="screen-enter">
      <PageHeading eyebrow="Analyse du 18 septembre" title={`Bonjour, ${profile.name.split(" ")[0] || "vous"}`} description="Vos indicateurs sont stables. Continuez à suivre les recommandations de votre médecin." />
      <div className="mt-7 grid gap-4 sm:grid-cols-3">
        <Metric icon={<HeartPulse />} label="Rythme cardiaque" value="72" unit="bpm" trend="Normal" />
        <Metric icon={<Activity />} label="Tension artérielle" value="118/76" unit="mmHg" trend="Optimal" />
        <Metric icon={<ShieldCheck />} label="Score cardiaque" value="86" unit="/100" trend="Très bon" />
      </div>
      <div className="mt-5 grid gap-5 lg:grid-cols-2">
        <ChartPanel title="Aperçu des résultats" subtitle="Comparaison avec les valeurs cibles">
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={resultBars} margin={{ top: 12, right: 5, left: -28, bottom: 0 }}>
              <CartesianGrid vertical={false} stroke="var(--border)" strokeDasharray="4 4" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: "var(--muted-foreground)", fontSize: 12 }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: "var(--muted-foreground)", fontSize: 11 }} />
              <Tooltip cursor={{ fill: "var(--muted)" }} contentStyle={{ borderRadius: 8, borderColor: "var(--border)" }} />
              <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                {resultBars.map((entry) => <Cell key={entry.name} fill={entry.color} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartPanel>
        <ChartPanel title="Rythme sur 7 jours" subtitle="Moyenne au repos">
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={pulseData} margin={{ top: 12, right: 10, left: -28, bottom: 0 }}>
              <CartesianGrid vertical={false} stroke="var(--border)" strokeDasharray="4 4" />
              <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: "var(--muted-foreground)", fontSize: 12 }} />
              <YAxis domain={[60, 90]} axisLine={false} tickLine={false} tick={{ fill: "var(--muted-foreground)", fontSize: 11 }} />
              <Tooltip contentStyle={{ borderRadius: 8, borderColor: "var(--border)" }} />
              <Line type="monotone" dataKey="bpm" stroke="var(--primary)" strokeWidth={3} dot={{ fill: "var(--card)", stroke: "var(--primary)", strokeWidth: 3, r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </ChartPanel>
      </div>
      <div className="mt-5 rounded-xl border bg-card p-5 shadow-float">
        <div className="flex items-start gap-4">
          <span className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-secondary text-primary"><Stethoscope /></span>
          <div><h3 className="font-display text-lg font-bold">Lecture rapide</h3><p className="mt-1 text-sm leading-6 text-muted-foreground">Votre rythme est régulier et votre tension se situe dans la plage optimale. Les valeurs sont des données de démonstration.</p></div>
        </div>
      </div>
    </section>
  );
}

function Metric({ icon, label, value, unit, trend }: { icon: ReactNode; label: string; value: string; unit: string; trend: string }) {
  return (
    <article className="rounded-xl border bg-card p-5 shadow-float">
      <div className="flex items-center justify-between"><span className="text-primary [&_svg]:size-5">{icon}</span><span className="rounded-full bg-secondary px-2.5 py-1 text-[11px] font-bold text-secondary-foreground">{trend}</span></div>
      <p className="mt-6 text-xs font-semibold text-muted-foreground">{label}</p>
      <p className="mt-1 font-display text-2xl font-bold">{value} <span className="font-sans text-xs font-medium text-muted-foreground">{unit}</span></p>
    </article>
  );
}

function ChartPanel({ title, subtitle, children }: { title: string; subtitle: string; children: ReactNode }) {
  return <article className="rounded-xl border bg-card p-5 shadow-float"><h3 className="font-display text-lg font-bold">{title}</h3><p className="mt-1 text-xs text-muted-foreground">{subtitle}</p><div className="mt-4">{children}</div></article>;
}

function AppointmentScreen() {
  const dates = ["21 sept.", "22 sept.", "23 sept.", "24 sept.", "25 sept.", "28 sept."];
  const times = ["09:00", "10:00", "11:30", "13:00", "14:30", "16:00"];
  const [date, setDate] = useState(dates[1]);
  const [time, setTime] = useState(times[1]);
  const [confirmed, setConfirmed] = useState(false);

  return (
    <section className="screen-enter">
      <PageHeading eyebrow="Consultation" title="Prendre rendez-vous" description="Choisissez le créneau qui vous convient pour votre prochaine consultation générale." />
      <div className="mt-7 grid gap-5 lg:grid-cols-[1fr_.72fr]">
        <div className="rounded-xl border bg-card p-5 shadow-soft sm:p-7">
          <Picker title="Choisissez une date" icon={<CalendarDays />} options={dates} value={date} onChange={setDate} />
          <div className="my-7 h-px bg-border" />
          <Picker title="Choisissez une heure" icon={<Clock3 />} options={times} value={time} onChange={setTime} />
          <Button variant="heart" size="lg" className="mt-8 h-13 w-full rounded-xl" onClick={() => setConfirmed(true)}><Check /> Confirmer le rendez-vous</Button>
        </div>
        <aside className="rounded-xl bg-primary p-6 text-primary-foreground shadow-soft">
          <span className="flex size-12 items-center justify-center rounded-lg bg-primary-foreground/15"><Stethoscope /></span>
          <h3 className="mt-6 font-display text-xl font-bold">Consultation générale</h3>
          <p className="mt-2 text-sm leading-6 text-primary-foreground/75">Dr Jane Mbarga · Cardiologie préventive</p>
          <div className="mt-7 space-y-3 border-t border-primary-foreground/20 pt-5 text-sm">
            <p className="flex items-center gap-2"><CalendarDays className="size-4" /> {date} 2026</p>
            <p className="flex items-center gap-2"><Clock3 className="size-4" /> {time}</p>
          </div>
          {confirmed && <p className="mt-6 rounded-lg bg-primary-foreground/15 p-4 text-sm font-semibold screen-enter">Rendez-vous confirmé. Vous recevrez un rappel avant la consultation.</p>}
        </aside>
      </div>
    </section>
  );
}

function Picker({ title, icon, options, value, onChange }: { title: string; icon: ReactNode; options: string[]; value: string; onChange: (value: string) => void }) {
  return (
    <div><h3 className="flex items-center gap-2 font-display text-lg font-bold"><span className="text-primary [&_svg]:size-5">{icon}</span>{title}</h3><div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">{options.map((option) => <Button key={option} type="button" variant={option === value ? "heart" : "outline"} className="h-11" onClick={() => onChange(option)}>{option}</Button>)}</div></div>
  );
}

function InformationScreen() {
  const articles = [
    { image: nutritionAsset.url, icon: <Leaf />, category: "Nutrition", title: "Les aliments qui soutiennent votre cœur", text: "Privilégiez les légumes, les fruits et les fibres tout en limitant le sel." },
    { image: exerciseAsset.url, icon: <Dumbbell />, category: "Activité", title: "Bouger régulièrement, à votre rythme", text: "Une activité modérée et régulière contribue au bon fonctionnement cardiovasculaire." },
  ];
  return (
    <section className="screen-enter"><PageHeading eyebrow="Conseils & prévention" title="Informations médicales" description="Des repères simples pour mieux comprendre et protéger votre santé cardiovasculaire." />
      <div className="mt-7 grid gap-5 md:grid-cols-2">{articles.map((article) => <article key={article.title} className="overflow-hidden rounded-xl border bg-card shadow-float"><img src={article.image} alt={article.title} width={374} height={242} loading="lazy" className="aspect-[16/9] w-full object-cover" /><div className="p-5"><span className="flex items-center gap-2 text-xs font-bold uppercase text-primary"><span className="[&_svg]:size-4">{article.icon}</span>{article.category}</span><h2 className="mt-3 font-display text-xl font-bold">{article.title}</h2><p className="mt-2 text-sm leading-6 text-muted-foreground">{article.text}</p><Button variant="link" className="mt-3 h-auto p-0">Lire le conseil <ChevronRight /></Button></div></article>)}</div>
      <div className="mt-5 rounded-xl bg-secondary p-5 text-secondary-foreground"><p className="flex items-start gap-3 text-sm leading-6"><Info className="mt-0.5 size-5 shrink-0" /><span><strong>En cas de douleur thoracique intense ou d’essoufflement soudain,</strong> contactez immédiatement les urgences de votre pays.</span></p></div>
    </section>
  );
}

function ContactScreen() {
  const [sent, setSent] = useState(false);
  return (
    <section className="screen-enter"><PageHeading eyebrow="Nous sommes à votre écoute" title="Contactez-nous" description="Posez une question à l’équipe médicale ou consultez votre prochain rendez-vous." />
      <div className="mt-7 grid gap-5 lg:grid-cols-[.72fr_1fr]">
        <aside className="rounded-xl bg-primary p-6 text-primary-foreground shadow-soft"><span className="flex size-12 items-center justify-center rounded-lg bg-primary-foreground/15"><CalendarDays /></span><p className="mt-6 text-xs font-semibold uppercase text-primary-foreground/65">Prochain rendez-vous</p><h2 className="mt-2 font-display text-2xl font-bold">22 septembre 2026</h2><p className="mt-2 flex items-center gap-2 text-sm"><Clock3 className="size-4" /> 10:00 · Dr Jane Mbarga</p><div className="mt-7 border-t border-primary-foreground/20 pt-5"><p className="flex items-center gap-3 text-sm"><Phone className="size-4" /> Urgences : 112</p></div></aside>
        <form onSubmit={(e) => { e.preventDefault(); setSent(true); }} className="space-y-4 rounded-xl border bg-card p-5 shadow-soft sm:p-7"><ProfileField label="Votre adresse e-mail"><Input type="email" required placeholder="vous@exemple.com" className="h-12 bg-background" /></ProfileField><ProfileField label="Votre question"><Textarea required placeholder="Comment pouvons-nous vous aider ?" className="min-h-36 resize-none bg-background" /></ProfileField><Button variant="heart" size="lg" className="h-13 w-full rounded-xl"><MessageCircle /> Envoyer le message</Button>{sent && <p className="rounded-lg bg-secondary p-4 text-sm font-semibold text-secondary-foreground screen-enter">Merci, votre message a bien été préparé pour l’équipe HeartGuard.</p>}</form>
      </div>
    </section>
  );
}

function AppFrame({ screen, profile, onNavigate, children }: { screen: Screen; profile: Profile; onNavigate: (screen: Screen) => void; children: ReactNode }) {
  const items: { id: Screen; label: string; icon: ReactNode }[] = [
    { id: "results", label: "Résultats", icon: <BarChart3 /> },
    { id: "appointment", label: "Rendez-vous", icon: <CalendarDays /> },
    { id: "information", label: "Informations", icon: <Info /> },
    { id: "contact", label: "Contact", icon: <MessageCircle /> },
    { id: "profile", label: "Profil", icon: <CircleUserRound /> },
  ];
  return (
    <main className="min-h-[100svh] bg-background pb-24 md:pb-0">
      <header className="sticky top-0 z-30 border-b bg-background/90 backdrop-blur-xl"><div className="mx-auto flex h-18 max-w-6xl items-center justify-between px-5"><BrandMark dark /><div className="hidden items-center gap-1 md:flex">{items.map((item) => <NavButton key={item.id} item={item} active={screen === item.id} onClick={() => onNavigate(item.id)} />)}</div><button aria-label="Voir le profil" onClick={() => onNavigate("profile")} className="flex size-10 cursor-pointer items-center justify-center rounded-full bg-secondary font-display text-sm font-bold text-secondary-foreground">{initials(profile.name)}</button></div></header>
      <div className="mx-auto max-w-6xl px-5 py-8 sm:py-10">{children}</div>
      <nav aria-label="Navigation principale" className="fixed inset-x-3 bottom-3 z-40 grid grid-cols-5 rounded-xl bg-primary p-2 shadow-soft md:hidden">{items.map((item) => <NavButton key={item.id} item={item} active={screen === item.id} onClick={() => onNavigate(item.id)} compact />)}</nav>
    </main>
  );
}

function NavButton({ item, active, onClick, compact = false }: { item: { label: string; icon: ReactNode }; active: boolean; onClick: () => void; compact?: boolean }) {
  return <Button type="button" variant="ghost" onClick={onClick} aria-label={item.label} className={compact ? `h-13 flex-col gap-1 rounded-lg px-1 text-[10px] ${active ? "bg-primary-foreground/15 text-primary-foreground" : "text-primary-foreground/65"}` : `h-10 rounded-lg px-3 ${active ? "bg-secondary text-secondary-foreground" : "text-muted-foreground"}`}><span className="[&_svg]:size-4">{item.icon}</span>{compact ? item.label : <span className="text-xs">{item.label}</span>}</Button>;
}

function PageHeading({ eyebrow, title, description }: { eyebrow: string; title: string; description: string }) {
  return <div className="max-w-2xl"><p className="text-xs font-bold uppercase text-primary">{eyebrow}</p><h1 className="mt-2 font-display text-3xl font-bold sm:text-4xl">{title}</h1><p className="mt-3 text-sm leading-6 text-muted-foreground sm:text-base">{description}</p></div>;
}

function TopBar({ onBack }: { onBack: () => void }) {
  return <div className="flex items-center justify-between"><Button variant="ghost" size="icon" onClick={onBack} aria-label="Retour"><ArrowLeft /></Button><BrandMark dark /><span className="size-9" /></div>;
}

function BrandMark({ dark = false }: { dark?: boolean }) {
  return <div className={`flex items-center gap-2 ${dark ? "text-primary" : "text-primary-foreground"}`}><span className="relative flex size-9 items-center justify-center rounded-lg bg-primary"><Heart className="size-5 fill-current text-primary-foreground" /><Activity className="absolute size-4 text-mint" /></span><span className="font-display text-lg font-bold">HeartGuard</span></div>;
}

function initials(name: string) {
  return name.split(" ").filter(Boolean).slice(0, 2).map((part) => part[0]?.toUpperCase()).join("") || "HG";
}
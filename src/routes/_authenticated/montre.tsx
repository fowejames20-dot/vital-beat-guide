import { createFileRoute } from "@tanstack/react-router";
import { Bluetooth, BatteryCharging, HeartPulse, RefreshCw, Watch } from "lucide-react";

import { PageHeading } from "@/components/app-frame";
import { Button } from "@/components/ui/button";
import { syncDevice } from "@/lib/heartguard.functions";
import { useApiMutation, useDashboard } from "@/lib/use-dashboard";

export const Route = createFileRoute("/_authenticated/montre")({
  head: () => ({
    meta: [
      { title: "Montre connectée — HeartGuard" },
      { name: "description", content: "Suivez la connexion de votre montre HeartGuard avec votre téléphone." },
      { property: "og:title", content: "Montre connectée — HeartGuard" },
      { property: "og:description", content: "Synchronisation de la montre et du téléphone." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: WatchPage,
});

function WatchPage() {
  const { data } = useDashboard();
  const mutation = useApiMutation(syncDevice);
  const device = data?.device;
  const connected = device?.connected ?? false;
  const latest = data?.measurements?.[0];

  return (
    <section className="screen-enter">
      <PageHeading
        eyebrow="Appareil"
        title="Votre montre connectée"
        description="La montre HeartGuard envoie votre rythme cardiaque au téléphone en continu."
      />

      <div className="mt-7 grid gap-5 lg:grid-cols-[.9fr_1fr]">
        <div className="flex flex-col items-center justify-center gap-6 rounded-xl border bg-card p-8 shadow-soft">
          <div className="relative flex items-center gap-6">
            {/* Montre */}
            <div className="relative flex h-40 w-28 flex-col items-center justify-center rounded-[1.6rem] border-4 border-foreground/80 bg-foreground text-primary-foreground shadow-float">
              <span className="absolute -top-3 h-3 w-10 rounded-t-md bg-foreground/70" />
              <span className="absolute -bottom-3 h-3 w-10 rounded-b-md bg-foreground/70" />
              <HeartPulse className={`size-7 text-mint ${connected ? "heart-pulse" : ""}`} />
              <p className="mt-2 font-display text-2xl font-bold">{latest?.heart_rate ?? "--"}</p>
              <p className="text-[10px] uppercase tracking-wide text-primary-foreground/60">bpm</p>
            </div>

            {/* Lien */}
            <div className="flex flex-col items-center gap-1">
              <Bluetooth className={`size-6 ${connected ? "text-primary" : "text-muted-foreground"}`} />
              <span className={`h-px w-14 ${connected ? "bg-primary" : "bg-border"}`} />
              <span className="text-[10px] font-semibold text-muted-foreground">
                {connected ? "Connectée" : "Hors ligne"}
              </span>
            </div>

            {/* Téléphone */}
            <div className="flex h-44 w-24 flex-col items-center justify-center rounded-[1.4rem] border-4 border-foreground/80 bg-background shadow-float">
              <span className="mb-2 h-1 w-8 rounded-full bg-foreground/30" />
              <Watch className="size-6 text-primary" />
              <p className="mt-2 px-2 text-center text-[10px] font-semibold">HeartGuard</p>
              <p className="mt-1 text-[10px] text-muted-foreground">Synchronisé</p>
            </div>
          </div>

          <Button
            variant={connected ? "outline" : "heart"}
            className="h-12 rounded-xl px-6"
            disabled={mutation.isPending}
            onClick={() => mutation.mutate({ connected: !connected })}
          >
            <RefreshCw className={mutation.isPending ? "animate-spin" : ""} />
            {connected ? "Synchroniser / déconnecter" : "Connecter la montre"}
          </Button>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <InfoCard icon={<Bluetooth />} label="État" value={connected ? "Connectée au téléphone" : "Déconnectée"} />
          <InfoCard icon={<BatteryCharging />} label="Batterie" value={`${device?.battery ?? 0} %`} />
          <InfoCard
            icon={<RefreshCw />}
            label="Dernière synchronisation"
            value={device ? new Date(device.last_sync).toLocaleString("fr-FR") : "—"}
          />
          <InfoCard icon={<HeartPulse />} label="Dernier pouls mesuré" value={latest?.heart_rate ? `${latest.heart_rate} bpm` : "—"} />
        </div>
      </div>
    </section>
  );
}

function InfoCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <article className="rounded-xl border bg-card p-5 shadow-float">
      <span className="text-primary [&_svg]:size-5">{icon}</span>
      <p className="mt-5 text-xs font-semibold text-muted-foreground">{label}</p>
      <p className="mt-1 font-display text-lg font-bold">{value}</p>
    </article>
  );
}

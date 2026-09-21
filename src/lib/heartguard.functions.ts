import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export type ProfileRow = {
  id: string;
  full_name: string;
  age: number | null;
  sex: string | null;
  condition: string | null;
};

export type MeasurementRow = {
  id: string;
  measured_at: string;
  systolic: number;
  diastolic: number;
  cholesterol: number;
  glucose: number;
  heart_rate: number | null;
};

export type AppointmentRow = {
  id: string;
  scheduled_date: string;
  scheduled_time: string;
  doctor: string;
  reason: string;
  notes: string | null;
  mode: string;
  status: string;
};

export type MedicationRow = {
  id: string;
  name: string;
  dosage: string;
  times: string[];
  notes: string | null;
  active: boolean;
};

export type MedicationLogRow = {
  id: string;
  medication_id: string;
  log_date: string;
  scheduled_time: string;
};

export type DeviceRow = {
  id: string;
  name: string;
  connected: boolean;
  battery: number;
  last_sync: string;
};

export type Dashboard = {
  email: string;
  profile: ProfileRow | null;
  measurements: MeasurementRow[];
  appointments: AppointmentRow[];
  medications: MedicationRow[];
  logs: MedicationLogRow[];
  device: DeviceRow | null;
};

const today = () => new Date().toISOString().slice(0, 10);

function toNumber(value: unknown, field: string) {
  const parsed = typeof value === "number" ? value : Number(String(value ?? "").replace(",", "."));
  if (!Number.isFinite(parsed)) throw new Error(`Valeur invalide pour ${field}`);
  return parsed;
}

function text(value: unknown, max = 500) {
  return String(value ?? "").trim().slice(0, max);
}

/** Récupère toutes les données de l'utilisateur connecté. */
export const getDashboard = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<Dashboard> => {
    const { supabase, userId, claims } = context;

    const [profile, measurements, appointments, medications, logs, device] = await Promise.all([
      supabase.from("profiles").select("id, full_name, age, sex, condition").eq("id", userId).maybeSingle(),
      supabase
        .from("measurements")
        .select("id, measured_at, systolic, diastolic, cholesterol, glucose, heart_rate")
        .order("measured_at", { ascending: false })
        .limit(12),
      supabase
        .from("appointments")
        .select("id, scheduled_date, scheduled_time, doctor, reason, notes, mode, status")
        .order("scheduled_date", { ascending: true }),
      supabase.from("medications").select("id, name, dosage, times, notes, active").order("created_at"),
      supabase.from("medication_logs").select("id, medication_id, log_date, scheduled_time").eq("log_date", today()),
      supabase.from("devices").select("id, name, connected, battery, last_sync").eq("user_id", userId).maybeSingle(),
    ]);

    return {
      email: (claims as { email?: string })?.email ?? "",
      profile: (profile.data as ProfileRow | null) ?? null,
      measurements: (measurements.data as MeasurementRow[] | null) ?? [],
      appointments: (appointments.data as AppointmentRow[] | null) ?? [],
      medications: (medications.data as MedicationRow[] | null) ?? [],
      logs: (logs.data as MedicationLogRow[] | null) ?? [],
      device: (device.data as DeviceRow | null) ?? null,
    };
  });

export const saveProfile = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { full_name: string; age: string; sex: string; condition: string }) => ({
    full_name: text(data.full_name, 120),
    age: data.age ? Math.max(1, Math.min(120, Math.round(toNumber(data.age, "âge")))) : null,
    sex: text(data.sex, 40),
    condition: text(data.condition, 1000),
  }))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase
      .from("profiles")
      .upsert({ id: context.userId, ...data });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const addMeasurement = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { systolic: string; diastolic: string; cholesterol: string; glucose: string; heartRate: string }) => ({
    systolic: Math.round(toNumber(data.systolic, "tension haute")),
    diastolic: Math.round(toNumber(data.diastolic, "tension basse")),
    cholesterol: Number(toNumber(data.cholesterol, "cholestérol").toFixed(2)),
    glucose: Number(toNumber(data.glucose, "glycémie").toFixed(2)),
    heart_rate: data.heartRate ? Math.round(toNumber(data.heartRate, "rythme cardiaque")) : null,
  }))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase
      .from("measurements")
      .insert({ ...data, user_id: context.userId });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const bookAppointment = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { date: string; time: string; doctor: string; reason: string; notes: string; mode: string }) => ({
    scheduled_date: text(data.date, 10),
    scheduled_time: text(data.time, 5),
    doctor: text(data.doctor, 120) || "Dr Jane Mbarga",
    reason: text(data.reason, 160) || "Consultation générale",
    notes: text(data.notes, 800),
    mode: text(data.mode, 20) || "cabinet",
  }))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase
      .from("appointments")
      .insert({ ...data, user_id: context.userId });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const cancelAppointment = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { id: string }) => ({ id: text(data.id, 40) }))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("appointments").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const addMedication = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { name: string; dosage: string; times: string[]; notes: string }) => ({
    name: text(data.name, 120),
    dosage: text(data.dosage, 80),
    times: (data.times ?? []).slice(0, 6).map((t) => text(t, 5)).filter(Boolean),
    notes: text(data.notes, 400),
  }))
  .handler(async ({ data, context }) => {
    if (!data.name) throw new Error("Le nom du médicament est requis");
    const { error } = await context.supabase
      .from("medications")
      .insert({ ...data, user_id: context.userId });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const deleteMedication = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { id: string }) => ({ id: text(data.id, 40) }))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("medications").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const toggleDose = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { medicationId: string; time: string; taken: boolean }) => ({
    medicationId: text(data.medicationId, 40),
    time: text(data.time, 5),
    taken: Boolean(data.taken),
  }))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    if (data.taken) {
      const { error } = await supabase.from("medication_logs").insert({
        user_id: userId,
        medication_id: data.medicationId,
        scheduled_time: data.time,
        log_date: today(),
      });
      if (error && !error.message.includes("duplicate")) throw new Error(error.message);
    } else {
      const { error } = await supabase
        .from("medication_logs")
        .delete()
        .eq("medication_id", data.medicationId)
        .eq("scheduled_time", data.time)
        .eq("log_date", today());
      if (error) throw new Error(error.message);
    }
    return { ok: true };
  });

export const syncDevice = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { connected: boolean }) => ({ connected: Boolean(data.connected) }))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { data: existing } = await supabase.from("devices").select("id").eq("user_id", userId).maybeSingle();
    const payload = {
      connected: data.connected,
      last_sync: new Date().toISOString(),
      battery: Math.max(35, Math.min(100, 60 + Math.round(Math.random() * 40))),
    };
    const { error } = existing
      ? await supabase.from("devices").update(payload).eq("id", (existing as { id: string }).id)
      : await supabase.from("devices").insert({ ...payload, user_id: userId });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

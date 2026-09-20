export type Level = "bon" | "surveiller" | "eleve";

export type Assessment = {
  label: string;
  value: string;
  unit: string;
  level: Level;
  status: string;
  advice: string;
  /** 0-100 score used for the comparison chart */
  score: number;
};

export type MeasurementInput = {
  systolic: number;
  diastolic: number;
  cholesterol: number; // g/L
  glucose: number; // g/L à jeun
  heartRate?: number | null;
};

const clamp = (value: number) => Math.max(0, Math.min(100, Math.round(value)));

export function assessBloodPressure(systolic: number, diastolic: number): Assessment {
  let level: Level = "bon";
  let status = "Tension optimale";
  let advice =
    "Votre tension est dans la plage recommandée. Continuez une alimentation peu salée et une activité régulière.";

  if (systolic >= 180 || diastolic >= 110) {
    level = "eleve";
    status = "Hypertension sévère";
    advice =
      "Tension très élevée. Consultez un médecin sans attendre ; en cas de maux de tête violents, douleur thoracique ou troubles de la vue, appelez le 119.";
  } else if (systolic >= 140 || diastolic >= 90) {
    level = "eleve";
    status = "Hypertension";
    advice =
      "Votre tension dépasse le seuil de 140/90. Prenez rendez-vous avec votre médecin, réduisez le sel et l'alcool, et mesurez votre tension chaque jour.";
  } else if (systolic >= 130 || diastolic >= 85) {
    level = "surveiller";
    status = "Tension normale haute";
    advice =
      "Tension un peu haute. Surveillez-la deux fois par semaine, limitez le sel et marchez au moins 30 minutes par jour.";
  } else if (systolic < 90 || diastolic < 60) {
    level = "surveiller";
    status = "Tension basse";
    advice =
      "Tension basse. Buvez suffisamment et signalez à votre médecin tout vertige ou malaise.";
  }

  // 120/80 → 100 ; on retire des points au-delà.
  const penalty = Math.max(0, systolic - 120) * 1.4 + Math.max(0, diastolic - 80) * 1.6;
  return {
    label: "Tension artérielle",
    value: `${systolic}/${diastolic}`,
    unit: "mmHg",
    level,
    status,
    advice,
    score: clamp(100 - penalty),
  };
}

export function assessCholesterol(cholesterol: number): Assessment {
  let level: Level = "bon";
  let status = "Cholestérol normal";
  let advice =
    "Votre cholestérol total est dans la norme. Gardez une alimentation riche en fruits, légumes et poisson.";

  if (cholesterol >= 2.4) {
    level = "eleve";
    status = "Cholestérol élevé";
    advice =
      "Cholestérol au-dessus de 2,40 g/L : risque cardiovasculaire accru. Consultez votre médecin, réduisez les fritures, l'huile de palme et les viandes grasses.";
  } else if (cholesterol >= 2.0) {
    level = "surveiller";
    status = "Cholestérol limite";
    advice =
      "Valeur limite. Privilégiez le poisson, les légumineuses et l'huile d'arachide en petite quantité, et refaites un bilan dans 3 mois.";
  }

  return {
    label: "Cholestérol total",
    value: cholesterol.toFixed(2),
    unit: "g/L",
    level,
    status,
    advice,
    score: clamp(100 - Math.max(0, cholesterol - 1.6) * 90),
  };
}

export function assessGlucose(glucose: number): Assessment {
  let level: Level = "bon";
  let status = "Glycémie normale";
  let advice = "Glycémie à jeun normale. Limitez les boissons sucrées pour la garder stable.";

  if (glucose >= 1.26) {
    level = "eleve";
    status = "Glycémie de type diabétique";
    advice =
      "Glycémie à jeun ≥ 1,26 g/L : cela évoque un diabète. Un contrôle médical est nécessaire pour confirmer et vous accompagner.";
  } else if (glucose >= 1.1) {
    level = "surveiller";
    status = "Prédiabète";
    advice =
      "Glycémie un peu haute. Réduisez le sucre et les féculents raffinés, bougez chaque jour et refaites un contrôle dans 3 mois.";
  } else if (glucose < 0.7) {
    level = "surveiller";
    status = "Glycémie basse";
    advice =
      "Glycémie basse. Ne sautez pas de repas et parlez-en à votre médecin si vous ressentez des tremblements ou des malaises.";
  }

  return {
    label: "Glycémie à jeun",
    value: glucose.toFixed(2),
    unit: "g/L",
    level,
    status,
    advice,
    score: clamp(100 - Math.max(0, glucose - 0.95) * 130 - Math.max(0, 0.7 - glucose) * 120),
  };
}

export function assessHeartRate(heartRate?: number | null): Assessment | null {
  if (!heartRate) return null;
  let level: Level = "bon";
  let status = "Rythme normal";
  let advice = "Votre rythme cardiaque au repos est normal.";

  if (heartRate > 100) {
    level = "eleve";
    status = "Rythme rapide";
    advice = "Rythme au repos supérieur à 100 bpm. Reposez-vous et parlez-en à votre médecin s'il persiste.";
  } else if (heartRate > 90) {
    level = "surveiller";
    status = "Rythme un peu rapide";
    advice = "Rythme légèrement élevé. Évitez le café en excès et surveillez votre sommeil.";
  } else if (heartRate < 50) {
    level = "surveiller";
    status = "Rythme lent";
    advice = "Rythme lent. Normal chez les sportifs, à signaler en cas de fatigue ou de vertiges.";
  }

  return {
    label: "Rythme cardiaque",
    value: String(heartRate),
    unit: "bpm",
    level,
    status,
    advice,
    score: clamp(100 - Math.abs(heartRate - 68) * 1.6),
  };
}

export type Verdict = {
  assessments: Assessment[];
  globalScore: number;
  level: Level;
  title: string;
  summary: string;
  actions: string[];
};

export function buildVerdict(input: MeasurementInput): Verdict {
  const assessments = [
    assessBloodPressure(input.systolic, input.diastolic),
    assessCholesterol(input.cholesterol),
    assessGlucose(input.glucose),
    ...(assessHeartRate(input.heartRate) ? [assessHeartRate(input.heartRate)!] : []),
  ];

  const globalScore = Math.round(
    assessments.reduce((total, item) => total + item.score, 0) / assessments.length,
  );
  const worst: Level = assessments.some((a) => a.level === "eleve")
    ? "eleve"
    : assessments.some((a) => a.level === "surveiller")
      ? "surveiller"
      : "bon";

  const title =
    worst === "eleve"
      ? "Consultation médicale recommandée"
      : worst === "surveiller"
        ? "Quelques valeurs à surveiller"
        : "Bilan rassurant";

  const summary =
    worst === "eleve"
      ? "Une ou plusieurs de vos valeurs dépassent nettement les seuils de référence. Prenez rendez-vous avec un professionnel de santé rapidement."
      : worst === "surveiller"
        ? "Vos valeurs restent proches des seuils. Quelques ajustements d'hygiène de vie suffisent souvent à revenir dans la norme."
        : "Toutes vos valeurs sont dans les plages de référence. Continuez ainsi et refaites un bilan dans 6 mois.";

  const actions = assessments.filter((a) => a.level !== "bon").map((a) => a.advice);
  if (actions.length === 0) {
    actions.push("Refaites un contrôle dans 6 mois et gardez 30 minutes d'activité physique par jour.");
  }

  return { assessments, globalScore, level: worst, title, summary, actions };
}

export const levelStyles: Record<Level, { badge: string; text: string; color: string }> = {
  bon: {
    badge: "bg-secondary text-secondary-foreground",
    text: "text-primary",
    color: "var(--success)",
  },
  surveiller: {
    badge: "bg-[color-mix(in_oklab,var(--warning)_28%,white)] text-foreground",
    text: "text-foreground",
    color: "var(--warning)",
  },
  eleve: {
    badge: "bg-destructive/12 text-destructive",
    text: "text-destructive",
    color: "var(--destructive)",
  },
};

"use client";

import { useEffect, useState } from "react";
import type { SiteSettings } from "@/lib/types";
import { fetcher } from "@/lib/fetcher";

/**
 * Shared hook that fetches the singleton SiteSettings from `/api/settings`.
 * Returns `null` while loading and a fallback object on error so UI can
 * still render with brand defaults.
 */
export const DEFAULT_SETTINGS: SiteSettings = {
  id: "singleton",
  brandName: "Seguros y Fianzas ELA",
  tagline: "Brindamos Servicios de Seguros y Fianzas",
  logoUrl: null,
  logoText: "ELA",
  primaryColor: "#00455e",
  secondaryColor: "#23a1ea",
  accentColor: "#faae0b",
  darkColor: "#212121",
  phone: "66-3206-4190",
  whatsapp: null,
  email: "contacto@segurosela.com",
  address: "Calle Buenaventura #374, Fracc. Chapultepec, Tijuana, B.C.",
  schedule: "Lun - Vier: 09:00 - 18:00",
  instagramUser: "segurosela",
  instagramUrl: "https://instagram.com/segurosela",
  facebookUrl: null,
  linkedinUrl: null,
  yearsExperience: 10,
  aboutText:
    "Constituida como una empresa 100% Mexicana, contamos con mas de 10 años de trayectoria.",
  aboutImageUrl: null,
};

export function useSettings() {
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let mounted = true;
    fetcher<SiteSettings>("/api/settings")
      .then((data) => {
        if (mounted) setSettings({ ...DEFAULT_SETTINGS, ...data });
      })
      .catch((err) => {
        if (mounted) {
          setError(err);
          setSettings(DEFAULT_SETTINGS);
        }
      });
    return () => {
      mounted = false;
    };
  }, []);

  return { settings, error };
}

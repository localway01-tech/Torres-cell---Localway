import { useEffect, useState, useCallback } from "react";
import { getServerSiteData, saveServerSiteData, DEFAULT_SITE_DATA } from "./server-api";
import { SITE } from "@/lib/site-config";

export interface CompanyData {
  name: string;
  brandSlogan?: string;
  slogan: string;
  description: string;
  whatsappNumber: string;
  instagram: string;
  googleReview: string;
  address: string;
  mapsRoute: string;
  mapsEmbed: string;
  logoUrl?: string;
  symbolUrl?: string;
}

export interface PixData {
  titular: string;
  banco: string;
  chave: string;
}

export interface WifiData {
  rede: string;
  senha: string;
}

export interface HoursData {
  weekdays: string;
  saturday: string;
  sunday: string;
  lunch: string;
}

export interface PromotionData {
  active: boolean;
  title: string;
  text: string;
}

export interface HomeServiceData {
  active: boolean;
  title: string;
  badge: string;
  description: string;
  neighborhoods: string[];
  imageUrl?: string;
}

export interface ServiceItem {
  id: string;
  name: string;
  desc: string;
  price: string;
  highlight: boolean;
  promoBadge: string;
  active: boolean;
  imageUrl?: string;
}

export interface ProductItem {
  id: string;
  name: string;
  desc: string;
  category: string;
  active: boolean;
  imageUrl?: string;
}

export interface Photo {
  id: string;
  title: string;
  category: string;
  url: string;
}

export interface SiteData {
  company: CompanyData;
  pix: PixData;
  wifi: WifiData;
  hours: HoursData;
  promotion: PromotionData;
  homeService: HomeServiceData;
  services: ServiceItem[];
  products: ProductItem[];
  photos: Photo[];
}

export type Links = {
  whatsappNumber: string;
  instagram: string;
  googleReview: string;
  mapsRoute: string;
};

export const defaultLinks: Links = {
  whatsappNumber: SITE.whatsappNumber,
  instagram: SITE.instagram,
  googleReview: SITE.googleReview,
  mapsRoute: SITE.mapsRoute,
};

export const LINK_FIELDS: { key: keyof Links; label: string }[] = [
  { key: "whatsappNumber", label: "WhatsApp (só números, com 55 e DDD)" },
  { key: "instagram", label: "Link do Instagram" },
  { key: "googleReview", label: "Link de avaliação no Google" },
  { key: "mapsRoute", label: "Link do Google Maps (rota)" },
];

const LOCAL_STORAGE_KEY = "torres_cell_site_data_v1";

export async function fetchSiteData(): Promise<SiteData> {
  // First try server-side persistent API
  try {
    const serverData = await getServerSiteData();
    if (serverData && typeof serverData === "object" && "company" in serverData) {
      if (typeof window !== "undefined") {
        try {
          localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(serverData));
        } catch {
          // ignore
        }
      }
      return serverData as SiteData;
    }
  } catch (err) {
    console.warn("Could not fetch server site data, falling back to local:", err);
  }

  // Fallback to localStorage if in browser
  if (typeof window !== "undefined") {
    try {
      const cached = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (cached) {
        return { ...DEFAULT_SITE_DATA, ...JSON.parse(cached) } as SiteData;
      }
    } catch {
      // ignore
    }
  }

  return DEFAULT_SITE_DATA as unknown as SiteData;
}

export async function saveSiteData(data: SiteData): Promise<{ success: boolean; error?: string }> {
  // Save locally first for instant reactivity
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data));
      window.dispatchEvent(new Event("torres_cell_data_updated"));
    } catch {
      // ignore
    }
  }

  // Save to server
  try {
    const result = await saveServerSiteData({ data });
    return result as { success: boolean; error?: string };
  } catch (err) {
    console.error("Error saving to server:", err);
    return { success: false, error: String(err) };
  }
}

export async function fetchLinks(): Promise<Links> {
  const data = await fetchSiteData();
  return {
    whatsappNumber: data.company.whatsappNumber || SITE.whatsappNumber,
    instagram: data.company.instagram || SITE.instagram,
    googleReview: data.company.googleReview || SITE.googleReview,
    mapsRoute: data.company.mapsRoute || SITE.mapsRoute,
  };
}

export async function fetchPhotos(): Promise<Photo[]> {
  const data = await fetchSiteData();
  return data.photos || [];
}

export function useSiteData() {
  const [data, setData] = useState<SiteData>(DEFAULT_SITE_DATA as unknown as SiteData);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(() => {
    fetchSiteData()
      .then((res) => {
        setData(res);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    loadData();

    const handleUpdate = () => loadData();
    if (typeof window !== "undefined") {
      window.addEventListener("torres_cell_data_updated", handleUpdate);
      window.addEventListener("storage", handleUpdate);
      return () => {
        window.removeEventListener("torres_cell_data_updated", handleUpdate);
        window.removeEventListener("storage", handleUpdate);
      };
    }
  }, [loadData]);

  // Backward compatibility convenience properties
  const links: Links = {
    whatsappNumber: data.company.whatsappNumber || SITE.whatsappNumber,
    instagram: data.company.instagram || SITE.instagram,
    googleReview: data.company.googleReview || SITE.googleReview,
    mapsRoute: data.company.mapsRoute || SITE.mapsRoute,
  };

  return {
    data,
    links,
    photos: data.photos || [],
    loading,
    refresh: loadData,
  };
}

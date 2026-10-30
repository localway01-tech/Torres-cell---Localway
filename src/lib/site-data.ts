import { useEffect, useState, useCallback } from "react";
import { getServerSiteData, saveServerSiteData } from "./server-api";
import { DEFAULT_SITE_DATA } from "./default-site-data";
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

export interface InstagramPost {
  id: string;
  imageUrl: string;
  postUrl: string;
  caption?: string;
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
  instagramPosts?: InstagramPost[];
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
  let localData: SiteData | null = null;
  if (typeof window !== "undefined") {
    try {
      const cached = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (cached) {
        localData = { ...DEFAULT_SITE_DATA, ...JSON.parse(cached) } as SiteData;
      }
    } catch {
      // ignore
    }
  }

  // Then try server-side persistent API
  try {
    const serverData = await getServerSiteData();
    if (serverData && typeof serverData === "object" && "company" in serverData) {
      const sData = { ...DEFAULT_SITE_DATA, ...serverData } as SiteData;

      // If server photos are empty but local has photos, preserve local photos
      if (
        (!sData.photos || sData.photos.length === 0) &&
        localData?.photos &&
        localData.photos.length > 0
      ) {
        sData.photos = localData.photos;
      }

      if (typeof window !== "undefined") {
        try {
          localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(sData));
        } catch {
          // ignore
        }
      }
      return sData;
    }
  } catch (err) {
    console.warn("Could not fetch server site data, falling back to local:", err);
  }

  // Fallback to local cache if server is unreachable
  if (localData) {
    return localData;
  }

  return DEFAULT_SITE_DATA as unknown as SiteData;
}

export async function saveSiteData(
  data: SiteData,
): Promise<{ success: boolean; error?: string; warning?: string }> {
  // Save locally first for instant reactivity and zero-latency UI update
  let localSaved = false;
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data));
      window.dispatchEvent(new Event("torres_cell_data_updated"));
      localSaved = true;
    } catch (e) {
      console.warn("Could not write to localStorage:", e);
    }
  }

  // Save to server
  try {
    const result = await saveServerSiteData({ data });
    if (result && typeof result === "object" && "success" in result && result.success) {
      return { success: true };
    }
    // If server returned non-success but local saved, report success with graceful warning
    if (localSaved) {
      return { success: true, warning: "Salvo localmente no dispositivo." };
    }
    return (result as { success: boolean; error?: string }) || { success: true };
  } catch (err) {
    console.warn("Notice: Server save returned error, kept in local storage:", err);
    if (localSaved) {
      return { success: true, warning: "Salvo no navegador com sucesso." };
    }
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

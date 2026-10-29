import { createServerFn } from "@tanstack/react-start";
import * as fs from "node:fs/promises";
import * as path from "node:path";
import { SITE } from "./site-config";

const DATA_FILE = path.resolve(process.cwd(), "data/site-data.json");
const AUTH_FILE = path.resolve(process.cwd(), "data/admin-auth.json");
const UPLOADS_DIR = path.resolve(process.cwd(), "public/uploads");

export const DEFAULT_SITE_DATA = {
  company: {
    name: "Torres Cell",
    brandSlogan: "Qualidade e Honestidade",
    slogan: "Seu celular em boas mãos. Tecnologia, cuidado e confiança em um só lugar.",
    description: "Assistência técnica especializada e venda de celulares e acessórios",
    whatsappNumber: "5585984137001",
    instagram: "https://www.instagram.com/torres_cell_0/",
    googleReview: "https://search.google.com/local/writereview?placeid=ChIJnQ6LDtNJxwcRNg098V5g_hY",
    address: "Av. Dr. Theberge, 2404 — Presidente Kennedy, Fortaleza — CE, CEP 60355-000",
    mapsRoute: SITE.mapsRoute,
    mapsEmbed: SITE.mapsEmbed,
    logoUrl: "",
  },
  pix: {
    titular: "Tiago Torres de Farias Santos",
    banco: "InfinitePay",
    chave: "69269766000172",
  },
  wifi: {
    rede: "TORRES CELL",
    senha: "torres2404",
  },
  hours: {
    weekdays: "08h às 18h",
    saturday: "Até 16h",
    sunday: "Fechado",
    lunch: "12h às 14h",
  },
  promotion: {
    active: true,
    title: "Promoção Especial",
    text: "Na troca da tela, a película 3D é grátis.",
  },
  homeService: {
    active: true,
    title: "Torres Cell vai até você",
    badge: "Atendimento em domicílio",
    description: "Consulte a disponibilidade de atendimento na sua região pelo WhatsApp.",
    neighborhoods: [
      "Álvaro Weyne",
      "Presidente Kennedy",
      "Jardim Iracema",
      "Parquelândia",
      "Cristo Redentor",
    ],
    imageUrl: "",
  },
  services: [
    {
      id: "troca-tela",
      name: "Troca de tela",
      desc: "Reparo e substituição completa de tela e display com máxima precisão.",
      price: "Sob consulta",
      highlight: true,
      promoBadge: "Película 3D grátis",
      active: true,
      imageUrl: "",
    },
    {
      id: "troca-bateria",
      name: "Troca de bateria",
      desc: "Substituição por bateria de alta qualidade e autonomia duradoura.",
      price: "Sob consulta",
      highlight: false,
      promoBadge: "",
      active: true,
      imageUrl: "",
    },
    {
      id: "troca-vidro",
      name: "Troca de vidro",
      desc: "Recuperação do vidro original mantendo o display de fábrica.",
      price: "Sob consulta",
      highlight: false,
      promoBadge: "",
      active: true,
      imageUrl: "",
    },
    {
      id: "problemas-carregamento",
      name: "Problemas de carregamento",
      desc: "Reparo de conector de carga, dock e circuito de alimentação.",
      price: "Sob consulta",
      highlight: false,
      promoBadge: "",
      active: true,
      imageUrl: "",
    },
    {
      id: "diagnostico-tecnico",
      name: "Diagnóstico e avaliação técnica",
      desc: "Análise completa do aparelho para identificar falhas com transparência.",
      price: "Sob consulta",
      highlight: false,
      promoBadge: "",
      active: true,
      imageUrl: "",
    },
    {
      id: "audio-microfone",
      name: "Problemas de áudio e microfone",
      desc: "Limpeza, reparo e troca de alto-falantes e microfones.",
      price: "Sob consulta",
      highlight: false,
      promoBadge: "",
      active: true,
      imageUrl: "",
    },
    {
      id: "software",
      name: "Manutenção de software",
      desc: "Restauração do sistema, remoção de falhas e atualizações.",
      price: "Sob consulta",
      highlight: false,
      promoBadge: "",
      active: true,
      imageUrl: "",
    },
  ],
  products: [
    {
      id: "smartphones",
      name: "Smartphones",
      desc: "Aparelhos selecionados com garantia e procedência. Consulte os modelos disponíveis.",
      category: "celulares",
      active: true,
      imageUrl: "",
    },
    {
      id: "capas-peliculas",
      name: "Capas e películas",
      desc: "Proteção completa com películas 3D, cerâmica e capas resistentes para seu aparelho.",
      category: "acessorios",
      active: true,
      imageUrl: "",
    },
    {
      id: "fones-ouvido",
      name: "Fones de ouvido",
      desc: "Fones bluetooth e com fio com alta fidelidade sonora para seu dia a dia.",
      category: "acessorios",
      active: true,
      imageUrl: "",
    },
    {
      id: "carregadores-cabos",
      name: "Carregadores e cabos",
      desc: "Fontes rápidas turbo, cabos homologados Lightning, Tipo C e Micro USB.",
      category: "acessorios",
      active: true,
      imageUrl: "",
    },
    {
      id: "outros-acessorios",
      name: "Outros acessórios para celular",
      desc: "Suportes veiculares, adaptadores, anéis de suporte e itens essenciais.",
      category: "acessorios",
      active: true,
      imageUrl: "",
    },
  ],
  photos: [] as { id: string; title: string; category: string; url: string }[],
};

export const getServerSiteData = createServerFn({ method: "GET" }).handler(async () => {
  try {
    const raw = await fs.readFile(DATA_FILE, "utf-8");
    const parsed = JSON.parse(raw);
    return { ...DEFAULT_SITE_DATA, ...parsed };
  } catch {
    return DEFAULT_SITE_DATA;
  }
});

export const saveServerSiteData = createServerFn({ method: "POST" })
  .validator((d: unknown) => d)
  .handler(async ({ data }) => {
    try {
      await fs.mkdir(path.dirname(DATA_FILE), { recursive: true });
      await fs.writeFile(DATA_FILE, JSON.stringify(data, null, 2), "utf-8");
      return { success: true };
    } catch (err) {
      console.error("Error saving site data file:", err);
      return { success: false, error: String(err) };
    }
  });

export const authenticateAdmin = createServerFn({ method: "POST" })
  .validator((creds: { username?: string; password?: string }) => creds)
  .handler(async ({ data }) => {
    const { username, password } = data;
    let expectedPass = "Torrescell123";

    try {
      const authRaw = await fs.readFile(AUTH_FILE, "utf-8");
      const authData = JSON.parse(authRaw);
      if (authData.password) expectedPass = authData.password;
    } catch {
      // Use default password
    }

    const cleanUser = username?.trim().toLowerCase() ?? "";
    const isUserValid =
      cleanUser === "torrescell2026" ||
      cleanUser === "torrescell2026@torrescell.com.br" ||
      cleanUser === "admin";
    const isPassValid = password === expectedPass;

    if (isUserValid && isPassValid) {
      const token = `tc_session_${Date.now()}_${Math.random().toString(36).substring(2)}`;
      return {
        success: true,
        token,
        username: "Torrescell2026",
      };
    }

    return {
      success: false,
      error: "Usuário ou senha incorretos. Verifique suas credenciais de administrador.",
    };
  });

export const changeAdminPassword = createServerFn({ method: "POST" })
  .validator((args: { currentPassword?: string; newPassword?: string; token?: string }) => args)
  .handler(async ({ data }) => {
    const { currentPassword, newPassword } = data;
    if (!newPassword || newPassword.length < 6) {
      return { success: false, error: "A nova senha deve ter no mínimo 6 caracteres." };
    }

    let currentExpected = "Torrescell123";
    try {
      const authRaw = await fs.readFile(AUTH_FILE, "utf-8");
      const authData = JSON.parse(authRaw);
      if (authData.password) currentExpected = authData.password;
    } catch {
      // Use default
    }

    if (currentPassword !== currentExpected) {
      return { success: false, error: "Senha atual incorreta." };
    }

    try {
      await fs.mkdir(path.dirname(AUTH_FILE), { recursive: true });
      await fs.writeFile(
        AUTH_FILE,
        JSON.stringify({ password: newPassword, updatedAt: new Date().toISOString() }, null, 2),
        "utf-8",
      );
      return { success: true };
    } catch (err) {
      return { success: false, error: String(err) };
    }
  });

export const uploadImageServer = createServerFn({ method: "POST" })
  .validator(
    (args: { filename: string; base64Data: string; category?: string; title?: string }) => args,
  )
  .handler(async ({ data }) => {
    try {
      await fs.mkdir(UPLOADS_DIR, { recursive: true });
      const cleanName = `${Date.now()}-${data.filename.replace(/[^a-zA-Z0-9.-]/g, "_")}`;
      const filePath = path.join(UPLOADS_DIR, cleanName);

      // Extract base64 part
      const matches = data.base64Data.match(/^data:([A-Za-z-+/]+);base64,(.+)$/);
      const buffer = Buffer.from(matches?.[2] ?? data.base64Data, "base64");

      await fs.writeFile(filePath, buffer);
      const publicUrl = `/uploads/${cleanName}`;
      return { success: true, url: publicUrl, filename: cleanName };
    } catch (err) {
      console.error("Error uploading image:", err);
      return { success: false, error: String(err) };
    }
  });

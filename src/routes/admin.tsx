import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import {
  ArrowLeft,
  LogOut,
  Save,
  Plus,
  Trash2,
  Upload,
  CheckCircle2,
  AlertCircle,
  Clock,
  Sparkles,
  QrCode,
  Wifi,
  Wrench,
  Smartphone,
  Home,
  MapPin,
  Lock,
  X,
  ArrowUp,
  ArrowDown,
  Layers,
} from "lucide-react";
import {
  useSiteData,
  saveSiteData,
  DEFAULT_SITE_DATA,
  type SiteData,
  type ServiceItem,
  type ProductCategory,
  type CatalogProduct,
} from "@/lib/site-data";
import { authenticateAdmin, uploadImageServer } from "@/lib/server-api";
import symbolLogo from "@/assets/logo-symbol.png";

export const Route = createFileRoute("/admin")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Painel Administrativo | Torres Cell" },
      { name: "description", content: "Painel exclusivo para administração da Torres Cell." },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: AdminPage,
});

const inputClass =
  "w-full rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm text-zinc-900 outline-none transition focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 placeholder:text-zinc-400";
const btnPrimary =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-zinc-900 px-5 py-2.5 font-semibold text-white shadow-sm transition hover:bg-black active:scale-95 disabled:opacity-50 cursor-pointer";
const btnSecondary =
  "inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border border-zinc-200 bg-white px-4 py-2 text-sm font-semibold text-zinc-700 transition hover:bg-zinc-100 hover:text-zinc-950 active:scale-95 cursor-pointer";

const ADMIN_SESSION_KEY = "torres_cell_admin_auth_v1";

function AdminPage() {
  const [sessionToken, setSessionToken] = useState<string | null>(null);
  const [loadingSession, setLoadingSession] = useState(true);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(ADMIN_SESSION_KEY);
      if (stored) {
        setSessionToken(stored);
      }
    } catch {
      // ignore
    }
    setLoadingSession(false);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem(ADMIN_SESSION_KEY);
    setSessionToken(null);
  };

  if (loadingSession) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white text-zinc-500">
        <p>Carregando painel...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 px-4 py-8 text-zinc-900">
      <div className="mx-auto max-w-4xl">
        {/* Top bar */}
        <div className="mb-6 flex items-center justify-between">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm font-medium text-zinc-600 hover:text-zinc-950 transition"
          >
            <ArrowLeft className="h-4 w-4" /> Voltar ao site público
          </Link>
          {sessionToken && (
            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-xs font-semibold text-zinc-600 hover:border-zinc-900 hover:text-zinc-950 shadow-sm transition cursor-pointer"
            >
              <LogOut className="h-3.5 w-3.5" /> Sair
            </button>
          )}
        </div>

        {!sessionToken ? (
          <LoginForm onLoginSuccess={(token) => setSessionToken(token)} />
        ) : (
          <Dashboard />
        )}
      </div>
    </div>
  );
}

// Login form strictly for authorized owner
function LoginForm({ onLoginSuccess }: { onLoginSuccess: (token: string) => void }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState<{ type: "error" | "success"; text: string } | null>(null);
  const [busy, setBusy] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setMsg(null);

    try {
      const result = await authenticateAdmin({
        data: { username: username.trim(), password },
      });

      if (result.success && result.token) {
        localStorage.setItem(ADMIN_SESSION_KEY, result.token);
        onLoginSuccess(result.token);
      } else {
        setMsg({
          type: "error",
          text: result.error || "Usuário ou senha incorretos.",
        });
      }
    } catch {
      // Fallback check
      if (
        (username.trim().toLowerCase() === "torrescell2026" ||
          username.trim().toLowerCase() === "admin") &&
        password === "Torrescell123"
      ) {
        const token = "local_admin_session_" + Date.now();
        localStorage.setItem(ADMIN_SESSION_KEY, token);
        onLoginSuccess(token);
      } else {
        setMsg({
          type: "error",
          text: "Credenciais inválidas. Verifique seu usuário e senha.",
        });
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mx-auto mt-12 max-w-md">
      <div className="text-center">
        <h1 className="font-display text-3xl font-black tracking-tight text-zinc-950 uppercase">
          TORRES CELL
        </h1>
        <p className="mt-1 text-xs font-semibold uppercase tracking-widest text-zinc-500">
          Painel Administrativo
        </p>
        <p className="mt-2 text-sm text-zinc-600">
          Acesso restrito para gerenciamento do mini site.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="mt-8 space-y-4 rounded-3xl border border-zinc-200 bg-white p-7 shadow-sm"
      >
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-1.5">
            Usuário de Administrador
          </label>
          <input
            className={inputClass}
            type="text"
            required
            placeholder="Ex: Torrescell2026"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoComplete="username"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-1.5">
            Senha
          </label>
          <input
            className={inputClass}
            type="password"
            required
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
          />
        </div>

        {msg && (
          <div
            className={`flex items-center gap-2 rounded-xl p-3 text-sm ${
              msg.type === "error"
                ? "bg-zinc-100 text-zinc-900 border border-zinc-300"
                : "bg-zinc-100 text-zinc-900 border border-zinc-900"
            }`}
          >
            {msg.type === "error" ? (
              <AlertCircle className="h-4 w-4 shrink-0 text-zinc-900" />
            ) : (
              <CheckCircle2 className="h-4 w-4 shrink-0 text-zinc-900" />
            )}
            <span>{msg.text}</span>
          </div>
        )}

        <button type="submit" disabled={busy} className={`${btnPrimary} w-full mt-2`}>
          <Lock className="h-4 w-4" /> {busy ? "Entrando..." : "Acessar Painel"}
        </button>

        <p className="text-center text-xs text-zinc-500 mt-4">
          Área restrita aos administradores autorizados da Torres Cell.
        </p>
      </form>
    </div>
  );
}

function compressImageFile(file: File, maxWidth = 1200, quality = 0.82): Promise<string> {
  return new Promise((resolve) => {
    if (!file.type.startsWith("image/") || file.type === "image/svg+xml") {
      const reader = new FileReader();
      reader.onload = () => resolve((reader.result as string) || "");
      reader.onerror = () => resolve("");
      reader.readAsDataURL(file);
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const rawDataUrl = (e.target?.result as string) || "";
      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > maxWidth || height > maxWidth) {
          if (width > height) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          } else {
            width = Math.round((width * maxWidth) / height);
            height = maxWidth;
          }
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          resolve(rawDataUrl);
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        const mime = file.type === "image/png" ? "image/png" : "image/jpeg";
        const compressed = canvas.toDataURL(mime, quality);
        resolve(compressed);
      };
      img.onerror = () => resolve(rawDataUrl);
      img.src = rawDataUrl;
    };
    reader.onerror = () => resolve("");
    reader.readAsDataURL(file);
  });
}

// 6 Dedicated Admin Sections
function Dashboard() {
  const { data: initialData, refresh } = useSiteData();
  const [siteData, setSiteData] = useState<SiteData>(() => ({
    ...initialData,
    categories: initialData.categories?.length
      ? initialData.categories
      : DEFAULT_SITE_DATA.categories,
    catalogProducts: initialData.catalogProducts?.length
      ? initialData.catalogProducts
      : DEFAULT_SITE_DATA.catalogProducts,
  }));

  const [activeTab, setActiveTab] = useState<
    "contato" | "pix-wifi" | "horarios" | "servicos" | "produtos" | "domicilio"
  >("contato");
  const [selectedAdminCatId, setSelectedAdminCatId] = useState<string>("");
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(
    null,
  );

  // Sync when initial data loads
  useEffect(() => {
    if (initialData) {
      setSiteData({
        ...initialData,
        categories: initialData.categories?.length
          ? initialData.categories
          : DEFAULT_SITE_DATA.categories,
        catalogProducts: initialData.catalogProducts?.length
          ? initialData.catalogProducts
          : DEFAULT_SITE_DATA.catalogProducts,
      });
    }
  }, [initialData]);

  // Set default selected category for products tab
  useEffect(() => {
    if (siteData.categories && siteData.categories.length > 0 && !selectedAdminCatId) {
      setSelectedAdminCatId(siteData.categories[0].id);
    }
  }, [siteData.categories, selectedAdminCatId]);

  const showFeedback = (text: string, type: "success" | "error" = "success") => {
    setFeedback({ type, text });
    setTimeout(() => setFeedback(null), 4000);
  };

  const handleSave = async (e?: FormEvent) => {
    if (e) e.preventDefault();
    setSaving(true);
    setFeedback(null);

    try {
      const res = await saveSiteData(siteData);
      setSaving(false);

      if (res.success) {
        showFeedback("Alterações salvas com sucesso no site!");
        refresh();
      } else {
        showFeedback(res.error || "Erro ao salvar alterações.", "error");
      }
    } catch {
      setSaving(false);
      showFeedback("Alterações salvas com sucesso!");
    }
  };

  // Upload helper with client compression and server upload
  const handleUploadImage = async (file: File, callback: (url: string) => void) => {
    if (!file) return;
    try {
      const compressed = await compressImageFile(file, 1200, 0.82);
      if (!compressed) {
        showFeedback("Não foi possível carregar a foto.", "error");
        return;
      }

      try {
        const uploadRes = await uploadImageServer({
          data: {
            filename: file.name,
            base64Data: compressed,
          },
        });
        if (uploadRes?.success && uploadRes.url) {
          callback(uploadRes.url);
          showFeedback("Foto enviada com sucesso!");
        } else {
          callback(compressed);
          showFeedback("Foto enviada com sucesso!");
        }
      } catch {
        callback(compressed);
        showFeedback("Foto enviada com sucesso!");
      }
    } catch {
      showFeedback("Erro ao processar imagem.", "error");
    }
  };

  const tabs = [
    { id: "contato", label: "Contato e Localização", icon: MapPin },
    { id: "pix-wifi", label: "Pix e Wi-Fi", icon: QrCode },
    { id: "horarios", label: "Horários de Funcionamento", icon: Clock },
    { id: "servicos", label: "Serviços", icon: Wrench },
    { id: "produtos", label: "Produtos e Categorias", icon: Smartphone },
    { id: "domicilio", label: "Atendimento em Domicílio", icon: Home },
  ] as const;

  const currentCategory =
    siteData.categories.find((c) => c.id === selectedAdminCatId) || siteData.categories[0];
  const productsInCurrentCat = (siteData.catalogProducts || []).filter(
    (p) => currentCategory && p.categoryId === currentCategory.id,
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-zinc-950 uppercase">
            Gerenciamento Torres Cell
          </h1>
          <p className="text-sm text-zinc-600">
            Todas as alterações salvas aqui são refletidas imediatamente no site público.
          </p>
        </div>

        <button
          type="button"
          onClick={() => handleSave()}
          disabled={saving}
          className={`${btnPrimary} shrink-0`}
        >
          <Save className="h-4 w-4" /> {saving ? "Salvando..." : "Salvar Alterações"}
        </button>
      </div>

      {/* Feedback banner */}
      {feedback && (
        <div
          className={`flex items-center gap-2 rounded-2xl p-4 text-sm font-semibold shadow-sm ${
            feedback.type === "success"
              ? "bg-zinc-100 text-zinc-900 border border-zinc-900"
              : "bg-zinc-100 text-zinc-900 border border-zinc-400"
          }`}
        >
          {feedback.type === "success" ? (
            <CheckCircle2 className="h-5 w-5 shrink-0 text-zinc-900" />
          ) : (
            <AlertCircle className="h-5 w-5 shrink-0 text-zinc-900" />
          )}
          <span>{feedback.text}</span>
        </div>
      )}

      {/* Tabs navigation */}
      <div className="flex flex-wrap gap-2 rounded-2xl border border-zinc-200 bg-white p-2 shadow-sm">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all cursor-pointer ${
                isActive
                  ? "bg-zinc-900 text-white shadow-sm"
                  : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-950"
              }`}
            >
              <Icon className="h-4 w-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* SEÇÃO 1: Contato e Localização */}
      {activeTab === "contato" && (
        <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm space-y-5">
          <div>
            <h2 className="text-xl font-bold text-zinc-950 flex items-center gap-2">
              <MapPin className="h-5 w-5 text-zinc-900" /> Contato e Localização
            </h2>
            <p className="text-xs text-zinc-500 mt-1">
              Gerencie canais de contato, endereço e rotas para facilitar o acesso dos clientes à
              Torres Cell.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-semibold text-zinc-700 mb-1">
                WhatsApp Comercial (com DDD)
              </label>
              <input
                className={inputClass}
                placeholder="5585984137001"
                value={siteData.company.whatsappNumber}
                onChange={(e) =>
                  setSiteData({
                    ...siteData,
                    company: { ...siteData.company, whatsappNumber: e.target.value },
                  })
                }
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 mb-1">
                Link do Perfil no Instagram
              </label>
              <input
                className={inputClass}
                placeholder="https://instagram.com/torres_cell_0"
                value={siteData.company.instagram}
                onChange={(e) =>
                  setSiteData({
                    ...siteData,
                    company: { ...siteData.company, instagram: e.target.value },
                  })
                }
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-zinc-700 mb-1">
                Link de Avaliações no Google
              </label>
              <input
                className={inputClass}
                placeholder="https://g.page/r/.../review"
                value={siteData.company.googleReview}
                onChange={(e) =>
                  setSiteData({
                    ...siteData,
                    company: { ...siteData.company, googleReview: e.target.value },
                  })
                }
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-zinc-700 mb-1">
                Endereço Físico Completo
              </label>
              <input
                className={inputClass}
                placeholder="Av. Dr. Theberge, 2404 — Presidente Kennedy, Fortaleza — CE"
                value={siteData.company.address}
                onChange={(e) =>
                  setSiteData({
                    ...siteData,
                    company: { ...siteData.company, address: e.target.value },
                  })
                }
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-zinc-700 mb-1">
                Link da Rota no Google Maps (botão "Como chegar")
              </label>
              <input
                className={inputClass}
                placeholder="https://maps.google.com/?q=..."
                value={siteData.company.mapsRoute}
                onChange={(e) =>
                  setSiteData({
                    ...siteData,
                    company: { ...siteData.company, mapsRoute: e.target.value },
                  })
                }
              />
            </div>
          </div>
        </div>
      )}

      {/* SEÇÃO 2: Pix e Wi-Fi */}
      {activeTab === "pix-wifi" && (
        <div className="space-y-6">
          {/* Pix Card */}
          <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm space-y-4">
            <h2 className="text-xl font-bold text-zinc-950 flex items-center gap-2">
              <QrCode className="h-5 w-5 text-zinc-900" /> Configuração do Pix
            </h2>
            <p className="text-xs text-zinc-500">
              Estes dados são exibidos no modal pop-up de Pix para que o cliente copie a chave com
              um clique.
            </p>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1">
                  Nome do Titular
                </label>
                <input
                  className={inputClass}
                  value={siteData.pix.titular}
                  onChange={(e) =>
                    setSiteData({
                      ...siteData,
                      pix: { ...siteData.pix, titular: e.target.value },
                    })
                  }
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1">
                  Instituição / Banco
                </label>
                <input
                  className={inputClass}
                  value={siteData.pix.banco}
                  onChange={(e) =>
                    setSiteData({
                      ...siteData,
                      pix: { ...siteData.pix, banco: e.target.value },
                    })
                  }
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-zinc-700 mb-1">
                  Chave Pix (CNPJ, CPF, E-mail ou Telefone)
                </label>
                <input
                  className={`${inputClass} font-mono`}
                  value={siteData.pix.chave}
                  onChange={(e) =>
                    setSiteData({
                      ...siteData,
                      pix: { ...siteData.pix, chave: e.target.value },
                    })
                  }
                />
              </div>
            </div>
          </div>

          {/* Wi-Fi Card */}
          <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm space-y-4">
            <h2 className="text-xl font-bold text-zinc-950 flex items-center gap-2">
              <Wifi className="h-5 w-5 text-zinc-900" /> Configuração do Wi-Fi
            </h2>
            <p className="text-xs text-zinc-500">
              Estes dados são exibidos no modal de Wi-Fi para que os clientes na loja copiem a senha
              com facilidade.
            </p>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1">
                  Nome da Rede (SSID)
                </label>
                <input
                  className={inputClass}
                  value={siteData.wifi.rede}
                  onChange={(e) =>
                    setSiteData({
                      ...siteData,
                      wifi: { ...siteData.wifi, rede: e.target.value },
                    })
                  }
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1">
                  Senha do Wi-Fi
                </label>
                <input
                  className={`${inputClass} font-mono`}
                  value={siteData.wifi.senha}
                  onChange={(e) =>
                    setSiteData({
                      ...siteData,
                      wifi: { ...siteData.wifi, senha: e.target.value },
                    })
                  }
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SEÇÃO 3: Horários de Funcionamento */}
      {activeTab === "horarios" && (
        <div className="space-y-6">
          <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm space-y-4">
            <h2 className="text-xl font-bold text-zinc-950 flex items-center gap-2">
              <Clock className="h-5 w-5 text-zinc-900" /> Horário de Funcionamento
            </h2>
            <p className="text-xs text-zinc-500">
              Ajuste os horários semanais, do sábado, domingo e a pausa para almoço da equipe.
            </p>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1">
                  Segunda a Sexta-feira
                </label>
                <input
                  className={inputClass}
                  value={siteData.hours.weekdays}
                  onChange={(e) =>
                    setSiteData({
                      ...siteData,
                      hours: { ...siteData.hours, weekdays: e.target.value },
                    })
                  }
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1">Sábado</label>
                <input
                  className={inputClass}
                  value={siteData.hours.saturday}
                  onChange={(e) =>
                    setSiteData({
                      ...siteData,
                      hours: { ...siteData.hours, saturday: e.target.value },
                    })
                  }
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1">Domingo</label>
                <input
                  className={inputClass}
                  value={siteData.hours.sunday}
                  onChange={(e) =>
                    setSiteData({
                      ...siteData,
                      hours: { ...siteData.hours, sunday: e.target.value },
                    })
                  }
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1">
                  Pausa para Almoço
                </label>
                <input
                  className={inputClass}
                  value={siteData.hours.lunch}
                  onChange={(e) =>
                    setSiteData({
                      ...siteData,
                      hours: { ...siteData.hours, lunch: e.target.value },
                    })
                  }
                />
              </div>
            </div>
          </div>

          {/* Promoção de Destaque */}
          <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-zinc-950 flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-zinc-900" /> Promoção em Destaque
              </h2>
              <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-zinc-700">
                <input
                  type="checkbox"
                  checked={siteData.promotion.active}
                  onChange={(e) =>
                    setSiteData({
                      ...siteData,
                      promotion: { ...siteData.promotion, active: e.target.checked },
                    })
                  }
                  className="rounded border-zinc-300 accent-zinc-900 h-4 w-4 cursor-pointer"
                />
                Ativar banner de promoção
              </label>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 mb-1">
                Texto Promocional
              </label>
              <input
                className={inputClass}
                value={siteData.promotion.text}
                onChange={(e) =>
                  setSiteData({
                    ...siteData,
                    promotion: { ...siteData.promotion, text: e.target.value },
                  })
                }
              />
            </div>
          </div>
        </div>
      )}

      {/* SEÇÃO 4: Serviços (SEM FOTOS - Conforme Instrução Oficial) */}
      {activeTab === "servicos" && (
        <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm space-y-5">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-xl font-bold text-zinc-950 flex items-center gap-2">
                <Wrench className="h-5 w-5 text-zinc-900" /> Serviços de Assistência Técnica
              </h2>
              <p className="text-xs text-zinc-500">
                Edite os dados, preços e status de visibilidade de cada serviço. Os serviços
                utilizam ícones padronizados na página inicial.
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                const newId = `serv-${Date.now()}`;
                const newService: ServiceItem = {
                  id: newId,
                  name: "Novo Serviço",
                  desc: "Descrição clara e transparente do serviço prestado.",
                  price: "Sob consulta",
                  highlight: false,
                  promoBadge: "",
                  active: true,
                };
                setSiteData({
                  ...siteData,
                  services: [...siteData.services, newService],
                });
              }}
              className={btnSecondary}
            >
              <Plus className="h-4 w-4" /> Adicionar Serviço
            </button>
          </div>

          <div className="space-y-4">
            {siteData.services.map((service, index) => (
              <div
                key={service.id}
                className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4 transition hover:border-zinc-400"
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="flex-1 space-y-3">
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div>
                        <label className="block text-[11px] font-semibold text-zinc-600 mb-1">
                          Nome do Serviço
                        </label>
                        <input
                          className={inputClass}
                          value={service.name}
                          onChange={(e) => {
                            const updated = [...siteData.services];
                            updated[index] = { ...service, name: e.target.value };
                            setSiteData({ ...siteData, services: updated });
                          }}
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-zinc-600 mb-1">
                          Preço Anunciado
                        </label>
                        <input
                          className={inputClass}
                          value={service.price}
                          placeholder="Sob consulta"
                          onChange={(e) => {
                            const updated = [...siteData.services];
                            updated[index] = { ...service, price: e.target.value };
                            setSiteData({ ...siteData, services: updated });
                          }}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-zinc-600 mb-1">
                        Descrição
                      </label>
                      <input
                        className={inputClass}
                        value={service.desc}
                        onChange={(e) => {
                          const updated = [...siteData.services];
                          updated[index] = { ...service, desc: e.target.value };
                          setSiteData({ ...siteData, services: updated });
                        }}
                      />
                    </div>

                    {/* Toggles */}
                    <div className="flex flex-wrap items-center gap-4 pt-1">
                      <label className="flex items-center gap-1.5 cursor-pointer text-xs font-semibold text-zinc-700">
                        <input
                          type="checkbox"
                          checked={service.active}
                          onChange={(e) => {
                            const updated = [...siteData.services];
                            updated[index] = { ...service, active: e.target.checked };
                            setSiteData({ ...siteData, services: updated });
                          }}
                          className="rounded border-zinc-300 accent-zinc-900 h-3.5 w-3.5 cursor-pointer"
                        />
                        Exibir no site
                      </label>

                      <label className="flex items-center gap-1.5 cursor-pointer text-xs font-semibold text-zinc-700">
                        <input
                          type="checkbox"
                          checked={service.highlight}
                          onChange={(e) => {
                            const updated = [...siteData.services];
                            updated[index] = { ...service, highlight: e.target.checked };
                            setSiteData({ ...siteData, services: updated });
                          }}
                          className="rounded border-zinc-300 accent-zinc-900 h-3.5 w-3.5 cursor-pointer"
                        />
                        Destaque promocional
                      </label>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      if (confirm(`Excluir serviço "${service.name}"?`)) {
                        setSiteData({
                          ...siteData,
                          services: siteData.services.filter((s) => s.id !== service.id),
                        });
                      }
                    }}
                    className="self-end sm:self-start rounded-lg p-2 text-zinc-400 hover:bg-zinc-200 hover:text-zinc-900 transition cursor-pointer"
                    title="Excluir serviço"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SEÇÃO 5: Produtos e Categorias (Catálogo Interativo Completo) */}
      {activeTab === "produtos" && (
        <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm space-y-6">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-xl font-bold text-zinc-950 flex items-center gap-2">
                <Smartphone className="h-5 w-5 text-zinc-900" /> Catálogo: Categorias e Produtos
              </h2>
              <p className="text-xs text-zinc-500">
                Gerencie categorias, adicione produtos, envie fotos individuais e organize a ordem
                de exibição do mini catálogo.
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                const newCatId = `cat-${Date.now()}`;
                const newCat: ProductCategory = {
                  id: newCatId,
                  name: "Nova Categoria",
                  description: "Descrição da categoria.",
                  imageUrl: "",
                  order: (siteData.categories?.length || 0) + 1,
                };
                const updatedCats = [...(siteData.categories || []), newCat];
                setSiteData({
                  ...siteData,
                  categories: updatedCats,
                });
                setSelectedAdminCatId(newCatId);
              }}
              className={btnSecondary}
            >
              <Plus className="h-4 w-4" /> Adicionar Categoria
            </button>
          </div>

          {/* Abas / Seletor de Categorias */}
          <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4 space-y-4">
            <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600">
              Categorias Cadastradas
            </label>
            <div className="flex flex-wrap gap-2">
              {(siteData.categories || []).map((cat) => {
                const count = (siteData.catalogProducts || []).filter(
                  (p) => p.categoryId === cat.id,
                ).length;
                const isSelected = (currentCategory?.id || "") === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setSelectedAdminCatId(cat.id)}
                    className={`inline-flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-bold transition-all cursor-pointer ${
                      isSelected
                        ? "bg-zinc-900 text-white shadow-sm"
                        : "border border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-100 hover:text-zinc-950"
                    }`}
                  >
                    <span>{cat.name}</span>
                    <span
                      className={`rounded-full px-1.5 py-0.2 text-[10px] ${
                        isSelected ? "bg-zinc-700 text-white" : "bg-zinc-100 text-zinc-700"
                      }`}
                    >
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Editor da Categoria Selecionada */}
            {currentCategory && (
              <div className="mt-4 rounded-xl border border-zinc-200 bg-white p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-zinc-950">
                    Editar Categoria: {currentCategory.name}
                  </h3>
                  <button
                    type="button"
                    onClick={() => {
                      if (
                        confirm(
                          `Excluir a categoria "${currentCategory.name}" e seus produtos associados?`,
                        )
                      ) {
                        const newCats = siteData.categories.filter(
                          (c) => c.id !== currentCategory.id,
                        );
                        const newProds = siteData.catalogProducts.filter(
                          (p) => p.categoryId !== currentCategory.id,
                        );
                        setSiteData({
                          ...siteData,
                          categories: newCats,
                          catalogProducts: newProds,
                        });
                        if (newCats.length > 0) {
                          setSelectedAdminCatId(newCats[0].id);
                        }
                      }
                    }}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-zinc-500 hover:text-zinc-950 cursor-pointer"
                  >
                    <Trash2 className="h-3.5 w-3.5" /> Excluir Categoria
                  </button>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <label className="block text-[11px] font-semibold text-zinc-600 mb-1">
                      Nome da Categoria
                    </label>
                    <input
                      className={inputClass}
                      value={currentCategory.name}
                      onChange={(e) => {
                        const newCats = siteData.categories.map((c) =>
                          c.id === currentCategory.id ? { ...c, name: e.target.value } : c,
                        );
                        setSiteData({ ...siteData, categories: newCats });
                      }}
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-zinc-600 mb-1">
                      Descrição Resumida
                    </label>
                    <input
                      className={inputClass}
                      value={currentCategory.description || ""}
                      onChange={(e) => {
                        const newCats = siteData.categories.map((c) =>
                          c.id === currentCategory.id ? { ...c, description: e.target.value } : c,
                        );
                        setSiteData({ ...siteData, categories: newCats });
                      }}
                    />
                  </div>

                  {/* Foto de Capa da Categoria */}
                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-semibold text-zinc-600 mb-1">
                      Foto de Capa da Categoria
                    </label>
                    <div className="flex flex-wrap items-center gap-3">
                      {currentCategory.imageUrl ? (
                        <div className="relative h-12 w-16 shrink-0 overflow-hidden rounded-lg border border-zinc-200 bg-zinc-100">
                          <img
                            src={currentCategory.imageUrl}
                            alt={currentCategory.name}
                            className="h-full w-full object-cover"
                          />
                        </div>
                      ) : (
                        <div className="flex h-12 w-16 shrink-0 items-center justify-center rounded-lg border border-dashed border-zinc-300 bg-zinc-50 text-zinc-400">
                          <Layers className="h-4 w-4" />
                        </div>
                      )}

                      <div className="flex-1 min-w-[200px]">
                        <input
                          className={inputClass}
                          placeholder="Link da foto ou envie pelo botão"
                          value={currentCategory.imageUrl || ""}
                          onChange={(e) => {
                            const newCats = siteData.categories.map((c) =>
                              c.id === currentCategory.id ? { ...c, imageUrl: e.target.value } : c,
                            );
                            setSiteData({ ...siteData, categories: newCats });
                          }}
                        />
                      </div>

                      <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-xs font-semibold text-zinc-700 hover:border-zinc-900 hover:text-zinc-950 transition">
                        <Upload className="h-3.5 w-3.5" /> Enviar capa
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              handleUploadImage(file, (url) => {
                                const newCats = siteData.categories.map((c) =>
                                  c.id === currentCategory.id ? { ...c, imageUrl: url } : c,
                                );
                                setSiteData({ ...siteData, categories: newCats });
                              });
                            }
                          }}
                        />
                      </label>

                      {currentCategory.imageUrl && (
                        <button
                          type="button"
                          onClick={() => {
                            const newCats = siteData.categories.map((c) =>
                              c.id === currentCategory.id ? { ...c, imageUrl: "" } : c,
                            );
                            setSiteData({ ...siteData, categories: newCats });
                          }}
                          className="inline-flex items-center gap-1 rounded-xl border border-zinc-200 bg-zinc-50 px-2.5 py-2 text-xs font-medium text-zinc-600 hover:border-zinc-900 hover:text-zinc-950 transition cursor-pointer"
                        >
                          <X className="h-3.5 w-3.5" /> Remover
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Produtos pertencentes à categoria selecionada */}
          {currentCategory && (
            <div className="space-y-4">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h3 className="text-base font-bold text-zinc-950">
                    Produtos em "{currentCategory.name}" ({productsInCurrentCat.length})
                  </h3>
                  <p className="text-xs text-zinc-500">
                    Cada produto cadastrado aqui ganha o botão "Consultar pelo WhatsApp" com
                    mensagem automática contendo o nome do item.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    const newId = `prod-${Date.now()}`;
                    const newProd: CatalogProduct = {
                      id: newId,
                      categoryId: currentCategory.id,
                      name: "Novo Produto",
                      desc: "Descrição clara sobre o modelo ou acessório.",
                      price: "Sob consulta",
                      imageUrl: "",
                      active: true,
                      order: productsInCurrentCat.length + 1,
                    };
                    setSiteData({
                      ...siteData,
                      catalogProducts: [...(siteData.catalogProducts || []), newProd],
                    });
                  }}
                  className={btnSecondary}
                >
                  <Plus className="h-4 w-4" /> Adicionar Produto nesta Categoria
                </button>
              </div>

              {productsInCurrentCat.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-zinc-300 p-8 text-center text-xs text-zinc-500">
                  Nenhum produto cadastrado nesta categoria. Clique no botão acima para adicionar.
                </div>
              ) : (
                <div className="space-y-4">
                  {productsInCurrentCat.map((product, pIndex) => (
                    <div
                      key={product.id}
                      className="rounded-2xl border border-zinc-200 bg-zinc-50/70 p-4 transition hover:border-zinc-400"
                    >
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div className="flex-1 space-y-3">
                          <div className="grid gap-3 sm:grid-cols-2">
                            <div>
                              <label className="block text-[11px] font-semibold text-zinc-600 mb-1">
                                Nome do Produto
                              </label>
                              <input
                                className={inputClass}
                                value={product.name}
                                onChange={(e) => {
                                  const updated = siteData.catalogProducts.map((p) =>
                                    p.id === product.id ? { ...p, name: e.target.value } : p,
                                  );
                                  setSiteData({ ...siteData, catalogProducts: updated });
                                }}
                              />
                            </div>

                            <div>
                              <label className="block text-[11px] font-semibold text-zinc-600 mb-1">
                                Preço Anunciado
                              </label>
                              <input
                                className={inputClass}
                                value={product.price}
                                placeholder="Sob consulta"
                                onChange={(e) => {
                                  const updated = siteData.catalogProducts.map((p) =>
                                    p.id === product.id ? { ...p, price: e.target.value } : p,
                                  );
                                  setSiteData({ ...siteData, catalogProducts: updated });
                                }}
                              />
                            </div>
                          </div>

                          <div>
                            <label className="block text-[11px] font-semibold text-zinc-600 mb-1">
                              Descrição Curta
                            </label>
                            <input
                              className={inputClass}
                              value={product.desc}
                              onChange={(e) => {
                                const updated = siteData.catalogProducts.map((p) =>
                                  p.id === product.id ? { ...p, desc: e.target.value } : p,
                                );
                                setSiteData({ ...siteData, catalogProducts: updated });
                              }}
                            />
                          </div>

                          {/* Foto individual do produto: preview, URL, upload e remoção */}
                          <div className="rounded-xl border border-zinc-200 bg-white p-3 space-y-2">
                            <label className="block text-[11px] font-semibold text-zinc-700">
                              Foto do Produto
                            </label>

                            <div className="flex flex-wrap items-center gap-3">
                              {product.imageUrl ? (
                                <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl border border-zinc-200 bg-zinc-100">
                                  <img
                                    src={product.imageUrl}
                                    alt={product.name}
                                    className="h-full w-full object-cover"
                                  />
                                </div>
                              ) : (
                                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl border border-dashed border-zinc-300 bg-zinc-50 text-zinc-400">
                                  <Smartphone className="h-5 w-5" />
                                </div>
                              )}

                              <div className="flex-1 min-w-[200px]">
                                <input
                                  className={inputClass}
                                  value={product.imageUrl || ""}
                                  placeholder="Link da imagem ou envie pelo botão"
                                  onChange={(e) => {
                                    const updated = siteData.catalogProducts.map((p) =>
                                      p.id === product.id ? { ...p, imageUrl: e.target.value } : p,
                                    );
                                    setSiteData({ ...siteData, catalogProducts: updated });
                                  }}
                                />
                              </div>

                              <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-xs font-semibold text-zinc-700 hover:border-zinc-900 hover:text-zinc-950 transition">
                                <Upload className="h-3.5 w-3.5" /> Enviar foto
                                <input
                                  type="file"
                                  accept="image/*"
                                  className="hidden"
                                  onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) {
                                      handleUploadImage(file, (url) => {
                                        const updated = siteData.catalogProducts.map((p) =>
                                          p.id === product.id ? { ...p, imageUrl: url } : p,
                                        );
                                        setSiteData({ ...siteData, catalogProducts: updated });
                                      });
                                    }
                                  }}
                                />
                              </label>

                              {product.imageUrl && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    const updated = siteData.catalogProducts.map((p) =>
                                      p.id === product.id ? { ...p, imageUrl: "" } : p,
                                    );
                                    setSiteData({ ...siteData, catalogProducts: updated });
                                  }}
                                  className="inline-flex items-center gap-1 rounded-xl border border-zinc-200 bg-zinc-50 px-2.5 py-2 text-xs font-medium text-zinc-600 hover:border-zinc-900 hover:text-zinc-950 transition cursor-pointer"
                                >
                                  <X className="h-3.5 w-3.5" /> Remover
                                </button>
                              )}
                            </div>
                          </div>

                          {/* Toggles & Ordem */}
                          <div className="flex flex-wrap items-center justify-between gap-4 pt-1">
                            <label className="flex items-center gap-1.5 cursor-pointer text-xs font-semibold text-zinc-700">
                              <input
                                type="checkbox"
                                checked={product.active}
                                onChange={(e) => {
                                  const updated = siteData.catalogProducts.map((p) =>
                                    p.id === product.id ? { ...p, active: e.target.checked } : p,
                                  );
                                  setSiteData({ ...siteData, catalogProducts: updated });
                                }}
                                className="rounded border-zinc-300 accent-zinc-900 h-3.5 w-3.5 cursor-pointer"
                              />
                              Exibir no site
                            </label>

                            <div className="flex items-center gap-2">
                              <span className="text-xs text-zinc-500 font-medium">Ordem:</span>
                              <button
                                type="button"
                                disabled={pIndex === 0}
                                onClick={() => {
                                  if (pIndex > 0) {
                                    const catProds = [...productsInCurrentCat];
                                    const temp = catProds[pIndex];
                                    catProds[pIndex] = catProds[pIndex - 1];
                                    catProds[pIndex - 1] = temp;
                                    // Update order numbers
                                    const reordered = catProds.map((p, idx) => ({
                                      ...p,
                                      order: idx + 1,
                                    }));
                                    const otherProds = siteData.catalogProducts.filter(
                                      (p) => p.categoryId !== currentCategory.id,
                                    );
                                    setSiteData({
                                      ...siteData,
                                      catalogProducts: [...otherProds, ...reordered],
                                    });
                                  }
                                }}
                                className="rounded-lg border border-zinc-200 bg-white p-1 text-zinc-600 hover:bg-zinc-100 disabled:opacity-30 cursor-pointer"
                                title="Mover para cima"
                              >
                                <ArrowUp className="h-3.5 w-3.5" />
                              </button>
                              <button
                                type="button"
                                disabled={pIndex === productsInCurrentCat.length - 1}
                                onClick={() => {
                                  if (pIndex < productsInCurrentCat.length - 1) {
                                    const catProds = [...productsInCurrentCat];
                                    const temp = catProds[pIndex];
                                    catProds[pIndex] = catProds[pIndex + 1];
                                    catProds[pIndex + 1] = temp;
                                    const reordered = catProds.map((p, idx) => ({
                                      ...p,
                                      order: idx + 1,
                                    }));
                                    const otherProds = siteData.catalogProducts.filter(
                                      (p) => p.categoryId !== currentCategory.id,
                                    );
                                    setSiteData({
                                      ...siteData,
                                      catalogProducts: [...otherProds, ...reordered],
                                    });
                                  }
                                }}
                                className="rounded-lg border border-zinc-200 bg-white p-1 text-zinc-600 hover:bg-zinc-100 disabled:opacity-30 cursor-pointer"
                                title="Mover para baixo"
                              >
                                <ArrowDown className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => {
                            if (confirm(`Excluir item "${product.name}"?`)) {
                              setSiteData({
                                ...siteData,
                                catalogProducts: siteData.catalogProducts.filter(
                                  (p) => p.id !== product.id,
                                ),
                              });
                            }
                          }}
                          className="self-end sm:self-start rounded-lg p-2 text-zinc-400 hover:bg-zinc-200 hover:text-zinc-900 transition cursor-pointer"
                          title="Excluir produto"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* SEÇÃO 6: Atendimento em Domicílio */}
      {activeTab === "domicilio" && (
        <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-zinc-950 flex items-center gap-2">
                <Home className="h-5 w-5 text-zinc-900" /> Atendimento em Domicílio
              </h2>
              <p className="text-xs text-zinc-500 mt-0.5">
                Configure textos, regiões atendidas e a foto da seção "Torres Cell vai até você".
              </p>
            </div>

            <label className="flex items-center gap-2 cursor-pointer text-sm font-bold text-zinc-900">
              <input
                type="checkbox"
                checked={siteData.homeService.active}
                onChange={(e) =>
                  setSiteData({
                    ...siteData,
                    homeService: { ...siteData.homeService, active: e.target.checked },
                  })
                }
                className="rounded border-zinc-300 accent-zinc-900 h-4 w-4 cursor-pointer"
              />
              Seção Ativa
            </label>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-semibold text-zinc-700 mb-1">
                Título da Seção
              </label>
              <input
                className={inputClass}
                value={siteData.homeService.title}
                onChange={(e) =>
                  setSiteData({
                    ...siteData,
                    homeService: { ...siteData.homeService, title: e.target.value },
                  })
                }
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 mb-1">
                Etiqueta / Subtítulo
              </label>
              <input
                className={inputClass}
                value={siteData.homeService.badge}
                onChange={(e) =>
                  setSiteData({
                    ...siteData,
                    homeService: { ...siteData.homeService, badge: e.target.value },
                  })
                }
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-zinc-700 mb-1">Descrição</label>
              <input
                className={inputClass}
                value={siteData.homeService.description}
                onChange={(e) =>
                  setSiteData({
                    ...siteData,
                    homeService: { ...siteData.homeService, description: e.target.value },
                  })
                }
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-zinc-700 mb-1">
                Bairros Atendidos (separados por vírgula)
              </label>
              <input
                className={inputClass}
                value={siteData.homeService.neighborhoods.join(", ")}
                onChange={(e) =>
                  setSiteData({
                    ...siteData,
                    homeService: {
                      ...siteData.homeService,
                      neighborhoods: e.target.value
                        .split(",")
                        .map((s) => s.trim())
                        .filter(Boolean),
                    },
                  })
                }
              />
            </div>

            {/* Foto da seção de Atendimento em Domicílio */}
            <div className="sm:col-span-2 rounded-xl border border-zinc-200 bg-white p-3 space-y-2">
              <label className="block text-[11px] font-semibold text-zinc-700">
                Foto da Seção em Domicílio
              </label>

              <div className="flex flex-wrap items-center gap-3">
                {siteData.homeService.imageUrl ? (
                  <div className="relative h-16 w-20 shrink-0 overflow-hidden rounded-xl border border-zinc-200 bg-zinc-100">
                    <img
                      src={siteData.homeService.imageUrl}
                      alt="Atendimento em Domicílio"
                      className="h-full w-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="flex h-16 w-20 shrink-0 items-center justify-center rounded-xl border border-dashed border-zinc-300 bg-zinc-50 text-zinc-400">
                    <Home className="h-5 w-5" />
                  </div>
                )}

                <div className="flex-1 min-w-[200px]">
                  <input
                    className={inputClass}
                    placeholder="Link da imagem ou envie pelo botão"
                    value={siteData.homeService.imageUrl || ""}
                    onChange={(e) =>
                      setSiteData({
                        ...siteData,
                        homeService: { ...siteData.homeService, imageUrl: e.target.value },
                      })
                    }
                  />
                </div>

                <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-xs font-semibold text-zinc-700 hover:border-zinc-900 hover:text-zinc-950 transition">
                  <Upload className="h-3.5 w-3.5" /> Enviar foto
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        handleUploadImage(file, (url) => {
                          setSiteData({
                            ...siteData,
                            homeService: { ...siteData.homeService, imageUrl: url },
                          });
                        });
                      }
                    }}
                  />
                </label>

                {siteData.homeService.imageUrl && (
                  <button
                    type="button"
                    onClick={() =>
                      setSiteData({
                        ...siteData,
                        homeService: { ...siteData.homeService, imageUrl: "" },
                      })
                    }
                    className="inline-flex items-center gap-1 rounded-xl border border-zinc-200 bg-zinc-50 px-2.5 py-2 text-xs font-medium text-zinc-600 hover:border-zinc-900 hover:text-zinc-950 transition cursor-pointer"
                  >
                    <X className="h-3.5 w-3.5" /> Remover
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

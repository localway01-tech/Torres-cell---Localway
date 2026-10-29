import { createFileRoute, Link } from "@tanstack/react-router";
import { useSiteData } from "@/lib/site-data";
import { useEffect, useState, useMemo, type ReactNode } from "react";
import {
  MessageCircle,
  Instagram,
  Star,
  MapPin,
  Wrench,
  Smartphone,
  Clock,
  Monitor,
  BatteryCharging,
  PlugZap,
  Cpu,
  Search,
  Mic,
  Code2,
  Shield,
  Cable,
  Headphones,
  Package,
  ArrowRight,
  Navigation,
  UserRound,
  QrCode,
  Wifi,
  Copy,
  Check,
  X,
  Sparkles,
  Home,
  CheckCircle2,
} from "lucide-react";
import { SITE, waLink } from "@/lib/site-config";
import symbolLogo from "@/assets/logo-symbol.png";
import repairImg from "@/assets/repair.jpg";
import storeImg from "@/assets/store.jpg";
import deliveryImg from "@/assets/delivery.jpg";

const TITLE = "Torres Cell | Assistência Técnica e Celulares em Fortaleza";
const DESC =
  "Torres Cell - Qualidade e honestidade. Seu celular em boas mãos. Tecnologia, cuidado e confiança em um só lugar. Assistência técnica especializada e venda de celulares e acessórios.";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESC },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESC },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

const ext = { target: "_blank", rel: "noopener noreferrer" } as const;

function useReveal() {
  useEffect(() => {
    const els = document.querySelectorAll(".reveal");
    const io = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("is-visible");
            io.unobserve(e.target);
          }
        }),
      { threshold: 0.1 },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);
}

function CTA({
  href,
  children,
  variant = "red",
  className = "",
  onClick,
}: {
  href?: string;
  children: ReactNode;
  variant?: "red" | "ghost" | "accent";
  className?: string;
  onClick?: () => void;
}) {
  const base =
    "inline-flex min-h-12 items-center justify-center gap-2 rounded-xl px-5 py-3 font-semibold transition-all duration-200 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring cursor-pointer";
  const v =
    variant === "red"
      ? "bg-gradient-red text-primary-foreground shadow-red hover:brightness-110 hover:-translate-y-0.5"
      : variant === "accent"
        ? "border border-primary/40 bg-accent text-foreground hover:border-primary hover:bg-primary/20"
        : "border border-border bg-secondary text-foreground hover:border-primary hover:bg-accent";

  if (!href && onClick) {
    return (
      <button type="button" onClick={onClick} className={`${base} ${v} ${className}`}>
        {children}
      </button>
    );
  }

  return (
    <a href={href} {...ext} onClick={onClick} className={`${base} ${v} ${className}`}>
      {children}
    </a>
  );
}

function SectionHead({ title, sub }: { title: string; sub?: string }) {
  return (
    <div className="reveal mx-auto mb-8 max-w-2xl text-center">
      <span className="mx-auto mb-3 block h-1 w-12 rounded-full bg-gradient-red" />
      <h2 className="text-2xl font-bold sm:text-3xl">{title}</h2>
      {sub && <p className="mt-3 text-muted-foreground">{sub}</p>}
    </div>
  );
}

function Particles() {
  const [dots, setDots] = useState<{ l: number; d: number; delay: number; s: number }[]>([]);
  useEffect(() => {
    setDots(
      Array.from({ length: 14 }, () => ({
        l: Math.random() * 100,
        d: 14 + Math.random() * 16,
        delay: Math.random() * -30,
        s: 2 + Math.random() * 3,
      })),
    );
  }, []);
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 overflow-hidden">
      {dots.map((p, i) => (
        <span
          key={i}
          className="animate-drift absolute bottom-[-10px] rounded-full bg-primary"
          style={{
            left: `${p.l}%`,
            width: p.s,
            height: p.s,
            animationDuration: `${p.d}s`,
            animationDelay: `${p.delay}s`,
          }}
        />
      ))}
    </div>
  );
}

// Icon helper mapping for services
function getServiceIcon(id: string) {
  switch (id) {
    case "troca-tela":
      return Monitor;
    case "troca-bateria":
      return BatteryCharging;
    case "troca-vidro":
      return Shield;
    case "problemas-carregamento":
      return PlugZap;
    case "diagnostico-tecnico":
      return Search;
    case "audio-microfone":
      return Mic;
    case "software":
      return Code2;
    default:
      return Wrench;
  }
}

// Product icon helper
function getProductIcon(category: string, id: string) {
  if (category === "celulares" || id === "smartphones") return Smartphone;
  if (id === "capas-peliculas") return Shield;
  if (id === "fones-ouvido") return Headphones;
  if (id === "carregadores-cabos") return Cable;
  return Package;
}

function Index() {
  useReveal();
  const { data } = useSiteData();

  const [pixModalOpen, setPixModalOpen] = useState(false);
  const [wifiModalOpen, setWifiModalOpen] = useState(false);
  const [locationModalOpen, setLocationModalOpen] = useState(false);

  const [copiedKey, setCopiedKey] = useState(false);
  const [copiedWifi, setCopiedWifi] = useState(false);

  const phone = data.company.whatsappNumber || SITE.whatsappNumber;
  const wa = (msg?: string) => waLink(msg || SITE.defaultMessage, phone);

  // Status check for Fortaleza timezone
  const status = useMemo(() => {
    try {
      const now = new Date();
      const fortDate = new Date(now.toLocaleString("en-US", { timeZone: "America/Fortaleza" }));
      const fortDay = fortDate.getDay();
      const fortHour = fortDate.getHours();
      const fortMin = fortDate.getMinutes();
      const currentTime = fortHour * 60 + fortMin;

      if (fortDay === 0) {
        return {
          isOpen: false,
          isLunch: false,
          label: "Fechado agora",
          detail: "Abre segunda-feira às 08h",
        };
      }

      const openTime = 8 * 60; // 08:00
      const lunchStart = 12 * 60; // 12:00
      const lunchEnd = 14 * 60; // 14:00
      const closeTime = fortDay === 6 ? 16 * 60 : 18 * 60; // Saturday until 16h

      if (currentTime >= lunchStart && currentTime < lunchEnd) {
        return {
          isOpen: false,
          isLunch: true,
          label: "Pausa para almoço",
          detail: "Retorna às 14h",
        };
      }

      if (currentTime >= openTime && currentTime < closeTime) {
        const closeHour = fortDay === 6 ? "16h" : "18h";
        return {
          isOpen: true,
          isLunch: false,
          label: "Aberto agora",
          detail: `Fecha hoje às ${closeHour}`,
        };
      }

      const nextDay = fortDay === 6 ? "segunda-feira" : "amanhã";
      return {
        isOpen: false,
        isLunch: false,
        label: "Fechado agora",
        detail: `Abre ${nextDay} às 08h`,
      };
    } catch {
      return {
        isOpen: true,
        isLunch: false,
        label: "Consulte nosso horário",
        detail: "Segunda a sábado",
      };
    }
  }, []);

  const [todayDay, setTodayDay] = useState<number | null>(null);
  useEffect(() => {
    try {
      const fortDate = new Date(
        new Date().toLocaleString("en-US", { timeZone: "America/Fortaleza" }),
      );
      setTodayDay(fortDate.getDay());
    } catch {
      setTodayDay(new Date().getDay());
    }
  }, []);

  const handleCopyPix = () => {
    navigator.clipboard.writeText(data.pix.chave);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2500);
  };

  const handleCopyWifi = () => {
    navigator.clipboard.writeText(data.wifi.senha);
    setCopiedWifi(true);
    setTimeout(() => setCopiedWifi(false), 2500);
  };

  // Close modals on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setPixModalOpen(false);
        setWifiModalOpen(false);
        setLocationModalOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const shortcuts = [
    { label: "WhatsApp", icon: MessageCircle, href: wa(), isAction: false },
    {
      label: "Instagram",
      icon: Instagram,
      href: data.company.instagram || SITE.instagram,
      isAction: false,
    },
    {
      label: "Avaliações no Google",
      icon: Star,
      href: data.company.googleReview || SITE.googleReview,
      isAction: false,
    },
    {
      label: "Como chegar",
      icon: MapPin,
      isAction: true,
      onClick: () => setLocationModalOpen(true),
    },
    { label: "Pix", icon: QrCode, isAction: true, onClick: () => setPixModalOpen(true) },
    { label: "Wi-Fi", icon: Wifi, isAction: true, onClick: () => setWifiModalOpen(true) },
  ];

  const activeServices = (data.services || []).filter((s) => s.active !== false);
  const activeProducts = (data.products || []).filter((p) => p.active !== false);

  return (
    <div className="circuit-bg relative min-h-screen overflow-x-hidden text-foreground">
      <Particles />

      {/* Admin shortcut icon */}
      <Link
        to="/admin"
        aria-label="Painel administrativo"
        className="absolute right-4 top-4 z-40 grid h-10 w-10 place-items-center rounded-full border border-primary/30 bg-background/70 text-primary/80 backdrop-blur-md transition-all hover:scale-105 hover:border-primary hover:text-primary"
      >
        <UserRound className="h-4 w-4" />
      </Link>

      <main className="relative mx-auto max-w-5xl px-4 pb-24">
        {/* Header: Símbolo oficial isolado + Hierarquia visual limpa */}
        <header className="reveal flex flex-col items-center pt-10 text-center sm:pt-14">
          {/* 1. Símbolo da marca (celular, coroa, chave inglesa e engrenagens em fundo transparente, sem caixa preta) */}
          <div className="relative">
            <img
              src={data.company.symbolUrl || symbolLogo}
              alt="Símbolo oficial Torres Cell"
              width={260}
              height={260}
              className="animate-float max-h-36 sm:max-h-44 w-auto object-contain drop-shadow-[0_12px_30px_rgba(0,0,0,0.6)]"
            />
          </div>

          {/* 2. Nome da empresa */}
          <h1 className="mt-5 font-display text-4xl font-extrabold tracking-tight sm:text-6xl text-foreground">
            Torres Cell
          </h1>

          {/* 3. Slogan da marca oficial */}
          <p className="mt-2 text-sm sm:text-base font-semibold uppercase tracking-wider text-muted-foreground">
            {data.company.brandSlogan || "Qualidade e honestidade"}
          </p>

          {/* 4. Frase de destaque */}
          <p className="mt-6 max-w-xl text-lg sm:text-xl font-medium text-foreground/95 leading-relaxed">
            {data.company.slogan || SITE.slogan}
          </p>

          {/* CTA principal */}
          <CTA
            href={wa("Olá, Torres Cell! Gostaria de falar com vocês.")}
            className="mt-7 w-full max-w-sm text-lg"
          >
            <MessageCircle className="h-5 w-5" /> Fale com a Torres Cell
          </CTA>
        </header>

        {/* Shortcuts: WhatsApp, Instagram, Google, Como chegar, Pix, Wi-Fi */}
        <nav
          aria-label="Acessos rápidos"
          className="reveal mt-10 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6"
        >
          {shortcuts.map(({ label, icon: Icon, href, internal, isAction, onClick }) => {
            const content = (
              <>
                <span className="grid h-11 w-11 place-items-center rounded-xl bg-accent text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                  <Icon className="h-5 w-5" />
                </span>
                <span className="leading-tight">{label}</span>
              </>
            );

            const cardClasses =
              "group flex min-h-24 w-full flex-col items-center justify-center gap-2 rounded-2xl border border-border bg-card p-4 text-center text-sm font-semibold shadow-card transition-all duration-200 hover:-translate-y-1 hover:border-primary active:scale-95 cursor-pointer";

            if (isAction && onClick) {
              return (
                <button key={label} type="button" onClick={onClick} className={cardClasses}>
                  {content}
                </button>
              );
            }

            return (
              <a key={label} href={href} {...(internal ? {} : ext)} className={cardClasses}>
                {content}
              </a>
            );
          })}
        </nav>

        {/* Promoção de Destaque Confirmada */}
        {data.promotion?.active !== false && (
          <section className="reveal mt-12 overflow-hidden rounded-3xl border border-primary/50 bg-gradient-to-r from-card via-accent/30 to-card p-6 shadow-red sm:p-8">
            <div className="flex flex-col items-center text-center sm:flex-row sm:items-center sm:justify-between sm:text-left">
              <div className="flex items-center gap-4">
                <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-gradient-red text-primary-foreground shadow-red">
                  <Sparkles className="h-6 w-6" />
                </span>
                <div>
                  <span className="inline-block rounded-full bg-primary/20 px-3 py-0.5 text-xs font-bold uppercase tracking-wider text-primary">
                    Promoção confirmada
                  </span>
                  <h3 className="mt-1 text-xl font-bold sm:text-2xl">
                    {data.promotion?.text || "Na troca da tela, a película 3D é grátis."}
                  </h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Aproveite para renovar a tela do seu smartphone e já sair com proteção 3D
                    inclusa!
                  </p>
                </div>
              </div>
              <CTA
                href={wa(
                  "Olá, Torres Cell! Gostaria de solicitar um orçamento para troca de tela com a película 3D grátis.",
                )}
                className="mt-5 w-full shrink-0 sm:mt-0 sm:w-auto"
              >
                Aproveitar promoção <ArrowRight className="h-4 w-4" />
              </CTA>
            </div>
          </section>
        )}

        {/* Seção de Horários de Funcionamento (preservada exatamente) */}
        <section id="horarios" className="mt-16 scroll-mt-6">
          <SectionHead
            title="Horário de funcionamento"
            sub="Venha nos visitar ou consulte o atendimento em tempo real pelo WhatsApp."
          />

          <div className="reveal mx-auto max-w-3xl rounded-3xl border border-border bg-card p-6 shadow-card sm:p-8">
            {/* Status Indicator */}
            <div className="mb-6 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-border/80 bg-secondary/80 p-4">
              <div className="flex items-center gap-3">
                <span
                  className={`relative flex h-3.5 w-3.5 ${
                    status.isOpen
                      ? "text-emerald-500"
                      : status.isLunch
                        ? "text-amber-500"
                        : "text-red-500"
                  }`}
                >
                  <span
                    className={`absolute inline-flex h-full w-full animate-ping rounded-full opacity-75 ${
                      status.isOpen
                        ? "bg-emerald-400"
                        : status.isLunch
                          ? "bg-amber-400"
                          : "bg-red-400"
                    }`}
                  />
                  <span
                    className={`relative inline-flex h-3.5 w-3.5 rounded-full ${
                      status.isOpen
                        ? "bg-emerald-500"
                        : status.isLunch
                          ? "bg-amber-500"
                          : "bg-red-500"
                    }`}
                  />
                </span>
                <div>
                  <p className="font-bold">{status.label}</p>
                  <p className="text-xs text-muted-foreground">{status.detail}</p>
                </div>
              </div>

              <CTA
                href={wa("Olá, Torres Cell! Gostaria de confirmar se estão atendendo agora.")}
                variant="ghost"
                className="text-xs sm:text-sm"
              >
                Confirmar no WhatsApp
              </CTA>
            </div>

            {/* List of hours */}
            <ul className="space-y-2.5">
              {[
                {
                  label: "Segunda a sexta-feira",
                  value: data.hours.weekdays || "08h às 18h",
                  days: [1, 2, 3, 4, 5],
                },
                {
                  label: "Sábado",
                  value: data.hours.saturday || "Até 16h (08h às 16h)",
                  days: [6],
                },
                {
                  label: "Domingo",
                  value: data.hours.sunday || "Fechado",
                  days: [0],
                },
              ].map((h) => {
                const active = todayDay !== null && h.days.includes(todayDay);
                return (
                  <li
                    key={h.label}
                    className={`flex items-center justify-between rounded-xl px-4 py-3 text-sm transition-colors ${
                      active
                        ? "border border-primary/60 bg-accent font-semibold text-foreground shadow-sm"
                        : "bg-secondary text-foreground/90"
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-primary" />
                      {h.label}
                      {active && (
                        <span className="ml-1 rounded-full bg-primary px-2 py-0.5 text-[11px] font-bold text-primary-foreground">
                          Hoje
                        </span>
                      )}
                    </span>
                    <span
                      className={
                        h.value === "Fechado"
                          ? "text-muted-foreground font-medium"
                          : "font-semibold"
                      }
                    >
                      {h.value}
                    </span>
                  </li>
                );
              })}
            </ul>

            {/* Lunch Pause Highlight */}
            <div className="mt-5 rounded-2xl border border-primary/20 bg-accent/60 p-4 text-center sm:text-left">
              <div className="flex flex-col items-center justify-between gap-2 sm:flex-row">
                <div className="flex items-center gap-3">
                  <span className="grid h-8 w-8 place-items-center rounded-lg bg-primary/20 text-primary">
                    <Clock className="h-4 w-4" />
                  </span>
                  <div>
                    <p className="text-sm font-bold text-foreground">
                      Pausa para almoço: {data.hours.lunch || "12h às 14h"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Durante esse intervalo o atendimento presencial é pausado para a refeição da
                      equipe.
                    </p>
                  </div>
                </div>
                <span className="rounded-full border border-primary/30 bg-background/80 px-3 py-1 text-xs font-semibold text-primary">
                  12h – 14h
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Seção de Assistência Técnica */}
        <section id="servicos" className="mt-20 scroll-mt-6">
          <SectionHead
            title="Assistência técnica especializada"
            sub="Preços sob consulta com peças de procedência, transparência e agilidade no atendimento."
          />

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {activeServices.map((service, i) => {
              const Icon = getServiceIcon(service.id);
              const isPromo = service.highlight || service.id === "troca-tela";
              return (
                <article
                  key={service.id}
                  className={`reveal group relative flex flex-col justify-between overflow-hidden rounded-2xl border bg-card shadow-card transition-all duration-200 hover:-translate-y-1 ${
                    isPromo ? "border-primary/60 shadow-red" : "border-border hover:border-primary"
                  }`}
                >
                  <div className="relative h-32 overflow-hidden">
                    <img
                      src={service.imageUrl || repairImg}
                      alt=""
                      aria-hidden
                      loading="lazy"
                      width={640}
                      height={400}
                      className="h-full w-full object-cover opacity-45 transition-transform duration-500 group-hover:scale-110"
                      style={{ objectPosition: `${(i * 23) % 100}% ${(i * 31) % 100}%` }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-card via-card/50 to-transparent" />
                    <span className="absolute bottom-3 left-4 grid h-11 w-11 place-items-center rounded-xl bg-gradient-red text-primary-foreground shadow-red">
                      <Icon className="h-5 w-5" />
                    </span>

                    {isPromo && (
                      <span className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full bg-gradient-red px-3 py-1 text-[11px] font-bold text-primary-foreground shadow-red">
                        <Sparkles className="h-3 w-3" /> Película 3D grátis
                      </span>
                    )}
                  </div>

                  <div className="flex flex-1 flex-col justify-between p-5 pt-2">
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-bold">{service.name}</h3>
                        <span className="shrink-0 rounded-md bg-secondary px-2 py-0.5 text-xs font-semibold text-muted-foreground">
                          {service.price || "Sob consulta"}
                        </span>
                      </div>
                      <p className="mt-2 text-sm text-muted-foreground">{service.desc}</p>
                    </div>

                    <CTA
                      variant="ghost"
                      href={wa(
                        `Olá, Torres Cell! Gostaria de solicitar um orçamento para ${service.name.toLowerCase()}.`,
                      )}
                      className="mt-5 w-full text-sm"
                    >
                      Solicitar orçamento <ArrowRight className="h-4 w-4" />
                    </CTA>
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        {/* Seção de Celulares e Acessórios */}
        <section id="produtos" className="mt-20 scroll-mt-6">
          <SectionHead
            title="Celulares e acessórios"
            sub="Consulte a disponibilidade de smartphones e itens para o seu dia a dia diretamente com a Torres Cell."
          />

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {activeProducts.map((product) => {
              const Icon = getProductIcon(product.category, product.id);
              return (
                <article
                  key={product.id}
                  className="reveal group flex flex-col justify-between overflow-hidden rounded-2xl border border-border bg-card shadow-card transition-all duration-200 hover:-translate-y-1 hover:border-primary"
                >
                  <div className="relative h-40 overflow-hidden">
                    <img
                      src={product.imageUrl || storeImg}
                      alt={`Foto de ${product.name}`}
                      loading="lazy"
                      width={640}
                      height={400}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent" />
                    <span className="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-lg bg-background/80 text-primary backdrop-blur-md">
                      <Icon className="h-4 w-4" />
                    </span>
                  </div>

                  <div className="flex flex-1 flex-col justify-between p-5">
                    <div>
                      <h3 className="text-lg font-bold">{product.name}</h3>
                      <p className="mt-2 text-sm text-muted-foreground">{product.desc}</p>
                    </div>

                    <CTA
                      variant="ghost"
                      href={wa(
                        `Olá, Torres Cell! Gostaria de consultar a disponibilidade de ${product.name.toLowerCase()}.`,
                      )}
                      className="mt-5 w-full text-sm"
                    >
                      Consultar disponibilidade
                    </CTA>
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        {/* Galeria de Fotos / Novidades na loja (se houver) */}
        {data.photos && data.photos.length > 0 && (
          <section id="novidades" className="mt-20 scroll-mt-6">
            <SectionHead
              title="Fotos da loja"
              sub="Acompanhe novidades, peças e aparelhos disponíveis na Torres Cell."
            />
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {data.photos.map((p) => (
                <a
                  key={p.id}
                  href={wa(
                    `Olá, Torres Cell! Vi no site a foto: ${p.title || "uma novidade"}. Gostaria de mais informações.`,
                  )}
                  {...ext}
                  className="group overflow-hidden rounded-2xl border border-border bg-card shadow-card transition hover:-translate-y-1 hover:border-primary"
                >
                  <div className="aspect-square w-full overflow-hidden">
                    <img
                      src={p.url}
                      alt={p.title || "Foto Torres Cell"}
                      loading="lazy"
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                  {p.title && <p className="truncate p-3 text-sm font-semibold">{p.title}</p>}
                </a>
              ))}
            </div>
          </section>
        )}

        {/* Atendimento em Domicílio ("Torres Cell vai até você") */}
        {data.homeService?.active !== false && (
          <section
            id="domicilio"
            className="reveal mt-20 scroll-mt-6 overflow-hidden rounded-3xl border border-primary/40 bg-card shadow-red md:grid md:grid-cols-2"
          >
            <div className="relative h-64 w-full md:h-full">
              <img
                src={data.homeService.imageUrl || deliveryImg}
                alt="Atendimento em domicílio Torres Cell"
                loading="lazy"
                width={800}
                height={600}
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-card/80 via-transparent to-transparent md:hidden" />
            </div>

            <div className="p-6 sm:p-8">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-accent px-3 py-1 text-xs font-bold text-primary">
                <Home className="h-3.5 w-3.5" />{" "}
                {data.homeService.badge || "Atendimento em domicílio"}
              </span>

              <h2 className="mt-3 text-2xl font-bold sm:text-3xl">
                {data.homeService.title || "Torres Cell vai até você"}
              </h2>

              <p className="mt-3 text-muted-foreground">
                {data.homeService.description ||
                  "Consulte a disponibilidade de atendimento na sua região pelo WhatsApp."}
              </p>

              {data.homeService.neighborhoods && data.homeService.neighborhoods.length > 0 && (
                <div className="mt-5">
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Regiões de referência:
                  </p>
                  <ul className="mt-2 flex flex-wrap gap-2">
                    {data.homeService.neighborhoods.map((b) => (
                      <li
                        key={b}
                        className="rounded-full border border-border bg-secondary px-3 py-1.5 text-xs font-medium"
                      >
                        <MapPin className="mr-1 inline h-3.5 w-3.5 text-primary" />
                        {b}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <CTA
                href={wa(
                  "Olá, Torres Cell! Gostaria de consultar a disponibilidade de atendimento em domicílio para o meu bairro.",
                )}
                className="mt-6 w-full"
              >
                <MessageCircle className="h-5 w-5" /> Consultar atendimento pelo WhatsApp
              </CTA>
            </div>
          </section>
        )}

        {/* Instagram Oficial */}
        <section className="reveal mt-20 overflow-hidden rounded-3xl border border-border bg-card p-6 text-center shadow-card sm:p-10">
          <span className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-gradient-red text-primary-foreground shadow-red">
            <Instagram className="h-8 w-8" />
          </span>

          <h2 className="mt-5 text-2xl font-bold sm:text-3xl">Acompanhe a Torres Cell</h2>
          <p className="mx-auto mt-3 max-w-md text-muted-foreground">
            Siga nosso perfil oficial para acompanhar novidades, serviços realizados e dicas de
            tecnologia.
          </p>

          <a
            href={data.company.instagram || SITE.instagram}
            {...ext}
            className="group relative mx-auto mt-6 block aspect-[4/5] w-full max-w-xs overflow-hidden rounded-2xl border border-border shadow-card transition-transform duration-300 hover:scale-[1.02]"
          >
            <img
              src={repairImg}
              alt="Perfil Instagram Torres Cell"
              loading="lazy"
              width={640}
              height={800}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-0 flex flex-col items-center justify-end bg-gradient-to-t from-background via-background/40 to-transparent p-5">
              <img
                src={data.company.symbolUrl || symbolLogo}
                alt="Símbolo oficial Torres Cell"
                width={70}
                height={70}
                className="h-16 w-16 object-contain drop-shadow"
              />
              <p className="mt-2 font-bold text-foreground">@torres_cell_0</p>
              <span className="text-xs text-muted-foreground">Instagram Oficial</span>
            </div>
          </a>

          <div className="mt-6 flex justify-center">
            <CTA href={data.company.instagram || SITE.instagram}>
              <Instagram className="h-5 w-5" /> Seguir no Instagram
            </CTA>
          </div>
        </section>

        {/* Localização e Como Chegar */}
        <section id="localizacao" className="mt-20 scroll-mt-6">
          <SectionHead
            title="Localização"
            sub="Venha até a nossa loja no bairro Presidente Kennedy em Fortaleza."
          />

          <div className="reveal overflow-hidden rounded-3xl border border-border bg-card shadow-card">
            <iframe
              title="Mapa de localização da Torres Cell"
              src={data.company.mapsEmbed || SITE.mapsEmbed}
              loading="lazy"
              className="h-72 w-full border-0 grayscale-[40%]"
              referrerPolicy="no-referrer-when-downgrade"
            />

            <div className="p-6 sm:p-8">
              <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
                <div>
                  <h3 className="flex items-center gap-2 text-xl font-bold">
                    <MapPin className="h-5 w-5 text-primary" /> Torres Cell
                  </h3>
                  <p className="mt-2 text-muted-foreground">
                    {data.company.address || SITE.address}
                  </p>
                </div>

                {/* Botão padronizado 'Como chegar' */}
                <CTA
                  href={data.company.mapsRoute || SITE.mapsRoute}
                  className="w-full shrink-0 md:w-auto"
                >
                  <Navigation className="h-4 w-4" /> Como chegar
                </CTA>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Rodapé Simplificado */}
      <footer className="relative border-t border-border bg-card/60 px-4 py-12 text-center">
        <div className="mx-auto max-w-md">
          <img
            src={data.company.symbolUrl || symbolLogo}
            alt="Símbolo Torres Cell"
            loading="lazy"
            width={80}
            height={80}
            className="mx-auto h-16 w-auto object-contain drop-shadow"
          />
          <h2 className="mt-3 font-display text-xl font-bold tracking-tight text-foreground">
            Torres Cell
          </h2>
          <p className="mt-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            {data.company.brandSlogan || "Qualidade e honestidade"}
          </p>
          <p className="mt-2 text-xs text-muted-foreground">
            {data.company.description ||
              "Assistência técnica especializada e venda de celulares e acessórios."}
          </p>

          <div className="mt-6 border-t border-border/60 pt-6">
            <p className="text-xs text-muted-foreground">
              Desenvolvido por{" "}
              <a
                href={SITE.localway}
                {...ext}
                className="font-semibold text-foreground transition-colors hover:text-primary"
              >
                Localway
              </a>
            </p>
          </div>
        </div>
      </footer>

      {/* Pop-up / Modal Localização Limpo */}
      {locationModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
        >
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-background/80 backdrop-blur-sm transition-opacity"
            onClick={() => setLocationModalOpen(false)}
          />

          {/* Dialog content */}
          <div className="relative w-full max-w-md overflow-hidden rounded-3xl border border-primary/40 bg-card p-6 shadow-2xl animate-in fade-in-0 zoom-in-95">
            <div className="flex items-center justify-between border-b border-border pb-4">
              <div className="flex items-center gap-2.5">
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-red text-primary-foreground shadow-red">
                  <MapPin className="h-5 w-5" />
                </span>
                <div>
                  <h3 className="font-bold">Localização</h3>
                  <p className="text-xs text-muted-foreground">Torres Cell</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setLocationModalOpen(false)}
                aria-label="Fechar"
                className="rounded-lg p-2 text-muted-foreground hover:bg-secondary hover:text-foreground"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-5 space-y-4">
              <div className="rounded-xl border border-border bg-secondary/80 p-4">
                <p className="text-xs font-medium text-muted-foreground">Endereço da loja</p>
                <p className="mt-1 font-semibold text-foreground leading-relaxed">
                  {data.company.address || SITE.address}
                </p>
              </div>

              <CTA
                href={data.company.mapsRoute || SITE.mapsRoute}
                className="w-full text-base"
                onClick={() => setLocationModalOpen(false)}
              >
                <Navigation className="h-4 w-4" /> Como chegar
              </CTA>
            </div>
          </div>
        </div>
      )}

      {/* Pop-up / Modal Pix Limpo */}
      {pixModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
        >
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-background/80 backdrop-blur-sm transition-opacity"
            onClick={() => setPixModalOpen(false)}
          />

          {/* Dialog content */}
          <div className="relative w-full max-w-md overflow-hidden rounded-3xl border border-primary/40 bg-card p-6 shadow-2xl animate-in fade-in-0 zoom-in-95">
            <div className="flex items-center justify-between border-b border-border pb-4">
              <div className="flex items-center gap-2.5">
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-red text-primary-foreground shadow-red">
                  <QrCode className="h-5 w-5" />
                </span>
                <div>
                  <h3 className="font-bold">Pagamento via Pix</h3>
                  <p className="text-xs text-muted-foreground">Torres Cell</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setPixModalOpen(false)}
                aria-label="Fechar"
                className="rounded-lg p-2 text-muted-foreground hover:bg-secondary hover:text-foreground"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-5 space-y-3.5">
              <div className="rounded-xl border border-border bg-secondary/80 p-3.5">
                <p className="text-xs font-medium text-muted-foreground">Titular da conta</p>
                <p className="font-semibold text-foreground">{data.pix.titular}</p>
              </div>

              <div className="rounded-xl border border-border bg-secondary/80 p-3.5">
                <p className="text-xs font-medium text-muted-foreground">Instituição / Banco</p>
                <p className="font-semibold text-foreground">{data.pix.banco}</p>
              </div>

              <div className="rounded-xl border border-primary/30 bg-accent/50 p-3.5">
                <p className="text-xs font-medium text-muted-foreground">Chave Pix (CNPJ)</p>
                <p className="mt-1 font-mono text-base font-bold text-primary select-all">
                  {data.pix.chave}
                </p>
              </div>

              {copiedKey && (
                <div className="flex items-center justify-center gap-2 rounded-xl bg-emerald-500/15 py-2 text-xs font-semibold text-emerald-400">
                  <CheckCircle2 className="h-4 w-4" /> Chave Pix copiada!
                </div>
              )}

              <button
                type="button"
                onClick={handleCopyPix}
                className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-red px-5 py-3 font-semibold text-primary-foreground shadow-red transition-all hover:brightness-110 active:scale-95"
              >
                {copiedKey ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                {copiedKey ? "Chave Pix copiada!" : "Copiar chave Pix"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Pop-up / Modal Wi-Fi Limpo */}
      {wifiModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
        >
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-background/80 backdrop-blur-sm transition-opacity"
            onClick={() => setWifiModalOpen(false)}
          />

          {/* Dialog content */}
          <div className="relative w-full max-w-md overflow-hidden rounded-3xl border border-primary/40 bg-card p-6 shadow-2xl animate-in fade-in-0 zoom-in-95">
            <div className="flex items-center justify-between border-b border-border pb-4">
              <div className="flex items-center gap-2.5">
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-red text-primary-foreground shadow-red">
                  <Wifi className="h-5 w-5" />
                </span>
                <div>
                  <h3 className="font-bold">Wi-Fi para Clientes</h3>
                  <p className="text-xs text-muted-foreground">Torres Cell</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setWifiModalOpen(false)}
                aria-label="Fechar"
                className="rounded-lg p-2 text-muted-foreground hover:bg-secondary hover:text-foreground"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-5 space-y-3.5">
              <div className="rounded-xl border border-border bg-secondary/80 p-3.5">
                <p className="text-xs font-medium text-muted-foreground">Nome da Rede (SSID)</p>
                <p className="font-semibold text-foreground">{data.wifi.rede}</p>
              </div>

              <div className="rounded-xl border border-primary/30 bg-accent/50 p-3.5">
                <p className="text-xs font-medium text-muted-foreground">Senha de Acesso</p>
                <p className="mt-1 font-mono text-base font-bold text-primary select-all">
                  {data.wifi.senha}
                </p>
              </div>

              {copiedWifi && (
                <div className="flex items-center justify-center gap-2 rounded-xl bg-emerald-500/15 py-2 text-xs font-semibold text-emerald-400">
                  <CheckCircle2 className="h-4 w-4" /> Senha copiada!
                </div>
              )}

              <button
                type="button"
                onClick={handleCopyWifi}
                className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-red px-5 py-3 font-semibold text-primary-foreground shadow-red transition-all hover:brightness-110 active:scale-95"
              >
                {copiedWifi ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                {copiedWifi ? "Senha copiada!" : "Copiar senha"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

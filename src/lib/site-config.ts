// Configuração central da Torres Cell — informações confirmadas da empresa.
export const SITE = {
  name: "Torres Cell",
  slogan: "Seu celular em boas mãos. Tecnologia, cuidado e confiança em um só lugar.",
  whatsappNumber: "5585984137001",
  whatsappFormatted: "(85) 98413-7001",
  defaultMessage: "Olá, Torres Cell! Vim pelo site.",
  instagram: "https://www.instagram.com/torres_cell_0/",
  googleReview: "https://search.google.com/local/writereview?placeid=ChIJnQ6LDtNJxwcRNg098V5g_hY",
  mapsRoute:
    "https://www.google.com/maps/dir//Torres+Cell+-+Assist%C3%AAncia+T%C3%A9cnica+Especializada+em+Celulares+-+Av.+Dr.+Theberge,+2404+-+Presidente+Kennedy,+Fortaleza+-+CE,+60355-000/@-3.7228503,-38.5678107,17z/data=!4m17!1m7!3m6!1s0x7c749d30e8b0e9d:0x16fe605ef13d0d36!2sTorres+Cell+-+Assist%C3%AAncia+T%C3%A9cnica+Especializada+em+Celulares!8m2!3d-3.7228503!4d-38.5678107!16s%2Fg%2F11t7g5sh5j!4m8!1m0!1m5!1m1!1s0x7c749d30e8b0e9d:0x16fe605ef13d0d36!2m2!1d-38.5678164!2d-3.7228472!3e0",
  mapsEmbed: "https://maps.google.com/maps?q=-3.7228503,-38.5678107&z=17&output=embed",
  address: "Av. Dr. Theberge, 2404 — Presidente Kennedy, Fortaleza — CE, CEP 60355-000",
  localway: "https://localway.com.br",
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
};

export const waLink = (
  message: string = SITE.defaultMessage,
  phone: string = SITE.whatsappNumber,
) => `https://wa.me/${phone.replace(/\D/g, "")}?text=${encodeURIComponent(message)}`;

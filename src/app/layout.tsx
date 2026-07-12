import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as SonnerToaster } from "@/components/ui/sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

const SITE_URL = "https://segurosela.com.mx";
const SITE_NAME = "Seguros y Fianzas ELA";
const SITE_DESCRIPTION =
  "Seguros y Fianzas ELA - Empresa 100% Mexicana con más de 10 años de trayectoria. Seguros personales, empresariales y fianzas en Tijuana, B.C. con 11 aseguradoras aliadas. Cotiza gratis.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} | Seguros Personales, Empresariales y Fianzas en Tijuana`,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  keywords: [
    "seguros ELA",
    "seguros Tijuana",
    "fianzas Tijuana",
    "seguros personales",
    "seguros empresariales",
    "fianzas México",
    "cotización de seguros",
    "seguro de vida Tijuana",
    "seguro de auto Tijuana",
    "seguro empresarial Baja California",
    "fianzas administrativas",
    "GNP seguros",
    "AXA seguros",
    "Zurich seguros",
    "Mapfre seguros",
  ],
  authors: [{ name: SITE_NAME }],
  creator: SITE_NAME,
  publisher: SITE_NAME,
  applicationName: SITE_NAME,
  category: "Seguros y Fianzas",
  classification: "Seguros y Fianzas en México",
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  alternates: {
    canonical: "/",
    languages: {
      "es-MX": "/",
    },
  },
  icons: {
    icon: [
      { url: "/images/logo/ela-logo.png", sizes: "192x192" },
      { url: "/images/logo/ela-logo.png", sizes: "32x32" },
    ],
    apple: [{ url: "/images/logo/ela-logo.png", sizes: "180x180" }],
  },
  manifest: "/manifest.webmanifest",
  openGraph: {
    title: `${SITE_NAME} | Seguros y Fianzas en Tijuana`,
    description: SITE_DESCRIPTION,
    url: SITE_URL,
    siteName: SITE_NAME,
    type: "website",
    locale: "es_MX",
    images: [
      {
        url: "/images/hero/hero-family.png",
        width: 1344,
        height: 768,
        alt: `${SITE_NAME} - Protege a tu familia y patrimonio`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_NAME} | Seguros y Fianzas en Tijuana`,
    description: SITE_DESCRIPTION,
    images: ["/images/hero/hero-family.png"],
    creator: "@segurosela",
  },
  other: {
    "geo.region": "MX-BCN",
    "geo.placename": "Tijuana, Baja California, México",
    "geo.position": "32.5000;-117.0160",
    ICBM: "32.5000, -117.0160",
    "theme-color": "#00455e",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#00455e",
  colorScheme: "light",
};

// JSON-LD Structured Data
const jsonLdOrganization = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: SITE_NAME,
  alternateName: "ELA Seguros",
  url: SITE_URL,
  logo: `${SITE_URL}/images/logo/ela-logo.png`,
  description: SITE_DESCRIPTION,
  email: "contacto@segurosela.com",
  telephone: "+52-66-3206-4190",
  address: {
    "@type": "PostalAddress",
    streetAddress: "Calle Buenaventura #374, Fracc. Chapultepec",
    addressLocality: "Tijuana",
    addressRegion: "Baja California",
    postalCode: "22020",
    addressCountry: "MX",
  },
  sameAs: [
    "https://www.instagram.com/elaseguros",
    "https://www.facebook.com/segurosela",
  ],
};

const jsonLdLocalBusiness = {
  "@context": "https://schema.org",
  "@type": "InsuranceAgency",
  name: SITE_NAME,
  image: `${SITE_URL}/images/hero/hero-family.png`,
  url: SITE_URL,
  telephone: "+52-66-3206-4190",
  email: "contacto@segurosela.com",
  priceRange: "$$",
  address: {
    "@type": "PostalAddress",
    streetAddress: "Calle Buenaventura #374, Fracc. Chapultepec",
    addressLocality: "Tijuana",
    addressRegion: "Baja California",
    postalCode: "22020",
    addressCountry: "MX",
  },
  geo: {
    "@type": "GeoCoordinates",
    latitude: 32.5,
    longitude: -117.016,
  },
  openingHoursSpecification: [
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
      opens: "09:00",
      closes: "18:00",
    },
  ],
  areaServed: [
    { "@type": "State", name: "Baja California" },
    { "@type": "State", name: "Estado de México" },
  ],
};

const jsonLdWebSite = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: SITE_NAME,
  url: SITE_URL,
  inLanguage: "es-MX",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es-MX" suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(jsonLdOrganization),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(jsonLdLocalBusiness),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(jsonLdWebSite),
          }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-white text-foreground`}
      >
        {children}
        <Toaster />
        <SonnerToaster position="top-right" richColors closeButton />
      </body>
    </html>
  );
}

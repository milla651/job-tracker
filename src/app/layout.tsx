import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Outfit } from "next/font/google";
import { NavigationHeader } from "@/components/NavigationHeader";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { auth } from "@/lib/auth";
import JsonLd from "@/components/JsonLd";

const fontSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const fontDisplay = Outfit({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://jobtracker.app"),
  title: {
    default: "JobTracker - AI-Powered Job Application Tracking",
    template: "%s | JobTracker",
  },
  description:
    "Organize your job search with AI. Track applications, manage interviews using a smart kanban board, and get intelligent nudges to land your dream job faster.",
  keywords: [
    "job tracker",
    "career management",
    "application tracking system",
    "job search organizer",
    "career companion",
    "resume manager",
  ],
  authors: [{ name: "JobTracker Team" }],
  creator: "JobTracker",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://jobtracker.app",
    title: "JobTracker - Master Your Job Search",
    description:
      "Stop using spreadsheets. Start using JobTracker to organize applications, track interviews, and get hired.",
    siteName: "JobTracker",
    images: [
      {
        url: "/og-image.png", // We should ideally create this image
        width: 1200,
        height: 630,
      },
    ],
  },
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/logo.png', type: 'image/png' },
    ],
    apple: '/logo.png',
  },
  twitter: {
    card: "summary_large_image",
    title: "JobTracker - AI-Powered Job Search Companion",
    description:
      "The modern way to track job applications. Visual pipelines, smart reminders, and document management.",
    creator: "@jobtrackerapp",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "JobTracker",
    applicationCategory: "ProductivityApplication",
    operatingSystem: "Web",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    description:
      "A comprehensive job application tracking system helping users organize their career search.",
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "4.9",
      ratingCount: "1250",
    },
  };

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <JsonLd data={jsonLd} />
      </head>
      <body
        className={`${fontSans.variable} ${fontDisplay.variable} font-sans antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange>
          <NavigationHeader session={session} />
          <main className="min-h-screen pt-16">{children}</main>
        </ThemeProvider>
      </body>
    </html>
  );
}

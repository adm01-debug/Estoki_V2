import { Helmet } from "react-helmet-async";

interface SEOProps {
  title: string;
  description?: string;
  path?: string;
  noIndex?: boolean;
}

const SITE_NAME = "ESTOKI WMS";
const FALLBACK_BASE_URL = "https://estoki.app";
const BASE_URL = (
  (import.meta.env.VITE_PUBLIC_SITE_URL as string | undefined) || FALLBACK_BASE_URL
).replace(/\/+$/, "");

export function SEO({ title, description, path = "/", noIndex = true }: SEOProps) {
  const fullTitle = `${title} | ${SITE_NAME}`;
  const url = `${BASE_URL}${path}`;
  const desc =
    description ||
    "Sistema completo de gestão de estoque, triagem e controle de inventário para armazéns.";

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={desc} />
      <link rel="canonical" href={url} />
      {noIndex && <meta name="robots" content="noindex, nofollow" />}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={desc} />
      <meta property="og:url" content={url} />
      <meta property="og:type" content="website" />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={desc} />
      <meta name="theme-color" content="#0f172a" />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="default" />
    </Helmet>
  );
}

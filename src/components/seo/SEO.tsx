import { Helmet } from "react-helmet-async";

interface SEOProps {
  title: string;
  description?: string;
  path?: string;
  noindex?: boolean;
}

const SITE = "https://cart-bloom-connect.lovable.app";

/**
 * SEO — per-route <head> metadata (title, description, canonical, og:*).
 * Requires <HelmetProvider> at the app root (already wired in main.tsx).
 */
export function SEO({ title, description, path, noindex }: SEOProps) {
  const fullTitle = title.includes("ESTOKI") ? title : `${title} | ESTOKI WMS`;
  const url = path ? `${SITE}${path}` : SITE;
  const desc =
    description ??
    "ESTOKI WMS — sistema de gestão de armazém com rastreabilidade, gamificação e IA.";

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={desc} />
      <link rel="canonical" href={url} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={desc} />
      <meta property="og:url" content={url} />
      <meta property="og:type" content="website" />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={desc} />
      {noindex && <meta name="robots" content="noindex,nofollow" />}
    </Helmet>
  );
}

export default SEO;
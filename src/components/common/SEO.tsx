import { Helmet } from 'react-helmet-async';

interface SEOProps {
  title: string;
  description?: string;
  path?: string;
  noIndex?: boolean;
}

const SITE_NAME = 'ESTOKI WMS';
const BASE_URL = 'https://estoki.app';

export function SEO({ title, description, path = '/', noIndex = false }: SEOProps) {
  const fullTitle = `${title} | ${SITE_NAME}`;
  const url = `${BASE_URL}${path}`;
  const desc = description || 'Sistema completo de gestão de estoque, triagem e controle de inventário para armazéns.';

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
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={desc} />
    </Helmet>
  );
}

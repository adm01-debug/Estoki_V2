// Analytics configuration
export function initAnalytics() {
  // Google Analytics or custom analytics
  if (import.meta.env.VITE_GA_ID) {
    const script = document.createElement("script");
    script.src = `https://www.googletagmanager.com/gtag/js?id=${import.meta.env.VITE_GA_ID}`;
    script.async = true;
    document.head.appendChild(script);

     window.dataLayer = window.dataLayer || [];
     const dataLayer = window.dataLayer;
     window.gtag = function () { dataLayer.push(arguments); };
    window.gtag("js", new Date());
    window.gtag("config", import.meta.env.VITE_GA_ID);
  }
}

export function trackEvent(category: string, action: string, label?: string, value?: number) {
  if (typeof window.gtag === "function") {
    window.gtag("event", action, { event_category: category, event_label: label, value });
  }
}

export function trackPageView(path: string) {
  if (typeof window.gtag === "function") {
    window.gtag("event", "page_view", { page_path: path });
  }
}


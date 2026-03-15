const APP_CONFIG = { name: 'WMS', version: '1.0.0', company: 'Promo Brindes' };

export function Footer() {
  return (
    <footer className="border-t py-4 px-6 text-center text-sm text-muted-foreground">
      <p>&copy; {new Date().getFullYear()} {APP_CONFIG.company} - {APP_CONFIG.name} v{APP_CONFIG.version}</p>
    </footer>
  );
}

# Auditoria de Dependências

- Pacotes analisados: **1459**
- Escopo: **produção + dev** · nível de bloqueio: **high**
- Achados: info=0 · low=0 · moderate=6 · high=2 · critical=0
- Bloqueantes: **1** · aceitos em allowlist: **7**

| Pacote | Sev | Escopo | Instalado | Faixa vulnerável | Achado | Status |
|---|---|---|---|---|---|---|
| `brace-expansion` | high | prod | `1.1.16, 2.1.2` | `<=5.0.7` | [brace-expansion: DoS via unbounded expansion length causing an out-of-memory pro](https://github.com/advisories/GHSA-mh99-v99m-4gvg) | ❌ bloqueante |
| `vite` | high | prod | `5.4.21` | `<=6.4.2` | [vite: `server.fs.deny` bypass on Windows alternate paths](https://github.com/advisories/GHSA-fx2h-pf6j-xcff) | aceito |
| `esbuild` | moderate | prod | `0.18.20, 0.21.5` | `<=0.24.2` | [esbuild enables any website to send any requests to the development server and r](https://github.com/advisories/GHSA-67mh-4wv8-2f99) | aceito |
| `react-router` | moderate | prod | `6.30.4` | `>=6.0.0 <7.18.0` | [React Router: Open redirect via backslash in <Link> and useNavigate (CVE-2025-68](https://github.com/advisories/GHSA-wrjc-x8rr-h8h6) | aceito |
| `react-router` | moderate | prod | `6.30.4` | `>=6.4.0 <7.18.0` | [React Router: Arbitrary Constructor Injection via deserializeErrors() in React R](https://github.com/advisories/GHSA-337j-9hxr-rhxg) | aceito |
| `react-router-dom` | moderate | prod | `6.30.4` | `>=6.30.2 <=6.30.4` | [React Router: Open redirect leading to XSS](https://github.com/advisories/GHSA-jjmj-jmhj-qwj2) | aceito |
| `vite` | moderate | prod | `5.4.21` | `<=6.4.2` | [launch-editor: NTLMv2 hash disclosure via UNC path handling on Windows](https://github.com/advisories/GHSA-v6wh-96g9-6wx3) | aceito |
| `vite` | moderate | prod | `5.4.21` | `<=6.4.1` | [Vite Vulnerable to Path Traversal in Optimized Deps `.map` Handling](https://github.com/advisories/GHSA-4w7w-66w2-5vf9) | aceito |

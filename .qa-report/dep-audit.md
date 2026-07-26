# Auditoria de Dependências

- Pacotes analisados: **1458**
- Escopo: **produção + dev** · nível de bloqueio: **high**
- Achados: info=0 · low=1 · moderate=21 · high=15 · critical=1
- Bloqueantes: **16** · aceitos em allowlist: **0**

| Pacote | Sev | Escopo | Faixa vulnerável | Achado | Status |
|---|---|---|---|---|---|
| `vitest` | critical | dev | `<3.2.6` | [When Vitest UI server is listening, arbitrary file can be read and executed](https://github.com/advisories/GHSA-5xrq-8626-4rwp) | ❌ bloqueante |
| `brace-expansion` | high | prod | `<=5.0.7` | [brace-expansion: DoS via unbounded expansion length causing an out-of-memory pro](https://github.com/advisories/GHSA-mh99-v99m-4gvg) | ❌ bloqueante |
| `axios` | high | prod | `>=1.0.0 <1.8.2` | [axios Requests Vulnerable To Possible SSRF and Credential Leakage via Absolute U](https://github.com/advisories/GHSA-jr5f-v2jv-69x6) | ❌ bloqueante |
| `axios` | high | prod | `>=1.0.0 <1.15.2` | [Axios has prototype pollution read-side gadgets in HTTP adapter that allow crede](https://github.com/advisories/GHSA-q8qp-cvcw-x6jj) | ❌ bloqueante |
| `axios` | high | prod | `>=1.0.0 <1.12.0` | [Axios is vulnerable to DoS attack through lack of data size check](https://github.com/advisories/GHSA-4hjh-wcwx-xvwj) | ❌ bloqueante |
| `axios` | high | prod | `>=1.0.0 <1.16.0` | [Axios: Regular Expression Denial of Service (ReDoS) via Cookie Name Injection](https://github.com/advisories/GHSA-hfxv-24rg-xrqf) | ❌ bloqueante |
| `axios` | high | prod | `>=1.0.0 <1.16.0` | [Axios: Proxy-Authorization Credential Leak to Origin Server Across HTTP-to-HTTPS](https://github.com/advisories/GHSA-p92q-9vqr-4j8v) | ❌ bloqueante |
| `axios` | high | prod | `>=1.0.0 <1.16.0` | [Axios: Proxy-Authorization header leaks to redirect target when proxy is re-eval](https://github.com/advisories/GHSA-j5f8-grm9-p9fc) | ❌ bloqueante |
| `axios` | high | prod | `>=1.0.0 <1.15.2` | [axios Vulnerable to Credential Theft and Response Hijacking via Prototype Pollut](https://github.com/advisories/GHSA-3g43-6gmg-66jw) | ❌ bloqueante |
| `axios` | high | prod | `>=1.0.0 <1.16.0` | [axios Vulnerable to Full Man-in-the-Middle via Prototype Pollution Gadget in `co](https://github.com/advisories/GHSA-35jp-ww65-95wh) | ❌ bloqueante |
| `axios` | high | prod | `>=1.0.0 <1.15.1` | [Axios: Incomplete Fix for CVE-2025-62718 — NO_PROXY Protection Bypassed via RFC ](https://github.com/advisories/GHSA-pmwg-cvhr-8vh7) | ❌ bloqueante |
| `axios` | high | prod | `>=1.0.0 <1.15.1` | [Axios: Prototype Pollution Gadgets - Response Tampering, Data Exfiltration, and ](https://github.com/advisories/GHSA-pf86-5x62-jrwf) | ❌ bloqueante |
| `axios` | high | prod | `>=1.0.0 <1.15.1` | [Axios: Header Injection via Prototype Pollution](https://github.com/advisories/GHSA-6chq-wfr3-2hj9) | ❌ bloqueante |
| `axios` | high | prod | `>=1.0.0 <=1.13.4` | [Axios is Vulnerable to Denial of Service via __proto__ Key in mergeConfig](https://github.com/advisories/GHSA-43fc-jf86-j433) | ❌ bloqueante |
| `axios` | high | prod | `>=1.3.2 <=1.7.3` | [Server-Side Request Forgery in axios](https://github.com/advisories/GHSA-8hc4-vh64-cxmj) | ❌ bloqueante |
| `vite` | high | prod | `<=6.4.2` | [vite: `server.fs.deny` bypass on Windows alternate paths](https://github.com/advisories/GHSA-fx2h-pf6j-xcff) | ❌ bloqueante |
| `axios` | moderate | prod | `>=1.0.0 <1.15.0` | [Axios has Unrestricted Cloud Metadata Exfiltration via Header Injection Chain](https://github.com/advisories/GHSA-fvcv-3m26-pcqx) | informativo |
| `axios` | moderate | prod | `>=1.0.0 <1.15.1` | [Axios: unbounded recursion in toFormData causes DoS via deeply nested request da](https://github.com/advisories/GHSA-62hf-57xw-28j9) | informativo |
| `axios` | moderate | prod | `>=1.0.0 <1.16.0` | [axios has DoS & Header Injection via Prototype Pollution Read-Side Gadgets in ax](https://github.com/advisories/GHSA-898c-q2cr-xwhg) | informativo |
| `axios` | moderate | prod | `>=1.0.0 <1.15.0` | [Axios has a NO_PROXY Hostname Normalization Bypass that Leads to SSRF](https://github.com/advisories/GHSA-3p68-rc4w-qgx5) | informativo |
| `axios` | moderate | prod | `>=1.0.0 <1.15.1` | [Axios: Authentication Bypass via Prototype Pollution Gadget in `validateStatus` ](https://github.com/advisories/GHSA-w9j2-pvgh-6h63) | informativo |
| `axios` | moderate | prod | `>=1.0.0 <1.15.2` | [Axios: Invisible JSON Response Tampering via Prototype Pollution Gadget in `pars](https://github.com/advisories/GHSA-3w6x-2g7m-8v23) | informativo |
| `axios` | moderate | prod | `>=1.0.0 <1.15.1` | [Axios: CRLF Injection in multipart/form-data body via unsanitized blob.type in f](https://github.com/advisories/GHSA-445q-vr5w-6q77) | informativo |
| `axios` | moderate | prod | `>=1.0.0 <1.15.1` | [Axios: no_proxy bypass via IP alias allows SSRF](https://github.com/advisories/GHSA-m7pr-hjqh-92cm) | informativo |
| `axios` | moderate | prod | `>=1.0.0 <1.15.1` | [Axios' HTTP adapter-streamed uploads bypass maxBodyLength when maxRedirects: 0](https://github.com/advisories/GHSA-5c9x-8gcm-mpgx) | informativo |
| `axios` | moderate | prod | `>=1.0.0 <1.15.1` | [Axios: HTTP adapter streamed responses bypass maxContentLength](https://github.com/advisories/GHSA-vf2m-468p-8v99) | informativo |
| `axios` | moderate | prod | `>=1.0.0 <1.15.1` | [Axios: XSRF Token Cross-Origin Leakage via Prototype Pollution Gadget in `withXS](https://github.com/advisories/GHSA-xx6v-rp6x-q39c) | informativo |
| `axios` | moderate | prod | `>=1.0.0 <1.18.0` | [Axios: Excessive recursion in formDataToJSON can cause denial of service](https://github.com/advisories/GHSA-42h9-826w-cgv3) | informativo |
| `axios` | moderate | prod | `>=1.0.0 <1.18.0` | [Axios: Deep formToJSON Key Recursion Can Cause Denial of Service](https://github.com/advisories/GHSA-pmv8-rq9r-6j72) | informativo |
| `axios` | moderate | prod | `>=1.0.0 <1.18.0` | [Axios: Prototype pollution gadgets can alter axios request construction](https://github.com/advisories/GHSA-mmx7-hfxf-jppx) | informativo |
| `axios` | moderate | prod | `>=1.0.0 <1.18.0` | [Axios: Nested axios option objects can consume polluted prototype values](https://github.com/advisories/GHSA-7q8q-rj6j-mhjq) | informativo |
| `esbuild` | moderate | prod | `<=0.24.2` | [esbuild enables any website to send any requests to the development server and r](https://github.com/advisories/GHSA-67mh-4wv8-2f99) | informativo |
| `react-router` | moderate | prod | `>=6.0.0 <7.18.0` | [React Router: Open redirect via backslash in <Link> and useNavigate (CVE-2025-68](https://github.com/advisories/GHSA-wrjc-x8rr-h8h6) | informativo |
| `react-router` | moderate | prod | `>=6.4.0 <7.18.0` | [React Router: Arbitrary Constructor Injection via deserializeErrors() in React R](https://github.com/advisories/GHSA-337j-9hxr-rhxg) | informativo |
| `react-router-dom` | moderate | prod | `>=6.30.2 <=6.30.4` | [React Router: Open redirect leading to XSS](https://github.com/advisories/GHSA-jjmj-jmhj-qwj2) | informativo |
| `vite` | moderate | prod | `<=6.4.2` | [launch-editor: NTLMv2 hash disclosure via UNC path handling on Windows](https://github.com/advisories/GHSA-v6wh-96g9-6wx3) | informativo |
| `vite` | moderate | prod | `<=6.4.1` | [Vite Vulnerable to Path Traversal in Optimized Deps `.map` Handling](https://github.com/advisories/GHSA-4w7w-66w2-5vf9) | informativo |
| `axios` | low | prod | `>=1.0.0 <1.15.1` | [Axios: Null Byte Injection via Reverse-Encoding in AxiosURLSearchParams](https://github.com/advisories/GHSA-xhjh-pmcv-23jw) | informativo |

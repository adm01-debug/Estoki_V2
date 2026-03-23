import { Suspense, lazy } from "react";
import { Route } from "react-router-dom";
import { LoadingFallback } from "@/components/common/LoadingFallback";

const Auth = lazy(() => import("@/pages/Auth"));
const TwoFactorAuth = lazy(() => import("@/pages/TwoFactorAuth"));
const Unauthorized = lazy(() => import("@/pages/Unauthorized"));

export const publicRoutes = (
  <>
    <Route path="/auth" element={<Suspense fallback={<LoadingFallback />}><Auth /></Suspense>} />
    <Route path="/2fa" element={<Suspense fallback={<LoadingFallback />}><TwoFactorAuth /></Suspense>} />
    <Route path="/unauthorized" element={<Suspense fallback={<LoadingFallback />}><Unauthorized /></Suspense>} />
  </>
);

import { Suspense, lazy } from "react";
import { Route } from "react-router-dom";
import { LoadingFallback } from "@/components/common/LoadingFallback";

const Auth = lazy(() => import("@/pages/Auth"));
const Login = lazy(() => import("@/pages/auth/Login"));
const Register = lazy(() => import("@/pages/auth/Register"));
const ForgotPassword = lazy(() => import("@/pages/auth/ForgotPassword"));
const ResetPassword = lazy(() => import("@/pages/auth/ResetPassword"));
const VerifyEmail = lazy(() => import("@/pages/auth/VerifyEmail"));
const TwoFactorAuth = lazy(() => import("@/pages/TwoFactorAuth"));
const Unauthorized = lazy(() => import("@/pages/Unauthorized"));

export const publicRoutes = (
  <>
    <Route path="/auth" element={<Suspense fallback={<LoadingFallback />}><Auth /></Suspense>} />
    <Route path="/auth/login" element={<Suspense fallback={<LoadingFallback />}><Login /></Suspense>} />
    <Route path="/auth/register" element={<Suspense fallback={<LoadingFallback />}><Register /></Suspense>} />
    <Route path="/auth/forgot-password" element={<Suspense fallback={<LoadingFallback />}><ForgotPassword /></Suspense>} />
    <Route path="/auth/reset-password" element={<Suspense fallback={<LoadingFallback />}><ResetPassword /></Suspense>} />
    <Route path="/auth/verify-email" element={<Suspense fallback={<LoadingFallback />}><VerifyEmail /></Suspense>} />
    <Route path="/2fa" element={<Suspense fallback={<LoadingFallback />}><TwoFactorAuth /></Suspense>} />
    <Route path="/unauthorized" element={<Suspense fallback={<LoadingFallback />}><Unauthorized /></Suspense>} />
  </>
);

import { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/components/AuthProvider";

export default function AdminRoute({ children }: { children: ReactNode }) {
  const { user, isAdmin } = useAuth();

  if (!user) {
    return <Navigate to="/auth" replace />;
  }
  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }
  return <>{children}</>;
}
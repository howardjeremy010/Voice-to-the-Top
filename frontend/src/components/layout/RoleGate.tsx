import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useMe } from "@/lib/hooks";
import { ROLE_HOME } from "@/lib/constants";
import type { Role } from "@/lib/types";

// Management pages render only once the session is confirmed, so no protected fetch fires for visitors.
export default function RoleGate({ roles, children }: { roles: Role[]; children: ReactNode }) {
  const { data } = useMe();
  if (!data) return <div data-testid="role-gate-loading" className="h-40 animate-pulse rounded-xl bg-slate-100" />;
  if (!roles.includes(data.role)) return <Navigate to={ROLE_HOME[data.role]} replace />;
  return <>{children}</>;
}

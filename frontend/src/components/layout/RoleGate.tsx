import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useMe } from "@/lib/hooks";
import { ROLE_HOME } from "@/lib/constants";
import type { Role } from "@/lib/types";

// Redirects users whose role cannot see this page; renders while loading/offline so pages never blank out.
export default function RoleGate({ roles, children }: { roles: Role[]; children: ReactNode }) {
  const { data } = useMe();
  if (data && !roles.includes(data.role)) return <Navigate to={ROLE_HOME[data.role]} replace />;
  return <>{children}</>;
}

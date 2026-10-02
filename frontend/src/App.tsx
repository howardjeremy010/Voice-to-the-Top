import { Routes, Route, Navigate } from "react-router-dom";
import AppShell from "@/components/layout/AppShell";
import PublicShell from "@/components/layout/PublicShell";
import RoleGate from "@/components/layout/RoleGate";
import Login from "@/pages/Login";
import Beranda from "@/pages/Beranda";
import Vtt from "@/pages/Vtt";
import Lacak from "@/pages/Lacak";
import DindingApresiasi from "@/pages/DindingApresiasi";
import Wbs from "@/pages/Wbs";
import Hotline from "@/pages/Hotline";
import CaraKerja from "@/pages/CaraKerja";
import HcModerasi from "@/pages/HcModerasi";
import EksekutifInbox from "@/pages/EksekutifInbox";
import EksekutifRekap from "@/pages/EksekutifRekap";

// One <Route> per page in src/pages; BrowserRouter already wraps this in main.tsx.
export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      {/* Public: anyone can access without login */}
      <Route element={<PublicShell />}>
        <Route path="/" element={<Beranda />} />
        <Route path="/vtt" element={<Vtt />} />
        <Route path="/lacak" element={<Lacak />} />
        <Route path="/dinding-apresiasi" element={<DindingApresiasi />} />
        <Route path="/wbs" element={<Wbs />} />
        <Route path="/hotline-hc" element={<Hotline />} />
        <Route path="/cara-kerja" element={<CaraKerja />} />
      </Route>
      {/* Management: Human Capital, CEO & CHCO (login required) */}
      <Route element={<AppShell />}>
        <Route path="/hc" element={<RoleGate roles={["hc"]}><HcModerasi /></RoleGate>} />
        <Route path="/eksekutif" element={<RoleGate roles={["exec"]}><EksekutifInbox /></RoleGate>} />
        <Route path="/eksekutif/rekap" element={<RoleGate roles={["exec"]}><EksekutifRekap /></RoleGate>} />
        <Route path="/manajemen/dinding-apresiasi" element={<DindingApresiasi readOnly />} />
        <Route path="/manajemen/cara-kerja" element={<CaraKerja />} />
      </Route>
      <Route path="/tiket-saya" element={<Navigate to="/lacak" replace />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

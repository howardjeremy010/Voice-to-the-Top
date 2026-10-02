import { Routes, Route, Navigate } from "react-router-dom";
import AppShell from "@/components/layout/AppShell";
import RoleGate from "@/components/layout/RoleGate";
import Login from "@/pages/Login";
import Beranda from "@/pages/Beranda";
import Vtt from "@/pages/Vtt";
import TiketSaya from "@/pages/TiketSaya";
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
      <Route element={<AppShell />}>
        <Route path="/" element={<RoleGate roles={["karyawan"]}><Beranda /></RoleGate>} />
        <Route path="/vtt" element={<RoleGate roles={["karyawan"]}><Vtt /></RoleGate>} />
        <Route path="/tiket-saya" element={<RoleGate roles={["karyawan"]}><TiketSaya /></RoleGate>} />
        <Route path="/wbs" element={<RoleGate roles={["karyawan"]}><Wbs /></RoleGate>} />
        <Route path="/hotline-hc" element={<RoleGate roles={["karyawan"]}><Hotline /></RoleGate>} />
        <Route path="/dinding-apresiasi" element={<DindingApresiasi />} />
        <Route path="/cara-kerja" element={<CaraKerja />} />
        <Route path="/hc" element={<RoleGate roles={["hc"]}><HcModerasi /></RoleGate>} />
        <Route path="/eksekutif" element={<RoleGate roles={["exec"]}><EksekutifInbox /></RoleGate>} />
        <Route path="/eksekutif/rekap" element={<RoleGate roles={["exec"]}><EksekutifRekap /></RoleGate>} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

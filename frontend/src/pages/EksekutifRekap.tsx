import { useQuery } from "@tanstack/react-query";
import { AlertTriangle, ShieldCheck } from "lucide-react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import PageHeader from "@/components/common/PageHeader";
import { CategoryPill, StatusBadge } from "@/components/common/Badges";
import { apiGet } from "@/lib/api";
import { CATEGORIES, STATUS_META, fmtDate, fmtDateTime } from "@/lib/constants";
import type { ExecRecap, Status } from "@/lib/types";

export default function EksekutifRekap() {
  const recap = useQuery({ queryKey: ["exec-recap"], queryFn: () => apiGet<ExecRecap>("/exec/recap"), retry: false });
  const d = recap.data;
  const count = (items: { key: string; count: number }[] | undefined, key: string) => items?.find((i) => i.key === key)?.count ?? 0;
  const chart = CATEGORIES.map((c) => ({
    name: c.name.replace("Insan ", ""),
    Masuk: count(d?.by_category, c.id),
    Ditolak: count(d?.rejections_by_category, c.id),
  }));
  const rejectedTotal = count(d?.by_status, "ditolak");
  const stats = [
    { label: "Total pesan", value: d?.total ?? 0, testid: "recap-total" },
    { label: "Menunggu HC", value: count(d?.by_status, "terkirim") + count(d?.by_status, "ditinjau"), testid: "recap-pending-hc" },
    { label: "Ditolak", value: rejectedTotal, testid: "recap-rejected" },
    { label: "Melewati batas", value: d?.overdue.length ?? 0, testid: "recap-overdue" },
  ];

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Pengaman bias penyaring"
        title="Monitor & Control"
        description="Pantau jumlah dan alasan penolakan, eskalasi tiket yang melewati batas, serta jejak setiap keputusan — tanpa membuka isi pesan."
      />
      <p className="flex items-center gap-2 rounded-lg bg-teal-50 px-4 py-3 text-sm text-teal-900">
        <ShieldCheck className="size-4" /> Halaman ini tidak menampilkan judul maupun isi pesan.
      </p>
      {recap.isError && <p className="text-sm text-muted-foreground">Rekap belum dapat dimuat.</p>}

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="animate-rise rounded-xl border border-slate-200/80 bg-white p-5">
            <p className="text-sm text-muted-foreground">{s.label}</p>
            <p data-testid={s.testid} className="mt-1 text-3xl font-bold text-navy">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <div className="rounded-2xl border border-slate-200/80 bg-white p-6">
          <h2 className="font-bold text-navy">Pesan masuk & ditolak per kategori</h2>
          <div className="mt-4 h-64" data-testid="recap-chart">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chart} margin={{ left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#475569" }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: "#475569" }} />
                <Tooltip />
                <Bar dataKey="Masuk" fill="#0D9488" radius={[6, 6, 0, 0]} />
                <Bar dataKey="Ditolak" fill="#BE123C" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="rounded-2xl border border-slate-200/80 bg-white p-6">
          <h2 className="flex items-center gap-2 font-bold text-navy"><AlertTriangle className="size-4 text-amber-600" /> Eskalasi: melewati batas waktu</h2>
          <div className="mt-4 space-y-2" data-testid="recap-overdue-list">
            {d && d.overdue.length === 0 && <p className="text-sm text-muted-foreground">Tidak ada tiket yang melewati batas.</p>}
            {d?.overdue.map((o) => (
              <div key={o.ticket_no} className="flex flex-wrap items-center gap-2 rounded-lg bg-red-50/70 p-3 text-sm">
                <span className="font-mono font-semibold text-navy">{o.ticket_no}</span>
                <CategoryPill category={o.category} />
                <span className="text-red-800">{o.stage === "tinjau_hc" ? "Tinjauan HC" : "Tanggapan CEO & CHCO"} · batas {fmtDate(o.due_at)}</span>
              </div>
            ))}
          </div>
          <div className="mt-6">
            <h3 className="text-sm font-semibold text-foreground">Sebaran status</h3>
            <div className="mt-2 flex flex-wrap gap-2">
              {d?.by_status.map((s) => (
                <span key={s.key} className="inline-flex items-center gap-1.5 text-sm">
                  <StatusBadge status={s.key as Status} /> <span className="font-semibold">{s.count}</span>
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200/80 bg-white p-6">
        <h2 className="font-bold text-navy">Rekap alasan penolakan</h2>
        <Table data-testid="recap-rejections-table" className="mt-3">
          <TableHeader>
            <TableRow>
              <TableHead>Tiket</TableHead>
              <TableHead>Kategori</TableHead>
              <TableHead>Alasan</TableHead>
              <TableHead>Oleh</TableHead>
              <TableHead>Tanggal</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {d?.rejections.length === 0 && (
              <TableRow><TableCell colSpan={5} className="text-muted-foreground">Belum ada penolakan.</TableCell></TableRow>
            )}
            {d?.rejections.map((r) => (
              <TableRow key={r.ticket_no} data-testid="recap-rejection-row">
                <TableCell className="font-mono text-xs">{r.ticket_no}</TableCell>
                <TableCell><CategoryPill category={r.category} /></TableCell>
                <TableCell className="max-w-md whitespace-normal text-sm">{r.reason}</TableCell>
                <TableCell className="text-sm">{r.by_name}</TableCell>
                <TableCell className="text-sm">{fmtDate(r.at)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="rounded-2xl border border-slate-200/80 bg-white p-6">
        <h2 className="font-bold text-navy">Audit log</h2>
        <Table data-testid="recap-audit-table" className="mt-3">
          <TableHeader>
            <TableRow>
              <TableHead>Waktu</TableHead>
              <TableHead>Pelaku</TableHead>
              <TableHead>Tindakan</TableHead>
              <TableHead>Tiket</TableHead>
              <TableHead>Keterangan</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {d?.audit.map((a) => (
              <TableRow key={a.id} data-testid="recap-audit-row">
                <TableCell className="text-xs">{fmtDateTime(a.at)}</TableCell>
                <TableCell className="text-sm">{a.actor_name}</TableCell>
                <TableCell className="text-sm font-medium">{a.action}</TableCell>
                <TableCell className="font-mono text-xs">{a.ticket_no}</TableCell>
                <TableCell className="max-w-sm whitespace-normal text-xs text-muted-foreground">{a.detail ?? "-"}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <p className="text-xs text-muted-foreground">Status: {Object.values(STATUS_META).map((s) => s.label).join(" · ")}</p>
    </div>
  );
}

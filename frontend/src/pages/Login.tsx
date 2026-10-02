import { useState } from "react";
import type { FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { ShieldCheck, Loader2 } from "lucide-react";
import BrandLogo from "@/components/common/BrandLogo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { apiPost } from "@/lib/api";
import { beginSession } from "@/lib/session";
import { errMsg } from "@/lib/hooks";
import { DEMO_ACCOUNTS, DEMO_PASSWORD, ROLE_HOME, ROLE_LABEL } from "@/lib/constants";
import { queryClient } from "@/lib/queryClient";
import type { User } from "@/lib/types";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const login = useMutation({
    mutationFn: (body: { email: string; password: string }) => apiPost<User>("/auth/login", body),
    onSuccess: (user) => {
      beginSession();
      queryClient.setQueryData(["me"], user);
      navigate(ROLE_HOME[user.role], { replace: true });
    },
  });

  const submit = (e: FormEvent) => {
    e.preventDefault();
    login.mutate({ email, password });
  };

  return (
    <div className="grid min-h-svh lg:grid-cols-[1.1fr_1fr]">
      <section className="relative hidden overflow-hidden bg-navy p-12 text-white lg:flex lg:flex-col">
        <div className="awning absolute inset-x-0 top-0 z-10 h-2" aria-hidden />
        <img
          src="https://images.unsplash.com/photo-1542838132-92c53300491e?crop=entropy&cs=srgb&fm=jpg&q=70&w=1400"
          alt="Produk segar di supermarket"
          className="absolute inset-0 size-full object-cover opacity-25"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-navy via-navy/80 to-navy/40" />
        <div className="relative">
          <BrandLogo light subtitle="Ruang Manajemen" />
        </div>
        <div className="relative mt-auto max-w-lg animate-rise">
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#E9D48B]">Where Every Voice Matters</p>
          <h1 className="mt-3 text-5xl font-bold leading-[1.1] tracking-tight">
            Setiap suara insan layak didengar.
          </h1>
          <p className="mt-4 text-base leading-relaxed text-slate-300">
            Ruang manajemen untuk meninjau, meneruskan, dan menanggapi suara setiap insan perusahaan.
          </p>
          <p className="mt-8 flex items-center gap-2 text-sm text-slate-300">
            <ShieldCheck className="size-4 text-teal-300" /> Mode Rahasia dan Anonim tersedia untuk setiap pesan.
          </p>
        </div>
      </section>

      <section className="flex items-center justify-center p-6 md:p-12">
        <div className="w-full max-w-md animate-rise">
          <Link to="/" data-testid="login-back-public" className="mb-8 inline-flex items-center gap-1 text-sm font-medium text-sky-700 hover:underline">
            ← Kembali ke situs Insan Bersuara
          </Link>
          <h2 className="text-3xl font-bold tracking-tight text-navy">Masuk Manajemen</h2>
          <p className="mt-1.5 text-sm text-muted-foreground">
            Khusus Human Capital serta CEO &amp; CHCO. Karyawan tidak perlu login untuk mengirim atau melacak pesan.
          </p>
          <form onSubmit={submit} className="mt-8 space-y-4" data-testid="login-form">
            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                data-testid="login-email-input"
                type="email"
                autoComplete="username"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nama@insan.co.id"
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password">Kata sandi</Label>
              <Input
                id="password"
                data-testid="login-password-input"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            {login.isError && (
              <p data-testid="login-error" className="text-sm text-destructive">
                {errMsg(login.error, "Tidak dapat terhubung ke server.")}
              </p>
            )}
            <Button data-testid="login-submit-button" type="submit" size="lg" className="w-full" disabled={login.isPending}>
              {login.isPending && <Loader2 className="size-4 animate-spin" />} Masuk
            </Button>
          </form>

          <div className="mt-10 rounded-xl border border-slate-200/80 bg-white p-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Akun demo · kata sandi <span className="font-mono normal-case text-navy">{DEMO_PASSWORD}</span>
            </p>
            <div className="mt-3 grid gap-2">
              {DEMO_ACCOUNTS.map((a) => (
                <button
                  key={a.email}
                  type="button"
                  data-testid={`demo-account-${a.email.split("@")[0]}`}
                  onClick={() => {
                    setEmail(a.email);
                    setPassword(DEMO_PASSWORD);
                  }}
                  className="flex items-center justify-between rounded-lg border border-transparent px-3 py-2 text-left transition-colors duration-150 hover:border-slate-200 hover:bg-slate-50"
                >
                  <span>
                    <span className="block text-sm font-semibold text-foreground">{a.name}</span>
                    <span className="block font-mono text-xs text-muted-foreground">{a.email}</span>
                  </span>
                  <span className="rounded-full bg-accent px-2.5 py-0.5 text-[11px] font-semibold text-navy">
                    {a.role === "hc" ? a.note : `${ROLE_LABEL[a.role]} · ${a.note}`}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

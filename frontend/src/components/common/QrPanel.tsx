import { QRCodeSVG } from "qrcode.react";
import { ExternalLink } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function QrPanel({
  value,
  label,
  caption,
  testid,
}: {
  value: string;
  label: string;
  caption: string;
  testid: string;
}) {
  return (
    <div
      data-testid={`${testid}-panel`}
      className="flex flex-col items-center rounded-2xl border border-slate-200/80 bg-white p-6 text-center shadow-[0_8px_24px_rgba(15,23,42,0.06)]"
    >
      <div className="rounded-xl border border-slate-100 bg-white p-3">
        <QRCodeSVG data-testid={`${testid}-qr`} value={value} size={176} fgColor="#0F2942" level="M" />
      </div>
      <p className="mt-4 text-sm text-muted-foreground">{caption}</p>
      <a
        data-testid={`${testid}-link`}
        href={value}
        target="_blank"
        rel="noopener noreferrer"
        className={cn(buttonVariants({ size: "lg" }), "mt-4 w-full bg-teal text-white hover:bg-teal/90")}
      >
        {label} <ExternalLink className="size-4" />
      </a>
    </div>
  );
}

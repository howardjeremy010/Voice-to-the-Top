import type { ReactNode } from "react";

export default function PageHeader({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4 animate-rise">
      <div className="max-w-2xl">
        {eyebrow && <p className="text-xs font-semibold uppercase tracking-[0.14em] text-teal">{eyebrow}</p>}
        <h1 data-testid="page-title" className="mt-1.5 text-3xl font-bold tracking-tight text-navy md:text-4xl">
          {title}
        </h1>
        {description && <p className="mt-2 text-base leading-relaxed text-muted-foreground">{description}</p>}
      </div>
      {action}
    </div>
  );
}

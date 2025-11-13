import type { ReactNode } from "react";

type PublicLayoutProps = {
  children: ReactNode;
};

export default function PublicLayout({ children }: PublicLayoutProps) {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-gradient-soft px-4 py-8 text-foreground">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(37,99,235,0.18),_transparent_55%),_radial-gradient(circle_at_bottom,_rgba(56,189,248,0.22),_transparent_55%)]" />
      <div className="relative z-10 flex w-full max-w-xl flex-col items-center gap-6 text-center">
        <div className="flex flex-col gap-2">
          <span className="text-xs font-semibold uppercase tracking-widest text-primary/70">
            Water Purifier Services
          </span>
          <h1 className="text-3xl font-bold text-primary">
            Service Portal Access
          </h1>
          <p className="text-sm text-muted-foreground">
            Sign in to manage products, services, orders, invoices, and keep customers
            hydrated.
          </p>
        </div>
        {children}
      </div>
    </div>
  );
}


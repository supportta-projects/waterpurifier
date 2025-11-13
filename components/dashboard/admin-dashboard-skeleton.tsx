export function AdminDashboardSkeleton() {
  const statPlaceholders = Array.from({ length: 4 });
  const latestServicePlaceholders = Array.from({ length: 3 });
  const statusPlaceholders = Array.from({ length: 4 });

  return (
    <div className="space-y-8">
      <section className="rounded-[2rem] bg-gradient-primary px-8 py-10 text-white shadow-soft">
        <div className="space-y-4">
          <div className="h-3 w-24 rounded-full bg-white/30 animate-pulse" />
          <div className="h-10 w-64 rounded-full bg-white/20 animate-pulse" />
          <div className="h-14 w-full max-w-2xl rounded-3xl bg-white/10 animate-pulse" />
          <div className="flex flex-wrap gap-3">
            <div className="h-11 w-40 rounded-full bg-white/20 animate-pulse" />
            <div className="h-11 w-48 rounded-full bg-white/25 animate-pulse" />
          </div>
        </div>
      </section>

      <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        {statPlaceholders.map((_, index) => (
          <div
            key={index}
            className="rounded-3xl border border-border/40 bg-white/90 p-6 shadow-soft"
          >
            <div className="h-3 w-24 rounded-full bg-muted/40 animate-pulse" />
            <div className="mt-4 h-10 w-32 rounded-full bg-muted/30 animate-pulse" />
            <div className="mt-6 h-3 w-40 rounded-full bg-muted/30 animate-pulse" />
          </div>
        ))}
      </section>

      <section className="grid gap-5 xl:grid-cols-[3fr_2fr]">
        <div className="rounded-[2rem] border border-border/40 bg-white/95 shadow-soft">
          <div className="border-b border-border/40 px-6 py-6">
            <div className="h-5 w-48 rounded-full bg-muted/30 animate-pulse" />
            <div className="mt-3 h-3 w-64 rounded-full bg-muted/20 animate-pulse" />
          </div>
          <div className="space-y-4 px-6 py-6">
            {latestServicePlaceholders.map((_, index) => (
              <div
                key={index}
                className="flex flex-col gap-3 rounded-2xl border border-border/40 bg-white px-5 py-4 shadow-inner shadow-black/5"
              >
                <div className="flex flex-col gap-2 animate-pulse">
                  <div className="h-4 w-28 rounded-full bg-muted/30" />
                  <div className="h-3 w-52 rounded-full bg-muted/20" />
                  <div className="flex flex-wrap gap-3">
                    <div className="h-3 w-24 rounded-full bg-muted/20" />
                    <div className="h-3 w-20 rounded-full bg-muted/20" />
                  </div>
                </div>
                <div className="h-7 w-28 rounded-full bg-muted/20 animate-pulse" />
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-[2rem] border border-border/40 bg-white/95 shadow-soft">
          <div className="border-b border-border/40 px-6 py-6">
            <div className="h-5 w-44 rounded-full bg-muted/30 animate-pulse" />
            <div className="mt-3 h-3 w-56 rounded-full bg-muted/20 animate-pulse" />
          </div>
          <div className="space-y-3 px-6 py-6">
            {statusPlaceholders.map((_, index) => (
              <div
                key={index}
                className="flex items-center justify-between rounded-2xl bg-gradient-soft px-4 py-3"
              >
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-2xl bg-muted/30 animate-pulse" />
                  <div className="h-4 w-28 rounded-full bg-muted/30 animate-pulse" />
                </div>
                <div className="h-4 w-10 rounded-full bg-muted/20 animate-pulse" />
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        {statPlaceholders.map((_, index) => (
          <div
            key={index}
            className="rounded-[2rem] border border-border/40 bg-white/95 px-5 py-6 text-center shadow-soft"
          >
            <div className="mx-auto h-3 w-32 rounded-full bg-muted/30 animate-pulse" />
            <div className="mx-auto mt-4 h-6 w-20 rounded-full bg-muted/20 animate-pulse" />
          </div>
        ))}
      </section>

      <section className="grid gap-5 lg:grid-cols-2">
        <div className="rounded-[2rem] border border-border/40 bg-white/95 shadow-soft">
          <div className="border-b border-border/40 px-6 py-6">
            <div className="h-5 w-44 rounded-full bg-muted/30 animate-pulse" />
            <div className="mt-3 h-3 w-64 rounded-full bg-muted/20 animate-pulse" />
          </div>
          <div className="space-y-3 px-6 py-6">
            {statusPlaceholders.slice(0, 3).map((_, index) => (
              <div
                key={index}
                className="flex items-center justify-between rounded-2xl bg-gradient-soft px-4 py-3"
              >
                <div className="flex items-center gap-3">
                  <div className="h-4 w-32 rounded-full bg-muted/30 animate-pulse" />
                </div>
                <div className="h-4 w-12 rounded-full bg-muted/20 animate-pulse" />
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-[2rem] border border-border/40 bg-white/95 shadow-soft">
          <div className="border-b border-border/40 px-6 py-6">
            <div className="h-5 w-36 rounded-full bg-muted/30 animate-pulse" />
            <div className="mt-3 h-3 w-60 rounded-full bg-muted/20 animate-pulse" />
          </div>
          <div className="space-y-3 px-6 py-6">
            {latestServicePlaceholders.slice(0, 4).map((_, index) => (
              <div key={index} className="h-10 rounded-2xl bg-gradient-soft animate-pulse" />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}



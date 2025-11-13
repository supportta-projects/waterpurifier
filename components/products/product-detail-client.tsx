"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2 } from "lucide-react";

import { useProducts } from "@/hooks/use-products";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

type ProductDetailClientProps = {
  productId: string;
};

export function ProductDetailClient({ productId }: ProductDetailClientProps) {
  const router = useRouter();
  const { products, loading: listLoading, error: listError } = useProducts();

  const productFromList = useMemo(
    () => products.find((item) => item.id === productId) ?? null,
    [products, productId],
  );

if (listLoading) {
    return (
      <div className="flex min-h-[360px] items-center justify-center">
        <div className="flex items-center gap-3 text-sm text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin text-primary" />
          Loading product details…
        </div>
      </div>
    );
  }

  if (listError || !productFromList) {
    return (
      <div className="flex min-h-[360px] flex-col items-center justify-center gap-4 rounded-[2rem] border border-border/40 bg-white/90 p-10 text-center shadow-soft">
        <p className="text-sm text-muted-foreground">
          {listError ?? "Product not found in Firestore."}
        </p>
        <Button
          variant="outline"
          className="rounded-full"
          onClick={() => router.push("/admin/products")}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to products
        </Button>
      </div>
    );
  }

  return (
    <section className="space-y-6">
      <Button
        variant="ghost"
        className="rounded-full text-sm text-primary hover:bg-primary/10"
        onClick={() => router.push("/admin/products")}
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to products
      </Button>

      <Card className="rounded-[2rem] border border-border/40 bg-white/90 shadow-soft">
        <CardHeader className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <CardTitle className="text-2xl text-primary">{productFromList.name}</CardTitle>
            <CardDescription>
              Model: {productFromList.model} · Created{" "}
              {productFromList.createdAt
                ? new Date(productFromList.createdAt).toLocaleDateString("en-IN")
                : "—"}
            </CardDescription>
          </div>
          <Badge>
            {productFromList.status === "ACTIVE"
              ? "Active"
              : productFromList.status === "COMING_SOON"
                ? "Coming Soon"
                : "Discontinued"}
          </Badge>
        </CardHeader>
        <CardContent className="grid gap-6 md:grid-cols-[2fr_1fr]">
          <div className="space-y-3">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              Description
            </h3>
            <p className="text-sm leading-6 text-foreground">{productFromList.description}</p>
          </div>
          <div className="space-y-3 rounded-2xl bg-gradient-soft p-5 text-sm">
            <div className="flex items-center justify-between border-b border-border/40 pb-3">
              <span className="text-muted-foreground">List Price</span>
              <span className="text-lg font-semibold text-primary">
                ₹{productFromList.price.toLocaleString("en-IN")}
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              * Pricing can be adjusted per customer order. For quarterly subscriptions, ensure
              the renewal price is updated in the service plan.
            </p>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}


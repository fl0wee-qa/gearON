import {
  ArrowRight,
  Cpu,
  Keyboard,
  Monitor,
  MousePointer2,
} from "lucide-react";
import Link from "next/link";

import { ImagePlaceholder } from "@/components/image-placeholder";
import { ProductCard } from "@/components/product-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { db } from "@/lib/db";
import { getFeaturedProducts, getNewArrivals } from "@/lib/catalog";

const quickCategories = [
  { label: "Mice", slug: "mice", icon: MousePointer2 },
  { label: "Keyboards", slug: "keyboards", icon: Keyboard },
  { label: "PC Components", slug: "gpus", icon: Cpu },
  { label: "Monitors", slug: "monitors", icon: Monitor },
];

export default async function HomePage() {
  const [featured, arrivals, categories] = await Promise.all([
    getFeaturedProducts(),
    getNewArrivals(),
    db.category.findMany({ orderBy: { name: "asc" } }),
  ]);

  return (
    <div className="space-y-16 md:space-y-24">
      <section className="border-border/60 bg-card/70 grid items-center gap-10 rounded-[2rem] border p-6 md:p-10 lg:grid-cols-2">
        <div className="space-y-6">
          <Badge variant="success" className="tracking-[0.14em] uppercase">
            New Season Drop
          </Badge>
          <h1 className="font-display text-4xl leading-[0.95] font-black uppercase italic sm:text-5xl lg:text-7xl">
            Engineered To
            <span className="text-primary block">Win</span>
          </h1>
          <p className="text-muted-foreground max-w-xl text-base sm:text-lg">
            Build your setup with premium gaming accessories and PC components.
            Fast filters, responsive cart drawer, and secure checkout included.
          </p>
          <div className="flex flex-wrap gap-3">
            <Button asChild size="lg" className="rounded-2xl">
              <Link href="/catalog">
                Explore Catalog <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="rounded-2xl">
              <Link href="/catalog?sort=newest">See New Arrivals</Link>
            </Button>
          </div>
          <div className="grid grid-cols-3 gap-5 pt-2">
            {[
              { label: "Latency", value: "0.12ms" },
              { label: "Support", value: "24/7" },
              { label: "Warranty", value: "3Y" },
            ].map((stat) => (
              <div key={stat.label}>
                <p className="text-xl font-black sm:text-2xl">{stat.value}</p>
                <p className="text-muted-foreground text-[10px] font-bold tracking-[0.16em] uppercase">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="relative">
          <ImagePlaceholder
            label="Hero Placeholder"
            ratioClass="aspect-square"
            className="rotate-2"
          />
          <Card className="border-border/60 bg-background/90 absolute -bottom-5 -left-5 hidden w-52 rounded-2xl p-4 md:block">
            <p className="text-muted-foreground text-xs font-bold tracking-[0.16em] uppercase">
              Official Warranty
            </p>
            <p className="mt-1 font-semibold">3-Year Full Coverage</p>
          </Card>
        </div>
      </section>

      <section className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
        {quickCategories.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.slug}
              href={`/catalog?category=${item.slug}`}
              className="group border-border/60 bg-card/60 hover:border-primary/50 relative overflow-hidden rounded-3xl border p-5 transition-all duration-200"
            >
              <div className="bg-primary absolute inset-0 translate-y-full transition-transform duration-300 group-hover:translate-y-0" />
              <div className="relative z-10 flex flex-col items-center gap-3 text-center">
                <div className="border-border/60 bg-background/70 group-hover:border-primary-foreground/30 group-hover:bg-primary/30 rounded-2xl border p-3 transition-colors">
                  <Icon className="text-primary group-hover:text-primary-foreground h-6 w-6 transition-colors" />
                </div>
                <span className="group-hover:text-primary-foreground text-sm font-bold tracking-[0.1em] uppercase">
                  {item.label}
                </span>
              </div>
            </Link>
          );
        })}
      </section>

      <section className="space-y-6">
        <div className="flex items-end justify-between gap-3">
          <div>
            <h2 className="font-display text-3xl font-black tracking-tight uppercase italic">
              Featured Essentials
            </h2>
            <p className="text-muted-foreground text-sm">
              High-performance picks curated from our catalog.
            </p>
          </div>
          <Button asChild variant="link" className="hidden sm:inline-flex">
            <Link href="/catalog">Browse all</Link>
          </Button>
        </div>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {featured.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      <section className="space-y-6">
        <h2 className="font-display text-3xl font-black tracking-tight uppercase italic">
          New Arrivals
        </h2>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {arrivals.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      <section className="border-border/70 bg-card/60 rounded-3xl border p-6">
        <h3 className="text-muted-foreground text-sm font-extrabold tracking-[0.16em] uppercase">
          Hardware Categories
        </h3>
        <div className="mt-4 flex flex-wrap gap-2">
          {categories.map((category) => (
            <Button
              key={category.id}
              asChild
              variant="outline"
              className="rounded-full"
            >
              <Link href={`/catalog?category=${category.slug}`}>
                {category.name}
              </Link>
            </Button>
          ))}
        </div>
      </section>
    </div>
  );
}

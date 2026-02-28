import Link from "next/link";

import { GearOnLogo } from "@/components/logo";

const columns = [
  {
    title: "Shop",
    items: [
      { label: "Catalog", href: "/catalog" },
      { label: "Keyboards", href: "/catalog?category=keyboards" },
      { label: "GPUs", href: "/catalog?category=gpus" },
    ],
  },
  {
    title: "Company",
    items: [
      { label: "About", href: "/" },
      { label: "Support", href: "/" },
      { label: "Profile", href: "/profile" },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="border-border/70 bg-card/40 mt-20 border-t">
      <div className="mx-auto grid w-full max-w-7xl gap-10 px-4 py-14 md:grid-cols-4">
        <div className="space-y-4 md:col-span-2">
          <GearOnLogo />
          <p className="text-muted-foreground max-w-md text-sm">
            Performance gaming accessories and PC components with clean, modern
            UI and a production-grade architecture.
          </p>
        </div>

        {columns.map((column) => (
          <div key={column.title} className="space-y-3">
            <h4 className="text-muted-foreground text-xs font-extrabold tracking-[0.18em] uppercase">
              {column.title}
            </h4>
            <ul className="space-y-2 text-sm">
              {column.items.map((item) => (
                <li key={item.label}>
                  <Link href={item.href} className="hover:text-primary">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </footer>
  );
}

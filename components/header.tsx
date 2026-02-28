"use client";

import { Menu, Search, Shield, ShoppingBag, User } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { FormEvent, useEffect, useMemo, useState } from "react";

import { useCartDrawer } from "@/components/cart/drawer-store";
import {
  getGuestCartTotals,
  useGuestCart,
} from "@/components/cart/guest-cart-store";
import { GearOnLogo } from "@/components/logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const nav = [
  { href: "/", label: "Home" },
  { href: "/catalog", label: "Shop" },
  { href: "/profile", label: "Profile" },
];

export function SiteHeader() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { data: session } = useSession();
  const searchValue = searchParams.get("q") ?? "";
  const [dbCount, setDbCount] = useState(0);

  const guestItems = useGuestCart((state) => state.items);
  const guestTotal = useMemo(
    () => getGuestCartTotals(guestItems),
    [guestItems],
  );
  const setCartOpen = useCartDrawer((state) => state.setOpen);

  const count = session?.user?.id ? dbCount : guestTotal.count;

  useEffect(() => {
    const load = async () => {
      if (!session?.user?.id) {
        setDbCount(0);
        return;
      }

      const response = await fetch("/api/cart", { cache: "no-store" });
      if (!response.ok) {
        return;
      }

      const data = (await response.json()) as {
        items: Array<{ quantity: number }>;
      };
      setDbCount(data.items.reduce((sum, item) => sum + item.quantity, 0));
    };

    void load();
  }, [session?.user?.id, pathname]);

  const handleSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const query = String(formData.get("q") ?? "").trim();
    const params = new URLSearchParams(searchParams.toString());
    if (query) {
      params.set("q", query);
    } else {
      params.delete("q");
    }
    params.delete("page");
    router.push(`/catalog?${params.toString()}`);
  };

  return (
    <header className="border-border/80 bg-background/85 sticky top-0 z-40 border-b backdrop-blur-xl">
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center gap-3 px-4 md:h-20">
        <Link href="/" className="shrink-0" aria-label="gearON home">
          <GearOnLogo />
        </Link>

        <nav className="border-border/70 bg-card/70 hidden items-center gap-1 rounded-full border p-1 lg:flex">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "rounded-full px-4 py-2 text-xs font-bold tracking-[0.16em] uppercase transition-all duration-200",
                pathname === item.href
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
            >
              {item.label}
            </Link>
          ))}
          {session?.user?.role === "ADMIN" ? (
            <Link
              href="/admin"
              className={cn(
                "rounded-full px-4 py-2 text-xs font-bold tracking-[0.16em] uppercase transition-all duration-200",
                pathname.startsWith("/admin")
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
            >
              Admin
            </Link>
          ) : null}
        </nav>

        <form
          onSubmit={handleSearch}
          className="relative ml-auto hidden w-full max-w-sm lg:block"
        >
          <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
          <Input
            name="q"
            defaultValue={searchValue}
            placeholder="Search accessories or brands"
            className="rounded-full pl-9"
            aria-label="Search products"
          />
        </form>

        <div className="ml-auto flex items-center gap-1 lg:ml-0">
          <ThemeToggle />

          <Button
            variant="ghost"
            size="icon"
            className="relative rounded-full"
            onClick={() => setCartOpen(true)}
            aria-label="Open cart"
            data-testid="cart-toggle"
          >
            <ShoppingBag className="h-5 w-5" />
            <span className="bg-primary text-primary-foreground absolute top-1 right-1 inline-flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[10px] font-bold">
              {count}
            </span>
          </Button>

          {session?.user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-full"
                  aria-label="User menu"
                >
                  <User className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-52">
                <DropdownMenuItem asChild>
                  <Link href="/profile">My Profile</Link>
                </DropdownMenuItem>
                {session.user.role === "ADMIN" ? (
                  <DropdownMenuItem asChild>
                    <Link href="/admin">
                      <Shield className="mr-2 h-4 w-4" />
                      Admin Panel
                    </Link>
                  </DropdownMenuItem>
                ) : null}
                <DropdownMenuItem onClick={() => signOut({ callbackUrl: "/" })}>
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button asChild variant="outline" className="rounded-full">
              <Link href="/auth/sign-in">Sign in</Link>
            </Button>
          )}

          <Sheet>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full lg:hidden"
                aria-label="Open menu"
              >
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="max-w-sm">
              <SheetHeader>
                <SheetTitle>
                  <GearOnLogo />
                </SheetTitle>
              </SheetHeader>
              <div className="mt-6 space-y-3">
                {nav.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="border-border hover:bg-muted block rounded-xl border px-4 py-3 font-semibold"
                  >
                    {item.label}
                  </Link>
                ))}
                {session?.user?.role === "ADMIN" ? (
                  <Link
                    href="/admin"
                    className="border-border hover:bg-muted block rounded-xl border px-4 py-3 font-semibold"
                  >
                    Admin
                  </Link>
                ) : null}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}

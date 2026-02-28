"use client";

import { Filter } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Switch } from "@/components/ui/switch";

type Item = { id: string; name: string; slug: string };

type CatalogFiltersProps = {
  categories: Item[];
  brands: Item[];
  current: {
    q?: string;
    category?: string;
    brand?: string;
    min?: string;
    max?: string;
    inStock?: string;
    sort?: string;
  };
};

function FilterForm({
  categories,
  brands,
  current,
  onApply,
}: CatalogFiltersProps & { onApply: (query: URLSearchParams) => void }) {
  const [category, setCategory] = useState(current.category ?? "");
  const [brand, setBrand] = useState(current.brand ?? "");
  const [min, setMin] = useState(current.min ?? "");
  const [max, setMax] = useState(current.max ?? "");
  const [inStock, setInStock] = useState(current.inStock === "true");

  const selectedCategoryName = useMemo(
    () => categories.find((item) => item.slug === category)?.name,
    [categories, category],
  );

  const selectedBrandName = useMemo(
    () => brands.find((item) => item.slug === brand)?.name,
    [brands, brand],
  );

  const submit = () => {
    const params = new URLSearchParams();
    if (current.q) {
      params.set("q", current.q);
    }
    if (current.sort) {
      params.set("sort", current.sort);
    }
    if (category) {
      params.set("category", category);
    }
    if (brand) {
      params.set("brand", brand);
    }
    if (min) {
      params.set("min", min);
    }
    if (max) {
      params.set("max", max);
    }
    if (inStock) {
      params.set("inStock", "true");
    }

    onApply(params);
  };

  const reset = () => {
    const params = new URLSearchParams();
    if (current.q) {
      params.set("q", current.q);
    }
    if (current.sort) {
      params.set("sort", current.sort);
    }
    onApply(params);
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label>Category</Label>
        <p className="text-muted-foreground text-xs">
          {selectedCategoryName ?? "All categories"}
        </p>
        <div className="border-border space-y-2 rounded-2xl border p-3">
          {categories.map((item) => (
            <label
              key={item.id}
              className="flex cursor-pointer items-center gap-2 text-sm"
            >
              <Checkbox
                checked={category === item.slug}
                onCheckedChange={() =>
                  setCategory(category === item.slug ? "" : item.slug)
                }
              />
              <span>{item.name}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <Label>Brand</Label>
        <p className="text-muted-foreground text-xs">
          {selectedBrandName ?? "All brands"}
        </p>
        <div className="border-border space-y-2 rounded-2xl border p-3">
          {brands.map((item) => (
            <label
              key={item.id}
              className="flex cursor-pointer items-center gap-2 text-sm"
            >
              <Checkbox
                checked={brand === item.slug}
                onCheckedChange={() =>
                  setBrand(brand === item.slug ? "" : item.slug)
                }
              />
              <span>{item.name}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <Label>Price range (USD)</Label>
        <div className="grid grid-cols-2 gap-2">
          <Input
            inputMode="numeric"
            placeholder="Min"
            value={min}
            onChange={(event) => setMin(event.target.value)}
          />
          <Input
            inputMode="numeric"
            placeholder="Max"
            value={max}
            onChange={(event) => setMax(event.target.value)}
          />
        </div>
      </div>

      <div className="border-border flex items-center justify-between rounded-2xl border p-3">
        <Label htmlFor="in-stock">In stock only</Label>
        <Switch id="in-stock" checked={inStock} onCheckedChange={setInStock} />
      </div>

      <div className="grid grid-cols-2 gap-2">
        <Button variant="outline" onClick={reset}>
          Reset
        </Button>
        <Button onClick={submit}>Apply</Button>
      </div>
    </div>
  );
}

export function CatalogFilters(props: CatalogFiltersProps) {
  const router = useRouter();

  const apply = (query: URLSearchParams) => {
    router.push(`/catalog?${query.toString()}`);
  };

  return (
    <>
      <div className="hidden lg:block">
        <FilterForm {...props} onApply={apply} />
      </div>

      <div className="lg:hidden">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" className="w-full rounded-xl">
              <Filter className="mr-2 h-4 w-4" />
              Filters
            </Button>
          </SheetTrigger>
          <SheetContent
            side="left"
            className="w-full overflow-y-auto sm:max-w-md"
          >
            <SheetHeader>
              <SheetTitle>Filters</SheetTitle>
            </SheetHeader>
            <div className="mt-4">
              <FilterForm {...props} onApply={apply} />
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </>
  );
}

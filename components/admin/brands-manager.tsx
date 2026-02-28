"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useTransition } from "react";
import { toast } from "sonner";

import {
  createBrandAction,
  deleteBrandAction,
} from "@/app/actions/admin-actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export function BrandsManager({
  brands,
}: {
  brands: Array<{ id: string; name: string; slug: string }>;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleCreate = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);

    startTransition(async () => {
      try {
        await createBrandAction({
          name: String(data.get("name") ?? ""),
          slug: String(data.get("slug") ?? ""),
        });
        toast.success("Brand created.");
        form.reset();
        router.refresh();
      } catch {
        toast.error("Could not create brand.");
      }
    });
  };

  const handleDelete = (id: string) => {
    startTransition(async () => {
      try {
        await deleteBrandAction(id);
        toast.success("Brand removed.");
        router.refresh();
      } catch {
        toast.error("Could not delete brand.");
      }
    });
  };

  return (
    <div className="space-y-6">
      <Card className="border-border/70 bg-card/70 rounded-2xl">
        <CardHeader>
          <CardTitle>Add Brand</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="space-y-3" onSubmit={handleCreate}>
            <Input name="name" placeholder="Brand name" required />
            <Input name="slug" placeholder="brand-slug" required />
            <Button type="submit" disabled={isPending}>
              Create Brand
            </Button>
          </form>
        </CardContent>
      </Card>

      <div className="space-y-3">
        {brands.map((brand) => (
          <Card
            key={brand.id}
            className="border-border/70 bg-card/70 rounded-2xl"
          >
            <CardContent className="flex flex-wrap items-center justify-between gap-3 p-4">
              <div>
                <p className="font-semibold">{brand.name}</p>
                <p className="text-muted-foreground text-xs">{brand.slug}</p>
              </div>
              <Button
                variant="destructive"
                disabled={isPending}
                onClick={() => handleDelete(brand.id)}
              >
                Delete
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

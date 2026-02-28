"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useTransition } from "react";
import { toast } from "sonner";

import {
  createCategoryAction,
  deleteCategoryAction,
} from "@/app/actions/admin-actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export function CategoriesManager({
  categories,
}: {
  categories: Array<{
    id: string;
    name: string;
    slug: string;
    description: string | null;
  }>;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleCreate = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);

    startTransition(async () => {
      try {
        await createCategoryAction({
          name: String(data.get("name") ?? ""),
          slug: String(data.get("slug") ?? ""),
          description: String(data.get("description") ?? ""),
        });
        toast.success("Category created.");
        form.reset();
        router.refresh();
      } catch {
        toast.error("Could not create category.");
      }
    });
  };

  const handleDelete = (id: string) => {
    startTransition(async () => {
      try {
        await deleteCategoryAction(id);
        toast.success("Category removed.");
        router.refresh();
      } catch {
        toast.error("Could not delete category.");
      }
    });
  };

  return (
    <div className="space-y-6">
      <Card className="border-border/70 bg-card/70 rounded-2xl">
        <CardHeader>
          <CardTitle>Add Category</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="space-y-3" onSubmit={handleCreate}>
            <Input name="name" placeholder="Category name" required />
            <Input name="slug" placeholder="category-slug" required />
            <Textarea name="description" placeholder="Description (optional)" />
            <Button type="submit" disabled={isPending}>
              Create Category
            </Button>
          </form>
        </CardContent>
      </Card>

      <div className="space-y-3">
        {categories.map((category) => (
          <Card
            key={category.id}
            className="border-border/70 bg-card/70 rounded-2xl"
          >
            <CardContent className="flex flex-wrap items-center justify-between gap-3 p-4">
              <div>
                <p className="font-semibold">{category.name}</p>
                <p className="text-muted-foreground text-xs">{category.slug}</p>
              </div>
              <Button
                variant="destructive"
                disabled={isPending}
                onClick={() => handleDelete(category.id)}
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

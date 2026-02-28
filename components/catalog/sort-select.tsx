"use client";

import { useRouter, useSearchParams } from "next/navigation";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SORT_OPTIONS } from "@/lib/constants";

export function SortSelect({ current }: { current?: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  return (
    <Select
      value={current ?? "popularity"}
      onValueChange={(value) => {
        const params = new URLSearchParams(searchParams.toString());
        params.set("sort", value);
        params.delete("page");
        router.push(`/catalog?${params.toString()}`);
      }}
    >
      <SelectTrigger className="w-[220px] rounded-xl">
        <SelectValue placeholder="Sort products" />
      </SelectTrigger>
      <SelectContent>
        {SORT_OPTIONS.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

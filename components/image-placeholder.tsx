import { cn } from "@/lib/utils";

export function ImagePlaceholder({
  label = "Image Placeholder",
  ratioClass = "aspect-square",
  className,
}: {
  label?: string;
  ratioClass?: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "group border-border relative overflow-hidden rounded-xl border bg-gradient-to-br from-zinc-300 to-zinc-400 dark:from-zinc-700 dark:to-zinc-800",
        ratioClass,
        className,
      )}
      aria-label={label}
    >
      <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.17),transparent_45%)]" />
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="rounded-full border border-zinc-500/40 bg-zinc-100/20 px-3 py-1 text-[10px] font-bold tracking-[0.18em] text-zinc-600 uppercase dark:text-zinc-300">
          {label}
        </span>
      </div>
    </div>
  );
}

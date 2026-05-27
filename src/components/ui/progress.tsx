import { cn } from "@/lib/utils";

interface ProgressProps {
  value: number;
  max?: number;
  className?: string;
}

export function Progress({ value, max = 100, className }: ProgressProps) {
  const percentage = max > 0 ? (value / max) * 100 : 0;
  const clampedWidth = Math.min(percentage, 100);

  return (
    <div
      className={cn(
        "relative h-2 w-full overflow-hidden rounded-full bg-secondary",
        className
      )}
    >
      <div
        className={cn(
          "h-full rounded-full transition-all duration-300",
          percentage > 100
            ? "bg-red-500"
            : percentage >= 80
              ? "bg-yellow-500"
              : "bg-green-500"
        )}
        style={{ width: `${clampedWidth}%` }}
      />
    </div>
  );
}

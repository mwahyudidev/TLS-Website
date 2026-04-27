import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function StatCard({
  label,
  value,
  hint,
  accent,
  className,
}: {
  label: string;
  value: string | number;
  hint?: string;
  accent?: "default" | "success" | "warning" | "info";
  className?: string;
}) {
  return (
    <Card className={className}>
      <CardContent className="p-5">
        <div className="text-xs text-muted-foreground">{label}</div>
        <div
          className={cn(
            "text-2xl font-semibold tracking-tight mt-1",
            accent === "success" && "text-emerald-700",
            accent === "warning" && "text-amber-700",
            accent === "info" && "text-blue-700",
          )}
        >
          {value}
        </div>
        {hint && (
          <div className="text-xs text-muted-foreground mt-1">{hint}</div>
        )}
      </CardContent>
    </Card>
  );
}

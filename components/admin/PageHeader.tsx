import type { ReactNode } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export function PageHeader({
  title,
  description,
  primaryAction,
  action,
  back,
}: {
  title: string;
  description?: string;
  primaryAction?: { label: string; href: string };
  action?: ReactNode;
  back?: { label: string; href: string };
}) {
  return (
    <header className="mb-6">
      {back && (
        <Link
          href={back.href}
          className="text-sm text-muted-foreground hover:text-foreground inline-flex items-center mb-2"
        >
          ← {back.label}
        </Link>
      )}
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
          {description && (
            <p className="text-sm text-muted-foreground mt-1">{description}</p>
          )}
        </div>
        {action ?? (primaryAction && (
          <Button asChild>
            <Link href={primaryAction.href}>{primaryAction.label}</Link>
          </Button>
        ))}
      </div>
    </header>
  );
}

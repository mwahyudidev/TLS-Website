import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatMoney } from "@/lib/format";

export function PaymentInstructionsCard({
  title,
  body,
  reference,
  amountCents,
}: {
  title: string;
  body: string;
  reference: string;
  amountCents: number;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed">
          {body}
        </pre>
        <div className="rounded-md border bg-muted/40 p-3 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Reference</span>
            <span className="font-mono">{reference}</span>
          </div>
          <div className="flex justify-between mt-1">
            <span className="text-muted-foreground">Amount</span>
            <span className="font-semibold">{formatMoney(amountCents)}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

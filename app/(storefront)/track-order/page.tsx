import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrackOrderForm } from "@/components/storefront/TrackOrderForm";
import { PageHero } from "@/components/storefront/PageHero";
import { ScrollReveal } from "@/components/storefront/ScrollReveal";
import { getSetting } from "@/server/modules/settings/service";

export default async function TrackOrderPage() {
  const help = await getSetting<string>(
    "track_order.help_text",
    "Enter your order number and the email used at checkout to track your order.",
  );

  return (
    <div>
      <PageHero
        title="Track Your Order"
        subtitle="Enter your order number and email to see the latest status of your delivery."
        accent="navy"
        imageUrl="https://images.unsplash.com/photo-1494597564530-871f2b93ac55?w=1600&q=90&auto=format&fit=crop"
        compact
      />

      <div className="container py-12 max-w-md">
        <ScrollReveal>
          <p className="text-sm text-muted-foreground mb-6">{help}</p>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Order lookup</CardTitle>
            </CardHeader>
            <CardContent>
              <TrackOrderForm />
            </CardContent>
          </Card>
        </ScrollReveal>
      </div>
    </div>
  );
}

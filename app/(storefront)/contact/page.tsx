import { PageHero } from "@/components/storefront/PageHero";
import { ScrollReveal } from "@/components/storefront/ScrollReveal";
import { ContactForm } from "@/components/storefront/ContactForm";

export default function ContactPage() {
  return (
    <div>
      <PageHero
        title="Contact Us"
        subtitle="Got a question about an order, product, or subscription? We'd love to hear from you."
        accent="green"
        imageUrl="https://images.unsplash.com/photo-1510130387422-82bed34b37e9?w=1600&q=90&auto=format&fit=crop"
        ctaLabel="Chat on WhatsApp"
        ctaHref="https://wa.me/6591234567"
      />

      <div className="container py-10">
        <div className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12">
            {/* Contact info */}
            <ScrollReveal direction="left">
              <div className="space-y-6">
                <div>
                  <h2 className="font-bold text-lg mb-3">Fastest Response</h2>
                  <a
                    href="https://wa.me/6591234567"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 rounded-2xl border p-4 hover:bg-green-50 transition-colors group"
                  >
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-500 text-white flex-shrink-0">
                      <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                      </svg>
                    </div>
                    <div>
                      <div className="font-bold text-sm group-hover:text-green-700">WhatsApp</div>
                      <div className="text-xs text-muted-foreground">+65 9123 4567 · 8am–9pm daily</div>
                    </div>
                  </a>
                </div>

                <div>
                  <h2 className="font-bold text-lg mb-3">Other Ways to Reach Us</h2>
                  <div className="space-y-3">
                    <div className="rounded-xl border p-4">
                      <div className="font-semibold text-sm mb-1">Email</div>
                      <a href="mailto:hello@thelineseafood.sg" className="text-sm text-teal-600 hover:underline">
                        hello@thelineseafood.sg
                      </a>
                    </div>
                    <div className="rounded-xl border p-4">
                      <div className="font-semibold text-sm mb-1">Social Media</div>
                      <div className="flex gap-3 mt-2">
                        <a href="https://www.instagram.com/thelineseafoodsg" target="_blank" rel="noopener noreferrer" className="text-xs text-muted-foreground hover:text-foreground">Instagram</a>
                        <a href="https://www.facebook.com/thelineseafoodsg" target="_blank" rel="noopener noreferrer" className="text-xs text-muted-foreground hover:text-foreground">Facebook</a>
                        <a href="https://www.tiktok.com/@thelineseafoodsg" target="_blank" rel="noopener noreferrer" className="text-xs text-muted-foreground hover:text-foreground">TikTok</a>
                      </div>
                    </div>
                    <div className="rounded-xl border p-4">
                      <div className="font-semibold text-sm mb-1">Operating Hours</div>
                      <div className="text-xs text-muted-foreground space-y-1">
                        <div>Mon – Sat: 7am – 9pm</div>
                        <div>Sun: 8am – 6pm</div>
                        <div>Public Holidays: 9am – 3pm</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </ScrollReveal>

            {/* Contact form */}
            <ScrollReveal>
              <h2 className="font-bold text-lg mb-4">Send Us a Message</h2>
              <ContactForm />
            </ScrollReveal>
          </div>
        </div>
      </div>
    </div>
  );
}

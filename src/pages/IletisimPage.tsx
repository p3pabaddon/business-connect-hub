import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { MapPin, Phone, Mail } from "lucide-react";
import { t } from "@/lib/translations";
import { SEOHead } from "@/components/SEOHead";

const IletisimPage = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <SEOHead 
        title={t("nav.contact")}
      />
      <Header />
      <main className="flex-1 bg-surface">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
          <h1 className="text-3xl sm:text-4xl font-heading text-foreground text-center mb-12">{t("nav.contact")}</h1>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div>
              <h2 className="text-xl font-heading text-foreground mb-6">{t("contact.subtitle")}</h2>
              <div className="space-y-4 mb-8">
                {[
                  { icon: Mail, label: t("contact.form_email"), value: "destek@randevudunyasi.com" },
                  { icon: Phone, label: t("auth.phone"), value: "0850 123 45 67" },
                  { icon: MapPin, label: t("common.address"), value: "İstanbul, Türkiye" },
                ].map((item) => (
                  <div key={item.label} className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-accent/10 rounded-lg flex items-center justify-center">
                      <item.icon className="w-5 h-5 text-accent" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">{item.label}</p>
                      <p className="text-sm font-medium text-foreground">{item.value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-card border border-border rounded-xl p-6 sm:p-8 shadow-card">
              <form className="space-y-5">
                <div>
                  <Label>{t("contact.form_name")}</Label>
                  <Input placeholder={t("contact.form_name_placeholder")} className="mt-1.5" />
                </div>
                <div>
                  <Label>{t("contact.form_email")}</Label>
                  <Input type="email" placeholder={t("contact.form_email_placeholder")} className="mt-1.5" />
                </div>
                <div>
                  <Label>{t("contact.form_subject")}</Label>
                  <Input placeholder={t("contact.form_subject_placeholder")} className="mt-1.5" />
                </div>
                <div>
                  <Label>{t("contact.form_message")}</Label>
                  <Textarea placeholder={t("contact.form_message_placeholder")} className="mt-1.5 min-h-[120px]" />
                </div>
                <Button type="submit" className="w-full">{t("contact.send")}</Button>
              </form>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default IletisimPage;

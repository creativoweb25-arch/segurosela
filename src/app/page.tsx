import { Header } from "@/components/sections/Header";
import { HeroSection } from "@/components/sections/HeroSection";
import { ServicesSection } from "@/components/sections/ServicesSection";
import { AboutSection } from "@/components/sections/AboutSection";
import { PartnersSection } from "@/components/sections/PartnersSection";
import { CommercialAlliesWithCalendar } from "@/components/sections/CommercialAlliesWithCalendar";
import { QuoteSection } from "@/components/sections/QuoteSection";
import { InstagramSection } from "@/components/sections/InstagramSection";
import { BlogSection } from "@/components/sections/BlogSection";
import { ContactSection } from "@/components/sections/ContactSection";
import { Footer } from "@/components/sections/Footer";
import { AdminPanel } from "@/components/admin/AdminPanel";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      <Header />
      <main className="flex-1">
        <HeroSection />
        <ServicesSection />
        <AboutSection />
        <PartnersSection />
        <CommercialAlliesWithCalendar />
        <QuoteSection />
        <InstagramSection />
        <BlogSection />
        <ContactSection />
      </main>
      <Footer />
      <AdminPanel />
    </div>
  );
}

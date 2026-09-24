import { useEffect, useState } from "react";
import { AnimatePresence } from "framer-motion";
import { Link } from "wouter";
import { ArrowRight, X } from "lucide-react";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Route, Switch, useLocation } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";

// Pages
import Home from "@/pages/home";
import About from "@/pages/about";
import Staff from "@/pages/staff";
import Departments from "@/pages/departments";
import Infrastructure from "@/pages/infrastructure";
import Regulations from "@/pages/regulations";
import News from "@/pages/news";
import NewsDetail from "@/pages/news-detail";
import StudentLife from "@/pages/student-life";
import Clubs from "@/pages/clubs";
import Projects from "@/pages/projects";
import Career from "@/pages/career";
import Calendar from "@/pages/calendar";
import Contact from "@/pages/contact";
import Schedule from "@/pages/schedule";
import NotFound from "@/pages/not-found";
import Admin from "@/pages/admin";

// Components
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { SmoothScroll } from "@/components/smooth-scroll";
import { ShaderBackground } from "@/components/shader-background";
import { ScrollToTop } from "@/components/scroll-to-top";
import { Preloader } from "@/components/preloader";

type PopupNewsItem = {
  id: number;
  title: string;
  excerpt: string;
  imageUrl?: string | null;
  popup?: boolean | null;
};

function BigNewsPopup() {
  const [item, setItem] = useState<PopupNewsItem | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    let active = true;
    fetch("/api/news", { cache: "no-store" })
      .then(response => response.ok ? response.json() as Promise<PopupNewsItem[]> : [])
      .then(items => {
        if (!active) return;
        const popup = Array.isArray(items) ? items.find(news => news.popup) : undefined;
        if (popup) {
          setItem(popup);
          setOpen(true);
        }
      })
      .catch(() => {});
    return () => { active = false; };
  }, []);

  if (!open || !item) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/75 px-4 py-8 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="big-news-popup-title">
      <div className="relative w-full max-w-2xl overflow-hidden rounded-3xl border border-amber-400/30 bg-[#07111F] shadow-2xl shadow-black/60">
        <button
          type="button"
          onClick={() => setOpen(false)}
          aria-label="Mbyll lajmin"
          className="absolute right-3 top-3 z-10 rounded-full bg-black/60 p-2 text-white/80 transition-colors hover:bg-black/90 hover:text-white"
        >
          <X size={18} />
        </button>
        {item.imageUrl && <img src={item.imageUrl} alt="" className="h-48 w-full object-cover sm:h-64" />}
        <div className="space-y-4 p-6 sm:p-8">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-amber-400">Lajm i rëndësishëm</p>
          <h2 id="big-news-popup-title" className="font-serif text-2xl font-bold leading-tight text-white sm:text-3xl">{item.title}</h2>
          {item.excerpt && <p className="text-sm leading-relaxed text-white/65 sm:text-base">{item.excerpt}</p>}
          <Link href={`/lajme/${item.id}`} onClick={() => setOpen(false)} className="inline-flex items-center gap-2 rounded-xl bg-amber-400 px-5 py-3 text-xs font-bold uppercase tracking-widest text-black transition-colors hover:bg-amber-300">
            Lexo lajmin <ArrowRight size={15} />
          </Link>
        </div>
      </div>
    </div>
  );
}

function AnimatedRoutes() {
  const [location] = useLocation();
  return (
    <AnimatePresence mode="wait">
      <Switch key={location}>
        <Route path="/" component={Home} />
        <Route path="/rreth-nesh" component={About} />
        <Route path="/stafi" component={Staff} />
        <Route path="/departamente" component={Departments} />
        <Route path="/infrastruktura" component={Infrastructure} />
        <Route path="/rregullore" component={Regulations} />
        <Route path="/lajme" component={News} />
        <Route path="/lajme/:id" component={NewsDetail} />
        <Route path="/jeta-studentore" component={StudentLife} />
        <Route path="/klube" component={Clubs} />
        <Route path="/projektet" component={Projects} />
        <Route path="/karriera" component={Career} />
        <Route path="/kalendar" component={Calendar} />
        <Route path="/orari" component={Schedule} />
        <Route path="/kontakt" component={Contact} />
        <Route component={NotFound} />
      </Switch>
    </AnimatePresence>
  );
}

function MainLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-[#04090F] text-foreground transition-colors duration-300 relative overflow-hidden">
      <ScrollToTop />
      <Preloader />
      <ShaderBackground />
      <BigNewsPopup />
      <div className="relative z-10 flex flex-col min-h-screen w-full">
        <Navbar />
        <main className="flex-1 w-full">
          <AnimatedRoutes />
        </main>
        <Footer />
      </div>
    </div>
  );
}

function Router() {
  const [location] = useLocation();
  if (location === "/admin") return <Admin />;
  return <MainLayout />;
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="dark" switchable>
        <TooltipProvider>
          <SmoothScroll>
            <Router />
          </SmoothScroll>
          <Toaster position="top-right" closeButton richColors />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;

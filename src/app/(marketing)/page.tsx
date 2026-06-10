"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useTheme } from 'next-themes';

// Exact recreation of the polished high-converting landing (skattpro-landing/index.html)
// Preserves visual identity, copy, interactions, pricing, and Norwegian tone 100%.
// All CTAs now link to real auth flows.

export default function SkattProLanding() {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [newsletterStatus, setNewsletterStatus] = useState('');
  const [contactStatus, setContactStatus] = useState('');
  const { setTheme: setNextTheme } = useTheme();

  // Theme handling (matches original exactly + persistence + sync with next-themes)
  useEffect(() => {
    const saved = localStorage.getItem('skattpro-theme') as 'light' | 'dark' | null;
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const initial = saved || (prefersDark ? 'dark' : 'light');
    setTheme(initial);
    document.documentElement.setAttribute('data-theme', initial);
    if (initial === 'dark') {
      document.documentElement.classList.add('dark');
    }
    // Sync with next-themes
    setNextTheme(initial);
  }, [setNextTheme]);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('skattpro-theme', newTheme);
    setNextTheme(newTheme);
  };

  // Scrollspy + sticky CTA + header glass
  useEffect(() => {
    const header = document.getElementById('site-header');
    const stickyCta = document.getElementById('sticky-cta');
    const backToTop = document.getElementById('back-to-top');

    const onScroll = () => {
      const scrollY = window.scrollY;

      if (header) {
        if (scrollY > 60) {
          header.style.background = 'var(--bg-glass-strong)';
          header.style.backdropFilter = 'blur(22px)';
          header.style.webkitBackdropFilter = 'blur(22px)';
          header.style.borderBottom = '1px solid var(--border)';
        } else {
          header.style.background = 'transparent';
          header.style.backdropFilter = 'none';
          header.style.webkitBackdropFilter = 'none';
          header.style.borderBottom = '1px solid transparent';
        }
      }

      if (stickyCta && backToTop) {
        if (scrollY > 700) {
          stickyCta.classList.add('visible');
          backToTop.classList.add('visible');
        } else {
          stickyCta.classList.remove('visible');
          backToTop.classList.remove('visible');
        }
      }

      // Scrollspy nav
      const sections = ['home', 'features', 'modules', 'dashboard', 'pricing', 'faq', 'contact'];
      let current = '';
      for (let i = sections.length - 1; i >= 0; i--) {
        const el = document.getElementById(sections[i]);
        if (el && el.offsetTop - 140 <= scrollY) {
          current = sections[i];
          break;
        }
      }

      document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${current}`) {
          link.classList.add('active');
        }
      });
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Fade-up animation (IntersectionObserver)
  useEffect(() => {
    const fadeEls = document.querySelectorAll('.fade-up');
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    );
    fadeEls.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  // Animated counters (exact original logic + nb-NO)
  useEffect(() => {
    const counters = document.querySelectorAll<HTMLElement>('.counter-value[data-target]');
    let ran = false;

    const animate = () => {
      if (ran) return;
      const section = document.getElementById('stats');
      if (!section) return;
      const rect = section.getBoundingClientRect();
      if (rect.top < window.innerHeight - 80) {
        ran = true;
        counters.forEach((counter) => {
          const target = parseInt(counter.getAttribute('data-target') || '0', 10);
          const duration = 1800;
          const start = performance.now();

          const update = (now: number) => {
            const elapsed = now - start;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            counter.textContent = Math.floor(eased * target).toLocaleString('nb-NO');
            if (progress < 1) {
              requestAnimationFrame(update);
            } else {
              counter.textContent = target.toLocaleString('nb-NO');
            }
          };
          requestAnimationFrame(update);
        });
      }
    };

    window.addEventListener('scroll', animate, { passive: true });
    // initial check
    setTimeout(animate, 300);
    return () => window.removeEventListener('scroll', animate);
  }, []);

  // FAQ accordion
  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  // Forms (wired to friendly messages — replace with real API later)
  const handleNewsletter = (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const email = (form.querySelector('#newsletter-email') as HTMLInputElement)?.value.trim();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setNewsletterStatus('Vennligst oppgi en gyldig e-postadresse.');
      return;
    }
    setNewsletterStatus('Takk! Du er nå påmeldt. Vi sender nyttig innhold om regnskap og skatt.');
    form.reset();
    setTimeout(() => setNewsletterStatus(''), 4000);
  };

  const handleContact = (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const name = (form.querySelector('#contact-name') as HTMLInputElement)?.value.trim();
    const email = (form.querySelector('#contact-email') as HTMLInputElement)?.value.trim();
    const msg = (form.querySelector('#contact-msg') as HTMLTextAreaElement)?.value.trim();

    if (!name || !email || !msg) {
      setContactStatus('Vennligst fyll ut alle feltene.');
      return;
    }
    setContactStatus('Takk for din melding! Vi svarer innen 1 virkedag.');
    form.reset();
    setTimeout(() => setContactStatus(''), 4500);
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      {/* Skip link */}
      <a href="#main-content" className="skip-link">Hopp til hovedinnhold</a>

      {/* Sticky CTA */}
      <div id="sticky-cta" className="fixed bottom-6 right-6 z-50">
        <Link
          href="#pricing"
          className="flex items-center gap-2 bg-primary-500 hover:bg-primary-600 text-white font-semibold px-5 py-3 rounded-full shadow-lg transition-colors"
        >
          <span className="text-sm">🚀</span> Start gratis
        </Link>
      </div>

      {/* Back to top */}
      <button
        id="back-to-top"
        aria-label="Tilbake til toppen"
        onClick={scrollToTop}
        className="fixed bottom-6 left-6 z-50 glass-strong w-11 h-11 rounded-full flex items-center justify-center shadow-lg cursor-pointer"
      >
        ↑
      </button>

      {/* Header */}
      <header
        id="site-header"
        className="fixed top-0 left-0 w-full z-40 transition-all duration-300"
        style={{ background: 'transparent' }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 md:h-18">
            <a href="#home" className="flex items-center gap-2.5" aria-label="SkattPro hjem">
              <div className="w-9 h-9 bg-primary-500 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-md">S</div>
              <span className="text-xl font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>SkattPro</span>
            </a>

            <nav className="hidden md:flex items-center gap-6 text-sm font-medium" aria-label="Hovedmeny">
              <a href="#home" className="nav-link active">Hjem</a>
              <a href="#features" className="nav-link">Funksjoner</a>
              <a href="#pricing" className="nav-link">Priser</a>
              <a href="#faq" className="nav-link">FAQ</a>
              <a href="#contact" className="nav-link">Kontakt</a>
            </nav>

            <div className="hidden md:flex items-center gap-3">
              <button
                id="theme-toggle"
                aria-label="Bytt tema"
                onClick={toggleTheme}
                className="flex items-center gap-2 px-1"
              >
                <div className="theme-toggle-track"><div className="theme-toggle-knob"></div></div>
                <span className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>Tema</span>
              </button>

              <Link
                href="/auth/signin"
                className="text-sm font-medium px-4 py-2 rounded-lg glass hover:bg-white/80 transition-colors"
                style={{ color: 'var(--text-primary)' }}
              >
                Logg inn
              </Link>
              <Link
                href="#pricing"
                className="bg-primary-500 hover:bg-primary-600 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors shadow-sm"
              >
                Kom i gang
              </Link>
            </div>

            <button
              id="mobile-toggle"
              aria-label="Åpne meny"
              aria-expanded={mobileMenuOpen}
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden w-10 h-10 flex items-center justify-center rounded-lg glass"
            >
              ☰
            </button>
          </div>
        </div>
      </header>

      {/* Mobile menu */}
      <div id="mobile-menu" className={`mobile-menu fixed inset-0 z-50 flex flex-col ${mobileMenuOpen ? 'open' : ''}`}>
        <div className="glass-strong h-full flex flex-col p-5 pt-4">
          <div className="flex justify-between items-center mb-8">
            <span className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>Meny</span>
            <button
              onClick={() => setMobileMenuOpen(false)}
              aria-label="Lukk meny"
              className="w-10 h-10 flex items-center justify-center rounded-lg glass"
            >
              ✕
            </button>
          </div>
          <nav className="flex flex-col gap-1 text-lg font-medium">
            {['Hjem', 'Funksjoner', 'Dashboard', 'Priser', 'FAQ', 'Kontakt'].map((label, i) => {
              const href = ['#home', '#features', '#dashboard', '#pricing', '#faq', '#contact'][i];
              return (
                <a
                  key={i}
                  href={href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="mobile-nav-link py-3 px-4 rounded-xl"
                  style={{ color: 'var(--text-primary)' }}
                >
                  {label}
                </a>
              );
            })}
            <Link
              href="#pricing"
              onClick={() => setMobileMenuOpen(false)}
              className="mt-4 bg-primary-500 text-white text-center font-semibold py-3 rounded-xl"
            >
              Start gratis
            </Link>
            <Link
              href="/auth/signin"
              onClick={() => setMobileMenuOpen(false)}
              className="mt-2 text-center py-3 rounded-xl glass"
            >
              Logg inn
            </Link>
          </nav>
        </div>
      </div>

      <main id="main-content">
        {/* HERO */}
        <section id="home" className="relative min-h-screen flex items-center overflow-hidden pt-16 pb-20">
          <div className="absolute top-20 -left-40 w-[500px] h-[500px] bg-primary-400/20 rounded-full blur-3xl pointer-events-none"></div>
          <div className="absolute bottom-10 -right-32 w-[400px] h-[400px] bg-blue-300/15 rounded-full blur-3xl pointer-events-none"></div>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div className="fade-up">
                <span className="section-label">Norsk regnskap, menneskelig design</span>
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight tracking-tight" style={{ color: 'var(--text-primary)' }}>
                  Regnskap som holder deg i <span className="text-primary-500">forkanten</span>
                </h1>
                <p className="mt-5 text-lg leading-relaxed max-w-xl" style={{ color: 'var(--text-secondary)' }}>
                  Alt du trenger for å drive bedrift — faktura, regnskap, skattemelding, lønn og bankavstemming — i ett enkelt, moderne system.
                </p>
                <div className="mt-8 flex flex-wrap gap-4">
                  <Link href="#pricing" className="bg-primary-500 hover:bg-primary-600 text-white font-semibold px-7 py-3.5 rounded-xl shadow-lg transition-colors text-center">
                    Start gratis prøveperiode <span className="ml-1 text-sm">→</span>
                  </Link>
                  <a href="#features" className="glass-strong font-semibold px-7 py-3.5 rounded-xl shadow-sm transition-colors text-center" style={{ color: 'var(--text-primary)' }}>
                    Se funksjoner
                  </a>
                </div>
                <div className="mt-6 flex items-center gap-2 text-sm" style={{ color: 'var(--text-muted)' }}>
                  <span>✓</span> Gratis 14 dagers prøveperiode · Ingen kredittkort påkrevd
                </div>
              </div>

              {/* Hero dashboard mock (exact visual from landing) */}
              <div className="fade-up hidden lg:block">
                <div className="glass-card p-6 shadow-2xl">
                  <div className="flex items-center justify-between mb-5">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-red-400"></div>
                      <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                      <div className="w-3 h-3 rounded-full bg-green-400"></div>
                    </div>
                    <span className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>SkattPro Dashboard</span>
                  </div>
                  <div className="grid grid-cols-3 gap-4 mb-5">
                    <div className="rounded-xl p-4 glass">
                      <div className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>Omsetning</div>
                      <div className="text-xl font-bold mt-1" style={{ color: 'var(--text-primary)' }}>875 400 kr</div>
                      <div className="text-xs text-green-500 mt-1">↑ +12.4%</div>
                    </div>
                    <div className="rounded-xl p-4 glass">
                      <div className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>Utgifter</div>
                      <div className="text-xl font-bold mt-1" style={{ color: 'var(--text-primary)' }}>214 200 kr</div>
                      <div className="text-xs text-red-500 mt-1">↓ -3.1%</div>
                    </div>
                    <div className="rounded-xl p-4 glass">
                      <div className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>Resultat</div>
                      <div className="text-xl font-bold mt-1 text-primary-500">661 200 kr</div>
                      <div className="text-xs text-green-500 mt-1">↑ +18.7%</div>
                    </div>
                  </div>
                  <div className="rounded-xl p-5 glass">
                    <div className="text-xs font-semibold mb-3" style={{ color: 'var(--text-muted)' }}>OMSNITT DETTE ÅRET</div>
                    <div className="flex items-end gap-1 h-20">
                      {[6,8,10,7,12,16,20,18,14,8,6].map((h, i) => (
                        <div key={i} className="flex-1 bg-primary-300/60 rounded-t" style={{ height: `${h * 4}px` }}></div>
                      ))}
                    </div>
                    <div className="text-xs mt-2" style={{ color: 'var(--text-muted)' }}>Jan — Nov</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* STATS */}
        <section id="stats" className="py-16 relative">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="glass-strong rounded-2xl p-8 shadow-lg fade-up">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
                <div><div className="text-3xl sm:text-4xl font-bold text-primary-500 counter-value" data-target="12400">0</div><div className="mt-1 text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Aktive bedrifter</div></div>
                <div><div className="text-3xl sm:text-4xl font-bold text-primary-500 counter-value" data-target="98">0</div><div className="mt-1 text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>% fornøydhet</div></div>
                <div><div className="text-3xl sm:text-4xl font-bold text-primary-500 counter-value" data-target="3500">0</div><div className="mt-1 text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Timer spart i SNITT</div></div>
                <div><div className="text-3xl sm:text-4xl font-bold text-primary-500 counter-value" data-target="99">0</div><div className="mt-1 text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>% oppetid</div></div>
              </div>
            </div>
          </div>
        </section>

        {/* FEATURES */}
        <section id="features" className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-14 fade-up">
              <span className="section-label">Features</span>
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight" style={{ color: 'var(--text-primary)' }}>Alt for regnskap og administrasjon</h2>
              <p className="mt-4 text-lg" style={{ color: 'var(--text-secondary)' }}>Kraftige verktøy for norske bedrifter.</p>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                { icon: '📘', title: 'Regnskap', desc: 'Hold oversikt over inntekt og utgifter. Automatisk kategorisering og rapportering.' },
                { icon: '📄', title: 'Faktura', desc: 'Lag profesjonelle fakturaer på minutter. Auto-purring og betalingsoppfølging.' },
                { icon: '📋', title: 'Skattemelding', desc: 'Innlevering til Skatteetaten og Altinn rett fra systemet.' },
                { icon: '🏦', title: 'Bank & Konto', desc: 'Koble bedriftskontoen din. Automatisk import og avstemming hver dag.' },
                { icon: '👥', title: 'Ansatte & Lønn', desc: 'Enkel lønnskjøring, a-melding og pensjonstrekk.' },
                { icon: '📷', title: 'Kvitteringer', desc: 'OCR leser beløp og kategoriserer automatisk.' },
              ].map((f, i) => (
                <article key={i} className="glass-card p-6 fade-up">
                  <div className="w-12 h-12 bg-primary-500/10 rounded-xl flex items-center justify-center mb-5 text-2xl">{f.icon}</div>
                  <h3 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>{f.title}</h3>
                  <p className="mt-2 text-sm" style={{ color: 'var(--text-secondary)' }}>{f.desc}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* MODULES / BYGGESTENENE */}
        <section id="modules" className="py-20" style={{ background: 'var(--bg-secondary)' }}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-14 fade-up">
              <span className="section-label">Byggestenene</span>
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight" style={{ color: 'var(--text-primary)' }}>Alt samlet</h2>
              <p className="mt-4 text-lg" style={{ color: 'var(--text-secondary)' }}>Fra kalkulator til påminnelser.</p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                { icon: '🧮', title: 'Kalkulator', desc: 'Inntekt, MVA, foreløpig skatt — gjør regnestykket på sekunder.', tag: 'MVA' },
                { icon: '📄', title: 'Faktura', desc: 'Send, purr og følg opp. Maksimer cash-flow.', tag: 'Purring' },
                { icon: '💰', title: 'Forskuddskalkulator', desc: 'Beregn forskuddsskatt automatisk.', tag: '15. mars' },
                { icon: '📅', title: 'Frister', desc: 'Aldri gå glipp av en frist. Vi varsler på forhånd.', tag: 'Varsling' },
                { icon: '📊', title: 'Utgifter', desc: 'Se alle utgifter på ett sted.', tag: 'Kategori' },
                { icon: '🔔', title: 'Påminnelser', desc: 'Smarte påminnelser for faktura, skatt og frister.', tag: 'Smart' },
              ].map((m, i) => (
                <article key={i} className="glass-card p-6 fade-up">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-xl">{m.icon}</span>
                    <h3 className="font-bold" style={{ color: 'var(--text-primary)' }}>{m.title}</h3>
                  </div>
                  <p className="text-sm mb-3" style={{ color: 'var(--text-secondary)' }}>{m.desc}</p>
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-primary-500/10 text-primary-600">{m.tag}</span>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* DASHBOARD PREVIEW */}
        <section id="dashboard" className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-14 fade-up">
              <span className="section-label">Dashboard</span>
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight" style={{ color: 'var(--text-primary)' }}>Hele regnskapet i et øyekast</h2>
              <p className="mt-4 text-lg" style={{ color: 'var(--text-secondary)' }}>Ett dashboard for omsetning, utgifter, budsjetter og varsler.</p>
            </div>
            <div className="grid lg:grid-cols-2 gap-8 items-center">
              <div className="glass-card p-6 shadow-2xl fade-up">
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-400"></div><div className="w-3 h-3 rounded-full bg-yellow-400"></div><div className="w-3 h-3 rounded-full bg-green-400"></div>
                  </div>
                  <span className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>SkattPro Dashboard</span>
                </div>
                <div className="grid grid-cols-3 gap-4 mb-5">
                  <div className="rounded-xl p-4 glass"><div className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>Omsetning</div><div className="text-xl font-bold mt-1" style={{ color: 'var(--text-primary)' }}>1 245 000 kr</div><div className="text-xs text-green-500 mt-1">↑ +8.2%</div></div>
                  <div className="rounded-xl p-4 glass"><div className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>Utgifter</div><div className="text-xl font-bold mt-1" style={{ color: 'var(--text-primary)' }}>432 000 kr</div><div className="text-xs text-red-500 mt-1">↓ -1.4%</div></div>
                  <div className="rounded-xl p-4 glass"><div className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>Resultat</div><div className="text-xl font-bold mt-1 text-primary-500">813 000 kr</div><div className="text-xs text-green-500 mt-1">↑ +14.1%</div></div>
                </div>
                <div className="rounded-xl p-5 glass">
                  <div className="text-xs font-semibold mb-3" style={{ color: 'var(--text-muted)' }}>OMSNITT DETTE ÅRET</div>
                  <div className="flex items-end gap-1 h-20">
                    {[6,8,10,7,12,16,20,18,14,8,6].map((h,i) => <div key={i} className="flex-1 bg-primary-300/60 rounded-t" style={{height: h*4 + 'px'}}></div>)}
                  </div>
                  <div className="text-xs mt-2" style={{ color: 'var(--text-muted)' }}>Jan — Nov</div>
                </div>
              </div>

              <div className="fade-up">
                <h3 className="text-xl font-bold mb-3" style={{ color: 'var(--text-primary)' }}>Alt du trenger, på ett sted</h3>
                <ul className="space-y-3">
                  {[
                    'Realtime oversikt over omsetning og resultat',
                    'Automatisk bankavstemming',
                    'Enkel fakturaoppfølging',
                    'Skattemelding og forskuddskalkulator',
                    'Lønn og a-melding'
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <span className="text-primary-500 mt-1">✓</span>
                      <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>{item}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-6">
                  <Link href="/auth/signup" className="inline-block bg-primary-500 text-white px-6 py-2.5 rounded-xl font-semibold shadow-sm">Prøv dashboardet gratis</Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* PRICING — exact match to landing */}
        <section id="pricing" className="py-20" style={{ background: 'var(--bg-secondary)' }}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-14 fade-up">
              <span className="section-label">Priser</span>
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight" style={{ color: 'var(--text-primary)' }}>Enkel, forutsigbar prising</h2>
              <p className="mt-4 text-lg" style={{ color: 'var(--text-secondary)' }}>Ingen skjulte kostnader. Bytt plan når som helst.</p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {/* Starter */}
              <div className="glass-card p-7 fade-up flex flex-col">
                <h3 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>Starter</h3>
                <div className="mt-4"><span className="text-4xl font-extrabold" style={{ color: 'var(--text-primary)' }}>0 kr</span><span className="text-sm" style={{ color: 'var(--text-muted)' }}>/md</span></div>
                <p className="mt-3 text-sm" style={{ color: 'var(--text-secondary)' }}>For frilansere og små ENK.</p>
                <ul className="mt-6 space-y-3 flex-1">
                  {['Opptil 50 transaksjoner/md', '5 fakturaer/md', 'Grunnleggende rapportering', 'E-postsupport'].map((t, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm" style={{ color: 'var(--text-secondary)' }}><span className="text-primary-500">✓</span> {t}</li>
                  ))}
                </ul>
                <Link href="/auth/signup?plan=starter" className="mt-8 block text-center py-3 rounded-xl font-semibold border border-primary-500 text-primary-500 hover:bg-primary-500 hover:text-white transition-colors">Kom i gang</Link>
              </div>

              {/* Pro — Mest populær */}
              <div className="pricing-popular glass-card p-7 fade-up flex flex-col">
                <h3 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>Pro</h3>
                <div className="mt-4"><span className="text-4xl font-extrabold" style={{ color: 'var(--text-primary)' }}>149 kr</span><span className="text-sm" style={{ color: 'var(--text-muted)' }}>/md</span></div>
                <p className="mt-3 text-sm" style={{ color: 'var(--text-secondary)' }}>For voksende bedrifter som trenger full funksjonalitet.</p>
                <ul className="mt-6 space-y-3 flex-1">
                  {['Ubegrenset transaksjoner', 'Ubegrenset fakturaer', 'Avansert rapportering', 'Skattemelding + forskudd', 'Prioritert support'].map((t, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm" style={{ color: 'var(--text-secondary)' }}><span className="text-primary-500">✓</span> {t}</li>
                  ))}
                </ul>
                <Link href="/auth/signup?plan=pro" className="mt-8 block text-center py-3 rounded-xl font-semibold bg-primary-500 text-white hover:bg-primary-600 transition-colors shadow-lg">Start gratis prøve</Link>
              </div>

              {/* Bedrift */}
              <div className="glass-card p-7 fade-up flex flex-col">
                <h3 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>Bedrift</h3>
                <div className="mt-4"><span className="text-4xl font-extrabold" style={{ color: 'var(--text-primary)' }}>399 kr</span><span className="text-sm" style={{ color: 'var(--text-muted)' }}>/md</span></div>
                <p className="mt-3 text-sm" style={{ color: 'var(--text-secondary)' }}>For AS og selskap.</p>
                <ul className="mt-6 space-y-3 flex-1">
                  {['Alt i Pro', 'Opptil 10 brukere', 'Lønnskjøring + a-melding', 'Dedikert account-manager', 'API-tilgang'].map((t, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm" style={{ color: 'var(--text-secondary)' }}><span className="text-primary-500">✓</span> {t}</li>
                  ))}
                </ul>
                <a href="#contact" className="mt-8 block text-center py-3 rounded-xl font-semibold border border-primary-500 text-primary-500 hover:bg-primary-500 hover:text-white transition-colors">Kontakt salg</a>
              </div>
            </div>
            <p className="text-center text-sm mt-8" style={{ color: 'var(--text-muted)' }}>14 dagers full tilgang til Pro-funksjoner. Avbryt når som helst.</p>
          </div>
        </section>

        {/* FAQ */}
        <section id="faq" className="py-20">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-14 fade-up">
              <span className="section-label">FAQ</span>
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight" style={{ color: 'var(--text-primary)' }}>Ofte stilte spørsmål</h2>
            </div>
            <div className="space-y-4 fade-up">
              {[
                { q: 'Kan jeg prøve SkattPro uten å betale?', a: 'Ja. Alle planer får 14 dagers gratis prøveperiode med full funksjonalitet. Ingen kredittkort påkrevd.' },
                { q: 'Støtter SkattPro alle norske banker?', a: 'Vi knytter til de fleste store norske banker via BankID og API-tilkobling. Liste med støttede banker vokser fortløpende. Du kan også laste opp CSV/OFX manuelt fra dag 1.' },
                { q: 'Hva skjer med dataene mine?', a: 'Dataene dine lagres i Europa med banknivå sikkerhet og kryptering. Vi selger aldri eller deler dine data. Full eksport + sletting på ett klikk (GDPR). ' },
                { q: 'Kan jeg eksportere regnskapet til Excel?', a: 'Ja, du kan eksportere til CSV, Excel og standardbibliotekformater når som helst.' },
              ].map((item, idx) => (
                <div key={idx} className="glass-card overflow-hidden">
                  <button
                    onClick={() => toggleFaq(idx)}
                    className={`faq-trigger w-full flex items-center justify-between p-5 text-left font-semibold ${openFaq === idx ? 'open' : ''}`}
                    style={{ color: 'var(--text-primary)' }}
                    aria-expanded={openFaq === idx}
                  >
                    <span>{item.q}</span>
                    <span className="faq-icon text-primary-500 text-xl leading-none">+</span>
                  </button>
                  <div className={`faq-answer px-5 pb-0 text-sm leading-relaxed ${openFaq === idx ? 'open' : ''}`} style={{ color: 'var(--text-secondary)' }}>
                    <div className="pb-5">{item.a}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* NEWSLETTER */}
        <section id="newsletter" className="py-20" style={{ background: 'var(--bg-secondary)' }}>
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center fade-up">
            <span className="section-label">Nyhetsbrev</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight" style={{ color: 'var(--text-primary)' }}>Få tips og veiledninger rett i innboksen</h2>
            <p className="mt-4 text-lg" style={{ color: 'var(--text-secondary)' }}>Vi sender nyttig innhold om regnskap, skatt og vekst.</p>
            <form id="newsletter-form" onSubmit={handleNewsletter} className="mt-8 flex flex-col sm:flex-row gap-3 max-w-xl mx-auto" noValidate>
              <input type="email" id="newsletter-email" required placeholder="din@epost.no" className="flex-1 px-4 py-3 rounded-xl glass text-sm focus:outline-none" style={{ color: 'var(--text-primary)' }} />
              <button type="submit" className="bg-primary-500 hover:bg-primary-600 text-white font-semibold px-6 py-3 rounded-xl transition-colors shadow-sm">Abonner</button>
            </form>
            {newsletterStatus && <p className="mt-3 text-sm" style={{ color: newsletterStatus.includes('Takk') ? '#16a34a' : 'var(--text-muted)' }}>{newsletterStatus}</p>}
          </div>
        </section>

        {/* CONTACT */}
        <section id="contact" className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-14 fade-up">
              <span className="section-label">Kontakt</span>
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight" style={{ color: 'var(--text-primary)' }}>Kom i kontakt</h2>
              <p className="mt-4 text-lg" style={{ color: 'var(--text-secondary)' }}>Har du spørsmål? Vi hjelper deg gjerne.</p>
            </div>
            <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              <div className="glass-card p-7 fade-up">
                <h3 className="font-bold mb-2" style={{ color: 'var(--text-primary)' }}>Send oss en melding</h3>
                <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>Vi svarer vanligvis innen 1 virkedag.</p>
                <form id="contact-form" onSubmit={handleContact} className="space-y-4" noValidate>
                  <div className="grid grid-cols-2 gap-4">
                    <div><label htmlFor="contact-name" className="block text-xs font-semibold mb-1" style={{ color: 'var(--text-secondary)' }}>Navn</label><input type="text" id="contact-name" required className="w-full px-3 py-2 rounded-lg glass text-sm" style={{ color: 'var(--text-primary)' }} /></div>
                    <div><label htmlFor="contact-email" className="block text-xs font-semibold mb-1" style={{ color: 'var(--text-secondary)' }}>E-post</label><input type="email" id="contact-email" required className="w-full px-3 py-2 rounded-lg glass text-sm" style={{ color: 'var(--text-primary)' }} /></div>
                  </div>
                  <div><label htmlFor="contact-msg" className="block text-xs font-semibold mb-1" style={{ color: 'var(--text-secondary)' }}>Melding</label><textarea id="contact-msg" rows={4} required className="w-full px-3 py-2 rounded-lg glass text-sm" style={{ color: 'var(--text-primary)' }}></textarea></div>
                  <button type="submit" className="bg-primary-500 hover:bg-primary-600 text-white font-semibold px-5 py-2.5 rounded-lg transition-colors shadow-sm">Send melding</button>
                  {contactStatus && <p className="text-sm" style={{ color: contactStatus.includes('Takk') ? '#16a34a' : '#b91c1c' }}>{contactStatus}</p>}
                </form>
              </div>

              <div className="glass-card p-7 fade-up flex flex-col justify-between">
                <div>
                  <h3 className="font-bold mb-2" style={{ color: 'var(--text-primary)' }}>Kontaktinformasjon</h3>
                  <ul className="space-y-3 text-sm" style={{ color: 'var(--text-secondary)' }}>
                    <li className="flex items-center gap-3">✉️ post@skattpro.no</li>
                    <li className="flex items-center gap-3">📞 +47 000 00 000</li>
                    <li className="flex items-center gap-3">📍 Oslo, Norge</li>
                  </ul>
                </div>
                <div className="mt-6">
                  <p className="text-xs font-semibold mb-2" style={{ color: 'var(--text-muted)' }}>FØLG OSS</p>
                  <div className="flex gap-3">
                    <a href="#" className="w-9 h-9 rounded-full glass flex items-center justify-center hover:bg-primary-500 hover:text-white transition-colors" aria-label="LinkedIn">in</a>
                    <a href="#" className="w-9 h-9 rounded-full glass flex items-center justify-center hover:bg-primary-500 hover:text-white transition-colors" aria-label="X">𝕏</a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="py-12 border-t" style={{ borderColor: 'var(--border)', background: 'var(--bg-secondary)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-2 md:grid-cols-4 gap-8 mb-10">
          <div>
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center text-white font-bold shadow-sm">S</div>
              <span className="font-bold text-lg" style={{ color: 'var(--text-primary)' }}>SkattPro</span>
            </div>
            <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>Alt du trenger for å drive bedrift. Regnskap som holder deg i forkanten.</p>
          </div>
          <div>
            <h4 className="font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>Produkt</h4>
            <ul className="space-y-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
              <li><a href="#features" className="hover:text-primary-500">Funksjoner</a></li>
              <li><a href="#pricing" className="hover:text-primary-500">Priser</a></li>
              <li><a href="#faq" className="hover:text-primary-500">FAQ</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>Selskap</h4>
            <ul className="space-y-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
              <li><a href="#contact" className="hover:text-primary-500">Kontakt</a></li>
              <li><a href="#" className="hover:text-primary-500">Personvern</a></li>
              <li><a href="#" className="hover:text-primary-500">Vilkår</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>Kontakt</h4>
            <ul className="space-y-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
              <li>post@skattpro.no</li>
              <li>Oslo, Norge</li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-4 pt-8 border-t" style={{ borderColor: 'var(--border)' }}>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>© 2026 SkattPro. Alle rettigheter reservert.</p>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Betalt SSL · GDPR-kompatibel · Data i Europa</p>
        </div>
      </footer>
    </>
  );
}

"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { Zap, ArrowRight, ChevronDown, Sparkles } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useRef } from "react";
import { Button } from "@/components/ui/button";

/**
 * Hero section with scroll-driven parallax background and entrance
 * animations. Requires client-side hooks (`useScroll`/`useTransform`/
 * `useRef`) so it is isolated from the server-rendered page shell.
 */
export function HeroSection() {
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const heroY = useTransform(scrollYProgress, [0, 1], ["0%", "40%"]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  return (
    <header ref={heroRef} role="banner" className="relative min-h-screen flex flex-col overflow-hidden">
      {/* Background image with parallax */}
      <motion.div className="absolute inset-0 z-0" style={{ y: heroY }}>
        <Image
          src="/hero-stadium.png"
          alt=""
          fill
          priority
          className="object-cover object-center"
          sizes="100vw"
          quality={90}
        />
        {/* Gradient overlays for readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/40 to-[#0a0a0f]" />
        <div className="absolute inset-0 bg-gradient-to-r from-blue-950/40 via-transparent to-indigo-950/40" />
      </motion.div>

      {/* Animated grain texture */}
      <div className="absolute inset-0 z-[1] opacity-[0.03] pointer-events-none bg-[url('data:image/svg+xml,%3Csvg viewBox=%270 0 256 256%27 xmlns=%27http://www.w3.org/2000/svg%27%3E%3Cfilter id=%27noise%27%3E%3CfeTurbulence type=%27fractalNoise%27 baseFrequency=%270.9%27 stitchTiles=%27stitch%27/%3E%3C/filter%3E%3Crect width=%27100%25%27 height=%27100%25%27 filter=%27url(%23noise)%27/%3E%3C/svg%3E')]" />

      {/* Navigation */}
      <nav
        role="navigation"
        aria-label="Main navigation"
        className="relative z-10 flex items-center justify-between px-6 py-5 max-w-7xl mx-auto w-full"
      >
        <div className="flex items-center gap-2.5">
          <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center">
            <Zap className="h-5 w-5 text-white" aria-hidden="true" />
          </div>
          <span className="text-xl font-bold text-white tracking-tight">StadiumAI</span>
        </div>
        <div className="hidden md:flex items-center gap-1">
          {["Dashboard", "Stadium", "Tournament", "Tickets"].map((label) => (
            <Link
              key={label}
              href={`/${label.toLowerCase()}`}
              className="px-3.5 py-2 rounded-lg text-sm font-medium text-white/70 hover:text-white hover:bg-white/10 transition-all"
            >
              {label}
            </Link>
          ))}
        </div>
        <Link href="/dashboard">
          <Button className="bg-white/10 backdrop-blur-md border border-white/20 text-white hover:bg-white/20 h-10 px-5">
            Launch App
          </Button>
        </Link>
      </nav>

      {/* Hero content */}
      <motion.div
        style={{ opacity: heroOpacity }}
        className="relative z-10 flex-1 flex flex-col items-center justify-center text-center px-6 pb-32"
      >
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          {/* Badge */}
          <motion.span
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="inline-flex items-center gap-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 px-4 py-1.5 text-xs font-medium text-blue-300 mb-8"
          >
            <Sparkles className="h-3.5 w-3.5 text-blue-400" aria-hidden="true" />
            Powered by Google Gemini 2.0 Flash
          </motion.span>

          {/* Heading */}
          <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black text-white tracking-tighter leading-[0.9]">
            Smart{" "}
            <span className="bg-gradient-to-r from-blue-400 via-cyan-300 to-blue-400 bg-clip-text text-transparent">
              Stadiums
            </span>
            <br />
            <span className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white/60 tracking-tight">
              & Tournament Operations
            </span>
          </h1>

          <p className="mt-8 text-base sm:text-lg text-slate-300/90 max-w-2xl mx-auto leading-relaxed font-light">
            AI-powered stadium management platform — from smart seat recommendations
            and real-time crowd density prediction to dynamic pricing, fraud detection,
            and automated tournament scheduling. All running on Google Cloud.
          </p>

          {/* CTAs */}
          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <Link href="/dashboard">
              <Button className="h-13 px-8 text-base font-semibold bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 transition-all hover:scale-[1.02]">
                Open Dashboard
                <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
              </Button>
            </Link>
            <Link href="/stadium">
              <Button variant="outline" className="h-13 px-8 text-base font-semibold text-white border-white/20 hover:bg-white/10 backdrop-blur-sm">
                Explore Stadium
              </Button>
            </Link>
          </div>
        </motion.div>
      </motion.div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2"
      >
        <span className="text-xs text-white/40 uppercase tracking-widest">Scroll</span>
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
        >
          <ChevronDown className="h-5 w-5 text-white/40" aria-hidden="true" />
        </motion.div>
      </motion.div>
    </header>
  );
}

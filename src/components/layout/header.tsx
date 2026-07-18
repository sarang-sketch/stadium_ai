'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, User, Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

/**
 * App header with StadiumAI logo, navigation, and user controls.
 */
export function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const [isDark, setIsDark] = useState(false);

  return (
    <header role="banner" className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="mr-4 hidden md:flex">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <span className="hidden font-bold sm:inline-block">StadiumAI</span>
          </Link>
          <nav role="navigation" aria-label="Main navigation" className="flex items-center space-x-6 text-sm font-medium">
            <Link href="/dashboard" className="transition-colors hover:text-foreground/80 text-foreground/60">Dashboard</Link>
            <Link href="/stadium" className="transition-colors hover:text-foreground/80 text-foreground/60">Stadium</Link>
            <Link href="/tournament" className="transition-colors hover:text-foreground/80 text-foreground/60">Tournament</Link>
            <Link href="/tickets" className="transition-colors hover:text-foreground/80 text-foreground/60">Tickets</Link>
          </nav>
        </div>
        <Button variant="ghost" className="mr-2 px-0 text-base hover:bg-transparent focus-visible:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 md:hidden" onClick={() => setIsOpen(!isOpen)} aria-label="Toggle Menu">
          {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          <span className="sr-only">Toggle Menu</span>
        </Button>
        <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
          <div className="w-full flex-1 md:w-auto md:flex-none">
          </div>
          <nav className="flex items-center">
            <Button variant="ghost" size="icon" onClick={() => setIsDark(!isDark)} aria-label="Toggle dark mode">
              {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Button>
            <Button variant="ghost" size="icon" aria-label="User menu">
              <User className="h-5 w-5" />
            </Button>
          </nav>
        </div>
      </div>
      <AnimatePresence>
        {isOpen && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="md:hidden overflow-hidden">
            <nav role="navigation" aria-label="Mobile navigation" className="flex flex-col space-y-4 p-4">
              <Link href="/dashboard" className="block transition-colors hover:text-foreground/80">Dashboard</Link>
              <Link href="/stadium" className="block transition-colors hover:text-foreground/80">Stadium</Link>
              <Link href="/tournament" className="block transition-colors hover:text-foreground/80">Tournament</Link>
              <Link href="/tickets" className="block transition-colors hover:text-foreground/80">Tickets</Link>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

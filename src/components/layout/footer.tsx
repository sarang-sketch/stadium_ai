'use client';

import React from 'react';

/**
 * App footer with copyright and simple links.
 */
export function Footer() {
  return (
    <footer role="contentinfo" className="border-t py-6 md:py-0 w-full shrink-0">
      <div className="container flex flex-col items-center justify-between gap-4 md:h-14 md:flex-row">
        <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
          Built for the Smart Stadiums & Tournament Operations challenge. &copy; {new Date().getFullYear()} StadiumAI.
        </p>
        <div className="flex items-center space-x-4 text-sm text-muted-foreground">
          <a href="#" className="hover:underline">Terms</a>
          <a href="#" className="hover:underline">Privacy</a>
        </div>
      </div>
    </footer>
  );
}

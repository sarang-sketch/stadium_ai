'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Home, Map, Trophy, Ticket, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

/**
 * Collapsible sidebar navigation component.
 */
export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const items = [
    { label: 'Dashboard', icon: Home, href: '/dashboard' },
    { label: 'Stadium', icon: Map, href: '/stadium' },
    { label: 'Tournament', icon: Trophy, href: '/tournament' },
    { label: 'Tickets', icon: Ticket, href: '/tickets' },
  ];

  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    if (e.key === 'ArrowDown') {
      const next = document.getElementById(`sidebar-item-${index + 1}`);
      next?.focus();
    } else if (e.key === 'ArrowUp') {
      const prev = document.getElementById(`sidebar-item-${index - 1}`);
      prev?.focus();
    }
  };

  return (
    <motion.aside 
      initial={false}
      animate={{ width: collapsed ? 80 : 240 }}
      className="h-screen border-r bg-background flex flex-col items-center py-4 relative"
      role="navigation"
      aria-label="Sidebar Navigation"
    >
      <div className="w-full px-2 space-y-2">
        {items.map((item, index) => (
          <Link
            key={item.href}
            href={item.href}
            id={`sidebar-item-${index}`}
            onKeyDown={(e) => handleKeyDown(e, index)}
            className={cn(
              "flex items-center p-2 rounded-md hover:bg-accent hover:text-accent-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              collapsed ? "justify-center" : "justify-start"
            )}
            aria-current={index === 0 ? 'page' : undefined}
          >
            <item.icon className="h-6 w-6 shrink-0" />
            {!collapsed && <span className="ml-3 font-medium">{item.label}</span>}
          </Link>
        ))}
      </div>
      <Button
        variant="ghost"
        size="icon"
        className="absolute bottom-4 right-[-16px] h-8 w-8 rounded-full border bg-background shadow-md"
        onClick={() => setCollapsed(!collapsed)}
        aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
      </Button>
    </motion.aside>
  );
}

'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface LoadingSkeletonProps {
  variant?: 'card' | 'table-row' | 'text' | 'avatar';
  className?: string;
}

/**
 * Reusable skeleton loader with different variants.
 */
export function LoadingSkeleton({ variant = 'text', className }: LoadingSkeletonProps) {
  const baseClasses = "bg-muted relative overflow-hidden";
  const shimmer = (
    <motion.div
      className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent"
      animate={{ translateX: ['100%'] }}
      transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
    />
  );

  let variantClasses = "";
  switch (variant) {
    case 'card':
      variantClasses = "h-48 rounded-xl w-full";
      break;
    case 'table-row':
      variantClasses = "h-12 rounded-md w-full";
      break;
    case 'avatar':
      variantClasses = "h-12 w-12 rounded-full";
      break;
    case 'text':
    default:
      variantClasses = "h-4 rounded w-3/4";
      break;
  }

  return (
    <div
      className={cn(baseClasses, variantClasses, className)}
      aria-busy="true"
      aria-label="Loading..."
      role="progressbar"
    >
      {shimmer}
    </div>
  );
}

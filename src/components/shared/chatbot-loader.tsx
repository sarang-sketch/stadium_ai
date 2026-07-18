"use client";

import dynamic from "next/dynamic";

/**
 * The chatbot is a floating widget that only matters after hydration (it has
 * no server-rendered content of its own), so it is lazy-loaded on the client
 * only. `next/dynamic` with `ssr: false` must be called from within a Client
 * Component, so this loader wrapper exists to keep the root layout a Server
 * Component while still deferring the chatbot bundle to the client.
 */
export const ChatbotLoader = dynamic(
  () => import("./chatbot").then((mod) => mod.Chatbot),
  { ssr: false }
);

"use client";

import { useEffect } from "react";

export function MeBootstrap() {
  useEffect(() => {
    fetch("/api/me").catch(() => {
      // Ignore bootstrap errors.
    });
  }, []);

  return null;
}

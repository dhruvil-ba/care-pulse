"use client";

import { useEffect, useState } from "react";

export type UserRole = "patient" | "provider" | "admin" | null;

export function useUserRole() {
  const [role, setRole] = useState<UserRole>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    const loadRole = async () => {
      try {
        const response = await fetch("/api/me");
        const data = await response.json();
        if (active) {
          setRole((data?.role as UserRole) ?? null);
        }
      } catch {
        if (active) {
          setRole(null);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    loadRole();

    return () => {
      active = false;
    };
  }, []);

  return { role, loading };
}

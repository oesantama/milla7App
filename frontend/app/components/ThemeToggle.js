"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Sun, Moon } from 'lucide-react';

/**
 * Toggle de Dark Mode
 */
export default function ThemeToggle() {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <button
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="theme-toggle-btn"
      aria-label="Alternar tema"
      title={
        theme === "dark" ? "Cambiar a modo claro" : "Cambiar a modo oscuro"
      }
    >
      {theme === "dark" ? (
        <Sun size={20} color="#fbc02d" />
      ) : (
        <Moon size={20} />
      )}
    </button>
  );
}

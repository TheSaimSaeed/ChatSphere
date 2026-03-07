"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

/** Small theme toggle button — cycles between light and dark mode. Safe to use on any background. */
export function ThemeToggle() {
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    useEffect(() => setMounted(true), []);

    if (!mounted) return <div className="size-9" />;

    const isDark = theme === "dark" || (theme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);

    return (
        <button
            type="button"
            aria-label="Toggle theme"
            onClick={() => setTheme(isDark ? "light" : "dark")}
            className="size-9 rounded-full flex items-center justify-center border border-white/10 bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-all"
        >
            {isDark ? (
                <span className="material-symbols-outlined text-[1.1rem]" style={{ fontSize: '18px' }}>light_mode</span>
            ) : (
                <span className="material-symbols-outlined text-[1.1rem]" style={{ fontSize: '18px', color: '#555' }}>dark_mode</span>
            )}
        </button>
    );
}

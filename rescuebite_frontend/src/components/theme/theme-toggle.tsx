"use client";

import { Check, Monitor, Moon, Sun } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useTheme } from "@/components/theme/theme-provider";
import { THEME_OPTIONS, type Theme } from "@/lib/theme";
import { cn } from "@/lib/utils";

const OPTION_ICONS: Record<Theme, typeof Sun> = {
  light: Sun,
  dark: Moon,
  system: Monitor,
};

/**
 * Light/dark/system picker for the navbar. The trigger icon is driven by the
 * `dark` class on <html> (not React state) so it is correct on first paint
 * and never causes a hydration mismatch.
 */
export function ThemeToggle({ className }: { className?: string }) {
  const { theme, setTheme } = useTheme();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    function handlePointerDown(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Change color theme"
        onClick={() => setOpen((isOpen) => !isOpen)}
        className={cn(
          "rounded-md border border-white/15 p-2 text-white transition-colors hover:bg-white/10",
          className,
        )}
      >
        <Sun aria-hidden className="size-4 dark:hidden" />
        <Moon aria-hidden className="hidden size-4 dark:block" />
      </button>

      {open && (
        <div
          role="menu"
          aria-label="Color theme"
          className="absolute right-0 z-30 mt-2 w-36 rounded-md border border-border bg-popover p-1 text-sm text-popover-foreground shadow-lg"
        >
          {THEME_OPTIONS.map((option) => {
            const Icon = OPTION_ICONS[option.value];
            const isActive = theme === option.value;
            return (
              <button
                key={option.value}
                type="button"
                role="menuitemradio"
                aria-checked={isActive}
                onClick={() => {
                  setTheme(option.value);
                  setOpen(false);
                }}
                className="flex w-full items-center gap-2 rounded-sm px-3 py-2 text-left transition-colors hover:bg-muted"
              >
                <Icon aria-hidden className="size-4 text-muted-foreground" />
                <span className="flex-1">{option.label}</span>
                {isActive && (
                  <Check aria-hidden className="size-4 text-primary" />
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

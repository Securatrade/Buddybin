"use client";

import Link from "next/link";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { Logo } from "@/components/logo";
import { ButtonLink } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/how-it-works", label: "How it works" },
  { href: "/for-cleaners", label: "For cleaners" },
  { href: "/help", label: "Help" },
  { href: "/login", label: "Log in" },
];

export function SiteHeader() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-buddy-border bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        <Logo />
        <nav className="hidden items-center gap-7 text-sm font-semibold text-buddy-navy md:flex">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href} className="hover:text-buddy-blue">
              {item.label}
            </Link>
          ))}
          <ButtonLink href="/#signup" size="sm">
            Get started
          </ButtonLink>
        </nav>
        <button
          type="button"
          className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-buddy-border text-buddy-navy md:hidden"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          onClick={() => setOpen((value) => !value)}
        >
          {open ? <X aria-hidden size={22} /> : <Menu aria-hidden size={22} />}
        </button>
      </div>
      <div
        className={cn(
          "border-t border-buddy-border bg-white px-4 py-4 md:hidden",
          open ? "block" : "hidden",
        )}
      >
        <nav className="mx-auto flex max-w-7xl flex-col gap-2">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-xl px-3 py-3 font-semibold text-buddy-navy hover:bg-buddy-pale"
              onClick={() => setOpen(false)}
            >
              {item.label}
            </Link>
          ))}
          <ButtonLink href="/#signup" className="mt-2" onClick={() => setOpen(false)}>
            Get started
          </ButtonLink>
        </nav>
      </div>
    </header>
  );
}

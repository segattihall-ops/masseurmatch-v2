"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, LogOut } from "lucide-react";
import { useState } from "react";
import { signOut } from "@/app/sign-in/actions";

interface NavbarProps {
  title: string;
  homeLink: string;
}

export function Navbar({ title, homeLink }: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  return (
    <nav className="border-b border-border bg-surface">
      <div className="mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo and title */}
          <Link href={homeLink} className="flex items-center gap-2">
            <div className="text-xl font-bold text-brand-primary">MM Pro</div>
            <div className="text-sm font-medium text-text-secondary hidden sm:block">{title}</div>
          </Link>

          {/* Desktop nav items */}
          <div className="hidden md:flex items-center gap-8">
            <Link
              href={homeLink}
              className={`text-sm font-medium transition ${
                pathname === homeLink
                  ? "text-brand-primary"
                  : "text-text-secondary hover:text-text-primary"
              }`}
            >
              Home
            </Link>
          </div>

          {/* Sign out button */}
          <button
            onClick={() => signOut()}
            className="flex items-center gap-2 text-sm font-medium text-text-secondary hover:text-text-primary transition"
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">Sign Out</span>
          </button>

          {/* Mobile menu button */}
          <button
            className="md:hidden ml-4 text-text-secondary"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-4 pt-4 border-t border-border space-y-2">
            <Link
              href={homeLink}
              className="block px-4 py-2 rounded-lg text-sm font-medium text-text-secondary hover:bg-surface-hover"
              onClick={() => setMobileMenuOpen(false)}
            >
              Home
            </Link>
            <button
              onClick={() => {
                signOut();
                setMobileMenuOpen(false);
              }}
              className="w-full text-left px-4 py-2 rounded-lg text-sm font-medium text-text-secondary hover:bg-surface-hover"
            >
              Sign Out
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}

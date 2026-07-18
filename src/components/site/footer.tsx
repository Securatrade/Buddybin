import Link from "next/link";
import { Logo } from "@/components/logo";
import { BRAND } from "@/lib/constants";

const legalLinks = [
  ["Contact", "/contact"],
  ["Login", "/login"],
  ["Help", "/help"],
  ["Terms", "/terms"],
  ["Privacy", "/privacy"],
  ["Cookies", "/cookies"],
  ["Cancellation policy", "/cancellation-policy"],
] as const;

export function SiteFooter() {
  return (
    <footer className="border-t border-buddy-border bg-white">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 md:grid-cols-[1.2fr_1fr] lg:px-8">
        <div>
          <Logo />
          <p className="mt-4 max-w-xl text-sm leading-6 text-slate-600">
            {BRAND.legalArrangement} Legal wording and operating policies are
            launch placeholders for legal review.
          </p>
        </div>
        <nav className="flex flex-wrap gap-x-6 gap-y-3 text-sm font-semibold text-buddy-navy md:justify-end">
          {legalLinks.map(([label, href]) => (
            <Link key={href} href={href} className="hover:text-buddy-blue">
              {label}
            </Link>
          ))}
        </nav>
      </div>
    </footer>
  );
}

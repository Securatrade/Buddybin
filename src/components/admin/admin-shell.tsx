import Link from "next/link";
import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";

const links = [
  ["Dashboard", "/admin"],
  ["Customers", "/admin/customers"],
  ["Pricing", "/admin/pricing"],
  ["Messages", "/admin/messages"],
] as const;

export function AdminShell({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-screen bg-buddy-pale">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <Logo />
          <nav className="flex flex-wrap items-center gap-2 text-sm font-bold text-buddy-navy">
            {links.map(([label, href]) => (
              <Link
                key={href}
                href={href}
                className="rounded-full px-3 py-2 hover:bg-white"
              >
                {label}
              </Link>
            ))}
            <form action="/api/admin/logout" method="post">
              <Button type="submit" size="sm" variant="secondary">
                Log out
              </Button>
            </form>
          </nav>
        </div>
        <div className="mt-8">{children}</div>
      </div>
    </main>
  );
}

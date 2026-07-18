import Image from "next/image";
import Link from "next/link";
import { BRAND } from "@/lib/constants";
import { cn } from "@/lib/utils";

export function Logo({ className }: { className?: string }) {
  return (
    <Link
      href="/"
      className={cn("inline-flex items-center gap-3 font-bold text-buddy-navy", className)}
      aria-label="BuddyBin home"
    >
      <Image
        src="/buddybin-logo.png"
        alt=""
        width={168}
        height={54}
        priority
        className="h-11 w-auto"
      />
      <span className="sr-only">{BRAND.name}</span>
    </Link>
  );
}

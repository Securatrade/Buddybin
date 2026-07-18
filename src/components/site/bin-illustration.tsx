import { Droplets } from "lucide-react";

export function BinIllustration() {
  return (
    <div
      className="relative min-h-[320px] overflow-hidden rounded-[28px] border border-buddy-border bg-buddy-pale shadow-sm"
      aria-hidden="true"
    >
      <div className="absolute -right-8 top-8 h-28 w-28 rounded-full bg-buddy-blue/10" />
      <div className="absolute left-8 top-8 flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-bold text-buddy-navy shadow-sm">
        <Droplets className="text-buddy-blue" size={18} />
        Sorted monthly
      </div>
      <svg
        viewBox="0 0 520 360"
        className="absolute inset-x-0 bottom-0 h-full w-full"
        role="img"
        aria-label=""
      >
        <path
          d="M42 292c48-62 105-91 171-87 72 5 91 53 160 35 41-10 72-38 105-80v158H42z"
          fill="#ffffff"
        />
        <g transform="translate(112 103)">
          <rect x="36" y="38" width="92" height="160" rx="13" fill="#061B2F" />
          <rect x="28" y="22" width="108" height="28" rx="10" fill="#0B2B4B" />
          <circle cx="56" cy="205" r="13" fill="#132238" />
          <circle cx="110" cy="205" r="13" fill="#132238" />
          <path d="M60 82h48M60 112h48M60 142h48" stroke="#fff" strokeWidth="8" strokeLinecap="round" opacity=".35" />
        </g>
        <g transform="translate(245 72)">
          <rect x="36" y="38" width="92" height="190" rx="13" fill="#39B929" />
          <rect x="28" y="22" width="108" height="28" rx="10" fill="#2FA121" />
          <circle cx="56" cy="235" r="13" fill="#132238" />
          <circle cx="110" cy="235" r="13" fill="#132238" />
          <path d="M61 96c17-22 45-22 62 0M61 136c17-22 45-22 62 0" fill="none" stroke="#fff" strokeWidth="8" strokeLinecap="round" opacity=".6" />
        </g>
        <g transform="translate(358 118)">
          <rect x="32" y="34" width="82" height="144" rx="13" fill="#159EE4" />
          <rect x="24" y="20" width="98" height="26" rx="10" fill="#087DBC" />
          <circle cx="50" cy="185" r="12" fill="#132238" />
          <circle cx="98" cy="185" r="12" fill="#132238" />
          <path d="M55 84h36M55 114h36" stroke="#fff" strokeWidth="8" strokeLinecap="round" opacity=".55" />
        </g>
        <path
          d="M68 272c38 15 74 22 108 20 38-2 61-16 96-18 51-3 79 23 126 15 18-3 35-10 52-21"
          fill="none"
          stroke="#159EE4"
          strokeWidth="12"
          strokeLinecap="round"
          opacity=".32"
        />
      </svg>
    </div>
  );
}

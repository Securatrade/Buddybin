import {
  CalendarCheck,
  CheckCircle2,
  CreditCard,
  Smile,
  Sparkles,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

const hassleItems = [
  "No chasing cleaners.",
  "No remembering to book.",
  "No cash payments.",
  "No bank transfers.",
  "No hassle.",
] as const;

const benefits: Array<{
  title: string;
  copy: string;
  icon: LucideIcon;
  tone: string;
}> = [
  {
    title: "Monthly Professional Cleaning",
    copy: "Your bins are professionally cleaned every month after collection to help keep them fresh, hygienic and looking their best.",
    icon: Sparkles,
    tone: "bg-buddy-green text-white",
  },
  {
    title: "One Simple Monthly Payment",
    copy: "No invoices, no cash, no manual bank transfers and no remembering when payment is due.",
    icon: CreditCard,
    tone: "bg-buddy-blue text-white",
  },
  {
    title: "We Organise Everything",
    copy: "Tell us your collection day once. We arrange your recurring clean with a trusted local cleaning partner.",
    icon: CalendarCheck,
    tone: "bg-buddy-navy text-white",
  },
  {
    title: "Set It And Forget It",
    copy: "Sign up once. No monthly booking, no messages back and forth, no admin.",
    icon: Smile,
    tone: "bg-buddy-pale text-buddy-green",
  },
];

const trustItems = [
  "Trusted local cleaning partners",
  "Secure online payments",
  "Simple monthly subscription",
  "Cancel anytime",
] as const;

export function WhyChooseBuddyBin() {
  return (
    <section className="bg-buddy-navy px-4 py-12 text-white sm:px-6 sm:py-16 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr] lg:items-end">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.18em] text-buddy-green">
              Why choose BuddyBin
            </p>
            <h2 className="mt-4 max-w-4xl text-4xl font-black leading-[1.03] sm:text-5xl lg:text-6xl 2xl:text-7xl">
              <span className="block">NO MORE BIN SMELLS.</span>
              <span className="block">NO MORE HORRIBLE BIN STAINS.</span>
              <span className="block">NO MORE RATS OR MAGGOTS.</span>
            </h2>
            <p className="mt-5 max-w-2xl text-xl font-bold leading-8 text-white">
              Keep your bins cleaner, fresher and more hygienic all year round.
            </p>
          </div>

          <div className="rounded-lg border border-white/10 bg-white/8 p-5 shadow-2xl shadow-black/10 sm:p-6">
            <p className="text-base leading-7 text-white/82">
              Your wheelie bins can quickly become dirty, smelly and attract
              unwanted pests if they are not cleaned regularly.
            </p>
            <p className="mt-4 text-base leading-7 text-white/82">
              BuddyBin makes regular bin cleaning effortless. Sign up once, make
              one secure monthly payment and we arrange everything with a trusted
              local cleaning partner.
            </p>
            <div className="mt-5 grid gap-2 sm:grid-cols-2">
              {hassleItems.map((item) => (
                <div
                  key={item}
                  className="rounded-lg bg-white/10 px-3 py-2 text-sm font-bold text-white"
                >
                  {item}
                </div>
              ))}
            </div>
            <p className="mt-5 text-lg font-black text-buddy-green">
              Just clean, fresh bins every month.
            </p>
          </div>
        </div>

        <div className="mt-10">
          <h3 className="text-2xl font-black text-white sm:text-3xl">
            Why homeowners choose BuddyBin
          </h3>
          <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {benefits.map((benefit) => {
              const Icon = benefit.icon;

              return (
                <article
                  key={benefit.title}
                  className="group rounded-lg border border-white/10 bg-white p-5 text-buddy-navy shadow-xl shadow-black/10 transition duration-200 md:hover:-translate-y-1 md:hover:shadow-2xl"
                >
                  <div
                    className={cn(
                      "flex h-12 w-12 items-center justify-center rounded-lg",
                      benefit.tone,
                    )}
                  >
                    <Icon size={24} aria-hidden />
                  </div>
                  <h4 className="mt-5 text-xl font-black leading-tight">
                    {benefit.title}
                  </h4>
                  <p className="mt-3 text-sm leading-6 text-slate-600">
                    {benefit.copy}
                  </p>
                </article>
              );
            })}
          </div>
        </div>

        <div className="mt-8 grid gap-3 rounded-lg border border-white/10 bg-white/8 p-4 sm:grid-cols-2 lg:grid-cols-4">
          {trustItems.map((item) => (
            <div key={item} className="flex items-center gap-3 text-sm font-bold text-white">
              <CheckCircle2 className="shrink-0 text-buddy-green" size={20} aria-hidden />
              <span>{item}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

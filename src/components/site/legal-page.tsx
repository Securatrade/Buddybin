import { SiteFooter } from "@/components/site/footer";
import { SiteHeader } from "@/components/site/header";
import { BRAND } from "@/lib/constants";

export function LegalPage({
  title,
  sections,
}: {
  title: string;
  sections: Array<[string, string]>;
}) {
  return (
    <>
      <SiteHeader />
      <main className="bg-white">
        <article className="mx-auto max-w-4xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
          <p className="font-bold uppercase tracking-[0.18em] text-buddy-green">
            Legal review required
          </p>
          <h1 className="mt-3 text-3xl font-black text-buddy-navy sm:text-5xl">
            {title}
          </h1>
          <p className="mt-5 rounded-lg border border-buddy-border bg-buddy-pale p-4 text-sm font-semibold text-buddy-navy">
            These launch terms are placeholders and must be reviewed by a UK
            solicitor before public use.
          </p>
          <div className="mt-8 space-y-7">
            <section>
              <h2 className="text-xl font-black text-buddy-navy">Service statement</h2>
              <p className="mt-3 leading-7 text-slate-600">{BRAND.legalArrangement}</p>
            </section>
            {sections.map(([heading, body]) => (
              <section key={heading}>
                <h2 className="text-xl font-black text-buddy-navy">{heading}</h2>
                <p className="mt-3 leading-7 text-slate-600">{body}</p>
              </section>
            ))}
          </div>
        </article>
      </main>
      <SiteFooter />
    </>
  );
}

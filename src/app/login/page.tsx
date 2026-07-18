import { LoginForm } from "@/components/auth/login-form";
import { SiteFooter } from "@/components/site/footer";
import { SiteHeader } from "@/components/site/header";

export const metadata = {
  title: "Log in",
};

export default function LoginPage() {
  return (
    <>
      <SiteHeader />
      <main className="bg-white py-16 sm:py-24">
        <div className="mx-auto grid max-w-5xl gap-10 px-4 sm:px-6 md:grid-cols-[1fr_420px] lg:px-8">
          <div>
            <p className="font-bold uppercase tracking-[0.18em] text-buddy-green">
              Customer login
            </p>
            <h1 className="mt-3 text-4xl font-black text-buddy-navy sm:text-5xl">
              Open your BuddyBin account with a secure email link.
            </h1>
            <p className="mt-5 text-lg leading-8 text-slate-600">
              No password is needed. Enter the email address used at checkout and
              Supabase will send a magic link.
            </p>
          </div>
          <LoginForm />
        </div>
      </main>
      <SiteFooter />
    </>
  );
}

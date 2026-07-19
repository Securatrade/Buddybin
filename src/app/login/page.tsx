import { LoginForm } from "@/components/auth/login-form";
import { SiteFooter } from "@/components/site/footer";
import { SiteHeader } from "@/components/site/header";

export const metadata = {
  title: "Log in",
};

function firstParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

const loginErrors: Record<string, string> = {
  invalid_link:
    "That login link is invalid or has expired. Please request a fresh secure BuddyBin login link.",
  session_failed:
    "We could not create your login session. Please request a fresh secure BuddyBin login link.",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{
    error?: string | string[];
    logged_out?: string | string[];
  }>;
}) {
  const params = await searchParams;
  const errorCode = firstParam(params.error);
  const initialError = errorCode ? loginErrors[errorCode] || loginErrors.invalid_link : "";
  const initialMessage = firstParam(params.logged_out)
    ? "You have been logged out."
    : "";

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
              No password is needed. Enter the email address used when you
              signed up and we&apos;ll send you a secure BuddyBin login link.
            </p>
          </div>
          <LoginForm initialError={initialError} initialMessage={initialMessage} />
        </div>
      </main>
      <SiteFooter />
    </>
  );
}

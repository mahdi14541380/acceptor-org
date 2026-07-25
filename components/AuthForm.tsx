"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { Dictionary } from "@/lib/i18n/getDictionary";
import type { Locale } from "@/lib/i18n/locales";
import Link from "next/link";

export function AuthForm({
  mode,
  locale,
  dict,
}: {
  mode: "login" | "signup";
  locale: Locale;
  dict: Dictionary["auth"];
}) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [signupDone, setSignupDone] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (mode === "signup") {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/api/auth/callback?locale=${locale}`,
        },
      });
      setLoading(false);
      if (error) {
        setError(error.message || dict.errorGeneric);
        return;
      }
      setSignupDone(true);
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      setLoading(false);
      if (error) {
        setError(error.message || dict.errorGeneric);
        return;
      }
      router.push(`/${locale}/account`);
      router.refresh();
    }
  }

  if (signupDone) {
    return (
      <div className="rounded-2xl border border-steelLine bg-steel p-8 text-center text-paper/80">
        {dict.signupSuccess}
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div>
        <label className="mb-1.5 block text-sm text-paper/70">
          {dict.emailLabel}
        </label>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="focus-ring w-full rounded-lg border border-steelLine bg-steel px-4 py-2.5 text-paper"
        />
      </div>
      <div>
        <label className="mb-1.5 block text-sm text-paper/70">
          {dict.passwordLabel}
        </label>
        <input
          type="password"
          required
          minLength={6}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="focus-ring w-full rounded-lg border border-steelLine bg-steel px-4 py-2.5 text-paper"
        />
      </div>

      {error && <p className="text-sm text-signal">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="focus-ring mt-2 rounded-full bg-signal px-6 py-3 text-sm font-semibold text-paper transition hover:bg-signalDeep disabled:opacity-50"
      >
        {mode === "signup" ? dict.signupButton : dict.loginButton}
      </button>

      <p className="mt-2 text-center text-sm text-paper/50">
        {mode === "signup" ? (
          <>
            {dict.haveAccount}{" "}
            <Link href={`/${locale}/login`} className="text-signal underline underline-offset-4">
              {dict.logInInstead}
            </Link>
          </>
        ) : (
          <>
            {dict.noAccount}{" "}
            <Link href={`/${locale}/signup`} className="text-signal underline underline-offset-4">
              {dict.createOne}
            </Link>
          </>
        )}
      </p>
    </form>
  );
}

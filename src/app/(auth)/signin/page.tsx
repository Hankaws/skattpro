"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";

export default function SignInPage() {
  const router = useRouter();
  const params = useSearchParams();
  const callbackUrl = params.get("callbackUrl") ?? "/dashboard";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="mx-auto max-w-md px-4 py-20">
      <div className="rounded-2xl border bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-bold">Logg inn</h1>
        <p className="mt-1 text-sm text-slate-600">Velkommen tilbake til SkattPro.</p>
        <form
          className="mt-6 space-y-4"
          onSubmit={async (e) => {
            e.preventDefault();
            setError(null);
            const res = await signIn("credentials", {
              email,
              password,
              redirect: false,
              callbackUrl,
            });
            if (res?.error) {
              setError("Ugyldig e-post eller passord.");
              return;
            }
            router.push(callbackUrl);
          }}
        >
          <div className="space-y-1">
            <label className="text-sm font-medium" htmlFor="email">E-post</label>
            <input
              id="email"
              type="email"
              required
              className="w-full rounded-lg border px-3 py-2 text-sm"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium" htmlFor="password">Passord</label>
            <input
              id="password"
              type="password"
              required
              className="w-full rounded-lg border px-3 py-2 text-sm"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          {error ? <p className="text-sm text-red-600">{error}</p> : null}
          <Button type="submit" className="w-full">Logg inn</Button>
        </form>
        <p className="mt-4 text-center text-sm text-slate-600">
          Har du ikke konto? <a href="/auth/signup" className="text-primary-600">Opprett konto</a>
        </p>
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export default function SignUpPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="mx-auto max-w-md px-4 py-20">
      <div className="rounded-2xl border bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-bold">Opprett konto</h1>
        <p className="mt-1 text-sm text-slate-600">Start din gratis prøveperiode.</p>
        <form
          className="mt-6 space-y-4"
          onSubmit={async (e) => {
            e.preventDefault();
            setError(null);
            const res = await fetch("/api/auth/signup", {
              method: "POST",
              headers: { "content-type": "application/json" },
              body: JSON.stringify({ name, email, password }),
            });
            if (!res.ok) {
              setError("Kunne ikke opprette konto.");
              return;
            }
            await signIn("credentials", { email, password, callbackUrl: "/dashboard" });
          }}
        >
          <div className="space-y-1">
            <label className="text-sm font-medium" htmlFor="name">Navn</label>
            <input id="name" required className="w-full rounded-lg border px-3 py-2 text-sm" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium" htmlFor="email">E-post</label>
            <input id="email" type="email" required className="w-full rounded-lg border px-3 py-2 text-sm" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium" htmlFor="password">Passord</label>
            <input id="password" type="password" required className="w-full rounded-lg border px-3 py-2 text-sm" value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
          {error ? <p className="text-sm text-red-600">{error}</p> : null}
          <Button type="submit" className="w-full">Opprett konto</Button>
        </form>
        <p className="mt-4 text-center text-sm text-slate-600">
          Har du konto? <a href="/auth/signin" className="text-primary-600">Logg inn</a>
        </p>
      </div>
    </div>
  );
}

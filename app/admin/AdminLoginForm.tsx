"use client";

import { useActionState } from "react";
import { login, type LoginState } from "./actions";

const initialState: LoginState = { error: null };

export function AdminLoginForm() {
  const [state, formAction, pending] = useActionState(login, initialState);

  return (
    <div className="flex min-h-[100svh] items-center justify-center bg-paper px-5">
      <form action={formAction} className="w-full max-w-xs">
        <p className="font-serif text-2xl tracking-tight">Admin</p>
        <p className="mt-1 text-sm text-ink-soft">Studio 98 — panou de rezervări.</p>

        <input
          type="password"
          name="password"
          placeholder="Parolă"
          autoFocus
          required
          className="mt-6 h-12 w-full rounded-full border border-line bg-transparent px-5 text-sm outline-none transition-colors focus:border-ink"
        />

        {state.error && (
          <p role="alert" className="mt-3 text-sm text-red-600">
            {state.error}
          </p>
        )}

        <button
          type="submit"
          disabled={pending}
          className="mt-4 flex h-12 w-full items-center justify-center rounded-full bg-ink text-[0.7rem] font-medium uppercase tracking-[0.18em] text-paper transition-colors hover:bg-ink-soft disabled:opacity-50"
        >
          {pending ? "Se verifică…" : "Intră"}
        </button>
      </form>
    </div>
  );
}

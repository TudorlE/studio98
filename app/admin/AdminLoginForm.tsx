"use client";

import { useState } from "react";
import { useActionState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { login, type LoginState } from "./actions";

const initialState: LoginState = { error: null };

export function AdminLoginForm() {
  const [state, formAction, pending] = useActionState(login, initialState);
  const [visible, setVisible] = useState(false);

  return (
    <div className="flex min-h-[100svh] items-center justify-center bg-paper px-5">
      <form action={formAction} className="w-full max-w-xs">
        <p className="font-serif text-2xl tracking-tight">Admin</p>
        <p className="mt-1 text-sm text-ink-soft">Studio 98 — panou de rezervări.</p>

        <div className="relative mt-6">
          <input
            type={visible ? "text" : "password"}
            name="password"
            placeholder="Parolă"
            autoFocus
            required
            className="h-12 w-full rounded-full border border-line bg-transparent px-5 pr-12 text-sm outline-none transition-colors focus:border-ink"
          />
          <button
            type="button"
            onClick={() => setVisible((v) => !v)}
            aria-label={visible ? "Ascunde parola" : "Arată parola"}
            className="absolute right-1 top-1 grid h-10 w-10 place-items-center rounded-full text-ink-faint hover:text-ink"
          >
            {visible ? <EyeOff size={18} strokeWidth={1.5} /> : <Eye size={18} strokeWidth={1.5} />}
          </button>
        </div>

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

"use client";

import { useFormStatus } from "react-dom";
import { useActionState } from "react";
import Link from "next/link";
import { signInAction, type AuthActionResult } from "@/lib/auth";

const initialState: AuthActionResult = {
  success: false,
  error: "",
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {pending ? "Signing in..." : "Sign In"}
    </button>
  );
}

export function SignInForm() {
  const [state, formAction] = useActionState(signInAction, initialState);

  return (
    <form action={formAction} className="space-y-4">
      {state && !state.success && state.error && (
        <div className="p-3 bg-red-100 text-red-700 rounded" role="alert">
          {state.error}
        </div>
      )}

      <div>
        <label htmlFor="email" className="block text-sm font-medium mb-1">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          aria-invalid={
            state && !state.success && state.fieldErrors?.email
              ? "true"
              : "false"
          }
          aria-describedby={
            state && !state.success && state.fieldErrors?.email
              ? "email-error"
              : undefined
          }
          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
            state && !state.success && state.fieldErrors?.email
              ? "border-red-500 focus:ring-red-500"
              : "border-gray-300 focus:ring-blue-500"
          }`}
        />
        {state && !state.success && state.fieldErrors?.email && (
          <p
            id="email-error"
            className="mt-1 text-sm text-red-600"
            role="alert"
          >
            {state.fieldErrors.email}
          </p>
        )}
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-medium mb-1">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          aria-invalid={
            state && !state.success && state.fieldErrors?.password
              ? "true"
              : "false"
          }
          aria-describedby={
            state && !state.success && state.fieldErrors?.password
              ? "password-error"
              : undefined
          }
          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
            state && !state.success && state.fieldErrors?.password
              ? "border-red-500 focus:ring-red-500"
              : "border-gray-300 focus:ring-blue-500"
          }`}
        />
        {state && !state.success && state.fieldErrors?.password && (
          <p
            id="password-error"
            className="mt-1 text-sm text-red-600"
            role="alert"
          >
            {state.fieldErrors.password}
          </p>
        )}
      </div>

      <SubmitButton />

      <p className="text-center text-sm text-gray-600">
        Don't have an account?{" "}
        <Link href="/signup" className="text-blue-600 hover:underline">
          Sign up
        </Link>
      </p>
    </form>
  );
}

"use client";

import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { EmailAuthMode, LoginModalError } from "@/types/auth";

const emailAuthSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "Email is required")
    .email("Enter a valid email address"),
  password: z
    .string()
    .min(1, "Password is required")
    .min(8, "Password must be at least 8 characters"),
});

type EmailAuthValues = z.infer<typeof emailAuthSchema>;

export type EmailAuthFormProps = {
  mode: EmailAuthMode;
  onModeChange: (mode: EmailAuthMode) => void;
  onSubmit: (values: EmailAuthValues) => Promise<LoginModalError | null>;
  disabled?: boolean;
  formError?: LoginModalError | null;
};

/**
 * Email + password sign-in / sign-up form (SECURITY.md §1, TECH ARCH §7.4).
 */
export function EmailAuthForm({
  mode,
  onModeChange,
  onSubmit,
  disabled = false,
  formError = null,
}: EmailAuthFormProps) {
  const [submitting, setSubmitting] = React.useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<EmailAuthValues>({
    resolver: zodResolver(emailAuthSchema),
    defaultValues: { email: "", password: "" },
  });

  const submit = handleSubmit(async (values) => {
    setSubmitting(true);
    try {
      await onSubmit(values);
    } finally {
      setSubmitting(false);
    }
  });

  const isBusy = disabled || submitting;
  const alternateMode: EmailAuthMode =
    mode === "sign_in" ? "sign_up" : "sign_in";

  return (
    <form
      className="flex flex-col gap-md"
      onSubmit={submit}
      noValidate
      aria-busy={isBusy}
    >
      <Input
        label="Email"
        type="email"
        autoComplete="email"
        inputMode="email"
        disabled={isBusy}
        errorMessage={errors.email?.message}
        {...register("email")}
      />

      <Input
        label="Password"
        type="password"
        autoComplete={
          mode === "sign_in" ? "current-password" : "new-password"
        }
        disabled={isBusy}
        errorMessage={errors.password?.message}
        {...register("password")}
      />

      {formError ? (
        <p
          role="alert"
          className="text-body-sm text-destructive"
          id="email-auth-error"
        >
          {formError.message}
        </p>
      ) : null}

      <Button
        type="submit"
        variant="primary"
        size="lg"
        fullWidth
        isLoading={submitting}
        disabled={isBusy}
      >
        {mode === "sign_in" ? "Sign in with email" : "Create account"}
      </Button>

      <p className="text-center text-body-sm text-muted-foreground">
        {mode === "sign_in" ? "New to Audient?" : "Already have an account?"}{" "}
        <button
          type="button"
          className="font-semibold text-primary underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          disabled={isBusy}
          onClick={() => onModeChange(alternateMode)}
        >
          {mode === "sign_in" ? "Create an account" : "Sign in"}
        </button>
      </p>
    </form>
  );
}

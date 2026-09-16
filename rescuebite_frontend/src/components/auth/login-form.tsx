"use client";

import { Eye, EyeOff, Loader2, Lock, Mail } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { type FormEvent, type ReactNode, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api, getErrorMessage } from "@/lib/api";

type LoginValues = {
  email: string;
  password: string;
};

type LoginErrors = Partial<Record<"email" | "password", string>>;

type LoginResponse = {
  success: boolean;
  statusCode: number;
  message: string;
  data: { accessToken: string; refreshToken: string };
};

const initialValues: LoginValues = {
  email: "",
  password: "",
};

function validatePassword(value: string): string {
  if (!value) return "Password is required";
  if (value.length < 8) return "Password must be at least 8 characters long";
  if (!/[a-z]/.test(value))
    return "Password must contain at least 1 lowercase letter";
  if (!/[A-Z]/.test(value))
    return "Password must contain at least 1 uppercase letter";
  if (!/[0-9]/.test(value)) return "Password must contain at least 1 number";
  if (!/[^A-Za-z0-9]/.test(value))
    return "Password must contain at least 1 special character";
  return "";
}

function validateLogin(values: LoginValues): LoginErrors {
  const errors: LoginErrors = {};

  if (!values.email.trim()) errors.email = "Email is required";
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email.trim()))
    errors.email = "Please enter a valid email address";

  const passwordError = validatePassword(values.password);
  if (passwordError) errors.password = passwordError;

  return errors;
}

export function LoginForm() {
  const router = useRouter();
  const [values, setValues] = useState<LoginValues>(initialValues);
  const [errors, setErrors] = useState<LoginErrors>({});
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  function update<K extends keyof LoginValues>(key: K, value: LoginValues[K]) {
    setValues((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const validationErrors = validateLogin(values);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setErrors({});
    setSubmitError("");
    setLoading(true);
    try {
      const response = (await api("/auth/login", {
        method: "POST",
        body: {
          email: values.email.trim(),
          password: values.password,
        },
      })) as LoginResponse;

      localStorage.setItem(
        "rescuebite_access_token",
        response.data.accessToken,
      );
      localStorage.setItem(
        "rescuebite_refresh_token",
        response.data.refreshToken,
      );
      router.push("/");
    } catch (error) {
      setSubmitError(
        getErrorMessage(
          error,
          "Unable to sign in. Please check your credentials.",
        ),
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Welcome back</CardTitle>
        <CardDescription>Sign in to your RescueBite account.</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit} noValidate>
        <CardContent className="grid gap-4">
          <Field
            label="Email"
            icon={<Mail className="size-4" />}
            error={errors.email}
          >
            <Input
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              value={values.email}
              onChange={(e) => update("email", e.target.value)}
              aria-invalid={Boolean(errors.email)}
            />
          </Field>

          <Field
            label="Password"
            icon={<Lock className="size-4" />}
            error={errors.password}
          >
            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                placeholder="Enter your password"
                value={values.password}
                onChange={(e) => update("password", e.target.value)}
                aria-invalid={Boolean(errors.password)}
                className="pr-9"
              />
              <button
                type="button"
                className="absolute top-1/2 right-2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <EyeOff className="size-4" />
                ) : (
                  <Eye className="size-4" />
                )}
              </button>
            </div>
          </Field>

          <div className="flex items-center justify-end">
            <Link
              href="/forgot-password"
              className="text-xs font-medium text-primary hover:underline"
            >
              Forgot password?
            </Link>
          </div>

          {submitError && (
            <p className="rounded-md bg-destructive/10 px-3 py-2 text-xs text-destructive">
              {submitError}
            </p>
          )}
        </CardContent>
        <CardFooter className="flex-col gap-3">
          <Button type="submit" size="lg" className="w-full" disabled={loading}>
            {loading && <Loader2 className="animate-spin" />}
            {loading ? "Signing in..." : "Sign in"}
          </Button>
          <p className="text-center text-xs text-muted-foreground">
            Don&apos;t have an account?{" "}
            <Link
              href="/register"
              className="font-medium text-primary hover:underline"
            >
              Sign up
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  );
}

type FieldProps = {
  label: string;
  icon: ReactNode;
  error?: string;
  children: ReactNode;
};

function Field({ label, icon, error, children }: FieldProps) {
  return (
    <div className="grid gap-1.5">
      <Label>
        {icon}
        {label}
      </Label>
      {children}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}

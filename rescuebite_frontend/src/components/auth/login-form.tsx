"use client";

import {
  Eye,
  EyeOff,
  Loader2,
  Lock,
  Mail,
  ShieldCheck,
  Store,
  User,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { type FormEvent, type ReactNode, useState } from "react";
import { GoogleAuthButton } from "@/components/auth/google-auth-button";
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
import { Separator } from "@/components/ui/separator";
import { api, getErrorMessage } from "@/lib/api";
import { getPostAuthPath } from "@/lib/auth";

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

type DemoRole = "ADMIN" | "PROVIDER" | "RECEIVER";

type DemoAccount = {
  role: DemoRole;
  label: string;
  email: string;
  password: string;
  icon: typeof ShieldCheck;
};

const DEMO_ACCOUNTS: DemoAccount[] = [
  {
    role: "ADMIN",
    label: "Admin",
    email: process.env.NEXT_PUBLIC_DEMO_ADMIN_EMAIL ?? "demoadmin@gmail.com",
    password: process.env.NEXT_PUBLIC_DEMO_ADMIN_PASSWORD ?? "de12Ad*m.",
    icon: ShieldCheck,
  },
  {
    role: "RECEIVER",
    label: "User",
    email: process.env.NEXT_PUBLIC_DEMO_USER_EMAIL ?? "custom@gmail.com",
    password: process.env.NEXT_PUBLIC_DEMO_USER_PASSWORD ?? "*cust45P1P./",
    icon: User,
  },
  {
    role: "PROVIDER",
    label: "Provider",
    email:
      process.env.NEXT_PUBLIC_DEMO_PROVIDER_EMAIL ?? "pro@gmail.com",
    password:
      process.env.NEXT_PUBLIC_DEMO_PROVIDER_PASSWORD ?? "*pro45P1P./",
    icon: Store,
  },
];

async function authenticate(email: string, password: string): Promise<string> {
  const response = (await api("/auth/login", {
    method: "POST",
    body: { email: email.trim(), password },
  })) as LoginResponse;

  localStorage.setItem("rescuebite_access_token", response.data.accessToken);
  localStorage.setItem("rescuebite_refresh_token", response.data.refreshToken);
  return response.data.accessToken;
}

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
  const [demoLoading, setDemoLoading] = useState<DemoRole | null>(null);
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
      const accessToken = await authenticate(
        values.email.trim(),
        values.password,
      );
      router.push(getPostAuthPath(accessToken));
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

  async function handleDemoLogin(account: DemoAccount) {
    setSubmitError("");
    setDemoLoading(account.role);
    try {
      const accessToken = await authenticate(account.email, account.password);
      router.push(getPostAuthPath(accessToken));
    } catch (error) {
      setSubmitError(
        getErrorMessage(
          error,
          `Unable to sign in with the demo ${account.label.toLowerCase()} account. Please make sure it exists.`,
        ),
      );
    } finally {
      setDemoLoading(null);
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
          <GoogleAuthButton mode="login" />

          <div className="flex items-center gap-3">
            <Separator className="flex-1" />
            <span className="text-xs text-muted-foreground">or</span>
            <Separator className="flex-1" />
          </div>

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
          <Button
            type="submit"
            size="lg"
            className="w-full"
            disabled={loading || demoLoading !== null}
          >
            {loading && <Loader2 className="animate-spin" />}
            {loading ? "Signing in..." : "Sign in"}
          </Button>

          <div className="flex w-full items-center gap-3 pt-1">
            <Separator className="flex-1" />
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              OR
            </span>
            <Separator className="flex-1" />
          </div>

          <div className="grid w-full gap-2">
            <p className="flex items-center justify-center gap-1.5 text-sm font-semibold">
              <Zap className="size-4" />
              Quick Demo Login
            </p>
            <div className="grid grid-cols-2 gap-2">
              {DEMO_ACCOUNTS.slice(0, 2).map((account) => {
                const Icon = account.icon;
                const isLoading = demoLoading === account.role;
                return (
                  <Button
                    key={account.role}
                    type="button"
                    variant="outline"
                    size="lg"
                    className="h-auto flex-col gap-1 py-3"
                    disabled={loading || demoLoading !== null}
                    onClick={() => handleDemoLogin(account)}
                    aria-label={`Demo login as ${account.label}`}
                  >
                    <span className="flex items-center gap-1.5 text-sm font-semibold">
                      {isLoading ? (
                        <Loader2 className="size-4 animate-spin" />
                      ) : (
                        <Icon className="size-4" />
                      )}
                      {account.label}
                    </span>
                    <span className="text-[11px] font-normal text-muted-foreground">
                      {isLoading ? "Signing in..." : "Demo Login"}
                    </span>
                  </Button>
                );
              })}
            </div>
            {DEMO_ACCOUNTS.slice(2).map((account) => {
              const Icon = account.icon;
              const isLoading = demoLoading === account.role;
              return (
                <div key={account.role} className="flex justify-center">
                  <Button
                    type="button"
                    variant="outline"
                    size="lg"
                    className="h-auto w-[calc(50%-4px)] flex-col gap-1 py-3"
                    disabled={loading || demoLoading !== null}
                    onClick={() => handleDemoLogin(account)}
                    aria-label={`Demo login as ${account.label}`}
                  >
                    <span className="flex items-center gap-1.5 text-sm font-semibold">
                      {isLoading ? (
                        <Loader2 className="size-4 animate-spin" />
                      ) : (
                        <Icon className="size-4" />
                      )}
                      {account.label}
                    </span>
                    <span className="text-[11px] font-normal text-muted-foreground">
                      {isLoading ? "Signing in..." : "Demo Login"}
                    </span>
                  </Button>
                </div>
              );
            })}
          </div>

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

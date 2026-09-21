"use client";

import {
  Eye,
  EyeOff,
  KeyRound,
  Loader2,
  Lock,
  Mail,
  Phone,
  User,
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
import { cn } from "@/lib/utils";

type Role = "RECEIVER" | "PROVIDER" | "ADMIN";

type RegisterValues = {
  name: string;
  email: string;
  contactNumber: string;
  role: Role;
  password: string;
  confirmPassword: string;
  otp: string;
};

type FormErrors = Partial<
  Record<
    "name" | "email" | "contactNumber" | "password" | "confirmPassword" | "otp",
    string
  >
>;

type VerifyEmailResponse = {
  success: boolean;
  statusCode: number;
  message: string;
  data: { accessToken: string; refreshToken: string };
};

const PASSWORD_RULES = [
  {
    label: "At least 8 characters",
    test: (value: string) => value.length >= 8,
  },
  {
    label: "At least 1 lowercase letter",
    test: (value: string) => /[a-z]/.test(value),
  },
  {
    label: "At least 1 uppercase letter",
    test: (value: string) => /[A-Z]/.test(value),
  },
  { label: "At least 1 number", test: (value: string) => /[0-9]/.test(value) },
  {
    label: "At least 1 special character",
    test: (value: string) => /[^A-Za-z0-9]/.test(value),
  },
];

const initialValues: RegisterValues = {
  name: "",
  email: "",
  contactNumber: "",
  role: "RECEIVER",
  password: "",
  confirmPassword: "",
  otp: "",
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

function validateRegister(values: RegisterValues): FormErrors {
  const errors: FormErrors = {};

  const name = values.name.trim();
  if (!name) errors.name = "Name is required";
  else if (name.length < 3)
    errors.name = "Name must be at least 3 characters long";
  else if (name.length > 10)
    errors.name = "Name must be at most 10 characters long";

  if (!values.email.trim()) errors.email = "Email is required";
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email.trim()))
    errors.email = "Please enter a valid email address";

  const passwordError = validatePassword(values.password);
  if (passwordError) errors.password = passwordError;

  if (!values.confirmPassword)
    errors.confirmPassword = "Please confirm your password";
  else if (values.confirmPassword !== values.password)
    errors.confirmPassword = "Passwords do not match";

  return errors;
}

export function SignupForm() {
  const router = useRouter();
  const [values, setValues] = useState<RegisterValues>(initialValues);
  const [errors, setErrors] = useState<FormErrors>({});
  const [step, setStep] = useState<"register" | "otp">("register");
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  function update<K extends keyof RegisterValues>(
    key: K,
    value: RegisterValues[K],
  ) {
    setValues((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  }

  async function handleRegister(e: FormEvent) {
    e.preventDefault();
    const validationErrors = validateRegister(values);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setErrors({});
    setSubmitError("");
    setLoading(true);
    try {
      await api("/auth/register", {
        method: "POST",
        body: {
          name: values.name.trim(),
          email: values.email.trim(),
          password: values.password,
          role: values.role,
          customer: {
            contactNumber: values.contactNumber.trim() || undefined,
          },
        },
      });
      setStep("otp");
    } catch (error) {
      setSubmitError(
        getErrorMessage(error, "Unable to create account. Please try again."),
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleVerifyOtp(e: FormEvent) {
    e.preventDefault();
    const otp = values.otp.trim();
    if (!/^\d{6}$/.test(otp)) {
      setErrors({ otp: "OTP must be exactly 6 digits" });
      return;
    }

    setErrors({});
    setSubmitError("");
    setLoading(true);
    try {
      const response = (await api("/auth/verify-email", {
        method: "POST",
        body: { email: values.email.trim(), otp },
      })) as VerifyEmailResponse;

      localStorage.setItem(
        "rescuebite_access_token",
        response.data.accessToken,
      );
      localStorage.setItem(
        "rescuebite_refresh_token",
        response.data.refreshToken,
      );
      router.push(getPostAuthPath(response.data.accessToken));
    } catch (error) {
      setSubmitError(
        getErrorMessage(error, "Verification failed. Please check your OTP."),
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="w-full max-w-md" size="default">
      {step === "register" ? (
        <>
          <CardHeader>
            <CardTitle>Create your account</CardTitle>
            <CardDescription>
              Join RescueBite and help rescue surplus food today.
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleRegister} noValidate>
            <CardContent className="grid gap-4">
              <GoogleAuthButton mode="signup" />

              <div className="flex items-center gap-3">
                <Separator className="flex-1" />
                <span className="text-xs text-muted-foreground">or</span>
                <Separator className="flex-1" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <AccountTypeButton
                  active={values.role === "RECEIVER"}
                  onClick={() => update("role", "RECEIVER")}
                  description="Find food"
                >
                  Receiver
                </AccountTypeButton>
                <AccountTypeButton
                  active={values.role === "PROVIDER"}
                  onClick={() => update("role", "PROVIDER")}
                  description="Donate food"
                >
                  Provider
                </AccountTypeButton>
                <AccountTypeButton
                  active={values.role === "ADMIN"}
                  onClick={() => update("role", "ADMIN")}
                  description="Manage the platform"
                >
                  Admin
                </AccountTypeButton>
              </div>

              <Field
                label="Name"
                icon={<User className="size-4" />}
                error={errors.name}
              >
                <Input
                  autoComplete="name"
                  maxLength={10}
                  placeholder="Your full name"
                  value={values.name}
                  onChange={(e) => update("name", e.target.value)}
                  aria-invalid={Boolean(errors.name)}
                />
              </Field>

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
                label="Contact Number"
                optional
                icon={<Phone className="size-4" />}
                error={errors.contactNumber}
              >
                <Input
                  type="tel"
                  autoComplete="tel"
                  placeholder="+880 1XXX-XXXXXX"
                  value={values.contactNumber}
                  onChange={(e) => update("contactNumber", e.target.value)}
                  aria-invalid={Boolean(errors.contactNumber)}
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
                    autoComplete="new-password"
                    placeholder="Enter a strong password"
                    value={values.password}
                    onChange={(e) => update("password", e.target.value)}
                    aria-invalid={Boolean(errors.password)}
                    className="pr-9"
                  />
                  <button
                    type="button"
                    className="absolute top-1/2 right-2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                  >
                    {showPassword ? (
                      <EyeOff className="size-4" />
                    ) : (
                      <Eye className="size-4" />
                    )}
                  </button>
                </div>
              </Field>

              <div className="grid grid-cols-1 gap-1.5">
                {PASSWORD_RULES.map((rule) => {
                  const passed = rule.test(values.password);
                  return (
                    <span
                      key={rule.label}
                      className={cn(
                        "flex items-center gap-2 text-xs",
                        passed ? "text-primary" : "text-muted-foreground",
                      )}
                    >
                      <span
                        className={cn(
                          "flex size-4 items-center justify-center rounded-full border text-[10px]",
                          passed
                            ? "border-primary bg-primary text-primary-foreground"
                            : "border-border",
                        )}
                      >
                        {passed ? "✓" : ""}
                      </span>
                      {rule.label}
                    </span>
                  );
                })}
              </div>

              <Field
                label="Confirm Password"
                icon={<Lock className="size-4" />}
                error={errors.confirmPassword}
              >
                <Input
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  placeholder="Re-enter your password"
                  value={values.confirmPassword}
                  onChange={(e) => update("confirmPassword", e.target.value)}
                  aria-invalid={Boolean(errors.confirmPassword)}
                />
              </Field>

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
                disabled={loading}
              >
                {loading && <Loader2 className="animate-spin" />}
                {loading ? "Creating account..." : "Create account"}
              </Button>
              <p className="text-center text-xs text-muted-foreground">
                Already have an account?{" "}
                <Link
                  href="/login"
                  className="font-medium text-primary hover:underline"
                >
                  Sign in
                </Link>
              </p>
            </CardFooter>
          </form>
        </>
      ) : (
        <>
          <CardHeader>
            <CardTitle>Verify your email</CardTitle>
            <CardDescription>
              We sent a 6-digit verification code to{" "}
              <span className="font-medium text-foreground">
                {values.email.trim()}
              </span>
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleVerifyOtp} noValidate>
            <CardContent className="grid gap-4">
              <Field
                label="Verification Code"
                icon={<KeyRound className="size-4" />}
                error={errors.otp}
              >
                <Input
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  maxLength={6}
                  placeholder="123456"
                  value={values.otp}
                  onChange={(e) =>
                    update("otp", e.target.value.replace(/\D/g, "").slice(0, 6))
                  }
                  aria-invalid={Boolean(errors.otp)}
                />
              </Field>

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
                disabled={loading}
              >
                {loading && <Loader2 className="animate-spin" />}
                {loading ? "Verifying..." : "Verify & create account"}
              </Button>
              <div className="flex w-full items-center justify-between text-xs text-muted-foreground">
                <button
                  type="button"
                  className="font-medium text-primary hover:underline disabled:pointer-events-none disabled:opacity-50"
                  disabled={loading}
                  onClick={handleRegister}
                >
                  Resend code
                </button>
                <button
                  type="button"
                  className="hover:text-foreground"
                  onClick={() => setStep("register")}
                >
                  Change email
                </button>
              </div>
            </CardFooter>
          </form>
        </>
      )}
    </Card>
  );
}

type FieldProps = {
  label: string;
  optional?: boolean;
  icon?: ReactNode;
  error?: string;
  children: ReactNode;
};

function Field({ label, optional, icon, error, children }: FieldProps) {
  return (
    <div className="grid gap-1.5">
      <Label>
        {icon}
        {label}
        {optional && (
          <span className="font-normal text-muted-foreground">(optional)</span>
        )}
      </Label>
      {children}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}

type AccountTypeButtonProps = {
  active: boolean;
  onClick: () => void;
  description: string;
  children: ReactNode;
};

function AccountTypeButton({
  active,
  onClick,
  description,
  children,
}: AccountTypeButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "flex flex-col items-start gap-0.5 rounded-md border p-3 text-left transition-colors",
        active
          ? "border-primary bg-primary/10 text-foreground"
          : "border-border hover:bg-muted",
      )}
    >
      <span className="text-sm font-medium">{children}</span>
      <span className="text-xs text-muted-foreground">{description}</span>
    </button>
  );
}

"use client";

import { Loader2, MapPin, Phone, Store } from "lucide-react";
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
import { cn } from "@/lib/utils";

const BUSINESS_TYPES = [
  "RESTAURANT",
  "BAKERY",
  "CAFE",
  "GROCERY",
  "OTHER",
] as const;

type BusinessType = (typeof BUSINESS_TYPES)[number];

export const BUSINESS_TYPE_LABELS: Record<BusinessType, string> = {
  RESTAURANT: "Restaurant",
  BAKERY: "Bakery",
  CAFE: "Café",
  GROCERY: "Grocery",
  OTHER: "Other",
};

export type ProviderProfile = {
  id: string;
  userId: string;
  businessName: string;
  businessType: BusinessType;
  address: string;
  city: string;
  phone: string;
  isVerified: boolean;
  createdAt: string;
};

type CreateProviderResponse = {
  success: boolean;
  statusCode: number;
  message: string;
  data: ProviderProfile;
};

type FormValues = {
  businessName: string;
  businessType: BusinessType | "";
  address: string;
  city: string;
  phone: string;
};

type FormErrors = Partial<Record<keyof FormValues, string>>;

const initialValues: FormValues = {
  businessName: "",
  businessType: "",
  address: "",
  city: "",
  phone: "",
};

function validateForm(values: FormValues): FormErrors {
  const errors: FormErrors = {};

  const businessName = values.businessName.trim();
  if (!businessName) errors.businessName = "Business name is required";
  else if (businessName.length < 2)
    errors.businessName = "Business name must be at least 2 characters long";
  else if (businessName.length > 100)
    errors.businessName = "Business name must be at most 100 characters long";

  if (!values.businessType) errors.businessType = "Select a business type";

  const address = values.address.trim();
  if (!address) errors.address = "Address is required";
  else if (address.length < 5)
    errors.address = "Address must be at least 5 characters long";

  const city = values.city.trim();
  if (!city) errors.city = "City is required";
  else if (city.length < 2)
    errors.city = "City must be at least 2 characters long";

  const phone = values.phone.trim();
  if (!phone) errors.phone = "Phone number is required";
  else if (!/^[0-9+\-\s()]{7,20}$/.test(phone))
    errors.phone = "Enter a valid phone number";

  return errors;
}

type ProviderProfileFormProps = {
  onCreated: (profile: ProviderProfile) => void;
  onAlreadyExists: () => void;
};

export function ProviderProfileForm({
  onCreated,
  onAlreadyExists,
}: ProviderProfileFormProps) {
  const [values, setValues] = useState<FormValues>(initialValues);
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState("");

  function update<K extends keyof FormValues>(key: K, value: FormValues[K]) {
    setValues((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  }

  function selectBusinessType(businessType: BusinessType) {
    setValues((prev) => ({ ...prev, businessType }));
    setErrors((prev) => ({ ...prev, businessType: undefined }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const validationErrors = validateForm(values);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setErrors({});
    setSubmitError("");
    setLoading(true);
    try {
      const response = (await api("/provider", {
        method: "POST",
        body: {
          businessName: values.businessName.trim(),
          businessType: values.businessType,
          address: values.address.trim(),
          city: values.city.trim(),
          phone: values.phone.trim(),
        },
      })) as CreateProviderResponse;

      onCreated(response.data);
    } catch (error) {
      const message = getErrorMessage(
        error,
        "Unable to create your profile. Please try again.",
      );
      if (/already exists/i.test(message)) {
        onAlreadyExists();
        return;
      }
      setSubmitError(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="w-full max-w-lg">
      <CardHeader>
        <CardTitle>Business details</CardTitle>
        <CardDescription>
          This information is shown to neighbors who reserve your surplus food.
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit} noValidate>
        <CardContent className="grid gap-4">
          <Field
            label="Business name"
            icon={<Store className="size-4" />}
            error={errors.businessName}
          >
            <Input
              maxLength={100}
              placeholder="e.g. Daily Crumb Bakery"
              value={values.businessName}
              onChange={(e) => update("businessName", e.target.value)}
              aria-invalid={Boolean(errors.businessName)}
            />
          </Field>

          <div className="grid gap-1.5">
            <Label>Business type</Label>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {BUSINESS_TYPES.map((type) => (
                <BusinessTypeButton
                  key={type}
                  active={values.businessType === type}
                  onClick={() => selectBusinessType(type)}
                >
                  {BUSINESS_TYPE_LABELS[type]}
                </BusinessTypeButton>
              ))}
            </div>
            {errors.businessType && (
              <p className="text-xs text-destructive">{errors.businessType}</p>
            )}
          </div>

          <Field
            label="Street address"
            icon={<MapPin className="size-4" />}
            error={errors.address}
          >
            <Input
              placeholder="123 Main Street"
              value={values.address}
              onChange={(e) => update("address", e.target.value)}
              aria-invalid={Boolean(errors.address)}
            />
          </Field>

          <Field label="City" error={errors.city}>
            <Input
              placeholder="e.g. Dhaka"
              value={values.city}
              onChange={(e) => update("city", e.target.value)}
              aria-invalid={Boolean(errors.city)}
            />
          </Field>

          <Field
            label="Phone number"
            icon={<Phone className="size-4" />}
            error={errors.phone}
          >
            <Input
              type="tel"
              autoComplete="tel"
              placeholder="+880 1XXX-XXXXXX"
              value={values.phone}
              onChange={(e) => update("phone", e.target.value)}
              aria-invalid={Boolean(errors.phone)}
            />
          </Field>

          {submitError && (
            <p className="rounded-md bg-destructive/10 px-3 py-2 text-xs text-destructive">
              {submitError}
            </p>
          )}
        </CardContent>
        <CardFooter className="flex-col items-start gap-2">
          <Button type="submit" size="lg" className="w-full" disabled={loading}>
            {loading && <Loader2 className="animate-spin" />}
            {loading ? "Creating profile..." : "Create provider profile"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}

type FieldProps = {
  label: string;
  icon?: ReactNode;
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

type BusinessTypeButtonProps = {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
};

function BusinessTypeButton({
  active,
  onClick,
  children,
}: BusinessTypeButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "flex h-9 items-center justify-center rounded-md border px-3 text-xs font-medium transition-colors",
        active
          ? "border-primary bg-primary/10 text-foreground"
          : "border-border text-foreground hover:bg-muted",
      )}
    >
      {children}
    </button>
  );
}

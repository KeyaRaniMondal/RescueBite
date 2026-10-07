"use client";

import { Camera, Loader2, Mail, Phone, User as UserIcon } from "lucide-react";
import { type FormEvent, type ReactNode, useEffect, useState } from "react";
import {
  initialsOf,
  type MeResponse,
  type ReceiverProfile,
} from "@/components/receiver/use-receiver";
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

const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/avif",
  "image/svg+xml",
];
const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

export function ProfileFormView({
  profile,
  onUpdated,
}: {
  profile: ReceiverProfile;
  onUpdated: (profile: ReceiverProfile) => void;
}) {
  const [name, setName] = useState(profile.name);
  const [contactNumber, setContactNumber] = useState(
    profile.customer?.contactNumber ?? "",
  );
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{
    name?: string;
    contactNumber?: string;
    photo?: string;
  }>({});
  const [formError, setFormError] = useState("");
  const [formSuccess, setFormSuccess] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setName(profile.name);
    setContactNumber(profile.customer?.contactNumber ?? "");
    setPhoto(null);
  }, [profile.name, profile.customer?.contactNumber]);

  useEffect(() => {
    if (!photo) {
      setPhotoPreview(null);
      return;
    }
    const url = URL.createObjectURL(photo);
    setPhotoPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [photo]);

  const avatarSrc = photoPreview || profile.imageUrl || null;

  const dirty =
    name.trim() !== profile.name ||
    contactNumber.trim() !== (profile.customer?.contactNumber ?? "") ||
    photo !== null;

  function validateForm(): boolean {
    const errors: typeof fieldErrors = {};
    const trimmedName = name.trim();
    if (!trimmedName) errors.name = "Name is required";
    else if (trimmedName.length < 3)
      errors.name = "Name must be at least 3 characters long";
    else if (trimmedName.length > 10)
      errors.name = "Name must be at most 10 characters long";

    const trimmedContact = contactNumber.trim();
    if (trimmedContact && trimmedContact.length > 30)
      errors.contactNumber = "Contact number is too long";

    if (photo) {
      if (!ALLOWED_IMAGE_TYPES.includes(photo.type))
        errors.photo =
          "Only image files (JPEG, PNG, WEBP, GIF, AVIF, SVG) are allowed";
      else if (photo.size > MAX_IMAGE_BYTES)
        errors.photo = "Photo must be smaller than 5MB";
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setFormError("");
    setFormSuccess("");
    if (!validateForm()) return;
    if (!dirty) {
      setFormError("No changes to save yet.");
      return;
    }

    setSaving(true);
    try {
      let body: Record<string, string> | FormData;
      if (photo) {
        const formData = new FormData();
        formData.append("name", name.trim());
        formData.append("contactNumber", contactNumber.trim());
        formData.append("file", photo);
        body = formData;
      } else {
        body = {
          name: name.trim(),
          contactNumber: contactNumber.trim(),
        };
      }

      const response = (await api("/users/me", {
        method: "PATCH",
        body,
      })) as MeResponse;

      onUpdated(response.data);
      setPhoto(null);
      setFormSuccess("Your profile was updated successfully.");
    } catch (error) {
      setFormError(
        getErrorMessage(
          error,
          "Unable to update your profile. Please try again.",
        ),
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mx-auto grid w-full max-w-2xl gap-4">
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserIcon className="size-4 text-primary" />
            Personal information
          </CardTitle>
          <CardDescription>
            Keep your details up to date so providers can reach you about
            pickups.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit} noValidate>
          <CardContent className="grid gap-4">
            <div className="flex items-center gap-4">
              <div className="flex size-14 shrink-0 items-center justify-center overflow-hidden rounded-full bg-muted text-base font-bold text-foreground">
                {avatarSrc ? (
                  // biome-ignore lint/performance/noImgElement: preview of local file or remote URL.
                  <img
                    src={avatarSrc}
                    alt="Profile preview"
                    className="size-full object-cover"
                  />
                ) : (
                  initialsOf(name.trim() || profile.name)
                )}
              </div>
              <Field label="Profile photo" error={fieldErrors.photo}>
                <label className="inline-flex cursor-pointer items-center gap-2 rounded-md border border-border px-3 py-2 text-xs font-medium text-foreground transition-colors hover:bg-muted">
                  <Camera className="size-4" />
                  {photo ? "Change photo" : "Upload photo"}
                  <input
                    type="file"
                    accept={ALLOWED_IMAGE_TYPES.join(",")}
                    className="sr-only"
                    onChange={(e) => {
                      setPhoto(e.target.files?.[0] ?? null);
                      setFieldErrors((prev) => ({
                        ...prev,
                        photo: undefined,
                      }));
                    }}
                  />
                </label>
                {photo && (
                  <span className="truncate text-xs text-muted-foreground">
                    {photo.name}
                  </span>
                )}
              </Field>
            </div>

            <Field
              label="Name"
              icon={<UserIcon className="size-4" />}
              error={fieldErrors.name}
            >
              <Input
                autoComplete="name"
                maxLength={10}
                placeholder="Your name"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  setFieldErrors((prev) => ({ ...prev, name: undefined }));
                }}
                aria-invalid={Boolean(fieldErrors.name)}
              />
            </Field>

            <Field label="Email" icon={<Mail className="size-4" />}>
              <Input value={profile.email} disabled readOnly />
            </Field>

            <Field
              label="Contact number"
              icon={<Phone className="size-4" />}
              error={fieldErrors.contactNumber}
            >
              <Input
                type="tel"
                autoComplete="tel"
                placeholder="+880 1XXX-XXXXXX"
                value={contactNumber}
                onChange={(e) => {
                  setContactNumber(e.target.value);
                  setFieldErrors((prev) => ({
                    ...prev,
                    contactNumber: undefined,
                  }));
                }}
                aria-invalid={Boolean(fieldErrors.contactNumber)}
              />
            </Field>

            {formError && (
              <p className="rounded-md bg-destructive/10 px-3 py-2 text-xs text-destructive">
                {formError}
              </p>
            )}
            {formSuccess && (
              <p className="rounded-md bg-primary/10 px-3 py-2 text-xs text-primary">
                {formSuccess}
              </p>
            )}
          </CardContent>
          <CardFooter className="justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              disabled={saving || !dirty}
              onClick={() => {
                setName(profile.name);
                setContactNumber(profile.customer?.contactNumber ?? "");
                setPhoto(null);
                setFieldErrors({});
                setFormError("");
                setFormSuccess("");
              }}
            >
              Reset
            </Button>
            <Button type="submit" size="lg" disabled={saving || !dirty}>
              {saving && <Loader2 className="animate-spin" />}
              {saving ? "Saving..." : "Save changes"}
            </Button>
          </CardFooter>
        </form>
      </Card>

      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-base">Account status</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-1 text-xs text-muted-foreground">
          <p>
            Status:{" "}
            <span className="font-semibold text-foreground">
              {profile.status}
            </span>
          </p>
          <p>
            Email:{" "}
            <span className="font-semibold text-foreground">
              {profile.emailVerified ? "Verified" : "Not verified"}
            </span>
          </p>
          <p>
            Member since:{" "}
            <span className="font-semibold text-foreground">
              {new Date(profile.createdAt).toLocaleDateString()}
            </span>
          </p>
        </CardContent>
      </Card>
    </div>
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

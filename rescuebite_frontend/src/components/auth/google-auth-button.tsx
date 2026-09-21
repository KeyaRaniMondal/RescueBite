"use client";

import { type CredentialResponse, GoogleLogin } from "@react-oauth/google";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { api, getErrorMessage } from "@/lib/api";
import { getPostAuthPath } from "@/lib/auth";

const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? "";

type GoogleAuthResponse = {
  success: boolean;
  statusCode: number;
  message: string;
  data: { accessToken: string; refreshToken: string };
};

type GoogleAuthButtonProps = {
  mode: "login" | "signup";
};

export function GoogleAuthButton({ mode }: GoogleAuthButtonProps) {
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [buttonWidth, setButtonWidth] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const measure = () => {
      setButtonWidth(Math.max(0, Math.floor(el.clientWidth)));
    };
    measure();

    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  async function completeGoogleAuth(idToken: string) {
    setError("");
    setLoading(true);
    try {
      const response = (await api("/auth/google", {
        method: "POST",
        body: { idToken },
      })) as GoogleAuthResponse;

      localStorage.setItem(
        "rescuebite_access_token",
        response.data.accessToken,
      );
      localStorage.setItem(
        "rescuebite_refresh_token",
        response.data.refreshToken,
      );
      router.push(getPostAuthPath(response.data.accessToken));
    } catch (err) {
      setError(
        getErrorMessage(
          err,
          `Unable to sign ${mode === "login" ? "in" : "up"} with Google. Please try again.`,
        ),
      );
    } finally {
      setLoading(false);
    }
  }

  function handleGoogleSuccess(response: CredentialResponse) {
    if (!response.credential) {
      setError("Google didn't return an ID token. Please try again.");
      return;
    }
    void completeGoogleAuth(response.credential);
  }

  if (!GOOGLE_CLIENT_ID) {
    return (
      <p className="rounded-md bg-destructive/10 px-3 py-2 text-xs text-destructive">
        Google sign-in is not configured. Add NEXT_PUBLIC_GOOGLE_CLIENT_ID to
        your .env.local file.
      </p>
    );
  }

  return (
    <div className="grid gap-1.5">
      <div ref={containerRef} className="relative flex w-full justify-center">
        {buttonWidth > 0 && (
          <GoogleLogin
            theme="outline"
            shape="rectangular"
            text={mode === "login" ? "signin_with" : "signup_with"}
            size="large"
            width={buttonWidth}
            onSuccess={handleGoogleSuccess}
            onError={() =>
              setError(
                "Google sign-in was cancelled or failed. Please try again.",
              )
            }
            containerProps={{
              style: {
                display: "flex",
                justifyContent: "center",
                width: "100%",
              },
            }}
          />
        )}

        {loading && (
          <div
            aria-live="polite"
            className="absolute inset-0 z-10 flex items-center justify-center gap-2 rounded-md bg-background/70 text-xs font-medium text-muted-foreground"
          >
            <Loader2 className="size-4 animate-spin" />
            Signing {mode === "login" ? "in" : "up"} with Google…
          </div>
        )}
      </div>

      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}

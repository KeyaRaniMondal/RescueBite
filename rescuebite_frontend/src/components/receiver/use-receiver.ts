import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { api, getErrorMessage } from "@/lib/api";
import { clearTokens, getAccessToken } from "@/lib/auth";

export type ReceiverProfile = {
  id: string;
  name: string;
  email: string;
  role: "ADMIN" | "PROVIDER" | "RECEIVER";
  status: string;
  emailVerified: boolean;
  imageUrl: string;
  createdAt: string;
  updatedAt: string;
  customer: { id: string; contactNumber: string | null } | null;
};

export type MeResponse = {
  success: boolean;
  statusCode: number;
  message: string;
  data: ReceiverProfile;
};

export type ReceiverPhase = "loading" | "ready" | "error";

/**
 * Guards a receiver-only page: redirects providers/admins/guests away and
 * loads the signed-in receiver profile.
 */
export function useReceiver() {
  const router = useRouter();
  const [phase, setPhase] = useState<ReceiverPhase>("loading");
  const [profile, setProfile] = useState<ReceiverProfile | null>(null);
  const [loadError, setLoadError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);

  // biome-ignore lint/correctness/useExhaustiveDependencies: reloadKey intentionally re-runs the load.
  useEffect(() => {
    let cancelled = false;

    async function load() {
      setPhase("loading");
      if (!getAccessToken()) {
        router.replace("/login");
        return;
      }
      try {
        const me = (await api("/users/me")) as MeResponse;
        if (cancelled) return;
        if (me.data.role === "PROVIDER") {
          router.replace("/provider/dashboard");
          return;
        }
        if (me.data.role !== "RECEIVER") {
          router.replace("/");
          return;
        }
        setProfile(me.data);
        setPhase("ready");
      } catch (error) {
        if (cancelled) return;
        const message = getErrorMessage(error);
        if (
          /authentication required|invalid or expired token|unauthorized/i.test(
            message,
          )
        ) {
          clearTokens();
          router.replace("/login");
          return;
        }
        setLoadError(message);
        setPhase("error");
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [router, reloadKey]);

  return {
    phase,
    profile,
    setProfile,
    loadError,
    reload: () => setReloadKey((key) => key + 1),
  };
}

export function initialsOf(name: string): string {
  return (
    name
      .split(" ")
      .map((part) => part[0])
      .filter(Boolean)
      .slice(0, 2)
      .join("")
      .toUpperCase() || "RB"
  );
}

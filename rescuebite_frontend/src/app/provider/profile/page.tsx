import type { Metadata } from "next";
import { ProviderProfileView } from "@/components/provider/provider-profile-view";

export const metadata: Metadata = {
  title: "Provider Profile | RescueBite",
  description:
    "Set up your provider profile to start sharing surplus food with your neighbors.",
};

export default function ProviderProfilePage() {
  return <ProviderProfileView />;
}

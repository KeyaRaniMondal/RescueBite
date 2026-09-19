import type { Metadata } from "next";
import { Hero } from "@/components/home/hero";

export const metadata: Metadata = {
  title: "RescueBite — No Good Food Left Behind",
  description:
    "RescueBite connects restaurants, bakeries, and grocery stores with neighbors who can use their surplus food — before it goes to waste.",
};

export default function Home() {
  return <Hero />;
}

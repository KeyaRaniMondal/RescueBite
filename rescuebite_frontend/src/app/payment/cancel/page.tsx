import type { Metadata } from "next";
import { Suspense } from "react";
import { PaymentResultView } from "@/components/payment/payment-result-view";

export const metadata: Metadata = {
  title: "Payment Cancelled | RescueBite",
  description: "Your RescueBite payment was cancelled.",
};

export default function PaymentCancelPage() {
  return (
    <Suspense>
      <PaymentResultView variant="cancel" />
    </Suspense>
  );
}

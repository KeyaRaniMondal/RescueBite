import type { Metadata } from "next";
import { Suspense } from "react";
import { PaymentResultView } from "@/components/payment/payment-result-view";

export const metadata: Metadata = {
  title: "Payment Failed | RescueBite",
  description: "Your RescueBite payment failed.",
};

export default function PaymentFailPage() {
  return (
    <Suspense>
      <PaymentResultView variant="fail" />
    </Suspense>
  );
}

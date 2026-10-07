import type { Metadata } from "next";
import { Suspense } from "react";
import { PaymentResultView } from "@/components/payment/payment-result-view";

export const metadata: Metadata = {
  title: "Payment Successful | RescueBite",
  description: "Your RescueBite payment was successful.",
};

export default function PaymentSuccessPage() {
  return (
    <Suspense>
      <PaymentResultView variant="success" />
    </Suspense>
  );
}

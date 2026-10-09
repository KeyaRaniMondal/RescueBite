import type { Metadata } from "next";
import { CartView } from "@/components/cart/cart-view";

export const metadata: Metadata = {
  title: "Your Cart | RescueBite",
  description: "Review your rescued food picks and reserve them all at once.",
};

export default function CartPage() {
  return <CartView />;
}

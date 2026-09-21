import type { Metadata } from "next";
import { PagePlaceholder } from "@/components/page-placeholder";

export const metadata: Metadata = {
  title: "Contact | RescueBite",
  description:
    "Get in touch with the RescueBite team — questions, partner inquiries, and feedback are always welcome.",
};

export default function ContactPage() {
  return (
    <PagePlaceholder
      title="Let's talk"
      description="Questions, feedback, or a restaurant, bakery, or store ready to start rescuing? Reach out and we'll get back to you. A contact form and our team details are coming soon."
    />
  );
}

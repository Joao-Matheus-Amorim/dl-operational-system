import { redirect } from "next/navigation";
import { ROUTES } from "@/lib/routes";

export default function LegacyDogtoothRedirectPage() {
  redirect(ROUTES.dogtooth);
}

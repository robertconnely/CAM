import { redirect } from "next/navigation";

export const metadata = {
  title: "PDLC Framework — CAM",
};

export default function PdlcFrameworkPage() {
  redirect("/cam/overview");
}

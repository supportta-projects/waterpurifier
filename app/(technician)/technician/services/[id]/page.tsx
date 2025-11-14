import type { Metadata } from "next";
import { ServiceDetailClient } from "@/components/services/service-detail-client";

type ServiceDetailPageProps = {
  params: Promise<{ id: string }>;
};

export const metadata: Metadata = {
  title: "Service Details | Technician",
};

export default async function TechnicianServiceDetailPage({ params }: ServiceDetailPageProps) {
  const { id } = await params;
  return <ServiceDetailClient serviceId={id} />;
}


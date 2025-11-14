import type { Product, ProductStatus } from "@/types/product";

export const mockProducts: Product[] = [
  {
    id: "PROD-001",
    customId: "PROD-001",
    name: "AquaPure Elite",
    model: "AP-ELT-2024",
    description:
      "Premium RO purifier with UV+UF filtration, ideal for high-TDS regions and urban households.",
    price: 18999,
    status: "ACTIVE",
    createdAt: "2024-07-12T10:18:00Z",
    updatedAt: "2024-10-02T09:05:00Z",
  },
  {
    id: "PROD-002",
    customId: "PROD-002",
    name: "CrystalClean Pro",
    model: "CC-PRO-18",
    description:
      "Compact purifier with smart app tracking, real-time filter life alerts and leak detection.",
    price: 15499,
    status: "ACTIVE",
    createdAt: "2024-05-09T14:42:00Z",
    updatedAt: "2024-09-21T08:30:00Z",
  },
  {
    id: "PROD-003",
    customId: "PROD-003",
    name: "PureWave Ultra",
    model: "PW-UL-22",
    description:
      "Energy-efficient purifier with mineral retention and 12L storage for large families.",
    price: 21250,
    status: "COMING_SOON",
    createdAt: "2024-09-18T11:12:00Z",
    updatedAt: "2024-10-14T06:40:00Z",
  },
  {
    id: "PROD-004",
    customId: "PROD-004",
    name: "HydroGuard Max",
    model: "HG-MX-16",
    description:
      "Commercial-grade purifier suited for offices and small cafes with high output.",
    price: 29999,
    status: "ACTIVE",
    createdAt: "2024-03-04T09:32:00Z",
    updatedAt: "2024-08-25T05:25:00Z",
  },
  {
    id: "PROD-005",
    customId: "PROD-005",
    name: "EcoFlow Lite",
    model: "EF-LT-12",
    description:
      "Entry-level purifier with essentials for soft water regions, low maintenance.",
    price: 10999,
    status: "DISCONTINUED",
    createdAt: "2023-12-18T16:50:00Z",
    updatedAt: "2024-06-01T12:45:00Z",
  },
];

export function filterProducts(
  query: string,
  status: ProductStatus | "ALL" = "ALL",
) {
  const normalized = query.trim().toLowerCase();
  return mockProducts.filter((product) => {
    const matchesStatus = status === "ALL" || product.status === status;
    const matchesQuery =
      !normalized ||
      product.name.toLowerCase().includes(normalized) ||
      product.model.toLowerCase().includes(normalized) ||
      product.description.toLowerCase().includes(normalized);

    return matchesStatus && matchesQuery;
  });
}


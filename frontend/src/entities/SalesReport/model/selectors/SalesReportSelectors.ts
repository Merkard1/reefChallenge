import { StateSchema } from "@/app/providers/StoreProvider";
import { buildSelector } from "@/shared/store/buildSelector";

export const [useSalesReportData, getSalesReportData] = buildSelector(
  (state: StateSchema) => state?.salesReport?.report || null
);

export const [useSalesReportStatus, getSalesReportStatus] = buildSelector(
  (state: StateSchema) => state?.salesReport?.status || "idle"
);

export const [useSalesReportError, getSalesReportError] = buildSelector(
  (state: StateSchema) => state?.salesReport?.error || null
);

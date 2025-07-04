import { FundingRequest } from "./funding-request";

export interface GroupedByDA {
  da: string;
  requests: FundingRequest[];
}
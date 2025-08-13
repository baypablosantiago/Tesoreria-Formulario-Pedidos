import { FundingRequestAdminResponseDto } from "./dtos";

export interface GroupedByDA {
  da: string;
  requests: FundingRequestAdminResponseDto[];
}
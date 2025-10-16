import { FundingRequestResponseDto } from "./dtos";

export interface UserMonthGroup {
  month: string;
  requests: FundingRequestResponseDto[];
  count: number;
}

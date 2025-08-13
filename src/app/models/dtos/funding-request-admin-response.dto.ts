import { FundingRequestResponseDto } from './funding-request-response.dto';

export interface FundingRequestAdminResponseDto extends FundingRequestResponseDto {
  userId: string;
}
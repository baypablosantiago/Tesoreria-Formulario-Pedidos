import { FundingRequestAdminResponseDto } from './funding-request-admin-response.dto';

export interface FundingRequestChangeNotificationDto {
  requestId: number;
  requestNumber: number;
  da: number;
  changeType: 'CREATE' | 'UPDATE' | 'STATUS_CHANGE' | 'WORK_STATUS_CHANGE' | 'COMMENT_ADDED' | 'PAYMENT_UPDATED';
  fieldChanged?: string;
  oldValue?: string;
  newValue?: string;
  changeDate: Date;
  userEmail: string;
  fullRequest: FundingRequestAdminResponseDto;
}

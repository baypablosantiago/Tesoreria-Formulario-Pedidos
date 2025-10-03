import { FundingRequestChangeNotificationDto } from './dtos';

export interface Notification {
  id: string;
  message: string;
  timestamp: Date;
  read: boolean;
  data: FundingRequestChangeNotificationDto;
}

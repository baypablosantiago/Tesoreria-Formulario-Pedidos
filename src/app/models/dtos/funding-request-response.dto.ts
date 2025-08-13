export interface FundingRequestResponseDto {
  id: number;
  receivedAt: Date;
  da: number;
  requestNumber: number;
  fiscalYear: number;
  paymentOrderNumber: string;
  concept: string;
  dueDate: string;
  amount: number;
  fundingSource: string;
  checkingAccount: string;
  comments?: string;
  commentsFromTeso?: string;
  partialPayment: number;
  isActive: boolean;
  onWork: boolean;
}
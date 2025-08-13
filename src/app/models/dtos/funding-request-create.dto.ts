export interface FundingRequestCreateDto {
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
}
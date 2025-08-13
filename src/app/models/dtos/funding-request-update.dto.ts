export interface FundingRequestUpdateDto {
  id: number;

  requestNumber: number;

  fiscalYear: number;

  paymentOrderNumber: string;

  concept: string;

  amount: number;

  fundingSource: string;

  checkingAccount: string;

  dueDate: string; 

  comments?: string;
}
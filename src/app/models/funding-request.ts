export interface FundingRequest {
  id?: number; 

  da: number;
  requestNumber: number;
  fiscalYear: number;
  paymentOrderNumber: number;

  concept: string;
  dueDate: string; 

  amount: number;

  fundingSource: string;
  checkingAccount: string;

  comments?: string;
  partialPayment:number;
  isActive?:boolean;
  receivedAt?:Date;
  commentsFromTeso?:string;
}
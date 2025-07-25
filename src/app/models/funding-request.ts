export interface FundingRequest {
  id?: number; 

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
  partialPayment:number;
  isActive?:boolean;
  onWork?:boolean;
  receivedAt?:Date;
  commentsFromTeso?:string;
}
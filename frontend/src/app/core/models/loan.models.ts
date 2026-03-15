export type LoanStatus = 'APPLIED' | 'APPROVED' | 'REJECTED';

export interface ApplyLoanRequest {
  loanAmount: number;
  salary: number;
  tenureMonths: number;
  employmentType: string;
}

export interface LoanCustomer {
  id: number;
  name: string;
  email: string;
}

export interface LoanApplication {
  id: number;
  loanAmount: number;
  salary: number;
  tenureMonths: number;
  employmentType: string;
  status: LoanStatus;
  customer: LoanCustomer | null;
}

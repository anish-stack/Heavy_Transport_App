export interface MemberPlan {
    _id: string;
    title: string;
    validityDays: number;
    whatIsThis: string;
  }
  
  export interface Recharge {
    _id: string;
    member_id: MemberPlan;
    amount: number;
    payment_approved: boolean;
    end_date: string;
    trn_no: string;
    createdAt: string;
  }
  
  export interface User {
    Bh_Id: string;
  }
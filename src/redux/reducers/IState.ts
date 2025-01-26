export interface IInitialState {
    isAuthenticated: boolean;
    error: any;
    tempMail: {email:string}|null;
    otpVerified:boolean;
  }
  
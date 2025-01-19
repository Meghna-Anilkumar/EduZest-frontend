


export interface IInitialState {
    isAuthenticated: boolean;
    error: IInitialStateError | null;
    tempMail: {email:string}|null;
    otpVerified:boolean;
  }
  
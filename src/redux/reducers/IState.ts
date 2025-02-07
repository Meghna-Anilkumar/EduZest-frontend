import { IUserdata } from "../../interface/user/IUserData";

export interface IInitialState {
    isAuthenticated: boolean;
    error: any;
    tempMail: {email:string}|null;
    otpVerified:boolean;
    userData:IUserdata|null
  }
  
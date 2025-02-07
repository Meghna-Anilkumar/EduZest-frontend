// import { IUser } from "./user/IUserData";


export enum ResponseStatus {
    SUCCESS = 'success',
    ERROR = 'error',
}

export interface IInitialStateError {
    error: string
    message: string
}

export interface ResponseData {
    success: boolean;
    message: string;
    error?: {
        message: string;
    };
    data?: unknown;
    redirectURL?: string
    accessToken?: string;
    refreshToken?: string;
}





export interface VerifyOtpBaseResponse {
    success: boolean;
    message: string;
    redirectURL: string;
}

export interface VerifyOtpSuccessResponse extends VerifyOtpBaseResponse {
    success: true;
    data?: any;
}

export interface VerifyOtpErrorResponse extends VerifyOtpBaseResponse {
    success: false;
}


export type VerifyOtpResponse = VerifyOtpSuccessResponse | VerifyOtpErrorResponse;


// import { IUser } from "./user/IUserData";


export enum ResponseStatus {
    SUCCESS = 'Success',
    ERROR = 'Error',
}

export interface IInitialStateError {
    error: string
    message: string
}

export interface ResponseData {
    status: ResponseStatus;
    message: string;
    error?: IInitialStateError | null,
    data?: {
        [key: string]: any;
    },
    redirectURL: string
}

export interface VerifyOtpBaseResponse {
    status: 'success' | 'error';
    message: string;
}

export interface VerifyOtpSuccessResponse extends VerifyOtpBaseResponse {
    status: 'success';
    data?: any;
}

export interface VerifyOtpErrorResponse extends VerifyOtpBaseResponse {
    status: 'error';
    message: string;
}

export type VerifyOtpResponse = VerifyOtpSuccessResponse | VerifyOtpErrorResponse;


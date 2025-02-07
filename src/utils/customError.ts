import { ResponseData } from "../interface/Interface";

export interface ErrorResponse extends ResponseData {
  data?: { [key: string]: string } | undefined
}

export function isErrorResponse(error: unknown): error is ErrorResponse {

  return (
    typeof error === 'object' &&
    error !== null &&
    'status' in error &&
    'message' in error
  );

};
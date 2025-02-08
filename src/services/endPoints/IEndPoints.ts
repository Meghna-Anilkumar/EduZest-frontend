export interface IEndPoints {
    login: string;
    logout: string;
}

export interface UserEndpoints extends IEndPoints {
    signup: string;
    verifyOTP: string;
    fetchUserdata:string
}


export interface AdminEndpoints extends IEndPoints {
    
}
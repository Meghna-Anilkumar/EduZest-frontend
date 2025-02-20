export interface IEndPoints {
    login: string;
    logout: string;
}

export interface UserEndpoints extends IEndPoints {
    signup: string;
    verifyOTP: string;
    fetchUserdata:string
    resendOTP:string
    forgotPassword:string
    resetPassword:string
    updateProfile:string
    changePassword:string
    googleAuth:string
}


export interface AdminEndpoints extends IEndPoints {
    getAllStudents:(page:number,limit:number)=>string
}
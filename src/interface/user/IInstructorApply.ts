export interface InstructorApplicationData {
    name: string;
    email: string;
    phone: string;
    qualification:string
    profile: {
        dob: string;
        gender: "Male" | "Female" | "Other";
        profilePic?: string;
    };
    aboutMe: string;
    cv: string;
}

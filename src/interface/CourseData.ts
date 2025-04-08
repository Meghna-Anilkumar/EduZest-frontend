import { ICourse, IModule} from "../interface/ICourse";

export interface CourseData extends Partial<ICourse> {
  thumbnail: string; // S3 key for thumbnail (required, overriding Partial<ICourse>)
  modules: IModule[]; // Use the existing IModule interface
}
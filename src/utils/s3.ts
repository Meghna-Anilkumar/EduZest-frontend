import axios from "axios";

export const getPresignedUrl = async (
    fileType: "thumbnail" | "video",
    fileName: string,
    moduleIndex?: number,
    lessonIndex?: number
  ) => {
    try {
      const response = await axios.post(
        "/instructor/courses/presigned-url", // Adjust to "/api/instructor/courses/presigned-url" if needed
        { fileType, fileName, moduleIndex, lessonIndex },
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );
      console.log("Presigned URL response:", response.data);
      return response.data; // { url, key }
    } catch (error: any) {
      console.error("Error getting presigned URL:", error.response?.status, error.response?.data || error.message);
      throw new Error(`Failed to get presigned URL: ${error.response?.status} - ${error.message}`);
    }
  };
  
  export const uploadToS3 = async (presignedUrl: string, file: File) => {
    try {
      await axios.put(presignedUrl, file, {
        headers: { "Content-Type": file.type },
      });
      console.log("Successfully uploaded to S3:", presignedUrl);
    } catch (error: any) {
      console.error("Error uploading to S3:", error.response?.status, error.response?.data || error.message);
      throw new Error(`Failed to upload to S3: ${error.response?.status} - ${error.message}`);
    }
  };
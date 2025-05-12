import React, { useRef } from "react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

interface CertificateProps {
  studentName: string;
  courseName: string;
  completionDate: string;
  instructorName: string; // Add instructorName prop
}

const Certificate: React.FC<CertificateProps> = ({ studentName, courseName, completionDate, instructorName }) => {
  const certificateRef = useRef<HTMLDivElement>(null);

  const handleDownloadPDF = async () => {
    if (!certificateRef.current) return;

    const canvas = await html2canvas(certificateRef.current, {
      scale: 2,
      useCORS: true,
    });

    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF({
      orientation: "landscape",
      unit: "mm",
      format: "a4",
    });

    const imgWidth = 297;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    pdf.addImage(imgData, "PNG", 0, (297 - imgHeight) / 2, imgWidth, imgHeight);

    const fileName = `${studentName.replace(/\s+/g, "-")}-${courseName.replace(/\s+/g, "-")}.pdf`;
    pdf.save(fileName);
  };

  return (
    <div className="flex flex-col items-center p-6 bg-gray-50 min-h-screen">
      <div
        id="certificate"
        ref={certificateRef}
        className="relative w-full max-w-5xl h-[600px] bg-white shadow-xl overflow-hidden rounded-lg border-8 border-double border-blue-900"
      >
        <div className="absolute inset-0 border-[12px] border-blue-900 opacity-5 m-4 rounded-lg"></div>
        
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-0 left-0 w-full h-full">
            <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
              <pattern id="diagonalHatch" patternUnits="userSpaceOnUse" width="10" height="10" patternTransform="rotate(45)">
                <line x1="0" y1="0" x2="0" y2="10" stroke="#2A4D69" strokeWidth="1" />
              </pattern>
              <rect width="100%" height="100%" fill="url(#diagonalHatch)" />
            </svg>
          </div>
        </div>
        
        <div className="absolute top-0 left-0 w-24 h-24">
          <svg viewBox="0 0 100 100" className="w-full h-full">
            <path d="M0,0 L100,0 L100,20 C60,20 20,60 20,100 L0,100 Z" fill="#2A4D69" opacity="0.8" />
          </svg>
        </div>
        <div className="absolute top-0 right-0 w-24 h-24">
          <svg viewBox="0 0 100 100" className="w-full h-full">
            <path d="M0,0 L100,0 L100,100 L80,100 C80,60 40,20 0,20 Z" fill="#2A4D69" opacity="0.8" />
          </svg>
        </div>
        <div className="absolute bottom-0 left-0 w-24 h-24">
          <svg viewBox="0 0 100 100" className="w-full h-full">
            <path d="M0,0 L20,0 C20,40 60,80 100,80 L100,100 L0,100 Z" fill="#2A4D69" opacity="0.8" />
          </svg>
        </div>
        <div className="absolute bottom-0 right-0 w-24 h-24">
          <svg viewBox="0 0 100 100" className="w-full h-full">
            <path d="M0,80 C40,80 80,40 80,0 L100,0 L100,100 L0,100 Z" fill="#2A4D69" opacity="0.8" />
          </svg>
        </div>

        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 opacity-5">
          <svg viewBox="0 0 200 200" className="w-full h-full">
            <circle cx="100" cy="100" r="95" fill="none" stroke="#F5A623" strokeWidth="2" />
            <circle cx="100" cy="100" r="85" fill="none" stroke="#F5A623" strokeWidth="1" />
            <circle cx="100" cy="100" r="75" fill="none" stroke="#2A4D69" strokeWidth="2" />
          </svg>
        </div>

        <div className="relative z-10 flex flex-col items-center justify-between h-full p-12 text-center">
          <div>
            <div className="mb-2 flex items-center justify-center">
              <div className="w-16 h-1 bg-blue-900 rounded-full mr-4"></div>
              <h2 className="text-2xl font-bold tracking-widest text-blue-900">
                EDUZEST
              </h2>
              <div className="w-16 h-1 bg-blue-900 rounded-full ml-4"></div>
            </div>
            <p className="text-sm text-blue-700 italic font-medium tracking-wider">EXCELLENCE IN ONLINE EDUCATION</p>
          </div>

          <div className="flex flex-col items-center">
            <h1 className="text-5xl font-serif text-blue-900 mb-8 font-bold tracking-wide">
              Certificate of Achievement
            </h1>
            
            <p className="text-lg text-blue-900 mb-3">This certifies that</p>
            <h2 className="text-4xl font-serif text-blue-900 mb-6 font-bold relative inline-block">
              {studentName}
              <div className="absolute -bottom-2 left-0 w-full h-1 bg-yellow-500 opacity-80"></div>
            </h2>
            
            <p className="text-lg text-blue-900 mb-6 max-w-lg">
              has successfully completed the course
            </p>
            <h3 className="text-2xl font-serif text-blue-900 mb-8 font-bold">
              {courseName}
            </h3>
            <p className="text-lg text-blue-900">
              Awarded this {completionDate}
            </p>
          </div>

          <div className="flex justify-between w-full">
            <div className="text-center">
              <div className="h-12 border-b border-gray-400 mb-2 mx-auto w-40">
                {/* Signature placeholder */}
              </div>
              <p className="text-base font-semibold text-blue-900">{instructorName}</p> {/* Display instructor name */}
              <p className="text-sm font-bold text-blue-900">Course Instructor</p>
            </div>
            
            <div className="relative w-24 h-24">
              <svg viewBox="0 0 100 100" className="w-full h-full">
                <circle cx="50" cy="50" r="48" fill="none" stroke="#F5A623" strokeWidth="2" />
                <circle cx="50" cy="50" r="40" fill="#F5A623" fillOpacity="0.1" />
                <text x="50" y="55" textAnchor="middle" fontSize="12" fontWeight="bold" fill="#2A4D69">SEAL</text>
              </svg>
            </div>
            
            <div className="text-center">
              <div className="h-12 border-b border-gray-400 mb-2 mx-auto w-40">
                {/* Signature placeholder */}
              </div>
              <p className="text-sm font-bold text-blue-900">EDUZEST CEO</p>
            </div>
          </div>
        </div>
      </div>

      <button
        onClick={handleDownloadPDF}
        className="mt-8 bg-blue-900 text-white py-3 px-8 rounded-lg hover:bg-blue-800 transition-colors shadow-lg flex items-center"
      >
        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
        </svg>
        Download Certificate
      </button>
    </div>
  );
};

export default Certificate;
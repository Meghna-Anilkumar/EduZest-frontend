import React from 'react';

interface InvoiceProps {
  payment: {
    _id: string;
    amount: number;
    status: string;
    createdAt: string;
    courseId: string;
  };
  courseName: string;
  onClose: () => void;
  onPrint: () => void;
}

const Invoice: React.FC<InvoiceProps> = ({ payment, courseName, onClose, onPrint }) => {
  const invoiceDate = new Date().toLocaleDateString();
  const paymentDate = new Date(payment.createdAt).toLocaleDateString();
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-screen overflow-auto">
        {/* Invoice Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">INVOICE</h2>
            <p className="text-gray-500 text-sm">#{payment._id.substring(0, 8).toUpperCase()}</p>
          </div>
          <div className="flex space-x-2">
            <button 
              onClick={onPrint}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            >
              Print
            </button>
            <button 
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
        
        {/* Invoice Body */}
        <div className="p-6" id="printable-invoice">
          {/* Company & Customer Info */}
          <div className="flex justify-between mb-8">
            <div>
              <h3 className="font-bold text-gray-800 mb-1">From:</h3>
              <p className="text-gray-600">EduZest Learning Platform</p>
            </div>
            <div className="text-right">
              <h3 className="font-bold text-gray-800 mb-1">Invoice Date:</h3>
              <p className="text-gray-600">{invoiceDate}</p>
              <h3 className="font-bold text-gray-800 mt-4 mb-1">Status:</h3>
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                payment.status === "completed"
                  ? "bg-green-100 text-green-800"
                  : payment.status === "pending"
                  ? "bg-yellow-100 text-yellow-800"
                  : "bg-red-100 text-red-800"
              }`}>
                {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
              </span>
            </div>
          </div>
          
          {/* Course Details */}
          <div className="mb-8">
            <h3 className="text-lg font-bold text-gray-800 mb-4 border-b pb-2">Course Details</h3>
            <div className="flex justify-between text-gray-600 mb-2">
              <span className="font-medium">Course Name:</span>
              <span>{courseName}</span>
            </div>
            <div className="flex justify-between text-gray-600 mb-2">
              <span className="font-medium">Enrollment Date:</span>
              <span>{paymentDate}</span>
            </div>
          </div>
          
          {/* Payment Summary */}
          <div className="mb-8">
            <h3 className="text-lg font-bold text-gray-800 mb-4 border-b pb-2">Payment Summary</h3>
            <table className="w-full">
              <thead>
                <tr className="text-left text-gray-600">
                  <th className="py-2">Description</th>
                  <th className="py-2 text-right">Amount</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t border-gray-200">
                  <td className="py-4">Course Fee - {courseName}</td>
                  <td className="py-4 text-right">₹{payment.amount.toFixed(2)}</td>
                </tr>
                <tr className="border-t border-gray-200 font-bold text-lg">
                  <td className="py-4">Total</td>
                  <td className="py-4 text-right">₹{payment.amount.toFixed(2)}</td>
                </tr>
              </tbody>
            </table>
          </div>
          
          {/* Thank You Note */}
          <div className="text-center mt-12 mb-6">
            <p className="text-gray-600 mb-2">Thank you for your enrollment!</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Invoice;
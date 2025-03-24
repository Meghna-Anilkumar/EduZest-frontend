import React from "react";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
}) => {
  const handlePrevious = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1);
    }
  };

  return (
    <div className="flex items-center justify-center space-x-2 p-2">
      {/* Left Arrow */}
      <button
        className="btn btn-outline btn-sm px-3 py-2 rounded-full"
        onClick={handlePrevious}
        disabled={currentPage === 1}>
        &#8592; {/* Left Arrow (←) */}
      </button>

      {/* Page Numbers */}
      {Array.from({ length: totalPages }, (_, index) => (
        <button
          key={index + 1}
          className={`btn btn-sm px-4 py-2 rounded-full ${
            currentPage === index + 1 ? "bg-blue-500 text-white" : "bg-gray-200"
          }`}
          onClick={() => onPageChange(index + 1)}>
          {index + 1}
        </button>
      ))}

      {/* Right Arrow */}
      <button
        className="btn btn-outline btn-sm px-3 py-2 rounded-full"
        onClick={handleNext}
        disabled={currentPage === totalPages}>
        &#8594; {/* Right Arrow (→) */}
      </button>
    </div>
  );
};

export default Pagination;

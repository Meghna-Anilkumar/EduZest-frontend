// components/CourseListing.tsx
import React, { lazy, Suspense, useEffect, useState } from "react";
import { Star } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { clearError } from "../../redux/reducers/courseReducer";
import { AppDispatch, RootState } from "../../redux/store";
import { getAllActiveCoursesAction } from "../../redux/actions/courseActions";

import { SearchBar } from "../common/SearchBar";
import Pagination from "../common/Pagination";

const Header = lazy(() => import("../common/users/Header"));

interface DisplayCourse {
  id: string;
  title: string;
  instructor: string;
  rating: number;
  reviewCount: number;
  originalPrice: number;
  tags?: string[];
  imageUrl: string;
}

const CourseListing: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { activeCourses, loading, error } = useSelector((state: RootState) => state.course);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);

  useEffect(() => {
    dispatch(
      getAllActiveCoursesAction({
        page: currentPage,
        limit: 10,
        search: searchTerm || undefined,
      })
    );

    return () => {
      dispatch(clearError());
    };
  }, [dispatch, currentPage, searchTerm]);

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const courses: DisplayCourse[] = activeCourses.courses.map((course: any) => ({
    id: course._id,
    title: course.title,
    instructor: course.instructorRef?.name || "Unknown Instructor",
    rating: 4.5,
    reviewCount: 1000,
    originalPrice: course.pricing?.amount || 0,
    tags: [
      ...(course.pricing?.amount > 0 ? ["Paid"] : ["Free"]),
      ...(course.studentsEnrolled > 1000 ? ["Bestseller"] : []),
    ],
    imageUrl: course.thumbnail || "/api/placeholder/300/200",
  }));

  return (
    <div className="flex flex-col min-h-screen">
      <Suspense fallback={<div>Loading...</div>}>
        <Header className="fixed top-0 left-0 right-0 z-50" />
      </Suspense>

      <div className="bg-gray-100 flex-grow pt-[80px] md:pt-[100px] p-4 md:p-8">
        <div className="container mx-auto">
          <h1 className="text-2xl md:text-3xl font-bold mb-4 md:mb-6">Courses to get you started</h1>
          <p className="text-gray-600 mb-6 md:mb-8">Explore courses from experienced, real-world experts</p>

          <div className="mb-6">
            <SearchBar onSearchChange={handleSearchChange} />
          </div>

          <div class="flex space-x-2 md:space-x-4 mb-6 md:mb-8 overflow-x-auto">
            <button className="px-3 py-1 md:px-4 md:py-2 bg-black text-white rounded-full text-sm md:text-base whitespace-nowrap">
              Most popular
            </button>
            <button className="px-3 py-1 md:px-4 md:py-2 text-gray-600 hover:bg-gray-200 rounded-full text-sm md:text-base whitespace-nowrap">
              New
            </button>
            <button className="px-3 py-1 md:px-4 md:py-2 text-gray-600 hover:bg-gray-200 rounded-full text-sm md:text-base whitespace-nowrap">
              Trending
            </button>
          </div>

          {loading ? (
            <div className="text-center">Loading courses...</div>
          ) : error ? (
            <div className="text-center text-red-500">{error}</div>
          ) : courses.length === 0 ? (
            <div className="text-center text-gray-500">No courses found.</div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                {courses.map((course) => (
                  <Link
                    to={`/course-details/${course.id}`}
                    key={course.id}
                    className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow"
                  >
                    <img
                      src={course.imageUrl}
                      alt={course.title}
                      className="w-full h-40 md:h-48 object-cover"
                    />
                    <div className="p-3 md:p-4">
                      <h2 className="font-bold text-base md:text-lg mb-1 md:mb-2 line-clamp-2">
                        {course.title}
                      </h2>
                      <p className="text-gray-600 text-xs md:text-sm mb-1 md:mb-2">
                        {course.instructor}
                      </p>

                      <div className="flex items-center mb-1 md:mb-2">
                        <span className="text-yellow-500 font-bold mr-1 md:mr-2 text-sm md:text-base">
                          {course.rating}
                        </span>
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`h-3 w-3 md:h-4 md:w-4 ${
                                i < Math.round(course.rating)
                                  ? "text-yellow-500 fill-yellow-500"
                                  : "text-gray-300"
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-gray-500 ml-1 md:ml-2 text-xs md:text-sm">
                          ({course.reviewCount.toLocaleString()})
                        </span>
                      </div>

                      <div className="mb-2 md:mb-4">
                        <span className="text-base md:text-xl font-bold">
                          ₹{course.originalPrice}
                        </span>
                      </div>

                      <div className="flex space-x-1 md:space-x-2">
                        {course.tags?.map((tag) => (
                          <span
                            key={tag}
                            className={`
                              px-1 py-0.5 md:px-2 md:py-1 rounded-full text-[10px] md:text-xs font-semibold
                              ${
                                tag === "Paid"
                                  ? "bg-purple-100 text-purple-800"
                                  : tag === "Free"
                                  ? "bg-blue-100 text-blue-800"
                                  : "bg-green-100 text-green-800"
                              }
                            `}
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>

              <div className="mt-8">
                <Pagination
                  currentPage={activeCourses.currentPage}
                  totalPages={activeCourses.totalPages}
                  onPageChange={handlePageChange}
                />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default CourseListing;
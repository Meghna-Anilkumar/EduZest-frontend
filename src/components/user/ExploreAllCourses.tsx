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

interface FilterOptions {
  level?: "beginner" | "intermediate" | "advanced";
  pricingType?: "free" | "paid";
}

interface SortOptions {
  field: "price" | "updatedAt" | "studentsEnrolled";
  order: "asc" | "desc";
}

const CourseListing: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { activeCourses, loading, error } = useSelector(
    (state: RootState) => state.course
  );
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [filters, setFilters] = useState<FilterOptions>({});
  const [sort, setSort] = useState<SortOptions>({
    field: "updatedAt",
    order: "desc",
  });
  const [isFilterOpen, setIsFilterOpen] = useState<boolean>(false);

  useEffect(() => {
    dispatch(
      getAllActiveCoursesAction({
        page: currentPage,
        limit: 10,
        search: searchTerm || undefined,
        filters,
        sort,
      })
    );

    return () => {
      dispatch(clearError());
    };
  }, [dispatch, currentPage, searchTerm, filters, sort]);

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
    setCurrentPage(1);
  };

  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value || undefined }));
    setCurrentPage(1);
  };

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const [field, order] = e.target.value.split(":");
    setSort({ field: field as any, order: order as "asc" | "desc" });
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const toggleFilters = () => {
    setIsFilterOpen(!isFilterOpen);
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
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-indigo-50 to-white">
      <Suspense
        fallback={
          <div className="flex items-center justify-center h-screen w-full">
            <div className="animate-pulse flex space-x-4">
              <div className="rounded-full bg-slate-200 h-10 w-10"></div>
              <div className="flex-1 space-y-6 py-1">
                <div className="h-2 bg-slate-200 rounded"></div>
                <div className="space-y-3">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="h-2 bg-slate-200 rounded col-span-2"></div>
                    <div className="h-2 bg-slate-200 rounded col-span-1"></div>
                  </div>
                  <div className="h-2 bg-slate-200 rounded"></div>
                </div>
              </div>
            </div>
          </div>
        }
      >
        <Header />
      </Suspense>

      <div className="flex-grow pt-[80px] md:pt-[100px] p-4 md:p-8">
        <div className="container mx-auto max-w-7xl">
          <div className="bg-gradient-to-r from-black to-gray-800 text-white rounded-lg p-6 mb-8 shadow-lg">
            <h1 className="text-3xl md:text-4xl font-bold mb-2 md:mb-3">
              Courses to get you started
            </h1>
            <p className="text-indigo-100 text-lg md:w-3/4">
              Explore courses from experienced, real-world experts and transform
              your skills today
            </p>
          </div>

          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <SearchBar onSearchChange={handleSearchChange} />
              <button
                onClick={toggleFilters}
                className="md:hidden bg-[#49BBBD] text-white px-4 py-2 rounded-full flex items-center"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mr-1"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
                  />
                </svg>
                Filters
              </button>
            </div>

            <div
              className={`transition-all duration-300 overflow-hidden ${
                isFilterOpen ? "max-h-96" : "max-h-0 md:max-h-96"
              }`}
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-white p-4 rounded-lg shadow-md mb-4">
                <select
                  name="level"
                  onChange={handleFilterChange}
                  className="border border-gray-300 px-4 py-1.5 rounded-full bg-white text-sm focus:ring-2 focus:ring-[#49BBBD] focus:border-[#49BBBD] transition-all"
                >
                  <option value="">All Levels</option>
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>

                <select
                  name="level"
                  onChange={handleFilterChange}
                  className="border border-gray-300 px-4 py-1.5 rounded-full bg-white text-sm focus:ring-2 focus:ring-[#49BBBD] focus:border-[#49BBBD] transition-all"
                >
                  <option value="">All Pricing</option>
                  <option value="free">Free</option>
                  <option value="paid">Paid</option>
                </select>

                <select
                  name="level"
                  onChange={handleFilterChange}
                  className="border border-gray-300 px-4 py-1.5 rounded-full bg-white text-sm focus:ring-2 focus:ring-[#49BBBD] focus:border-[#49BBBD] transition-all"
                >
                  <option value="updatedAt:desc">Newest First</option>
                  <option value="updatedAt:asc">Oldest First</option>
                  <option value="price:asc">Price: Low to High</option>
                  <option value="price:desc">Price: High to Low</option>
                  <option value="studentsEnrolled:desc">Most Popular</option>
                </select>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {[...Array(8)].map((_, index) => (
                <div
                  key={index}
                  className="bg-white rounded-lg shadow-md overflow-hidden animate-pulse"
                >
                  <div className="w-full h-48 bg-gray-200"></div>
                  <div className="p-4">
                    <div className="h-4 bg-gray-200 rounded mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="flex items-center mb-2">
                      <div className="h-3 bg-gray-200 rounded w-12 mr-2"></div>
                      <div className="flex space-x-1">
                        {[...Array(5)].map((_, i) => (
                          <div
                            key={i}
                            className="h-3 w-3 bg-gray-200 rounded-full"
                          ></div>
                        ))}
                      </div>
                    </div>
                    <div className="h-5 bg-gray-200 rounded w-1/4 mb-4"></div>
                    <div className="flex space-x-2">
                      <div className="h-5 w-12 bg-gray-200 rounded-full"></div>
                      <div className="h-5 w-16 bg-gray-200 rounded-full"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-8 rounded-lg text-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-12 w-12 mx-auto mb-4 text-red-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <h3 className="text-lg font-semibold mb-2">
                Error Loading Courses
              </h3>
              <p>{error}</p>
            </div>
          ) : courses.length === 0 ? (
            <div className="bg-[#E6F9F9] border border-[#B4E6E7] text-[#318C8D] px-4 py-12 rounded-lg text-center">
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-16 w-16 mx-auto mb-4 text-[#49BBBD]"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >

                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <h3 className="text-xl font-semibold mb-2">No courses found</h3>
              <p className="text-[#49BBBD]">
                Try adjusting your search or filter criteria
              </p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {courses.map((course) => (
                  <Link
                    to={`/course-details/${course.id}`}
                    key={course.id}
                    className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 group"
                  >
                    <div className="relative">
                      <img
                        src={course.imageUrl}
                        alt={course.title}
                        className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      {course.tags?.includes("Bestseller") && (
                        <span className="absolute top-3 left-3 bg-yellow-500 text-white text-xs font-bold px-2 py-1 rounded-md">
                          BESTSELLER
                        </span>
                      )}
                    </div>
                    <div className="p-5">
                      <h2 className="font-bold text-lg text-gray-800 mb-2 line-clamp-2 group-hover:text-[#49BBBD] transition-colors">
                        {course.title}
                      </h2>
                      <p className="text-gray-600 text-sm font-medium mb-2 flex items-center">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4 mr-1 text-gray-500"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                          />
                        </svg>
                        {course.instructor}
                      </p>
                      <div className="flex items-center mb-3">
                        <span className="text-yellow-500 font-bold mr-2 text-base">
                          {course.rating}
                        </span>
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`h-4 w-4 ${
                                i < Math.round(course.rating)
                                  ? "text-yellow-500 fill-yellow-500"
                                  : "text-gray-300"
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-gray-500 ml-2 text-xs">
                          ({course.reviewCount.toLocaleString()})
                        </span>
                      </div>
                      <div className="mb-3">
                        {course.originalPrice > 0 ? (
                          <span className="text-xl font-bold text-gray-900">
                            ₹{course.originalPrice.toLocaleString()}
                          </span>
                        ) : (
                          <span className="text-xl font-bold text-green-600">
                            Free
                          </span>
                        )}
                      </div>
                      <div className="flex space-x-2">
                        {course.tags?.map((tag) => (
                          <span
                            key={tag}
                            className={`
                              px-2 py-1 rounded-full text-xs font-semibold
                              ${
                                tag === "Paid"
                                  ? "bg-purple-100 text-[#49BBBD]"
                                  : tag === "Free"
                                  ? "bg-green-100 text-green-800"
                                  : tag === "Bestseller"
                                  ? "bg-amber-100 text-amber-800"
                                  : "bg-blue-100 text-blue-800"
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
              <div className="mt-12">
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

      <footer className="bg-gradient-to-r from-black to-gray-800 text-gray-200 py-6 mt-12">
        <div className="container mx-auto text-center">
          <p>
            © {new Date().getFullYear()} Learning Platform. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default CourseListing;

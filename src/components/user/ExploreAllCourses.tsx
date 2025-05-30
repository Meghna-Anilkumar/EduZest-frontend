import React, { lazy, Suspense, useEffect, useState } from "react";
import { Star, Filter, ChevronDown } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { clearError } from "../../redux/reducers/courseReducer";
import { AppDispatch, RootState } from "../../redux/store";
import { getAllActiveCoursesAction } from "../../redux/actions/courseActions";
import { SearchBar } from "../common/SearchBar";
import Pagination from "../common/Pagination";
import { ICourse, FilterOptions, SortOptions } from "../../interface/ICourse";

interface HeaderProps {
  className?: string;
}

const Header = lazy(() =>
  import("../common/users/Header").then((module) => ({
    default: module.default as React.ComponentType<HeaderProps>,
  }))
);

interface DisplayCourse {
  id: string;
  title: string;
  instructor: string;
  rating: number;
  reviewCount: number;
  originalPrice: number;
  offerPrice?: number;
  discountPercentage?: number;
  tags: string[];
  imageUrl: string;
}

const ExploreAllCourses: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { activeCourses, loading, error } = useSelector((state: RootState) => state.course);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [filters, setFilters] = useState<FilterOptions>({});
  const [sort, setSort] = useState<SortOptions>({ field: "updatedAt", order: "desc" });
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  useEffect(() => {
    console.log("Dispatching getAllActiveCoursesAction with params:", {
      page: currentPage,
      limit: 8,
      search: searchTerm || undefined,
      filters,
      sort,
    });
    dispatch(
      getAllActiveCoursesAction({
        page: currentPage,
        limit: 8,
        search: searchTerm || undefined,
        filters,
        sort,
      })
    );

    return () => {
      dispatch(clearError());
    };
  }, [dispatch, currentPage, searchTerm, filters, sort]);

  console.log("activeCourses state received from Redux:", activeCourses);
  console.log("Raw courses data before mapping:", activeCourses.courses);

  const courses: DisplayCourse[] = activeCourses.courses.map((course: ICourse) => {
    const isFree = course.pricing?.amount === 0;
    const mappedCourse = {
      id: course._id.toString(),
      title: course.title,
      instructor: course.instructorRef?.name || "Unknown Instructor",
      rating: 4.5,
      reviewCount: 1000,
      originalPrice: course.pricing?.amount || 0,
      offerPrice: isFree ? undefined : course.offer?.offerPrice,
      discountPercentage: isFree ? undefined : course.offer?.discountPercentage,
      tags: [
        isFree ? "Free" : "Paid",
        ...(course.studentsEnrolled > 1000 ? ["Bestseller"] : []),
        ...(!isFree && course.offer?.discountPercentage ? [`${course.offer.discountPercentage}% Off`] : []),
      ],
      imageUrl: course.thumbnail || "/api/placeholder/300/200",
    };
    console.log(`Mapped course (${course.title}):`, mappedCourse);
    return mappedCourse;
  });

  console.log("Final mapped courses for rendering:", courses);

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

  const formatPrice = (price: number) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(price);

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Suspense fallback={<div className="flex items-center justify-center h-screen">
                      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#49BBBD]"></div>
      </div>}>
        <Header className="fixed top-0 left-0 right-0 z-50" />
      </Suspense>

      <div className="flex-grow pt-[80px] md:pt-[100px] pb-12">
        <div className="container mx-auto px-4 md:px-8">
          <div className="bg-gradient-to-r from-[#247274] to-[#49BBBD] rounded-xl p-6 md:p-10 mb-8 text-white shadow-lg">
            <h1 className="text-3xl md:text-4xl font-bold mb-2">Discover Your Next Skill</h1>
            <p className="text-lg md:text-xl opacity-90 mb-6">Explore courses from experienced, real-world experts</p>
            <div className="max-w-2xl">
              <SearchBar onSearchChange={handleSearchChange} />
            </div>
          </div>

          <div className="mb-8">
            <div className="flex flex-wrap justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-800">Featured Courses</h2>
              <button 
                onClick={toggleFilters} 
                className="flex items-center gap-2 md:hidden bg-white py-2 px-4 rounded-lg shadow-sm border border-gray-200"
              >
                <Filter size={18} />
                <span>Filters</span>
                <ChevronDown size={16} className={`transform transition-transform ${isFilterOpen ? 'rotate-180' : ''}`} />
              </button>
            </div>
            
            <div className={`md:flex gap-3 ${isFilterOpen ? 'block' : 'hidden md:flex'}`}>
              <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-200 mb-3 md:mb-0 flex-grow md:flex-grow-0">
                <label className="block text-sm font-medium text-gray-600 mb-1">Level</label>
                <select
                  name="level"
                  onChange={handleFilterChange}
                  className="w-full border-gray-200 bg-gray-50 p-2 rounded text-sm focus:ring focus:ring-[#49BBBD]/20 focus:border-[#49BBBD] outline-none"
                >
                  <option value="">All Levels</option>
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>
              
              <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-200 mb-3 md:mb-0 flex-grow md:flex-grow-0">
                <label className="block text-sm font-medium text-gray-600 mb-1">Price</label>
                <select
                  name="pricingType"
                  onChange={handleFilterChange}
                  className="w-full border-gray-200 bg-gray-50 p-2 rounded text-sm focus:ring focus:ring-[#49BBBD]/20 focus:border-[#49BBBD] outline-none"
                >
                  <option value="">All Pricing</option>
                  <option value="free">Free</option>
                  <option value="paid">Paid</option>
                </select>
              </div>
              
              <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-200 mb-3 md:mb-0 flex-grow md:flex-grow-0">
                <label className="block text-sm font-medium text-gray-600 mb-1">Sort By</label>
                <select 
                  onChange={handleSortChange} 
                  className="w-full border-gray-200 bg-gray-50 p-2 rounded text-sm focus:ring focus:ring-[#49BBBD]/20 focus:border-[#49BBBD] outline-none"
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
            <div className="flex items-center justify-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#49BBBD]"></div>
            </div>
          ) : error ? (
            <div className="text-center p-10 bg-red-50 rounded-lg border border-red-100">
              <div className="text-red-500 font-medium text-lg mb-2">Oops! Something went wrong</div>
              <div className="text-gray-600">{error}</div>
            </div>
          ) : courses.length === 0 ? (
            <div className="text-center p-10 bg-gray-50 rounded-lg border border-gray-100">
              <div className="text-gray-500 font-medium text-lg mb-2">No courses found</div>
              <p className="text-gray-500">Try adjusting your search or filter criteria</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {courses.map((course) => (
                  <Link
                    to={`/course-details/${course.id}`}
                    key={course.id}
                    className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-all duration-300 flex flex-col h-full border border-gray-100 group"
                  >
                    <div className="relative">
                      <img
                        src={course.imageUrl}
                        alt={course.title}
                        className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    
                    <div className="p-5 flex-grow flex flex-col">
                      <h2 className="font-bold text-lg mb-2 line-clamp-2 text-gray-800 group-hover:text-[#49BBBD] transition-colors">
                        {course.title}
                      </h2>
                      
                      <p className="text-gray-600 text-sm mb-2">
                        By <span className="font-medium">{course.instructor}</span>
                      </p>
                      
                      <div className="flex items-center mb-3">
                        <span className="text-yellow-500 font-bold mr-1 text-sm">
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
                      
                      <div className="mt-auto">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            {course.originalPrice === 0 ? (
                              <span className="font-bold text-lg text-gray-900">Free</span>
                            ) : course.offerPrice !== undefined ? (
                              <>
                                <span className="font-bold text-lg text-gray-900">
                                  {formatPrice(course.offerPrice)}
                                </span>
                                <span className="text-sm text-gray-500 line-through">
                                  {formatPrice(course.originalPrice)}
                                </span>
                              </>
                            ) : (
                              <span className="font-bold text-lg text-gray-900">
                                {formatPrice(course.originalPrice)}
                              </span>
                            )}
                          </div>
                          
                          <div className="flex space-x-2">
                            {course.tags.map((tag) => (
                              <span
                                key={tag}
                                className={`
                                  px-2 py-1 rounded-full text-xs font-semibold
                                  ${
                                    tag === "Paid"
                                      ? "bg-purple-100 text-purple-700"
                                      : tag === "Free"
                                      ? "bg-[#49BBBD]/10 text-[#49BBBD]"
                                      : tag.includes("% Off")
                                      ? "bg-red-100 text-red-700"
                                      : "bg-green-100 text-green-700"
                                  }
                                `}
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>
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
    </div>
  );
};

export default ExploreAllCourses;
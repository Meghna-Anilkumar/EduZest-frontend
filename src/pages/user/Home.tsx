import React, { lazy, Suspense } from "react";
import bannerImage from "@/assets/ebanner.jpg";
import courseImage from "@/assets/javascript.png";
import instructorImage from "@/assets/instructor.png";
const Header = lazy(() => import("../../components/common/users/Header"));
const Footer = lazy(() => import("../../components/common/users/Footer"));

const Home = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Suspense
        fallback={
          <div className="w-full h-screen flex items-center justify-center">
            Loading...
          </div>
        }
      >
        <Header />
        <main className="flex-1 w-full pt-16">
          <section className="relative w-full h-[50vh] min-h-[400px]">
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{
                backgroundImage: `url(${bannerImage})`,
              }}
            />
            <div className="absolute inset-0 bg-black/50" />
            <div className="relative h-full container mx-auto px-4 flex items-center justify-center">
              <div className="text-center max-w-2xl mx-auto p-6 bg-black/40 backdrop-blur-sm rounded-lg">
                <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4">
                  Never Stop Learning with EduZest
                </h1>
                <p className="text-lg text-white mb-6">
                  Unlock your potential with accredited courses across the
                  globe.
                </p>
                <button className="bg-white text-black px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-all">
                  Explore Courses
                </button>
              </div>
            </div>
          </section>

          {/* New Courses Section */}
          <section className="py-16 bg-gray-50">
            <div className="container mx-auto px-4">
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold mb-4">New Courses</h2>
                <p className="text-gray-600 text-lg">
                  Check out the most popular and trending courses today!
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                {[1, 2, 3, 4].map((course) => (
                  <div
                    key={course}
                    className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
                  >
                    <div className="aspect-video w-full bg-gray-200">
                      <img
                        src={courseImage}
                        alt={`Course ${course}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="p-6">
                      <h3 className="font-semibold text-lg mb-2">
                        Course Title {course}
                      </h3>
                      <p className="text-gray-600 mb-2">
                        Lessons: {6 + course} | Students: {150 + course * 10}
                      </p>
                      <p className="text-gray-600 mb-4">Level: Beginner</p>
                      <button className="text-blue-600 font-semibold hover:underline">
                        Start course →
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Instructors Section */}
          <section className="py-16 bg-white">
            <div className="container mx-auto px-4">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-2xl font-bold mb-2">Best Instructors</h2>
                  <p className="text-gray-600">
                    At The Academy, We Strive To Bring Together The Best
                  </p>
                </div>
                <button className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors">
                  All Instructors
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[
                  { name: "Jon Kantner", role: "Designer" },
                  { name: "Debbie LaChusa", role: "SEO" },
                  { name: "Edwin Diaz", role: "Composer" },
                  { name: "Cassie Evans", role: "Developer" },
                  { name: "Erich Andreas", role: "Programmer" },
                  { name: "Jason Allen", role: "Marketing" },
                ].map((instructor, index) => (
                  <div key={index} className="group cursor-pointer">
                    <div className="relative overflow-hidden rounded-xl aspect-[4/3]">
                      <img
                        src={instructorImage}
                        alt={instructor.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      <div className="absolute bottom-4 left-4 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <h3 className="font-semibold text-lg">
                          {instructor.name}
                        </h3>
                        <p className="text-sm text-gray-200">
                          {instructor.role}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Your Courses Section - Updated */}
          <section className="py-12 bg-gray-50">
            <div className="container mx-auto px-4">
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-2xl font-bold">YOUR COURSES</h2>
                <button className="text-blue-600 font-semibold hover:underline">
                  See All
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[
                  {
                    title: "Google Ads Training 2023 - Profit With Pay",
                    lessons: 6,
                    students: 198,
                    level: "Average",
                    image: "/api/placeholder/400/250?text=Google+Ads",
                  },
                  {
                    title: "ASO & Mobile App Marketing: Monetize Your App",
                    lessons: 8,
                    students: 156,
                    level: "Advanced",
                    image: "/api/placeholder/400/250?text=App+Marketing",
                  },
                  {
                    title: "Python for Beginners - Learn Programming",
                    lessons: 12,
                    students: 145,
                    level: "Beginner",
                    image: "/api/placeholder/400/250?text=Python",
                  },
                ].map((course, index) => (
                  <div
                    key={index}
                    className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                  >
                    <div className="flex gap-6 p-4">
                      <div className="w-40 h-28 flex-shrink-0">
                        <img
                          src={courseImage}
                          alt={course.title}
                          className="w-full h-full object-cover rounded-lg"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-lg mb-2 line-clamp-2">
                          {course.title}
                        </h3>
                        <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                          <span>Lesson: {course.lessons}</span>
                          <span>•</span>
                          <span>Student: {course.students}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">
                            {course.level}
                          </span>
                          <button className="px-4 py-1 bg-black text-white text-sm rounded-full hover:bg-gray-800 transition-colors">
                            Let's Go →
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="py-16 bg-gray-100">
            <div className="container mx-auto px-4">
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-2xl font-bold">TOP COURSES</h2>
                <button className="text-blue-600 font-semibold hover:underline">
                  View All
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                  {
                    title: "UX/UI Design Essential Training",
                    lessons: 8,
                    students: 156,
                    level: "Beginner",
                    image: "/api/placeholder/400/250?text=UI+Design",
                  },
                  {
                    title: "Python For Beginners: Learn Programming",
                    lessons: 12,
                    students: 189,
                    level: "Beginner",
                    image: "/api/placeholder/400/250?text=Python",
                  },
                  {
                    title: "Acoustic Guitar And Electric Guitar Started",
                    lessons: 15,
                    students: 172,
                    level: "Advanced",
                    image: "/api/placeholder/400/250?text=Guitar",
                  },
                  {
                    title: "Mobile App Development With Flutter & Dart",
                    lessons: 10,
                    students: 145,
                    level: "Average",
                    image: "/api/placeholder/400/250?text=Mobile+Dev",
                  },
                ].map((course, index) => (
                  <div
                    key={index}
                    className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all"
                  >
                    <div className="aspect-video relative">
                      <img
                        src={courseImage}
                        alt={course.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold text-lg mb-3 line-clamp-2">
                        {course.title}
                      </h3>
                      <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                        <span>Lessons: {course.lessons}</span>
                        <span>•</span>
                        <span>Student: {course.students}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">
                          {course.level}
                        </span>
                        <button className="px-4 py-1 bg-black text-white text-sm rounded-full hover:bg-gray-800 transition-colors">
                          Start Course →
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </main>
        <Footer />
      </Suspense>
    </div>
  );
};

export default Home;

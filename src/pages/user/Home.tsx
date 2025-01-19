import React, { lazy, Suspense } from "react";

const Header = lazy(() => import("../../components/common/users/Header"));
const Footer = lazy(() => import("../../components/common/users/Footer"));

const Home: React.FC = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Header />
      <main className="min-h-screen">
        <div className="container mx-auto px-4 lg:px-8">
          {/* Showcase */}
          <header
            className="w-full h-[50vh] md:h-96 bg-cover bg-center flex flex-col items-center text-center justify-end p-8 md:p-16 mb-8"
            style={{
              backgroundImage: "url('https://i.ibb.co/zGSDGCL/slide1.png')",
            }}
          >
            <div className="bg-black/40 p-6 rounded-lg backdrop-blur-sm">
              <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">
                Surface Deals
              </h2>
              <p className="text-white mb-4 text-sm md:text-base">
                Select Surfaces are on sale now - save while supplies last
              </p>
              <a
                href="#"
                className="inline-flex items-center bg-white text-black px-6 py-2 font-bold hover:bg-opacity-90 transition-all"
              >
                Shop Now <i className="fas fa-chevron-right ml-2"></i>
              </a>
            </div>
          </header>

          {/* Home Cards 1 */}
          <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8 mb-12">
            {[
              {
                img: "https://i.ibb.co/LZPVKq9/card1.png",
                title: "New Surface Pro 7",
                desc: "See how Katie Sowers, Asst. Coach for the 49ers, uses Surface Pro 7 to put her plans into play.",
              },
              {
                img: "https://i.ibb.co/KjGFHVJ/card2.png",
                title: "New Surface Laptop 3",
                desc: "Express yourself powerfully with a thin, light, and elegant design, faster performance, and up to 11.5 hours battery life.",
              },
              {
                img: "https://i.ibb.co/2cnshH6/card3.png",
                title: "Save $150 + free controller",
                desc: "Buy an Xbox One X console and double your fun with a free select extra controller. Starting at $349.",
              },
              {
                img: "https://i.ibb.co/G57P0Pb/card4.png",
                title: "The new Microsoft Edge",
                desc: "Expect more. World class performance, with more privacy, more productivity, and more value.",
              },
            ].map((card, index) => (
              <div key={index} className="flex flex-col">
                <img
                  src={card.img}
                  alt={card.title}
                  className="w-full h-auto mb-4"
                />
                <h3 className="text-xl font-semibold mb-2">{card.title}</h3>
                <p className="mb-4 flex-grow">{card.desc}</p>
                <a
                  href="#"
                  className="text-blue-600 font-semibold hover:underline inline-flex items-center"
                >
                  Learn More <i className="fas fa-chevron-right ml-2"></i>
                </a>
              </div>
            ))}
          </section>

          {/* Xbox Section */}
          <section
            className="w-full h-[60vh] md:h-96 bg-cover bg-center mb-12 relative"
            style={{
              backgroundImage: "url('https://i.ibb.co/tBJGPD9/xbox.png')",
            }}
          >
            <div className="absolute inset-0 bg-black/20"></div>
            <div className="relative w-full md:w-1/2 p-8 md:p-12 text-white">
              <h2 className="text-2xl md:text-3xl font-bold mb-4">
                Xbox Game Pass Ultimate
              </h2>
              <p className="mb-6 text-sm md:text-base">
                Xbox Game Pass Ultimate Xbox Live Gold and over 100 high-quality
                console and PC games. Play together with friends and discover
                your next favorite game.
              </p>
              <a
                href="#"
                className="inline-flex items-center bg-white text-black px-6 py-2 font-bold hover:bg-opacity-90 transition-all"
              >
                Join Now <i className="fas fa-chevron-right ml-2"></i>
              </a>
            </div>
          </section>

          {/* Home Cards 2 */}
          <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8 mb-12">
            {[
              {
                img: "https://i.ibb.co/zVqhWn2/card5.png",
                title: "Microsoft Teams",
                desc: "Unleash the power of your team.",
                cta: "Shop Now",
              },
              {
                img: "https://i.ibb.co/mGZcxcn/card6.jpg",
                title: "Unlock the power of learning",
                desc: "Get students future-ready with Windows 10 devices. Starting at $219.",
                cta: "Shop Now",
              },
              {
                img: "https://i.ibb.co/NpPvVHj/card7.png",
                title: "Windows 10 Enterprise",
                desc: "Download the free 90-day evaluation for IT professionals.",
                cta: "Download Now",
              },
              {
                img: "https://i.ibb.co/LkP4L5T/card8.png",
                title: "Explore Kubernetes",
                desc: "Learn how Kubernetes works and get started with cloud native app development today.",
                cta: "Get Started",
              },
            ].map((card, index) => (
              <div key={index} className="flex flex-col">
                <img
                  src={card.img}
                  alt={card.title}
                  className="w-full h-auto mb-4"
                />
                <h3 className="text-xl font-semibold mb-2">{card.title}</h3>
                <p className="mb-4 flex-grow">{card.desc}</p>
                <a
                  href="#"
                  className="text-blue-600 font-semibold hover:underline inline-flex items-center"
                >
                  {card.cta} <i className="fas fa-chevron-right ml-2"></i>
                </a>
              </div>
            ))}
          </section>

          {/* Carbon Section */}
          <section
            className="w-full h-[60vh] md:h-96 bg-cover bg-center text-white flex items-center justify-start p-8 md:p-12 mb-12 relative"
            style={{
              backgroundImage: "url('https://i.ibb.co/72cgtsz/carbon.jpg')",
            }}
          >
            <div className="absolute inset-0 bg-black/30"></div>
            <div className="relative w-full md:w-2/3 lg:w-1/2">
              <h2 className="text-2xl md:text-3xl font-bold mb-4">
                Committing To Carbon Negative
              </h2>
              <p className="mb-6 text-sm md:text-base">
                Microsoft will be carbon negative by 2030 and by 2050 we will
                remove all carbon the company has emitted since it was founded
                in 1975.
              </p>
              <a
                href="#"
                className="inline-flex items-center bg-white text-black px-6 py-2 font-bold hover:bg-opacity-90 transition-all"
              >
                Learn More <i className="fas fa-chevron-right ml-2"></i>
              </a>
            </div>
          </section>

          {/* Follow Section */}
          <section className="flex flex-col sm:flex-row items-center justify-start space-y-4 sm:space-y-0 sm:space-x-4 mb-12 px-4">
            <p className="font-semibold">Follow Microsoft</p>
            <div className="flex space-x-4">
              {[
                {
                  href: "https://facebook.com",
                  img: "https://i.ibb.co/LrVMXNR/social-fb.png",
                  alt: "Facebook",
                },
                {
                  href: "https://twitter.com",
                  img: "https://i.ibb.co/vJvbLwm/social-twitter.png",
                  alt: "Twitter",
                },
                {
                  href: "https://linkedin.com",
                  img: "https://i.ibb.co/b30HMhR/social-linkedin.png",
                  alt: "LinkedIn",
                },
              ].map((social, index) => (
                <a
                  key={index}
                  href={social.href}
                  className="hover:opacity-80 transition-opacity"
                >
                  <img src={social.img} alt={social.alt} className="w-6 h-6" />
                </a>
              ))}
            </div>
          </section>

          {/* Links Section */}
          <section className="bg-gray-200 text-gray-600 text-sm py-12 px-6 md:px-8 mb-8 rounded-lg">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8">
              {[
                {
                  title: "What's New",
                  links: [
                    "Surface Pro X",
                    "Surface Laptop 3",
                    "Surface Pro 7",
                    "Windows 10 apps",
                    "Office apps",
                  ],
                },
                {
                  title: "Microsoft Store",
                  links: [
                    "Account Profile",
                    "Download Center",
                    "Microsoft Store support",
                    "Returns",
                    "Order tracking",
                  ],
                },
                {
                  title: "Education",
                  links: [
                    "Microsoft in education",
                    "Office for students",
                    "Office 365 for schools",
                    "Deals for students & parents",
                    "Microsoft Azure in education",
                  ],
                },
                {
                  title: "Business",
                  links: [
                    "Microsoft Cloud",
                    "Microsoft Dynamics 365",
                    "Microsoft 365 for business",
                    "Microsoft Azure",
                    "AppSource",
                  ],
                },
                {
                  title: "About Microsoft",
                  links: [
                    "Company news",
                    "Privacy at Microsoft",
                    "Investors",
                    "Diversity and inclusion",
                    "Accessibility",
                  ],
                },
                {
                  title: "More",
                  links: [
                    "Microsoft Store Support",
                    "Returns",
                    "Order tracking",
                    "Help",
                    "Privacy & Cookies",
                  ],
                },
              ].map((section, index) => (
                <div key={index}>
                  <h4 className="font-semibold mb-4">{section.title}</h4>
                  <ul className="space-y-3">
                    {section.links.map((link, linkIndex) => (
                      <li key={linkIndex}>
                        <a href="#" className="hover:underline text-gray-600">
                          {link}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </section>
        </div>
        <Footer />
      </main>
    </Suspense>
  );
};

export default Home;

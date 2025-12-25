import Navbar from "@/components/Navbar";
import { SchoolCardSkeleton } from "@/components/SchoolCardSkeleton";
import Footer from "@/components/Footer";

export default function DirectoryLoading() {
  return (
    <>
      <section
        className="w-full h-fit bg-cover bg-center flex flex-col items-center pb-40 px-5 relative"
        style={{ backgroundImage: "url('/images/Hero.jpg')" }}
      >
        <div className="w-full h-full absolute top-0 left-0 bg-black/20 z-0"></div>
        <div className="w-full flex items-center justify-center md:px-10 pt-5 md:pt-0 relative z-[1000]">
          <Navbar />
        </div>
        <div className="pt-13 flex flex-col items-center md:w-[930px] w-full px-0 md:px-0 mt-20 relative">
          <div className="bg-white w-full p-5 rounded-3xl mt-6 relative">
            <div className="w-full p-4 md:rounded-[10px] rounded-full overflow-hidden flex items-center gap-5 relative">
              <div className="w-full h-12 bg-gray-200 rounded-lg animate-pulse"></div>
            </div>
          </div>
        </div>
      </section>

      <section className="w-full md:px-10 px-5 pb-25 pt-10 bg-white">
        <div className="w-full grid md:grid-cols-3 grid-cols-1 gap-5">
          {Array.from({ length: 6 }).map((_, index) => (
            <SchoolCardSkeleton key={index} />
          ))}
        </div>
      </section>

      <Footer />
    </>
  );
}

import Image from "next/image";
import Link from "next/link";
import React from "react";

const Footer = () => {
  return (
    <section className="w-full flex flex-col px-10 py-16 bg-[#774BE5]">
      <div className="w-full flex md:flex-col flex-col-reverse gap-10">
        <div className="flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <Link href="/">
              <Image
                src="/images/logo-white.png"
                alt="logo"
                width={100}
                height={100}
              />
            </Link>
            <div className="flex items-center gap-2">
              <Link
                href="https://www.instagram.com/hello.aralya/?fbclid=IwY2xjawNi6ZNleHRuA2FlbQIxMQBicmlkETFtQzZWdlZ5NXpPMDNpYkJMAR6K2jgVdxDYAKxtyPbjdimUQRAcxd9TjB-QOkfa50PY4S48iIxo6ew11J6hVg_aem_GJNOU2znrChkHLGCQPzJYg"
                target="_blank"
              >
                <i className="ri-instagram-line text-white text-2xl"></i>
              </Link>

              <Link
                href="https://web.facebook.com/people/Aralya/61578164295126"
                target="_blank"
              >
                <i className="ri-facebook-line text-white text-2xl"></i>
              </Link>
            </div>
          </div>

          <div className="max-w-4xl text-[#fefefe] text-sm leading-relaxed opacity-80 space-y-2">
            <p>
              <strong>Aralya</strong> is an independent information platform designed to help parents
              explore and compare preschools. School names, logos, and trademarks
              shown on this website belong to their respective owners and are used
              for identification and informational purposes only. Aralya is not
              affiliated with, endorsed by, or officially connected to any school
              listed unless explicitly stated.
            </p>
            <p>
              Information on Aralya is gathered from publicly available sources and
              direct communication and may change over time. While we aim to keep
              details accurate and up to date, parents are encouraged to confirm all
              information directly with the school. Aralya does not accept
              applications, process enrollments, or act as an agent or
              representative of any school.
            </p>
            <p>
              Content on this site is provided for general information only and
              should not be considered professional or educational advice. If you
              represent a school and would like information updated or removed,
              please contact us.
            </p>
          </div>
        </div>

        <div className="flex flex-col">
          <ul className="flex md:flex-row flex-col gap-8">
            <li className="text-[#cfcfcf] font-medium hover:text-[#FFFFFF] transition-colors duration-500 ease-in-out delay-100">
              <Link href="/contact">Contact</Link>
            </li>
            <li className="text-[#cfcfcf] font-medium hover:text-[#FFFFFF] transition-colors duration-500 ease-in-out delay-100">
              <Link href="/q-and-a">Q&A</Link>
            </li>
            <li className="text-[#cfcfcf] font-medium hover:text-[#FFFFFF] transition-colors duration-500 ease-in-out delay-100">
              <Link href="/privacy-policy">Privacy</Link>
            </li>
            <li className="text-[#cfcfcf] font-medium hover:text-[#FFFFFF] transition-colors duration-500 ease-in-out delay-100">
              <Link href="/terms-of-services">Terms</Link>
            </li>
          </ul>
        </div>
      </div>



      <div className="w-full border-t border-white mt-8"></div>

      <div className="flex items-center justify-between mt-8">
        <p className="text-white font-normal text-sm">
          © {new Date().getFullYear()} Aralya.
        </p>
        <p className="text-white font-normal text-sm">
          {" "}
          hello.aralya@gmail.com
        </p>
      </div>
    </section>
  );
};

export default Footer;

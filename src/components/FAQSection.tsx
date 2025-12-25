"use client";
import { useState } from "react";

interface FAQItem {
  question: string;
  answer: string;
}

interface FAQSectionProps {
  title: string;
  description: string;
  faqs: FAQItem[];
}

const FAQSection = ({ title, description, faqs }: FAQSectionProps) => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="w-full md:px-10 px-5 py-25 bg-white">
      <h2 className="text-[#0E1C29] md:text-[56px] text-4xl font-normal text-center">
        {title}
      </h2>
      <p className="mt-4 text-[#0E1C29] text-base text-center font-semibold">
        {description}
      </p>
      <div className="w-full grid grid-cols-1 gap-5 mt-11">
        {faqs.map((faq, index) => {
          const isOpen = openIndex === index;
          return (
            <div
              key={index}
              className={`w-full rounded-[10px] py-3 px-4 cursor-pointer ${
                isOpen ? "bg-[#0F0F0F]" : "bg-[#F0EFEF]"
              }`}
              onClick={() => toggleFAQ(index)}
            >
              <div className="mb-2 w-full flex items-center justify-between">
                <p
                  className={`text-base font-semibold ${
                    isOpen ? "text-white" : "text-[#0E1C29]"
                  }`}
                >
                  {faq.question}
                </p>
                <i
                  className={`text-xl mt-0.25 ${
                    isOpen ? "text-white rotate-180" : "text-[#0E1C29] rotate-0"
                  } ri-arrow-down-s-line`}
                ></i>
              </div>
              <div
                className={`overflow-hidden  ${
                  isOpen ? "max-h-96 mt-2" : "max-h-0 mt-0"
                }`}
              >
                <p className="text-sm font-normal text-white">{faq.answer}</p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default FAQSection;

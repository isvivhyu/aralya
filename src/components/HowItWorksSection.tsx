import React from "react";

interface StepItem {
  iconClass: string;
  text: string | React.ReactNode;
}

interface HowItWorksSectionProps {
  title: string;
  description?: string;
  steps: StepItem[];
}

const HowItWorksSection = ({
  title,
  description,
  steps,
}: HowItWorksSectionProps) => {
  return (
    <section className="w-full md:px-10 px-5 py-25 bg-[#EFE8FF]">
      <h2 className="text-[#0E1C29] md:text-[56px] text-4xl font-normal text-center">
        {title}
      </h2>
      {description && (
        <p className="mt-4 text-[#0E1C29] text-base text-center font-semibold">
          {description}
        </p>
      )}
      <div className="w-full flex md:flex-row flex-col  gap-2.5 mt-8">
        {steps.map((step, index) => (
          <div
            key={index}
            className="w-full p-4 h-48 flex flex-col items-center"
          >
            <div className="flex items-center justify-center mb-2.5 mt-5.5">
              <i className={`${step.iconClass} text-black text-4xl`}></i>
            </div>
            <p className="text-base text-center text-[#0D0D0D] font-normal px-2">
              {step.text}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default HowItWorksSection;

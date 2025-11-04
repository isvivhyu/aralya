interface StepItem {
  iconSrc: string;
  iconAlt: string;
  stepNumber: number;
  title: string;
  description: string;
}

interface HowItWorksSectionProps {
  title: string;
  description: string;
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
      <p className="mt-4 text-[#0E1C29] text-base text-center font-semibold">
        {description}
      </p>
      <div className="w-full flex md:flex-row flex-col  gap-2.5 mt-8">
        {steps.map((step, index) => (
          <div
            key={index}
            className="bg-white w-full p-4 rounded-[20px] h-48 flex flex-col items-center"
          >
            {/* <Image
              src={step.iconSrc}
              width={48}
              height={48}
              alt={step.iconAlt}
            /> */}
            <div className="bg-[#EFE8FF] w-10 h-10 rounded-full flex items-center justify-center mb-2.5 mt-5.5">
              <h6 className="font-semibold text-xl text-[#774BE5]">
                {step.stepNumber}
              </h6>
            </div>
            <p className="text-xl text-center text-[#0D0D0D] font-semibold">
              {step.title}
            </p>
            <p className="text-base text-center text-[#0D0D0D] font-normal mt-2.5">
              {step.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default HowItWorksSection;

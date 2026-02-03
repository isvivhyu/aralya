"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";

const DisclaimerPopup = () => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        // Check if user has already dismissed the disclaimer in this session
        const hasSeenDisclaimer = sessionStorage.getItem("hasSeenDisclaimer");

        if (!hasSeenDisclaimer) {
            const timer = setTimeout(() => {
                setIsVisible(true);
            }, 5000); // 5 seconds delay

            return () => clearTimeout(timer);
        }
    }, []);

    const handleClose = () => {
        setIsVisible(false);
        sessionStorage.setItem("hasSeenDisclaimer", "true");
    };

    if (!isVisible) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/60 backdrop-blur-sm transition-opacity duration-300">
            <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translate3d(0, 40px, 0);
          }
          to {
            opacity: 1;
            transform: translate3d(0, 0, 0);
          }
        }
        .animate-fade-in-up {
          animation: fadeInUp 0.5s ease-out forwards;
        }
      `}</style>
            <div
                className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto relative animate-fade-in-up"
                role="dialog"
                aria-labelledby="disclaimer-title"
            >
                <div className="p-6 md:p-8">
                    <div className="flex justify-between items-center mb-6">
                        <div className="flex items-center gap-2">
                            <i className="ri-information-fill text-[#774BE5] text-2xl"></i>
                            <h2 id="disclaimer-title" className="text-2xl font-bold text-gray-800">
                                Important Disclaimer
                            </h2>
                        </div>
                        <button
                            onClick={handleClose}
                            className="text-gray-400 hover:text-gray-600 transition-colors"
                        >
                            <i className="ri-close-line text-2xl"></i>
                        </button>
                    </div>

                    <div className="space-y-4 text-gray-600 leading-relaxed text-sm md:text-base">
                        <p>
                            <strong className="text-gray-800">Aralya</strong> is an independent information platform designed to help parents
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

                    <div className="mt-8 flex justify-end">
                        <button
                            onClick={handleClose}
                            className="px-6 py-2.5 bg-[#774BE5] text-white font-medium rounded-lg hover:bg-[#6a42cc] transition-colors shadow-lg shadow-purple-200"
                        >
                            I Understand
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DisclaimerPopup;

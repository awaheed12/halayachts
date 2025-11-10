'use client';

import React from 'react';
import { FaRegEnvelope } from 'react-icons/fa';
import { LuPhone } from "react-icons/lu";
import Link from 'next/link';

const Banner = ({
    smallHeading = "",
    mainHeading = "",
    description = "",
    showButton = false,
    buttonText = "Book Now",
    buttonLink = "/booking",
    showContact = false,
    email = "info@halayachts.com",
    phone = "+1 (555) 123-4567",
    backgroundImage = "/images/banner-bg.jpg", 
    height = "screen",
    contentPosition = "center",
    textAlign = "center",
    customClass = "",
    overlayColor = "black",
    overlayOpacity = 0,  
}) => {

    const heightOptions = {
        screen: "min-h-screen",
        large: "min-h-[80vh] md:min-h-[90vh]",
        medium: "min-h-[60vh] md:min-h-[70vh]",
        small: "min-h-[40vh] md:min-h-[50vh]",
        auto: "min-h-[300px] md:min-h-[400px]"
    };

    const positionClasses = {
        center: "items-center justify-center",
        top: "items-start justify-center pt-20 md:pt-32",
        bottom: "items-end justify-center pb-20 md:pb-32"
    };

    const textAlignClasses = {
        center: "text-center",
        left: "text-left items-start",
        right: "text-right items-end"
    };

    // Calculate opacity class based on overlayOpacity prop
    const getOpacityClass = () => {
        if (overlayOpacity === 0) return "opacity-0"; // No overlay
        if (overlayOpacity === 0.1) return "opacity-10";
        if (overlayOpacity === 0.2) return "opacity-20";
        if (overlayOpacity === 0.3) return "opacity-30";
        if (overlayOpacity === 0.4) return "opacity-40";
        if (overlayOpacity === 0.5) return "opacity-50";
        if (overlayOpacity === 0.6) return "opacity-60";
        if (overlayOpacity === 0.7) return "opacity-70";
        if (overlayOpacity === 0.8) return "opacity-80";
        if (overlayOpacity === 0.9) return "opacity-90";
        return "opacity-0"; // default ab 0
    };

    return (
        <section
            className={`
                relative 
                ${heightOptions[height]} 
                flex 
                ${positionClasses[contentPosition]}
                bg-cover bg-center bg-no-repeat
                ${customClass}
            `}
            style={{
                backgroundImage: `url('${backgroundImage}')`
            }}
        >
            {/* Overlay - Only shows if overlayOpacity > 0 */}
            {overlayOpacity > 0 && (
                <div 
                    className={`absolute inset-0 bg-${overlayColor} ${getOpacityClass()}`}
                />
            )}
            
            <div className={`
                relative z-10 
                text-white max-w-7xl mx-auto 
                flex flex-col gap-5 px-5 py-5
                ${textAlignClasses[textAlign]}
            `}>
                {smallHeading && (
                    <h3 className="text-base md:text-xl lg:text-2xl font-light tracking-wider">
                        {smallHeading}
                    </h3>
                )}

                {mainHeading && (
                    <h1 className="text-3xl md:text-6xl lg:text-6xl xl:text-[65px] font-light">
                        {mainHeading}
                    </h1>
                )}

                {description && (
                    <p className="text-base md:text-lg lg:text-xl sm:max-w-5xl mx-auto leading-relaxed tracking-wider font-light">
                        {description}
                    </p>
                )}

                {showButton && (
                    <Link href={buttonLink}>
                        <button className="bg-text-primary text-base p-3 w-2xs md:text-base font-medium rounded cursor-pointer hover:bg-opacity-90 transition duration-300">
                            {buttonText}
                        </button>
                    </Link>
                )}

                {showContact && (
                    <div className="flex flex-col md:flex-row items-center justify-center gap-6 md:gap-12 text-sm md:text-base">
                        <Link href={`mailto:${email}`}>
                            <div className="flex items-center gap-3 cursor-pointer hover:text-gray-300 transition duration-300">
                                <FaRegEnvelope className="w-5 h-5" />
                                <span className='text-base font-medium tracking-wide'>{email}</span>
                            </div>
                        </Link>
                        <Link href={`tel:${phone}`}>
                            <div className="flex items-center gap-3 cursor-pointer hover:text-gray-300 transition duration-300">
                                <LuPhone className="w-5 h-5" />
                                <span className='text-base font-medium tracking-wide'>{phone}</span>
                            </div>
                        </Link>
                    </div>
                )}
            </div>
        </section>
    );
};

export default Banner;
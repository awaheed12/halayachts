import React from 'react'
import Link from 'next/link';
import { FaFacebookF, FaInstagram, FaLinkedinIn, FaYoutube } from 'react-icons/fa';
import { AnimatedLi, AnimatedSocialIcon } from './AnimatedFooterItem';
import Newsletter from './Newsletter';

const Footer = () => {
  // Constants for footer data
  const COMPANY_INFO = {
    name: "Hala Yachts",
    description: "HalaYachts delivers bespoke, luxury yacht charters across the globe. Every voyage is uniquely crafted for those who seek extraordinary experiences, not just travel.",
    email: "charter@halayachts.com",
    phone: "+1 (555) 987-6543",
    address: "123 Oceanview Drive Miami, FL 33139, USA",
    copyright: "© 2025 HalaYachts. All rights reserved."
  };

  const QUICK_LINKS = [
    { name: "Home", href: "/" },
    { name: "Charter", href: "/charter" },
    { name: "Location", href: "/location" },
    { name: "About Us", href: "/about" },
    { name: "Hala Jets", href: "https://halajets.com/" }
  ];

  const CHARTER_YACHTS = [
    { name: "21' Cipelli", href: "/" },
    { name: "65' Viking", href: "/" },
    { name: "60' Pirlant", href: "/" },
    { name: "Other", href: "/" }
  ];

  const LEGAL_LINKS = [
    { name: "Privacy Policy", href: "/" },
    { name: "Terms of Service", href: "/" },
    { name: "Cookie Settings", href: "/" }
  ];

  const SOCIAL_LINKS = [
    { icon: <FaFacebookF size={20} />, href: "#" },
    { icon: <FaInstagram size={20} />, href: "#" },
    { icon: <FaLinkedinIn size={20} />, href: "#" },
    { icon: <FaYoutube size={20} />, href: "#" }
  ];

  const renderLinkList = (items) => (
    <ul className="space-y-3.5 font-light">
      {items.map((item, index) => (
        <AnimatedLi key={index}>
          <Link
            href={item.href}
            className="text-white hover:text-[#c8a75c] tracking-wider transition duration-300 block"
          >
            {item.name}
          </Link>
        </AnimatedLi>
      ))}
    </ul>
  );

  const renderSocialIcons = () => (
    <div className="flex gap-4">
      {SOCIAL_LINKS.map((social, index) => (
        <AnimatedSocialIcon key={index} href={social.href}>
          {social.icon}
        </AnimatedSocialIcon>
      ))}
    </div>
  );

  return (
    <>
      <Newsletter />
      <footer className='xl:pt-64 xl:pb-24 py-8 bg-black text-white'>
        <div className='max-w-7xl mx-auto px-5'>
          <div className='flex lg:items-center items-start lg:flex-row flex-col md:gap-0 gap-5'>
            <Link href="/" className='flex-1'>
              <img
                src="/images/logo.png"
                alt={COMPANY_INFO.name}
                className="h-[60px] w-[100px] sm:h-auto sm:w-40"
              />
            </Link>
            <div className="flex-1 flex justify-end lg:text-right">
              <p className='text-base md:text-lg lg:text-lg sm:max-w-5xl tracking-wider leading-relaxed font-light lg:max-w-[480px]'>
                {COMPANY_INFO.description}
              </p>
            </div>
          </div>

          <div className="border-t border-gray-300 my-6"></div>
          <div className='flex lg:flex-row flex-col items-end justify-items-normal md:gap-0 gap-5'>
            <div className='flex md:flex-row flex-col items-start md:gap-20 gap-5 lg:w-3/4 w-full'>
              <div className='flex flex-col gap-4'>
                <h3 className="text-lg font-semibold tracking-wider">Quick Links</h3>
                {renderLinkList(QUICK_LINKS)}
              </div>
              <div className='flex flex-col gap-4'>
                <h3 className="text-lg font-semibold tracking-wider">Charter</h3>
                {renderLinkList(CHARTER_YACHTS)}
              </div>
              <div className='flex flex-col gap-4'>
                <h3 className="text-lg font-semibold tracking-wider">Contact</h3>
                <ul className="space-y-3.5 font-light">
                  <AnimatedLi>
                    <a href={`mailto:${COMPANY_INFO.email}`} className="text-white hover:text-[#c8a75c] tracking-wider transition duration-300 block">
                      {COMPANY_INFO.email}
                    </a>
                  </AnimatedLi>
                  <AnimatedLi>
                    <a href={`tel:${COMPANY_INFO.phone}`} className="text-white hover:text-[#c8a75c]tracking-wider transition duration-300 block">
                      {COMPANY_INFO.phone}
                    </a>
                  </AnimatedLi>
                  <AnimatedLi>
                    <span className="text-white hover:text-[#c8a75c] tracking-wider block">
                      {COMPANY_INFO.address}
                    </span>
                  </AnimatedLi>
                </ul>
              </div>
            </div>
            <div className='flex lg:w-3/12 w-full md:justify-end'>
              {renderSocialIcons()}
            </div>
          </div>
        </div>
      </footer>
      <div className='bg-text-primary py-3'>
        <div className='max-w-7xl mx-auto px-5 flex lg:flex-row flex-col items-center gap-2.5'>
          <div className='flex-1 text-base tracking-wider text-white font-semibold'>
            {COMPANY_INFO.copyright}
          </div>
          <div className='flex-1'>
            <ul className="flex md:gap-7 gap-2 items-center md:justify-end sm:text-base text-xs font-semibold">
              {LEGAL_LINKS.map((link, index) => (
                <AnimatedLi key={index}>
                  <Link
                    href={link.href}
                    className="text-white hover:text-white md:text-right text-center tracking-wider transition duration-300 block"
                  >
                    {link.name}
                  </Link>
                </AnimatedLi>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </>
  )
}

export default Footer;
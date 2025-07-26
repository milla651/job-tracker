import React, { useState } from "react";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  return (
    <nav className="bg-gray-800 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo and mobile menu button */}
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center">
              <span className="text-xl font-bold tracking-tight">
                BrandLogo
              </span>
            </div>
          </div>

          {/* Desktop navigation */}
          <div className="hidden md:flex items-center space-x-4">
            <NavItem href="#" text="Dashboard" />
            <LogoutButton />
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={toggleMenu}
              className="inline-flex items-center justify-center p-2 rounded-md hover:bg-gray-700 focus:outline-none"
              aria-expanded="false">
              <span className="sr-only">Open main menu</span>
              {isMenuOpen ? <CloseIcon /> : <MenuIcon />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-gray-800">
            <MobileNavItem href="#" text="Dashboard" />
            <div className="pt-2 border-t border-gray-700">
              <LogoutButton mobile />
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

// Reusable navigation item component
const NavItem = ({ href, text }) => (
  <a
    href={href}
    className="px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-700 transition-colors duration-200">
    {text}
  </a>
);

// Mobile-specific navigation item
const MobileNavItem = ({ href, text }) => (
  <a
    href={href}
    className="block px-3 py-2 rounded-md text-base font-medium hover:bg-gray-700">
    {text}
  </a>
);

// Logout button with responsive styling
const LogoutButton = ({ mobile }) => (
  <button
    className={`${
      mobile
        ? "w-full text-left block px-3 py-2 rounded-md text-base font-medium hover:bg-gray-700"
        : "px-3 py-2 rounded-md text-sm font-medium hover:bg-red-600 transition-colors duration-200 bg-red-500"
    }`}>
    Logout
  </button>
);

// Menu icon components
const MenuIcon = () => (
  <svg
    className="h-6 w-6"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M4 6h16M4 12h16M4 18h16"
    />
  </svg>
);

const CloseIcon = () => (
  <svg
    className="h-6 w-6"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M6 18L18 6M6 6l12 12"
    />
  </svg>
);

export default Navbar;

"use client";
import { useEffect, useState } from "react";
import { ArrowUp } from "lucide-react";

const ScrollToTop = () => {
  const [isVisible, setIsVisible] = useState(false);

   useEffect(() => {
    if (typeof window === "undefined") {
      console.log("Window object not available - running on server");
      return;
    }

    const toggleVisibility = () => {
     
      if (window.pageYOffset > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

  
    const handleScroll = () => {
      requestAnimationFrame(toggleVisibility);
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      console.log("ScrollToTop component unmounted");
    };
  }, []);

  const scrollToTop = () => {
    if (typeof window === "undefined") {
      console.log("Scroll attempted on server side");
      return;
    }

    console.log("Attempting to scroll to top");

    try {
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
      console.log("Scroll initiated successfully");
    } catch (error) {
      console.error("Scroll failed:", error);

      
      window.scrollTo(0, 0);
    }
  };

  
  if (typeof window === "undefined") return null;

  return (
    <button
      className={`fixed bottom-10 right-10 bg-gray-800 text-white p-3 rounded-full shadow-lg transition-opacity duration-300 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-400 ${
        isVisible ? "opacity-100" : "opacity-0 pointer-events-none"
      }`}
      onClick={scrollToTop}
      aria-label="Scroll to top"
    >
      <ArrowUp className="w-6 h-6" />
    </button>
  );
};

export default ScrollToTop;

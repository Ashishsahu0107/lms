import { useState, useEffect } from 'react';

export const useResponsive = () => {
  const [screenSize, setScreenSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 0,
    height: typeof window !== 'undefined' ? window.innerHeight : 0
  });

  const [breakpoint, setBreakpoint] = useState({
    isMobile: false,
    isTablet: false,
    isDesktop: false,
    isLargeDesktop: false
  });

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      
      setScreenSize({ width, height });
      
      setBreakpoint({
        isMobile: width < 768,
        isTablet: width >= 768 && width < 1024,
        isDesktop: width >= 1024 && width < 1280,
        isLargeDesktop: width >= 1280
      });
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return {
    ...screenSize,
    ...breakpoint,
    isSmallScreen: screenSize.width < 640,
    isMediumScreen: screenSize.width >= 640 && screenSize.width < 1024,
    isLargeScreen: screenSize.width >= 1024
  };
};

// Responsive grid utility
export const useResponsiveGrid = (items, { 
  mobile = 1, 
  tablet = 2, 
  desktop = 3, 
  large = 4 
} = {}) => {
  const { isMobile, isTablet, isDesktop, isLargeDesktop } = useResponsive();
  
  const columns = isMobile ? mobile : isTablet ? tablet : isDesktop ? desktop : large;
  
  const rows = Math.ceil(items.length / columns);
  
  return {
    columns,
    rows,
    gridClass: `grid grid-cols-${mobile} md:grid-cols-${tablet} lg:grid-cols-${desktop} xl:grid-cols-${large}`
  };
};

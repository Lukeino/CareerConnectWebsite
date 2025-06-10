import { useEffect } from 'react';

// Custom hook to disable mouse wheel on number inputs
export const useDisableNumberInputWheel = () => {
  useEffect(() => {
    const handleWheel = (e) => {
      // Check if the target is a number input and is focused
      if (e.target.type === 'number' && document.activeElement === e.target) {
        e.preventDefault();
      }
    };

    // Add event listener to the document
    document.addEventListener('wheel', handleWheel, { passive: false });

    // Cleanup
    return () => {
      document.removeEventListener('wheel', handleWheel);
    };
  }, []);
};

export default useDisableNumberInputWheel;

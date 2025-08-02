import React, { useEffect } from 'react';

interface DebugSidebarProps {
  componentName: string;
  children: React.ReactNode;
}

const DebugSidebar: React.FC<DebugSidebarProps> = ({ componentName, children }) => {
  useEffect(() => {
    console.log(`🔍 DebugSidebar: ${componentName} component mounted`);
    return () => {
      console.log(`🔍 DebugSidebar: ${componentName} component unmounted`);
    };
  }, [componentName]);

  return (
    <div data-debug-component={componentName}>
      {children}
    </div>
  );
};

export default DebugSidebar; 
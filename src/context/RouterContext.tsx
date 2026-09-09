import React, { createContext, useContext, useState, useEffect } from 'react';

interface RouterContextType {
  currentPath: string;
  navigate: (path: string) => void;
  params: Record<string, string>;
}

const RouterContext = createContext<RouterContextType | undefined>(undefined);

export const RouterProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentPath, setCurrentPath] = useState<string>(window.location.pathname || '/');
  const [params, setParams] = useState<Record<string, string>>({});

  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname || '/');
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigate = (path: string) => {
    if (window.location.pathname !== path) {
      window.history.pushState({}, '', path);
      setCurrentPath(path);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Helper to extract dynamic params (e.g., /projects/:id)
  useEffect(() => {
    const segments = currentPath.split('/').filter(Boolean);
    if (segments[0] === 'projects' && segments[1] && segments[1] !== '') {
      setParams({ id: segments[1] });
    } else {
      setParams({});
    }
  }, [currentPath]);

  return (
    <RouterContext.Provider value={{ currentPath, navigate, params }}>
      {children}
    </RouterContext.Provider>
  );
};

export const useRouter = () => {
  const context = useContext(RouterContext);
  if (!context) {
    throw new Error('useRouter must be used within a RouterProvider');
  }
  return context;
};

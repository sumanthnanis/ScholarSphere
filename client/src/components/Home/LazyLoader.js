import React, { useEffect, useRef } from "react";

const LazyLoader = ({ onLoad }) => {
  const loaderRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          onLoad();
          observer.unobserve(loaderRef.current);
        }
      });
    });

    observer.observe(loaderRef.current);

    return () => observer.disconnect();
  }, []);

  return <div ref={loaderRef} />;
};

export default LazyLoader;

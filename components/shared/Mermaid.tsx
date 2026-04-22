"use client";

import { useEffect, useRef, useState } from "react";

interface Props {
  chart: string;
}

const Mermaid = ({ chart }: Props) => {
  const ref = useRef<HTMLDivElement>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://cdn.jsdelivr.net/npm/mermaid/dist/mermaid.min.js";
    script.async = true;
    script.onload = () => {
      // @ts-ignore
      window.mermaid.initialize({
        startOnLoad: true,
        theme: "dark",
        securityLevel: "loose",
      });
      setLoaded(true);
    };
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  useEffect(() => {
    if (loaded && ref.current) {
      try {
        // @ts-ignore
        window.mermaid.render(`mermaid-${Math.floor(Math.random() * 1000)}`, chart).then(({ svg }) => {
          if (ref.current) ref.current.innerHTML = svg;
        });
      } catch (error) {
        console.error("Mermaid rendering error:", error);
      }
    }
  }, [chart, loaded]);

  return (
    <div 
      ref={ref} 
      className="flex justify-center bg-dark-2 p-4 rounded-xl border border-zinc-800 overflow-x-auto my-6 min-h-[100px]"
    >
      {!loaded && <p className="text-zinc-500 animate-pulse">Loading diagrams...</p>}
    </div>
  );
};

export default Mermaid;

"use client";

import { useEffect, useState, useCallback, useRef } from "react";

// Loads async data, falling back to mock data when the backend is unreachable.
// Returns { data, source, reload } where source is "loading" | "api" | "mock".
export function useApiData(loader, fallback, deps = []) {
  const [state, setState] = useState({ data: fallback, source: "loading" });
  const loaderRef = useRef(loader);
  const fallbackRef = useRef(fallback);

  // Keep the latest loader/fallback without re-running the fetch effect.
  useEffect(() => {
    loaderRef.current = loader;
    fallbackRef.current = fallback;
  });

  const apply = useCallback((result) => setState(result), []);

  const reload = useCallback(() => {
    loaderRef.current()
      .then((data) => apply({ data, source: "api" }))
      .catch((err) => {
        console.error("API load failed — showing demo data", err);
        apply({ data: fallbackRef.current, source: "mock" });
      });
  }, [apply]);

  useEffect(() => {
    let active = true;
    loaderRef.current()
      .then((data) => {
        if (active) apply({ data, source: "api" });
      })
      .catch((err) => {
        if (active) {
          console.error("API load failed — showing demo data", err);
          apply({ data: fallbackRef.current, source: "mock" });
        }
      });
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return { data: state.data, source: state.source, reload };
}

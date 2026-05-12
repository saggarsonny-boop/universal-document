"use client";

import { useEffect, useState } from "react";
import { CATALOGS, pickLocale, strings, type Strings } from "./strings";

export function useStrings(): Strings {
  const [s, setS] = useState<Strings>(strings);
  useEffect(() => {
    if (typeof navigator === "undefined") return;
    const code = pickLocale(navigator.language);
    setS(CATALOGS[code]);
  }, []);
  return s;
}

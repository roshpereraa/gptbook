"use client";

import { useEffect, useState } from "react";

export function Greeting() {
  const [text, setText] = useState("Hello");
  useEffect(() => {
    const h = new Date().getHours();
    setText(h < 5 ? "Up late" : h < 12 ? "Good morning" : h < 18 ? "Good afternoon" : "Good evening");
  }, []);
  return <>{text}</>;
}

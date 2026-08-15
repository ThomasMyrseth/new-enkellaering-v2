"use client";
import { useEffect } from "react";
import { captureAttributionFromURL } from "@/lib/attribution";

export default function AttributionTracker() {
  useEffect(() => {
    captureAttributionFromURL();
  }, []);
  return null;
}

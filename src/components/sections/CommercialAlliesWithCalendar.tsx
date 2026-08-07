"use client";

import { useState } from "react";
import { CommercialAlliesSection } from "@/components/sections/CommercialAlliesSection";
import { HealthFairsCalendar } from "@/components/sections/HealthFairsCalendar";

export function CommercialAlliesWithCalendar() {
  const [calendarOpen, setCalendarOpen] = useState(false);
  return (
    <>
      <CommercialAlliesSection onShowCalendar={() => setCalendarOpen(true)} />
      <HealthFairsCalendar open={calendarOpen} onOpenChange={setCalendarOpen} />
    </>
  );
}

export default CommercialAlliesWithCalendar;

import { format } from "date-fns";
import { tr } from "date-fns/locale";

export function generateTimeSlots(startTime: string, endTime: string, interval: number = 30): string[] {
  const slots: string[] = [];
  
  if (!startTime || !endTime) return [];
  
  const startStr = String(startTime);
  const endStr = String(endTime);

  if (startStr.toLowerCase().includes("kapal") || endStr.toLowerCase().includes("kapal")) {
    return [];
  }

  // Parse hours and minutes safely
  const startParts = startStr.split(":");
  const endParts = endStr.split(":");
  
  if (startParts.length < 2 || endParts.length < 2) return [];

  const [startH, startM] = startParts.map(Number);
  const [endH, endM] = endParts.map(Number);

  let current = new Date();
  current.setHours(startH, startM, 0, 0);

  const end = new Date();
  end.setHours(endH, endM, 0, 0);

  while (current < end) {
    slots.push(format(current, "HH:mm"));
    current.setMinutes(current.getMinutes() + interval);
  }

  return slots;
}

export function getWorkingHoursForDay(workingHours: any, date: Date | undefined): { start: string; end: string } | null {
  if (!workingHours || !date) return null;

  const dayNameEN = format(date, "EEEE").toLowerCase();
  const dayNameTR = format(date, "EEEE", { locale: tr }).toLowerCase();

  const DAY_MAP: Record<string, string[]> = {
    "monday": ["pazartesi", "monday", "mon", "pzt"],
    "tuesday": ["salı", "tuesday", "tue", "sal"],
    "wednesday": ["çarşamba", "wednesday", "wed", "çar"],
    "thursday": ["perşembe", "thursday", "thu", "per"],
    "friday": ["cuma", "friday", "fri", "cum"],
    "saturday": ["cumartesi", "saturday", "sat", "cmt"],
    "sunday": ["pazar", "sunday", "sun", "paz"]
  };

  // Find the relevant mapping for the English day name
  const acceptableKeys = DAY_MAP[dayNameEN] || [dayNameEN, dayNameTR];
  
  // Try to find a key in the workingHours object that matches any of our acceptable keys (case-insensitive)
  const foundKey = Object.keys(workingHours).find(k => 
    acceptableKeys.includes(k.toLowerCase())
  );

  const hours = foundKey ? workingHours[foundKey] : null;
  if (!hours) return null;

  let start = "";
  let end = "";

  if (typeof hours === 'string') {
    if (hours.toLowerCase().includes("kapal")) return null;
    const parts = hours.split("-").map(p => p.trim());
    if (parts.length < 2) return null;
    [start, end] = parts;
  } else if (typeof hours === 'object') {
    if (hours.closed || hours.is_closed) return null;
    start = hours.start || hours.startTime || "";
    end = hours.end || hours.endTime || "";
  }

  if (!start || !end) return null;
  return { start, end };
}

/**
 * Dynamic Pricing Logic: Calculates the effective price based on day/time rules.
 * Default Rules:
 * - Weekends (Sat, Sun): +10% Peak Surcharge
 * - Slow Days (Tue, Wed): -10% Off-Peak Discount
 */
export function calculateSmartPrice(basePrice: number, date: Date | undefined): { 
  price: number, 
  originalPrice: number, 
  multiplier: number,
  label: string | null 
} {
  if (!date) return { price: basePrice, originalPrice: basePrice, multiplier: 1, label: null };
  
  const day = format(date, "EEEE").toLowerCase();
  let multiplier = 1;
  let label = null;

  // Peak Hours: Saturday and Sunday
  if (day === "saturday" || day === "sunday") {
    multiplier = 1.1; // +10%
    label = "Yoğun Saat Artışı (+10%)";
  } 
  // Off-Peak: Tuesday and Wednesday
  else if (day === "tuesday" || day === "wednesday") {
    multiplier = 0.9; // -10%
    label = "Sakin Gün İndirimi (-10%)";
  }

  const finalPrice = Math.round(basePrice * multiplier);
  
  return {
    price: finalPrice,
    originalPrice: basePrice,
    multiplier,
    label
  };
}

export function isSlotOccupied(
  slot: string,
  occupiedSlots: any[],
  staffId: string | null,
  totalStaffCount: number
): boolean {
  const appointmentsInSlot = occupiedSlots.filter(s => s.appointment_time.slice(0, 5) === slot);

  if (staffId) {
    // Specific staff member: check if they have an appointment at this time
    return appointmentsInSlot.some(a => a.staff_id === staffId);
  } else {
    // "Anyone": check if ALL staff members are busy at this time
    // If totalStaffCount is 0 (no staff defined), we assume 1 implicit staff
    const limit = totalStaffCount > 0 ? totalStaffCount : 1;
    return appointmentsInSlot.length >= limit;
  }
}

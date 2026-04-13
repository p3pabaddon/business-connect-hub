import { format } from "date-fns";
import { tr } from "date-fns/locale";

export function generateTimeSlots(startTime: string, endTime: string, interval: number = 30, breakStart?: string, breakEnd?: string): string[] {
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
    const timeStr = format(current, "HH:mm");
    
    // Check if within break
    let isBreak = false;
    if (breakStart && breakEnd) {
      if (timeStr >= breakStart && timeStr < breakEnd) {
        isBreak = true;
      }
    }

    if (!isBreak) {
      slots.push(timeStr);
    }
    
    current.setMinutes(current.getMinutes() + interval);
  }

  return slots;
}

export function getWorkingHoursForDay(workingHours: any, date: Date | undefined): { start: string; end: string, breakStart?: string, breakEnd?: string } | null {
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
  return { 
    start, 
    end, 
    breakStart: hours.break_start || hours.breakStart, 
    breakEnd: hours.break_end || hours.breakEnd 
  };
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

/**
 * Extract duration (in minutes) from the notes field.
 * Format: [DURATION:180] stored as a prefix in notes.
 */
function parseDurationFromNotes(notes: string | null | undefined): number {
  if (!notes) return 30;
  const match = notes.match(/\[DURATION:(\d+)\]/);
  return match ? parseInt(match[1], 10) : 30;
}

/**
 * Checks if a slot (or a range of slots for a duration) is occupied.
 */
export function isSlotOccupied(
  slot: string,
  occupiedSlots: any[],
  staffId: string | null,
  totalStaffCount: number,
  serviceDuration: number = 30
): boolean {
  const [slotH, slotM] = slot.split(":").map(Number);
  const slotStartMins = slotH * 60 + slotM;
  const slotEndMins = slotStartMins + serviceDuration;

  const staffCount = totalStaffCount > 0 ? totalStaffCount : 1;

  // We need to check EVERY minute (or 15-min interval) within the service duration
  // to see if at any point there aren't enough staff free.
  // For simplicity since our intervals are usually 30 min, we can check in 15 min steps.
  for (let time = slotStartMins; time < slotEndMins; time += 15) {
    const overlappingAtTime = occupiedSlots.filter(s => {
      if (!s.appointment_time) return false;
      const [aptH, aptM] = s.appointment_time.split(":").map(Number);
      const aptStartMins = aptH * 60 + aptM;
      const duration = parseDurationFromNotes(s.notes) || s.total_duration || s.duration || 30;
      const aptEndMins = aptStartMins + duration;

      return time >= aptStartMins && time < aptEndMins;
    });

    if (staffId) {
      // If a specific staff is selected, check if they are busy at THIS exact time 'time'
      if (overlappingAtTime.some(a => a.staff_id === staffId)) return true;
    } else {
      // If no staff selected, check if ALL staff are busy at THIS exact time 'time'
      if (overlappingAtTime.length >= staffCount) return true;
    }
  }

  return false;
}

/**
 * Helper to calculate overlapping groups for UI positioning.
 */
export function calculateOverlaps(appointments: any[]) {
  const sorted = [...appointments].sort((a, b) => {
    const aTime = a.appointment_time.split(":").map(Number);
    const bTime = b.appointment_time.split(":").map(Number);
    return (aTime[0] * 60 + aTime[1]) - (bTime[0] * 60 + bTime[1]);
  });

  const columns: any[][] = [];
  
  sorted.forEach(apt => {
    const [aptH, aptM] = apt.appointment_time.split(":").map(Number);
    const start = aptH * 60 + aptM;
    const duration = parseDurationFromNotes(apt.notes) || apt.total_duration || apt.duration || 30;
    const end = start + duration;

    let placed = false;
    for (let i = 0; i < columns.length; i++) {
      const lastInCol = columns[i][columns[i].length - 1];
      const [lastH, lastM] = lastInCol.appointment_time.split(":").map(Number);
      const lastStart = lastH * 60 + lastM;
      const lastEnd = lastStart + (parseDurationFromNotes(lastInCol.notes) || lastInCol.total_duration || lastInCol.duration || 30);

      // If it doesn't overlap with the last one in this column, place it here
      if (start >= lastEnd) {
        columns[i].push(apt);
        placed = true;
        break;
      }
    }

    if (!placed) {
      columns.push([apt]);
    }
  });

  return columns;
}

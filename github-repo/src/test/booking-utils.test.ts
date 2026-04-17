import { describe, it, expect } from "vitest";
import { generateTimeSlots, isSlotOccupied } from "@/lib/booking-utils";

describe("generateTimeSlots", () => {
  it("should generate correct 30-min slots", () => {
    const slots = generateTimeSlots("09:00", "11:00", 30);
    expect(slots).toEqual(["09:00", "09:30", "10:00", "10:30"]);
  });

  it("should return empty for 'Kapalı'", () => {
    expect(generateTimeSlots("Kapalı", "Kapalı")).toEqual([]);
  });

  it("should return empty for invalid input", () => {
    expect(generateTimeSlots("", "")).toEqual([]);
    expect(generateTimeSlots("abc", "def")).toEqual([]);
  });

  it("should generate 60-min intervals", () => {
    const slots = generateTimeSlots("10:00", "13:00", 60);
    expect(slots).toEqual(["10:00", "11:00", "12:00"]);
  });
});

describe("isSlotOccupied", () => {
  it("should detect occupied slot", () => {
    const occupied = [
      { appointment_time: "10:00:00", staff_id: "s1" },
    ];
    expect(isSlotOccupied("10:00", occupied, "s1", 1)).toBe(true);
  });

  it("should not flag unoccupied slot", () => {
    const occupied = [
      { appointment_time: "10:00:00", staff_id: "s1" },
    ];
    expect(isSlotOccupied("11:00", occupied, "s1", 1)).toBe(false);
  });
});

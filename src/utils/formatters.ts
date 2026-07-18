// Assuming global types from @/types/*
type MatchStatus = "SCHEDULED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED" | "DELAYED";
type SeatStatus = "AVAILABLE" | "RESERVED" | "SOLD" | "LOCKED";

/**
 * Formats a decimal ratio (0-1) into a percentage string.
 * @param value - The value to format.
 * @returns The percentage string (e.g., "85.5%").
 */
export function formatPercentage(value: number): string {
  return `${(value * 100).toFixed(1)}%`;
}

/**
 * Formats a stadium occupancy ratio into a descriptive string.
 * @param ratio - The occupancy ratio (0-1).
 * @returns The occupancy description string.
 */
export function formatOccupancy(ratio: number): string {
  const percentage = Math.round(ratio * 100);
  if (percentage >= 100) return "At Capacity";
  if (percentage >= 90) return "Near Capacity";
  if (percentage >= 60) return "Moderately Crowded";
  if (percentage > 0) return "Filling Up";
  return "Empty";
}

/**
 * Formats a fraud/security risk score into a label and a UI color.
 * @param score - The risk score (0-1).
 * @returns An object containing the display label and Tailwind color class.
 */
export function formatRiskScore(score: number): { label: string; color: string } {
  if (score >= 0.8) {
    return { label: "High Risk", color: "text-red-600 bg-red-100" };
  }
  if (score >= 0.4) {
    return { label: "Medium Risk", color: "text-yellow-600 bg-yellow-100" };
  }
  return { label: "Low Risk", color: "text-green-600 bg-green-100" };
}

/**
 * Returns formatted details for a MatchStatus.
 * @param status - The match status enum.
 * @returns The display label and color class.
 */
export function formatMatchStatus(status: MatchStatus): { label: string; color: string } {
  switch (status) {
    case "SCHEDULED":
      return { label: "Scheduled", color: "text-blue-600 bg-blue-100" };
    case "IN_PROGRESS":
      return { label: "Live", color: "text-green-600 bg-green-100" };
    case "COMPLETED":
      return { label: "Completed", color: "text-gray-600 bg-gray-100" };
    case "CANCELLED":
      return { label: "Cancelled", color: "text-red-600 bg-red-100" };
    case "DELAYED":
      return { label: "Delayed", color: "text-orange-600 bg-orange-100" };
    default:
      return { label: "Unknown", color: "text-gray-500 bg-gray-100" };
  }
}

/**
 * Returns formatted details for a SeatStatus.
 * @param status - The seat status enum.
 * @returns The display label and color class.
 */
export function formatSeatStatus(status: SeatStatus): { label: string; color: string } {
  switch (status) {
    case "AVAILABLE":
      return { label: "Available", color: "text-green-600 bg-green-100" };
    case "RESERVED":
      return { label: "Reserved", color: "text-yellow-600 bg-yellow-100" };
    case "SOLD":
      return { label: "Sold", color: "text-gray-600 bg-gray-100" };
    case "LOCKED":
      return { label: "Locked", color: "text-red-600 bg-red-100" };
    default:
      return { label: "Unknown", color: "text-gray-500 bg-gray-100" };
  }
}

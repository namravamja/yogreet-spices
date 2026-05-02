import { OrderStatus } from "../models";

export interface StatusTransitionResult {
  valid: boolean;
  reason?: string;
}

// Define valid status transitions based on the state machine
const VALID_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  pending: ["confirmed", "cancelled"],
  confirmed: ["seller_preparing", "cancelled"],
  seller_preparing: ["ready_for_pickup", "cancelled"],
  ready_for_pickup: ["pickup_assigned"],
  pickup_assigned: ["picked_up", "pickup_failed"],
  picked_up: ["in_transit"],
  in_transit: ["customs_processing", "out_for_delivery"],
  customs_processing: ["in_transit"],
  out_for_delivery: ["delivered", "delivery_failed"],
  delivered: ["completed"],
  completed: [], // Terminal state
  pickup_failed: ["reschedule_requested", "cancelled"],
  delivery_failed: ["reschedule_requested", "returned"],
  reschedule_requested: ["pickup_assigned", "returned"],
  returned: [], // Terminal state
  cancelled: [], // Terminal state
  damaged_reported: ["reschedule_requested", "returned"],
};

// Terminal states that cannot transition to any other state
const TERMINAL_STATES: OrderStatus[] = ["completed", "returned", "cancelled"];

/**
 * Validates if a status transition is allowed according to the state machine rules
 * @param currentStatus - The current order status
 * @param newStatus - The desired new status
 * @returns StatusTransitionResult with valid flag and optional reason
 */
export const validateStatusTransition = (
  currentStatus: OrderStatus,
  newStatus: OrderStatus
): StatusTransitionResult => {
  // Check if statuses are defined
  if (!currentStatus || !newStatus) {
    return {
      valid: false,
      reason: "Current status and new status must be provided",
    };
  }

  // Check if trying to transition to the same status
  if (currentStatus === newStatus) {
    return {
      valid: false,
      reason: "Cannot transition to the same status",
    };
  }

  // Check if current status is a terminal state
  if (TERMINAL_STATES.includes(currentStatus)) {
    return {
      valid: false,
      reason: `Cannot transition from terminal state "${currentStatus}"`,
    };
  }

  // Check if the transition is valid
  const validNextStatuses = VALID_TRANSITIONS[currentStatus];
  
  if (!validNextStatuses) {
    return {
      valid: false,
      reason: `Unknown current status: "${currentStatus}"`,
    };
  }

  if (!validNextStatuses.includes(newStatus)) {
    return {
      valid: false,
      reason: `Cannot transition directly from "${currentStatus}" to "${newStatus}". Valid next statuses are: ${validNextStatuses.join(", ")}`,
    };
  }

  return { valid: true };
};

/**
 * Get all valid next statuses for a given current status
 * @param currentStatus - The current order status
 * @returns Array of valid next statuses
 */
export const getValidNextStatuses = (currentStatus: OrderStatus): OrderStatus[] => {
  return VALID_TRANSITIONS[currentStatus] || [];
};

/**
 * Check if a status requires proof images before transition
 * @param status - The status to check
 * @returns true if proof is required
 */
export const requiresProofImages = (status: OrderStatus): boolean => {
  return status === "picked_up" || status === "delivered";
};

/**
 * Check if a status requires an issue report before transition
 * @param status - The status to check
 * @returns true if issue report is required
 */
export const requiresIssueReport = (status: OrderStatus): boolean => {
  return (
    status === "pickup_failed" ||
    status === "delivery_failed" ||
    status === "damaged_reported"
  );
};

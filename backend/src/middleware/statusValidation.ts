import { Request, Response, NextFunction } from "express";
import { Order } from "../models";
import * as StatusTransitionUtils from "../utils/statusTransition";

/**
 * Middleware to validate order status transitions
 * Checks if the transition is valid and if required data (proof/issues) is provided
 */
export const validateStatusTransition = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id, orderId } = req.params;
    const orderIdParam = id || orderId; // Support both :id and :orderId
    const { status: newStatus, proofImages } = req.body;

    if (!orderIdParam) {
      res.status(400).json({
        success: false,
        error: "Order ID is required",
        code: "MISSING_ORDER_ID",
      });
      return;
    }

    if (!newStatus) {
      res.status(400).json({
        success: false,
        error: "New status is required",
        code: "MISSING_STATUS",
      });
      return;
    }

    // Fetch the order
    const order = await Order.findById(orderIdParam);

    if (!order) {
      res.status(404).json({
        success: false,
        error: "Order not found",
        code: "ORDER_NOT_FOUND",
      });
      return;
    }

    // Validate the status transition using the utility function
    const validation = StatusTransitionUtils.validateStatusTransition(order.status, newStatus);

    if (!validation.valid) {
      res.status(400).json({
        success: false,
        error: "Invalid status transition",
        details: {
          currentStatus: order.status,
          attemptedStatus: newStatus,
          reason: validation.reason,
        },
        code: "INVALID_STATUS_TRANSITION",
      });
      return;
    }

    // Check if proof images are required
    if (StatusTransitionUtils.requiresProofImages(newStatus)) {
      if (!proofImages || proofImages.length === 0) {
        res.status(400).json({
          success: false,
          error: "Proof images required for this status transition",
          details: {
            requiredProofType: newStatus === "picked_up" ? "pickup" : "delivery",
            minimumImages: 1,
            attemptedStatus: newStatus,
          },
          code: "PROOF_REQUIRED",
        });
        return;
      }
    }

    // Check if issue report is required
    if (StatusTransitionUtils.requiresIssueReport(newStatus)) {
      if (!order.deliveryIssue) {
        res.status(400).json({
          success: false,
          error: "Issue report required for this status transition",
          details: {
            attemptedStatus: newStatus,
            message: "Please report an issue before transitioning to a failure state",
          },
          code: "ISSUE_REPORT_REQUIRED",
        });
        return;
      }
    }

    // Validation passed, proceed to controller
    next();
  } catch (error: any) {
    console.error("Error in validateStatusTransition middleware:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error during status validation",
      code: "VALIDATION_ERROR",
    });
  }
};

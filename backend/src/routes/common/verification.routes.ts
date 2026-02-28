import express from "express";
import {
  verifySingleDocument,
  verifyPANController,
  verifyGSTController,
  verifyAadhaarController,
  verifyIFSCController,
  verifyFSSAIController,
  verifyIECController,
  verifyBatchDocuments,
  crossVerifyPANGST,
  saveAutoVerificationStatus,
  getAutoVerificationStatus
} from "../../controllers/common/verification.controller";
import { asyncHandler } from "../../middleware/errorHandler";
import { verifyToken } from "../../middleware/authMiddleware";

const router = express.Router();

// Single document verification endpoints (public - just format/API verification)
router.post("/document", asyncHandler(verifySingleDocument as any));
router.post("/pan", asyncHandler(verifyPANController as any));
router.post("/gst", asyncHandler(verifyGSTController as any));
router.post("/aadhaar", asyncHandler(verifyAadhaarController as any));
router.post("/ifsc", asyncHandler(verifyIFSCController as any));
router.post("/fssai", asyncHandler(verifyFSSAIController as any));
router.post("/iec", asyncHandler(verifyIECController as any));

// Batch verification
router.post("/batch", asyncHandler(verifyBatchDocuments as any));

// Cross verification
router.post("/pan-gst", asyncHandler(crossVerifyPANGST as any));

// Save/Get verification status (authenticated - stores in DB)
router.post("/save-status", verifyToken, asyncHandler(saveAutoVerificationStatus as any));
router.get("/status", verifyToken, asyncHandler(getAutoVerificationStatus as any));

export default router;

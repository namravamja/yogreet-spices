import { Request, Response } from "express";
import {
  verifyDocument,
  verifyPAN,
  verifyGST,
  verifyAadhaar,
  verifyIFSC,
  verifyFSSAI,
  verifyIEC,
  validateUdyamFormat,
  validateBankAccountFormat,
  DocumentType
} from "../../utils/documentVerification";
import { Documents } from "../../models/Documents";
import { Seller } from "../../models/Seller";

// Define AuthRequest interface locally
interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
  };
}

/**
 * Verify a single document
 * POST /api/verify/document
 */
export const verifySingleDocument = async (req: Request, res: Response) => {
  const { documentType, value, crossCheckData } = req.body;

  if (!documentType || !value) {
    return res.status(400).json({
      success: false,
      message: "Document type and value are required"
    });
  }

  const validTypes: DocumentType[] = ['pan', 'gst', 'aadhaar', 'ifsc', 'fssai', 'iec', 'udyam', 'bankAccount'];
  
  if (!validTypes.includes(documentType)) {
    return res.status(400).json({
      success: false,
      message: `Invalid document type. Valid types: ${validTypes.join(', ')}`
    });
  }

  try {
    const result = await verifyDocument(documentType, value, crossCheckData);
    
    return res.status(200).json({
      success: true,
      ...result
    });
  } catch (error) {
    console.error("Document verification error:", error);
    return res.status(500).json({
      success: false,
      message: "Verification failed due to server error"
    });
  }
};

/**
 * Verify PAN number
 * POST /api/verify/pan
 */
export const verifyPANController = async (req: Request, res: Response) => {
  const { pan, gst } = req.body;

  if (!pan) {
    return res.status(400).json({
      success: false,
      message: "PAN number is required"
    });
  }

  try {
    const result = await verifyPAN(pan, gst);
    return res.status(200).json({ success: true, ...result });
  } catch (error) {
    console.error("PAN verification error:", error);
    return res.status(500).json({
      success: false,
      message: "PAN verification failed"
    });
  }
};

/**
 * Verify GST number
 * POST /api/verify/gst
 */
export const verifyGSTController = async (req: Request, res: Response) => {
  const { gst, pan } = req.body;

  if (!gst) {
    return res.status(400).json({
      success: false,
      message: "GST number is required"
    });
  }

  try {
    const result = await verifyGST(gst, pan);
    return res.status(200).json({ success: true, ...result });
  } catch (error) {
    console.error("GST verification error:", error);
    return res.status(500).json({
      success: false,
      message: "GST verification failed"
    });
  }
};

/**
 * Verify Aadhaar number
 * POST /api/verify/aadhaar
 */
export const verifyAadhaarController = async (req: Request, res: Response) => {
  const { aadhaar } = req.body;

  if (!aadhaar) {
    return res.status(400).json({
      success: false,
      message: "Aadhaar number is required"
    });
  }

  try {
    const result = await verifyAadhaar(aadhaar);
    return res.status(200).json({ success: true, ...result });
  } catch (error) {
    console.error("Aadhaar verification error:", error);
    return res.status(500).json({
      success: false,
      message: "Aadhaar verification failed"
    });
  }
};

/**
 * Verify IFSC code
 * POST /api/verify/ifsc
 */
export const verifyIFSCController = async (req: Request, res: Response) => {
  const { ifsc } = req.body;

  if (!ifsc) {
    return res.status(400).json({
      success: false,
      message: "IFSC code is required"
    });
  }

  try {
    const result = await verifyIFSC(ifsc);
    return res.status(200).json({ success: true, ...result });
  } catch (error) {
    console.error("IFSC verification error:", error);
    return res.status(500).json({
      success: false,
      message: "IFSC verification failed"
    });
  }
};

/**
 * Verify FSSAI license number
 * POST /api/verify/fssai
 */
export const verifyFSSAIController = async (req: Request, res: Response) => {
  const { fssai } = req.body;

  if (!fssai) {
    return res.status(400).json({
      success: false,
      message: "FSSAI license number is required"
    });
  }

  try {
    const result = await verifyFSSAI(fssai);
    return res.status(200).json({ success: true, ...result });
  } catch (error) {
    console.error("FSSAI verification error:", error);
    return res.status(500).json({
      success: false,
      message: "FSSAI verification failed"
    });
  }
};

/**
 * Verify IEC code
 * POST /api/verify/iec
 */
export const verifyIECController = async (req: Request, res: Response) => {
  const { iec } = req.body;

  if (!iec) {
    return res.status(400).json({
      success: false,
      message: "IEC code is required"
    });
  }

  try {
    const result = await verifyIEC(iec);
    return res.status(200).json({ success: true, ...result });
  } catch (error) {
    console.error("IEC verification error:", error);
    return res.status(500).json({
      success: false,
      message: "IEC verification failed"
    });
  }
};

/**
 * Verify multiple documents at once
 * POST /api/verify/batch
 */
export const verifyBatchDocuments = async (req: Request, res: Response) => {
  const { documents } = req.body;

  if (!documents || !Array.isArray(documents) || documents.length === 0) {
    return res.status(400).json({
      success: false,
      message: "Documents array is required"
    });
  }

  try {
    const results = await Promise.all(
      documents.map(async (doc: { type: DocumentType; value: string; crossCheckData?: Record<string, string> }) => {
        if (!doc.type || !doc.value) {
          return { type: doc.type, verified: false, message: "Invalid document data" };
        }
        const result = await verifyDocument(doc.type, doc.value, doc.crossCheckData);
        return { type: doc.type, ...result };
      })
    );

    const allVerified = results.every(r => r.verified);

    return res.status(200).json({
      success: true,
      allVerified,
      results
    });
  } catch (error) {
    console.error("Batch verification error:", error);
    return res.status(500).json({
      success: false,
      message: "Batch verification failed"
    });
  }
};

/**
 * Cross-verify PAN and GST
 * POST /api/verify/pan-gst
 */
export const crossVerifyPANGST = async (req: Request, res: Response) => {
  const { pan, gst } = req.body;

  if (!pan || !gst) {
    return res.status(400).json({
      success: false,
      message: "Both PAN and GST numbers are required"
    });
  }

  try {
    // Verify PAN with GST cross-check
    const panResult = await verifyPAN(pan, gst);
    
    // Verify GST with PAN cross-check
    const gstResult = await verifyGST(gst, pan);

    const crossVerified = panResult.verified && gstResult.verified;

    return res.status(200).json({
      success: true,
      crossVerified,
      pan: panResult,
      gst: gstResult,
      message: crossVerified 
        ? "PAN and GST are valid and match each other" 
        : "PAN and GST verification failed or mismatch"
    });
  } catch (error) {
    console.error("Cross verification error:", error);
    return res.status(500).json({
      success: false,
      message: "Cross verification failed"
    });
  }
};

/**
 * Save auto-verification status to database
 * POST /api/verify/save-status
 */
export const saveAutoVerificationStatus = async (req: AuthRequest, res: Response) => {
  const { documentType, value, verified, details, bankName, branchName } = req.body;
  const userId = req.user?.id;

  if (!userId) {
    return res.status(401).json({
      success: false,
      message: "Authentication required"
    });
  }

  if (!documentType || value === undefined || verified === undefined) {
    return res.status(400).json({
      success: false,
      message: "Document type, value, and verified status are required"
    });
  }

  // Map document types to their field names
  const documentFieldMap: Record<string, string> = {
    'pan': 'panNumber',
    'gst': 'gstNumber',
    'aadhaar': 'aadharNumber',
    'ifsc': 'bankIfscCode',
    'bankAccount': 'bankAccountNumber',
    'fssai': 'fssaiLicenseNumber',
    'iec': 'iecCode'
  };

  const fieldName = documentFieldMap[documentType];
  if (!fieldName) {
    return res.status(400).json({
      success: false,
      message: "Invalid document type"
    });
  }

  try {
    // Find seller and their documents
    const seller = await Seller.findById(userId);
    if (!seller) {
      return res.status(404).json({
        success: false,
        message: "Seller not found"
      });
    }

    // Find or create documents record
    let documents;
    if (seller.documentsId) {
      documents = await Documents.findById(seller.documentsId);
    }

    if (!documents) {
      documents = new Documents({});
      await documents.save();
      seller.documentsId = documents._id as any;
      await seller.save();
    }

    // Update the document value and auto-verification status
    const updateData: Record<string, any> = {
      [fieldName]: value,
      [`autoVerified.${fieldName}`]: {
        verified,
        verifiedAt: new Date(),
        details: details || undefined,
        ...(documentType === 'ifsc' && { bankName, branchName })
      }
    };

    await Documents.findByIdAndUpdate(documents._id, { $set: updateData });

    return res.status(200).json({
      success: true,
      message: `${documentType.toUpperCase()} verification status saved`,
      field: fieldName,
      verified
    });
  } catch (error) {
    console.error("Save verification status error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to save verification status"
    });
  }
};

/**
 * Get auto-verification status for all documents
 * GET /api/verify/status
 */
export const getAutoVerificationStatus = async (req: AuthRequest, res: Response) => {
  const userId = req.user?.id;

  if (!userId) {
    return res.status(401).json({
      success: false,
      message: "Authentication required"
    });
  }

  try {
    const seller = await Seller.findById(userId);
    if (!seller) {
      return res.status(404).json({
        success: false,
        message: "Seller not found"
      });
    }

    if (!seller.documentsId) {
      return res.status(200).json({
        success: true,
        autoVerified: {}
      });
    }

    const documents = await Documents.findById(seller.documentsId);
    if (!documents) {
      return res.status(200).json({
        success: true,
        autoVerified: {}
      });
    }

    return res.status(200).json({
      success: true,
      autoVerified: documents.autoVerified || {}
    });
  } catch (error) {
    console.error("Get verification status error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to get verification status"
    });
  }
};

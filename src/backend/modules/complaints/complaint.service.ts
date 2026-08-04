import { complaintRepository, CreateComplaintData, UpdateComplaintData, ListComplaintsFilter } from "./complaint.repository";
import { ComplaintSeverity, ComplaintTrend } from "@prisma/client";
import { prisma } from "@/backend/prisma/client";

export class ComplaintService {
  async listComplaints(orgId: string, filter?: ListComplaintsFilter) {
    return complaintRepository.listComplaints(orgId, filter);
  }

  async getComplaint(id: string, orgId: string) {
    return complaintRepository.getComplaintById(id, orgId);
  }

  private async validateParentAttachments(orgId: string, competitorId?: string | null, productId?: string | null) {
    let resolvedCompetitorId: string | null = null;
    let resolvedProductId: string | null = null;

    if (competitorId) {
      const competitor = await prisma.competitor.findFirst({
        where: { id: competitorId, orgId },
      });
      if (!competitor) {
        throw new Error("NOT_FOUND: Referenced competitor does not exist");
      }
      resolvedCompetitorId = competitor.id;
    }

    if (productId) {
      const product = await prisma.product.findFirst({
        where: {
          id: productId,
          competitor: { orgId },
        },
        include: { competitor: true },
      });

      if (!product) {
        throw new Error("NOT_FOUND: Referenced product does not exist");
      }

      // Check product/competitor relationship consistency if both are specified
      if (resolvedCompetitorId && product.competitorId !== resolvedCompetitorId) {
        throw new Error("INVALID_RELATIONSHIP: Product does not belong to specified competitor");
      }

      resolvedProductId = product.id;
      // Auto-bind competitorId if omitted
      if (!resolvedCompetitorId) {
        resolvedCompetitorId = product.competitorId;
      }
    }

    return { competitorId: resolvedCompetitorId, productId: resolvedProductId };
  }

  async createComplaint(params: {
    text: string;
    severity?: ComplaintSeverity;
    frequency?: number | null;
    trend?: ComplaintTrend;
    orgId: string;
    competitorId?: string | null;
    productId?: string | null;
  }) {
    const text = params.text ? params.text.trim() : "";
    if (!text) {
      throw new Error("VALIDATION_ERROR: Complaint text is required");
    }
    if (text.length > 2000) {
      throw new Error("VALIDATION_ERROR: Complaint text exceeds maximum length of 2000 characters");
    }

    if (params.severity && !Object.values(ComplaintSeverity).includes(params.severity)) {
      throw new Error("VALIDATION_ERROR: Invalid complaint severity");
    }

    if (params.trend && !Object.values(ComplaintTrend).includes(params.trend)) {
      throw new Error("VALIDATION_ERROR: Invalid complaint trend");
    }

    if (params.frequency !== undefined && params.frequency !== null) {
      if (typeof params.frequency !== "number" || !Number.isFinite(params.frequency) || params.frequency < 0 || params.frequency > 100) {
        throw new Error("VALIDATION_ERROR: Frequency must be a finite number between 0 and 100");
      }
    }

    const { competitorId, productId } = await this.validateParentAttachments(
      params.orgId,
      params.competitorId,
      params.productId
    );

    const data: CreateComplaintData = {
      text,
      severity: params.severity,
      frequency: params.frequency,
      trend: params.trend,
      orgId: params.orgId,
      competitorId,
      productId,
    };

    return complaintRepository.createComplaint(data);
  }

  async updateComplaint(
    id: string,
    orgId: string,
    params: {
      text?: string;
      severity?: ComplaintSeverity;
      frequency?: number | null;
      trend?: ComplaintTrend;
      competitorId?: string | null;
      productId?: string | null;
    }
  ) {
    const existing = await complaintRepository.getComplaintById(id, orgId);
    if (!existing) {
      return null;
    }

    const updateData: UpdateComplaintData = {};

    if (params.text !== undefined) {
      const text = params.text.trim();
      if (!text) {
        throw new Error("VALIDATION_ERROR: Complaint text cannot be empty");
      }
      if (text.length > 2000) {
        throw new Error("VALIDATION_ERROR: Complaint text exceeds maximum length of 2000 characters");
      }
      updateData.text = text;
    }

    if (params.severity !== undefined) {
      if (!Object.values(ComplaintSeverity).includes(params.severity)) {
        throw new Error("VALIDATION_ERROR: Invalid complaint severity");
      }
      updateData.severity = params.severity;
    }

    if (params.trend !== undefined) {
      if (!Object.values(ComplaintTrend).includes(params.trend)) {
        throw new Error("VALIDATION_ERROR: Invalid complaint trend");
      }
      updateData.trend = params.trend;
    }

    if (params.frequency !== undefined && params.frequency !== null) {
      if (typeof params.frequency !== "number" || !Number.isFinite(params.frequency) || params.frequency < 0 || params.frequency > 100) {
        throw new Error("VALIDATION_ERROR: Frequency must be a finite number between 0 and 100");
      }
      updateData.frequency = params.frequency;
    } else if (params.frequency === null) {
      updateData.frequency = null;
    }

    if (params.competitorId !== undefined || params.productId !== undefined) {
      const targetCompetitorId = params.competitorId !== undefined ? params.competitorId : existing.competitorId;
      const targetProductId = params.productId !== undefined ? params.productId : existing.productId;

      const { competitorId, productId } = await this.validateParentAttachments(
        orgId,
        targetCompetitorId,
        targetProductId
      );

      updateData.competitorId = competitorId;
      updateData.productId = productId;
    }

    return complaintRepository.updateComplaint(id, orgId, updateData);
  }

  async deleteComplaint(id: string, orgId: string) {
    const existing = await complaintRepository.getComplaintById(id, orgId);
    if (!existing) {
      return null;
    }
    return complaintRepository.deleteComplaint(id, orgId);
  }
}

export const complaintService = new ComplaintService();

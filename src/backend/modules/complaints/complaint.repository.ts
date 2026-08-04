import { prisma } from "@/backend/prisma/client";
import { Complaint, ComplaintSeverity, ComplaintTrend } from "@prisma/client";

export interface CreateComplaintData {
  text: string;
  severity?: ComplaintSeverity;
  frequency?: number | null;
  trend?: ComplaintTrend;
  orgId: string;
  competitorId?: string | null;
  productId?: string | null;
}

export interface UpdateComplaintData {
  text?: string;
  severity?: ComplaintSeverity;
  frequency?: number | null;
  trend?: ComplaintTrend;
  competitorId?: string | null;
  productId?: string | null;
}

export interface ListComplaintsFilter {
  severity?: ComplaintSeverity;
  trend?: ComplaintTrend;
  competitorId?: string;
  productId?: string;
}

export class ComplaintRepository {
  async listComplaints(orgId: string, filter?: ListComplaintsFilter): Promise<Complaint[]> {
    const where: any = { orgId };

    if (filter?.severity) {
      where.severity = filter.severity;
    }
    if (filter?.trend) {
      where.trend = filter.trend;
    }
    if (filter?.competitorId) {
      where.competitorId = filter.competitorId;
    }
    if (filter?.productId) {
      where.productId = filter.productId;
    }

    return prisma.complaint.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });
  }

  async getComplaintById(id: string, orgId: string): Promise<Complaint | null> {
    return prisma.complaint.findFirst({
      where: { id, orgId },
    });
  }

  async createComplaint(data: CreateComplaintData): Promise<Complaint> {
    return prisma.complaint.create({
      data: {
        text: data.text,
        severity: data.severity ?? ComplaintSeverity.MEDIUM,
        frequency: data.frequency ?? null,
        trend: data.trend ?? ComplaintTrend.STABLE,
        orgId: data.orgId,
        competitorId: data.competitorId ?? null,
        productId: data.productId ?? null,
      },
    });
  }

  async updateComplaint(id: string, orgId: string, data: UpdateComplaintData): Promise<Complaint | null> {
    const existing = await this.getComplaintById(id, orgId);
    if (!existing) {
      return null;
    }

    return prisma.complaint.update({
      where: { id },
      data: {
        ...(data.text !== undefined && { text: data.text }),
        ...(data.severity !== undefined && { severity: data.severity }),
        ...(data.frequency !== undefined && { frequency: data.frequency }),
        ...(data.trend !== undefined && { trend: data.trend }),
        ...(data.competitorId !== undefined && { competitorId: data.competitorId }),
        ...(data.productId !== undefined && { productId: data.productId }),
      },
    });
  }

  async deleteComplaint(id: string, orgId: string): Promise<Complaint | null> {
    const existing = await this.getComplaintById(id, orgId);
    if (!existing) {
      return null;
    }

    return prisma.complaint.delete({
      where: { id },
    });
  }
}

export const complaintRepository = new ComplaintRepository();

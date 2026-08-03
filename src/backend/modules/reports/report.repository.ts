import { prisma } from "@/backend/prisma/client";
import { ReportSchedule, ExecutionStatus } from "@prisma/client";

export interface CreateReportData {
  title: string;
  description?: string;
  schedule?: ReportSchedule;
  orgId: string;
  createdById?: string;
}

export interface UpdateReportData {
  title?: string;
  description?: string;
  schedule?: ReportSchedule;
}

export class ReportRepository {
  async listReports(orgId: string) {
    return prisma.report.findMany({
      where: { orgId },
      orderBy: { createdAt: "desc" },
    });
  }

  async getReportById(id: string, orgId: string) {
    return prisma.report.findFirst({
      where: { id, orgId },
    });
  }

  async createReport(data: CreateReportData) {
    return prisma.report.create({
      data: {
        title: data.title,
        description: data.description,
        schedule: data.schedule || ReportSchedule.ON_DEMAND,
        orgId: data.orgId,
        createdById: data.createdById,
      },
    });
  }

  async updateReport(id: string, orgId: string, data: UpdateReportData) {
    const report = await this.getReportById(id, orgId);
    if (!report) return null;

    return prisma.report.update({
      where: { id },
      data: {
        ...(data.title !== undefined && { title: data.title }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.schedule !== undefined && { schedule: data.schedule }),
      },
    });
  }

  async deleteReport(id: string, orgId: string) {
    const report = await this.getReportById(id, orgId);
    if (!report) return null;

    return prisma.report.delete({
      where: { id },
    });
  }

  async createExecution(reportId: string) {
    return prisma.reportExecution.create({
      data: {
        reportId,
        status: ExecutionStatus.RUNNING,
        startedAt: new Date(),
      },
    });
  }

  async completeExecution(executionId: string, reportId: string, summary: Record<string, unknown>) {
    const execution = await prisma.reportExecution.update({
      where: { id: executionId },
      data: {
        status: ExecutionStatus.SUCCESS,
        completedAt: new Date(),
        summary: summary as any,
      },
    });

    await prisma.report.update({
      where: { id: reportId },
      data: { lastRunAt: new Date() },
    });

    return execution;
  }

  async failExecution(executionId: string, errorLog: string) {
    return prisma.reportExecution.update({
      where: { id: executionId },
      data: {
        status: ExecutionStatus.FAILED,
        completedAt: new Date(),
        errorLog,
      },
    });
  }

  async listExecutionHistory(orgId: string) {
    return prisma.reportExecution.findMany({
      where: {
        report: {
          orgId,
        },
      },
      include: {
        report: {
          select: {
            id: true,
            title: true,
          },
        },
      },
      orderBy: { startedAt: "desc" },
    });
  }
}

export const reportRepository = new ReportRepository();

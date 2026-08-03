import { reportRepository, CreateReportData, UpdateReportData } from "./report.repository";
import { ReportSchedule } from "@prisma/client";
import { dashboardAnalyticsService } from "@/backend/modules/analytics/dashboard-analytics.service";
import { intelligenceAnalyticsService } from "@/backend/modules/analytics/intelligence-analytics.service";

export interface ReportExecutionResultDTO {
  id: string;
  reportId: string;
  reportTitle?: string;
  status: string;
  startedAt: Date;
  completedAt: Date | null;
  durationSeconds: number | null;
  summary: Record<string, unknown> | null;
  errorLog: string | null;
}

export class ReportService {
  async listReports(orgId: string) {
    return reportRepository.listReports(orgId);
  }

  async getReport(id: string, orgId: string) {
    return reportRepository.getReportById(id, orgId);
  }

  async createReport(params: { title: string; description?: string; schedule?: ReportSchedule; orgId: string; createdById: string }) {
    const title = params.title ? params.title.trim() : "";
    if (!title) {
      throw new Error("Report title is required");
    }

    const validSchedules = Object.values(ReportSchedule);
    const schedule = params.schedule || ReportSchedule.ON_DEMAND;
    if (!validSchedules.includes(schedule)) {
      throw new Error("Invalid report schedule");
    }

    const data: CreateReportData = {
      title,
      description: params.description ? params.description.trim() : undefined,
      schedule,
      orgId: params.orgId,
      createdById: params.createdById,
    };

    return reportRepository.createReport(data);
  }

  async updateReport(id: string, orgId: string, params: { title?: string; description?: string; schedule?: ReportSchedule }) {
    const report = await reportRepository.getReportById(id, orgId);
    if (!report) {
      return null;
    }

    const updateData: UpdateReportData = {};

    if (params.title !== undefined) {
      const title = params.title.trim();
      if (!title) {
        throw new Error("Report title cannot be empty");
      }
      updateData.title = title;
    }

    if (params.description !== undefined) {
      updateData.description = params.description.trim() || undefined;
    }

    if (params.schedule !== undefined) {
      const validSchedules = Object.values(ReportSchedule);
      if (!validSchedules.includes(params.schedule)) {
        throw new Error("Invalid report schedule");
      }
      updateData.schedule = params.schedule;
    }

    return reportRepository.updateReport(id, orgId, updateData);
  }

  async deleteReport(id: string, orgId: string) {
    const report = await reportRepository.getReportById(id, orgId);
    if (!report) {
      return null;
    }
    return reportRepository.deleteReport(id, orgId);
  }

  async executeReport(id: string, orgId: string): Promise<ReportExecutionResultDTO | null> {
    const report = await reportRepository.getReportById(id, orgId);
    if (!report) {
      return null;
    }

    const execution = await reportRepository.createExecution(id);

    try {
      const dashboardMetrics = await dashboardAnalyticsService.getDashboardAnalytics(orgId);
      const recentInsightsResponse = await intelligenceAnalyticsService.getRecentInsights(orgId, { limit: 5 });
      const recentInsights = recentInsightsResponse.items;

      const summarySnapshot: Record<string, unknown> = {
        generatedAt: new Date().toISOString(),
        reportTitle: report.title,
        metrics: {
          competitorCount: dashboardMetrics.competitorCount,
          totalProductCount: dashboardMetrics.totalProductCount,
          avgIntelligenceActivityScore: dashboardMetrics.avgIntelligenceActivityScore,
          datasetReadinessPercent: dashboardMetrics.datasetReadinessPercent,
        },
        insightsSummary: recentInsights.map((insight) => ({
          id: insight.id,
          title: insight.title,
          type: insight.type,
          summary: insight.summary,
        })),
      };

      const completed = await reportRepository.completeExecution(execution.id, id, summarySnapshot);

      const durationSeconds = completed.completedAt && completed.startedAt
        ? Math.round((completed.completedAt.getTime() - completed.startedAt.getTime()) / 1000)
        : null;

      return {
        id: completed.id,
        reportId: completed.reportId,
        reportTitle: report.title,
        status: completed.status,
        startedAt: completed.startedAt,
        completedAt: completed.completedAt,
        durationSeconds,
        summary: completed.summary as Record<string, unknown>,
        errorLog: completed.errorLog,
      };
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : "Report generation failed";
      const sanitizedError = errorMsg.replace(/DATABASE_URL|postgres:\/\/[^\s]+/gi, "[REDACTED]");
      const failed = await reportRepository.failExecution(execution.id, sanitizedError);

      const durationSeconds = failed.completedAt && failed.startedAt
        ? Math.round((failed.completedAt.getTime() - failed.startedAt.getTime()) / 1000)
        : null;

      return {
        id: failed.id,
        reportId: failed.reportId,
        reportTitle: report.title,
        status: failed.status,
        startedAt: failed.startedAt,
        completedAt: failed.completedAt,
        durationSeconds,
        summary: null,
        errorLog: failed.errorLog,
      };
    }
  }

  async listExecutionHistory(orgId: string): Promise<ReportExecutionResultDTO[]> {
    const logs = await reportRepository.listExecutionHistory(orgId);

    return logs.map((log) => {
      const durationSeconds = log.completedAt && log.startedAt
        ? Math.round((log.completedAt.getTime() - log.startedAt.getTime()) / 1000)
        : null;

      return {
        id: log.id,
        reportId: log.reportId,
        reportTitle: log.report?.title,
        status: log.status,
        startedAt: log.startedAt,
        completedAt: log.completedAt,
        durationSeconds,
        summary: log.summary as Record<string, unknown> | null,
        errorLog: log.errorLog,
      };
    });
  }
}

export const reportService = new ReportService();

import { PrismaClient, Dataset, Prisma, DatasetStatus, DatasetFailureCode } from '@prisma/client';
import { DatasetProfileResult } from './dataset-profiler';
import { StructuredIntelligenceResult } from '../../shared/ai/intelligence-contract';
import { DatasetStateError } from '../../shared/errors/dataset-errors';
import { SemanticMappingDocument } from '../../shared/mapping/semantic-mapping';

const prisma = new PrismaClient();

export class DatasetRepository {
  async create(data: Prisma.DatasetUncheckedCreateInput): Promise<Dataset> {
    return prisma.dataset.create({
      data,
    });
  }

  async findById(id: string, orgId: string): Promise<Dataset | null> {
    return prisma.dataset.findFirst({
      where: {
        id,
        orgId,
      },
    });
  }

  async findWithIntelligence(id: string, orgId: string) {
    return prisma.dataset.findFirst({
      where: {
        id,
        orgId,
      },
      include: {
        profile: true,
        insights: {
          orderBy: [
            { createdAt: 'asc' },
            { id: 'asc' }
          ]
        }
      }
    });
  }

  async findAllByOrganization(orgId: string): Promise<Dataset[]> {
    return prisma.dataset.findMany({
      where: { orgId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async delete(id: string, orgId: string): Promise<Dataset> {
    // Check existence and org isolation first
    const existing = await prisma.dataset.findFirst({
      where: { id, orgId },
    });
    if (!existing) {
      throw new Error('Dataset not found');
    }
    
    return prisma.dataset.delete({
      where: { id },
    });
  }

  async updateStatus(id: string, orgId: string, status: DatasetStatus): Promise<Dataset> {
    const existing = await prisma.dataset.findFirst({
      where: { id, orgId },
    });
    if (!existing) {
      throw new Error('Dataset not found');
    }

    return prisma.dataset.update({
      where: { id },
      data: { status },
    });
  }

  async updateStatusAndFailureReason(id: string, orgId: string, status: DatasetStatus, failureReason: string | null = null): Promise<Dataset> {
    const existing = await prisma.dataset.findFirst({
      where: { id, orgId },
    });
    if (!existing) {
      throw new Error('Dataset not found');
    }

    return prisma.dataset.update({
      where: { id },
      data: { status, failureReason, failureCode: null },
    });
  }

  async updateSemanticMapping(id: string, orgId: string, mapping: SemanticMappingDocument, status: DatasetStatus): Promise<Dataset> {
    const existing = await prisma.dataset.findFirst({
      where: { id, orgId },
    });
    if (!existing) {
      throw new Error('Dataset not found');
    }

    return prisma.dataset.update({
      where: { id },
      data: { 
        semanticMapping: JSON.parse(JSON.stringify(mapping)),
        status,
        failureReason: null,
        failureCode: null
      },
    });
  }
  async claimDatasetForProcessing(id: string, orgId: string): Promise<boolean> {
    const result = await prisma.dataset.updateMany({
      where: { id, orgId, status: 'MAPPED' },
      data: { status: 'PROCESSING', failureReason: null, failureCode: null }
    });
    return result.count === 1;
  }

  async persistIntelligenceTransaction(
    id: string,
    orgId: string,
    profile: DatasetProfileResult,
    intelligence: StructuredIntelligenceResult
  ): Promise<void> {
    await prisma.$transaction(async (tx) => {
      // 1. Delete existing insights to prevent duplication
      await tx.datasetInsight.deleteMany({
        where: { datasetId: id }
      });

      // 2. Upsert dataset profile
      await tx.datasetProfile.upsert({
        where: { datasetId: id },
        update: {
          rowCount: profile.physicalRowCount,
          columnCount: profile.physicalColumnCount,
          columnMetadata: profile.columns ? JSON.parse(JSON.stringify(profile.columns)) : {},
          summaryStatistics: profile.semanticAggregates ? JSON.parse(JSON.stringify(profile.semanticAggregates)) : {}
        },
        create: {
          datasetId: id,
          rowCount: profile.physicalRowCount,
          columnCount: profile.physicalColumnCount,
          columnMetadata: profile.columns ? JSON.parse(JSON.stringify(profile.columns)) : {},
          summaryStatistics: profile.semanticAggregates ? JSON.parse(JSON.stringify(profile.semanticAggregates)) : {}
        }
      });

      // 3. Create validated insights
      if (intelligence.insights.length > 0) {
        await tx.datasetInsight.createMany({
          data: intelligence.insights.map((insight) => ({
            datasetId: id,
            type: insight.type,
            title: insight.title,
            summary: insight.summary,
            confidence: insight.confidence,
            evidence: insight.evidence ? JSON.parse(JSON.stringify(insight.evidence)) : {}
          }))
        });
      }

      // 4. Update status to READY explicitly verifying state
      const updateResult = await tx.dataset.updateMany({
        where: { id, orgId, status: 'PROCESSING' },
        data: { status: 'READY', failureReason: null, failureCode: null }
      });

      if (updateResult.count !== 1) {
        throw new DatasetStateError('Dataset is no longer in PROCESSING state. Transaction aborted.');
      }
    });
  }

  async markProcessingAsFailed(id: string, orgId: string, reason: string, failureCode: DatasetFailureCode): Promise<void> {
    const updateResult = await prisma.dataset.updateMany({
      where: { id, orgId, status: 'PROCESSING' },
      data: { status: 'FAILED', failureReason: reason, failureCode }
    });
    if (updateResult.count !== 1) {
      throw new DatasetStateError('Dataset is not in PROCESSING state. Failed to mark as FAILED.');
    }
  }

  async retryDatasetProcessing(id: string, orgId: string, retryableCodes: DatasetFailureCode[]): Promise<boolean> {
    const updateResult = await prisma.dataset.updateMany({
      where: {
        id,
        orgId,
        status: 'FAILED',
        failureCode: { in: retryableCodes }
      },
      data: {
        status: 'MAPPED',
        failureReason: null,
        failureCode: null
      }
    });
    return updateResult.count === 1;
  }
}

export const datasetRepository = new DatasetRepository();

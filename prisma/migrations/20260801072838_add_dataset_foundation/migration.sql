-- CreateEnum
CREATE TYPE "DatasetStatus" AS ENUM ('UPLOADED', 'MAPPING_REQUIRED', 'PROCESSING', 'READY', 'FAILED');

-- CreateTable
CREATE TABLE "Dataset" (
    "id" TEXT NOT NULL,
    "originalFilename" TEXT NOT NULL,
    "storageKey" TEXT NOT NULL,
    "format" TEXT,
    "mimeType" TEXT,
    "fileSize" INTEGER,
    "status" "DatasetStatus" NOT NULL DEFAULT 'UPLOADED',
    "failureReason" TEXT,
    "semanticMapping" JSONB,
    "orgId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Dataset_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DatasetProfile" (
    "id" TEXT NOT NULL,
    "datasetId" TEXT NOT NULL,
    "rowCount" INTEGER,
    "columnCount" INTEGER,
    "columnMetadata" JSONB,
    "summaryStatistics" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DatasetProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DatasetInsight" (
    "id" TEXT NOT NULL,
    "datasetId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "confidence" TEXT,
    "evidence" JSONB,
    "competitorId" TEXT,
    "productId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DatasetInsight_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Dataset_orgId_idx" ON "Dataset"("orgId");

-- CreateIndex
CREATE INDEX "Dataset_status_idx" ON "Dataset"("status");

-- CreateIndex
CREATE INDEX "Dataset_createdAt_idx" ON "Dataset"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "DatasetProfile_datasetId_key" ON "DatasetProfile"("datasetId");

-- CreateIndex
CREATE INDEX "DatasetInsight_datasetId_idx" ON "DatasetInsight"("datasetId");

-- CreateIndex
CREATE INDEX "DatasetInsight_competitorId_idx" ON "DatasetInsight"("competitorId");

-- CreateIndex
CREATE INDEX "DatasetInsight_productId_idx" ON "DatasetInsight"("productId");

-- AddForeignKey
ALTER TABLE "Dataset" ADD CONSTRAINT "Dataset_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DatasetProfile" ADD CONSTRAINT "DatasetProfile_datasetId_fkey" FOREIGN KEY ("datasetId") REFERENCES "Dataset"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DatasetInsight" ADD CONSTRAINT "DatasetInsight_datasetId_fkey" FOREIGN KEY ("datasetId") REFERENCES "Dataset"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DatasetInsight" ADD CONSTRAINT "DatasetInsight_competitorId_fkey" FOREIGN KEY ("competitorId") REFERENCES "Competitor"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DatasetInsight" ADD CONSTRAINT "DatasetInsight_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE SET NULL ON UPDATE CASCADE;

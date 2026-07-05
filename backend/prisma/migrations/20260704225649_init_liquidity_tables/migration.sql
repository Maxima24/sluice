-- CreateEnum
CREATE TYPE "SnapshotSource" AS ENUM ('BOOT', 'POLL', 'EVENT', 'MANUAL');

-- CreateEnum
CREATE TYPE "RebalanceStatus" AS ENUM ('PENDING', 'BUILDING', 'INFLIGHT', 'SUCCEEDED', 'FAILED');

-- CreateEnum
CREATE TYPE "LedgerDirection" AS ENUM ('OUTBOUND', 'INBOUND');

-- CreateEnum
CREATE TYPE "LedgerEntryType" AS ENUM ('PRINCIPAL', 'FEE');

-- CreateTable
CREATE TABLE "channel_snapshot" (
    "id" TEXT NOT NULL,
    "channelId" TEXT NOT NULL,
    "peerPubkey" TEXT NOT NULL,
    "stateName" TEXT NOT NULL,
    "localBalance" DECIMAL(40,0) NOT NULL,
    "remoteBalance" DECIMAL(40,0) NOT NULL,
    "capacity" DECIMAL(40,0) NOT NULL,
    "isUdt" BOOLEAN NOT NULL DEFAULT false,
    "fundingUdtTypeScript" JSONB,
    "source" "SnapshotSource" NOT NULL,
    "capturedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "channel_snapshot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rebalance_job" (
    "id" TEXT NOT NULL,
    "idempotencyKey" TEXT NOT NULL,
    "sourceChannelId" TEXT NOT NULL,
    "destChannelId" TEXT NOT NULL,
    "amount" DECIMAL(40,0) NOT NULL,
    "maxFee" DECIMAL(40,0) NOT NULL,
    "status" "RebalanceStatus" NOT NULL DEFAULT 'PENDING',
    "paymentHash" TEXT,
    "feePaid" DECIMAL(40,0),
    "router" JSONB,
    "error" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "rebalance_job_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ledger_entry" (
    "id" TEXT NOT NULL,
    "rebalanceJobId" TEXT NOT NULL,
    "channelId" TEXT NOT NULL,
    "direction" "LedgerDirection" NOT NULL,
    "entryType" "LedgerEntryType" NOT NULL,
    "amount" DECIMAL(40,0) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ledger_entry_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "channel_snapshot_channelId_capturedAt_idx" ON "channel_snapshot"("channelId", "capturedAt");

-- CreateIndex
CREATE UNIQUE INDEX "rebalance_job_idempotencyKey_key" ON "rebalance_job"("idempotencyKey");

-- CreateIndex
CREATE INDEX "ledger_entry_rebalanceJobId_idx" ON "ledger_entry"("rebalanceJobId");

-- AddForeignKey
ALTER TABLE "ledger_entry" ADD CONSTRAINT "ledger_entry_rebalanceJobId_fkey" FOREIGN KEY ("rebalanceJobId") REFERENCES "rebalance_job"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

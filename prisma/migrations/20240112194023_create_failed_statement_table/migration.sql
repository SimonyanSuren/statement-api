-- CreateTable
CREATE TABLE "failed_statements" (
    "id" SERIAL NOT NULL,
    "txnReference" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "failed_statements_pkey" PRIMARY KEY ("id")
);

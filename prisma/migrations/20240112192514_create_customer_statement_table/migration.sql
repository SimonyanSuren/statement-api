-- CreateTable
CREATE TABLE "customer_statements" (
    "id" SERIAL NOT NULL,
    "txnReference" TEXT NOT NULL,
    "accountNumber" TEXT NOT NULL,
    "mutation" TEXT NOT NULL,
    "startBalance" DECIMAL(10,2) NOT NULL,
    "endBalance" DECIMAL(10,2) NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "customer_statements_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "customer_statements_txnReference_key" ON "customer_statements"("txnReference");

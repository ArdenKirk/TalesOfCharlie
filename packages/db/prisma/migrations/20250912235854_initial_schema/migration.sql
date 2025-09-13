-- CreateEnum
CREATE TYPE "public"."PostStatus" AS ENUM ('PUBLISHED', 'DENIED', 'PENDING');

-- CreateEnum
CREATE TYPE "public"."ReviewStatus" AS ENUM ('PENDING', 'APPROVED', 'DENIED');

-- CreateTable
CREATE TABLE "public"."User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "emailVerified" TIMESTAMP(3),
    "googleId" TEXT,
    "username" TEXT NOT NULL,
    "avatarUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Post" (
    "id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "domain" TEXT NOT NULL,
    "headlineExact" TEXT NOT NULL,
    "ledeExact" TEXT NOT NULL,
    "summaryConservativeMd" TEXT NOT NULL,
    "tags" TEXT[],
    "status" "public"."PostStatus" NOT NULL DEFAULT 'PUBLISHED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdByUserId" TEXT NOT NULL,
    "starCountCached" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "Post_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Star" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "postId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Star_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."WhitelistDomain" (
    "domain" TEXT NOT NULL,
    "addedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "addedBy" TEXT,

    CONSTRAINT "WhitelistDomain_pkey" PRIMARY KEY ("domain")
);

-- CreateTable
CREATE TABLE "public"."BlacklistDomain" (
    "domain" TEXT NOT NULL,
    "reason" TEXT,
    "addedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "addedBy" TEXT,

    CONSTRAINT "BlacklistDomain_pkey" PRIMARY KEY ("domain")
);

-- CreateTable
CREATE TABLE "public"."DomainReview" (
    "id" TEXT NOT NULL,
    "domain" TEXT NOT NULL,
    "status" "public"."ReviewStatus" NOT NULL DEFAULT 'PENDING',
    "monthlyVisitorsReported" INTEGER,
    "evidenceUrl" TEXT,
    "legitimacyAssessment" TEXT,
    "decidedBy" TEXT,
    "decidedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DomainReview_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "public"."User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "public"."User"("username");

-- CreateIndex
CREATE UNIQUE INDEX "Post_url_key" ON "public"."Post"("url");

-- CreateIndex
CREATE INDEX "Post_domain_idx" ON "public"."Post"("domain");

-- CreateIndex
CREATE INDEX "Star_postId_idx" ON "public"."Star"("postId");

-- CreateIndex
CREATE INDEX "Star_userId_idx" ON "public"."Star"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Star_userId_postId_key" ON "public"."Star"("userId", "postId");

-- CreateIndex
CREATE INDEX "DomainReview_domain_idx" ON "public"."DomainReview"("domain");

-- AddForeignKey
ALTER TABLE "public"."Post" ADD CONSTRAINT "Post_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Star" ADD CONSTRAINT "Star_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Star" ADD CONSTRAINT "Star_postId_fkey" FOREIGN KEY ("postId") REFERENCES "public"."Post"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

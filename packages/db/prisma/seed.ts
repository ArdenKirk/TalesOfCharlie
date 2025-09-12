import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    // seed a dev user and a couple of domains and tags
    await prisma.user.upsert({
        where: { email: 'dev@local.test' },
        update: {},
        create: { email: 'dev@local.test', username: 'dev' }
    });

    await prisma.whitelistDomain.upsert({
        where: { domain: 'example-whitelisted.com' },
        update: {},
        create: { domain: 'example-whitelisted.com' }
    });

    await prisma.blacklistDomain.upsert({
        where: { domain: 'example-blacklisted.com' },
        update: {},
        create: { domain: 'example-blacklisted.com', reason: 'Low quality source' }
    });
}

main().finally(() => prisma.$disconnect());

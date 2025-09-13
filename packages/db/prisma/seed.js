const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Starting database seeding...');

    // Create users with varied auth types and demographics
    console.log('👥 Creating users...');
    const users = [
        // Admin user (identified by email domain)
        { email: 'admin@talesofcharlie.com', username: 'talescharlie_admin', googleId: null, avatarUrl: null },
        // Regular users with Google OAuth
        { email: 'conservative1@gmail.com', username: 'conservative_voice', googleId: 'g123456789', avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=conservative1' },
        { email: 'tradvalues@gmail.com', username: 'traditional_values', googleId: 'g987654321', avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=tradvalues' },
        { email: 'free_speech@gmail.com', username: 'free_speech', googleId: 'g456123789', avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=free_speech' },
        { email: 'liberty_lovers@gmail.com', username: 'liberty_lovers', googleId: 'g789456123', avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=liberty_lovers' },
        // Magic link users (no Google OAuth)
        { email: 'patriot@email.com', username: 'patriot_news', googleId: null, avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=patriot' },
        { email: 'truth_seeker@email.com', username: 'truth_seeker', googleId: null, avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=truth_seeker' },
        { email: 'second_amendment@email.com', username: 'second_amendment', googleId: null, avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=second_amendment' },
    ];

    const createdUsers = [];
    for (const userData of users) {
        const user = await prisma.user.upsert({
            where: { email: userData.email },
            update: {},
            create: userData,
        });
        createdUsers.push(user);
    }

    console.log(`✅ Created ${createdUsers.length} users`);

    // Create domain lists (whitelisted and blacklisted)
    console.log('🌐 Creating domain lists...');

    // Conservative/reputable sources (whitelisted)
    const whitelistedDomains = [
        'nationalreview.com',
        'wsj.com', // Wall Street Journal
        'nypost.com',
        'dailycaller.com',
        'breitbart.com',
        'thefederalist.com',
        'townhall.com',
        'redstate.com',
        'theblaze.com',
        'pjmedia.com',
        'dailywire.com',
        'foxnews.com',
        'cnsnews.com',
        'judicialwatch.org',
        'heritage.org',
        'cato.org'
    ];

    // Left-leaning sources (for bias analysis, whitelisted but flagged)
    const whitelistedLeftDomains = [
        'cnn.com',
        'nytimes.com',
        'washingtonpost.com',
        'nbcnews.com',
        'huffpost.com',
        'msnbc.com',
        'politico.com',
        'theguardian.com',
        'bbc.com',
        'reuters.com'
    ];

    // Low-quality sources (blacklisted)
    const blacklistedDomains = [
        { domain: 'tabloid.news', reason: 'Sensationalist tabloid journalism' },
        { domain: 'conspiracy.center', reason: 'Known for baseless conspiracy theories' },
        { domain: 'fakeolitics.com', reason: 'Repeatedly published false information' },
        { domain: 'extremist.radio', reason: 'Promotes extremist viewpoints that violate platform standards' },
        { domain: 'satire.only', reason: 'Satire site that presents fiction as news' }
    ];

    const whitelistPromises = [...whitelistedDomains, ...whitelistedLeftDomains].map(domain =>
        prisma.whitelistDomain.upsert({
            where: { domain },
            update: {},
            create: { domain, addedAt: new Date() },
        })
    );

    await Promise.all(whitelistPromises);
    console.log(`✅ Whitelisted ${whitelistPromises.length} domains`);

    for (const blacklisted of blacklistedDomains) {
        await prisma.blacklistDomain.upsert({
            where: { domain: blacklisted.domain },
            update: {},
            create: { domain: blacklisted.domain, reason: blacklisted.reason, addedAt: new Date() },
        });
    }
    console.log(`✅ Blacklisted ${blacklistedDomains.length} domains`);

    // Create domain review submissions
    console.log('📋 Creating domain review submissions...');
    const domainReviews = [
        { domain: 'realclearpolitics.com', monthlyVisitors: 1200000, evidenceUrl: 'https://www.alexa.com/siteinfo/realclearpolitics.com', status: 'PENDING' },
        { domain: 'newsmax.com', monthlyVisitors: 950000, evidenceUrl: 'https://www.alexa.com/siteinfo/newsmax.com', status: 'PENDING' },
        { domain: 'oann.com', monthlyVisitors: 800000, evidenceUrl: 'https://www.alexa.com/siteinfo/oann.com', status: 'APPROVED' },
        { domain: 'epochtimes.com', monthlyVisitors: 750000, evidenceUrl: 'https://www.alexa.com/siteinfo/epochtimes.com', status: 'DENIED' }
    ];

    for (const review of domainReviews) {
        await prisma.domainReview.create({
            data: {
                domain: review.domain,
                monthlyVisitorsReported: review.monthlyVisitors,
                evidenceUrl: review.evidenceUrl,
                status: review.status,
                createdAt: new Date(),
            },
        });
    }
    console.log(`✅ Created ${domainReviews.length} domain review submissions`);

    // Create sample articles with processed content
    console.log('📰 Creating sample articles...');
    const sampleArticles = [
        {
            url: 'https://nationalreview.com/2024/09/conservative-voices-silenced/',
            domain: 'nationalreview.com',
            headlineExact: 'Conservative Voices Being Silenced in Media Landscape',
            ledeExact: 'Traditional conservative perspectives face unprecedented challenges as mainstream platforms increasingly prioritize progressive narratives.',
            summaryConservativeMd: `**Conservative Analysis**: This excellent piece from National Review highlights the urgent crisis facing authentic conservative journalism. The mainstream media's increasingly monolithic progressive viewpoint threatens to marginalize traditional American values and the voices that defend them. Conservatives should recognize this as part of a broader cultural battle where fundamental American principles - individual liberty, family values, and economic freedom - are under systematic assault.

The article demonstrates how platforms that once claimed neutrality have embraced ideological conformity, silencing dissenting views that challenge progressive orthodoxy. This isn't just about media representation; it's about maintaining the intellectual diversity essential to our republic's health.`,
            tags: ['politics', 'media-bias', 'conservative', 'free-speech', 'traditional-values'],
            status: 'PUBLISHED',
            createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
        },
        {
            url: 'https://nypost.com/2024/08/liberty-vs-control/',
            domain: 'nypost.com',
            headlineExact: 'Individual Liberty Under Attack from Progressive Policies',
            ledeExact: 'Government overreach threatens fundamental American freedoms as progressive agendas prioritize control over personal responsibility.',
            summaryConservativeMd: `**Conservative Analysis**: Another outstanding piece from New York Post that cuts to the heart of what conservatives have warned about for decades. The progressive movement's relentless push toward centralized control contradicts America's founding principles of individual liberty and self-determination. This story exemplifies why conservatives must remain vigilant against government expansionism that undermines personal responsibility and economic freedom.

The article showcases how bureaucratic overreach, championed by progressive policies, diminishes individual agency while creating dependency on government institutions. Conservatives understand that the path to American prosperity lies in maximizing personal freedom, not state control.`,
            tags: ['politics', 'government-overreach', 'individual-liberty', 'conservative', 'progressivism'],
            status: 'PUBLISHED',
            createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
        },
        {
            url: 'https://cnn.com/2024/progressive-progress/',
            domain: 'cnn.com',
            headlineExact: 'Progressive Policies Drive Positive Change',
            ledeExact: 'Democratic reforms bring essential improvements and address systemic inequalities that benefit society as a whole.',
            summaryConservativeMd: `**Conservative Analysis**: CNN's editorial bias is on full display here, presenting progressive wish fulfillment as objective journalism. While claiming to advance "positive change," the article demonstrates classic progressive framing that avoids economic reality and individual accountability. Conservatives understand that real prosperity doesn't come from government transfers but from economic freedom, personal responsibility, and market-driven innovation.

The piece's portrayal of progressive policies as universally beneficial ignores the economic costs and reduced freedom inherent in expanded government programs. This article implements the classic progressive technique of presenting government's redistribution of private wealth as a public good, concealing who ultimately bears the costs.`,
            tags: ['liberal-bias', 'mainstream-media', 'progressive-agenda', 'economics', 'media-watch'],
            status: 'PUBLISHED',
            createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
        },
        {
            url: 'https://wsj.com/opinion/traditional-marriage/',
            domain: 'wsj.com',
            headlineExact: 'Traditional Marriage Supports Family and Society',
            ledeExact: 'Research and experience demonstrate that traditional family structures provide optimal conditions for child development and societal stability.',
            summaryConservativeMd: `**Conservative Analysis**: The Wall Street Journal continues its tradition of intellectual rigor and commitment to timeless truths. This piece provides compelling evidence for the conservative understanding that traditional family structures - mothers and fathers committed to each other and their children - provide the optimal environment for human flourishing. The article demonstrates how progressive experimentation with family structures has often come at great cost to children and society.

Conservatives recognize that strong, stable families are the foundation of free societies. This article reinforces why we must resist attempts to redefine marriage and family in ways that prioritize adult desires over children's well-being.`,
            tags: ['traditional-values', 'family', 'conservative', 'politics', 'culture-war'],
            status: 'PUBLISHED',
            createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
        },
        {
            url: 'https://tabloid.news/sensational-story/',
            domain: 'tabloid.news',
            status: 'DENIED', // Blacklisted domain
            createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
        }
    ];

    const createdPosts = [];
    for (const articleData of sampleArticles) {
        let post = await prisma.post.upsert({
            where: { url: articleData.url },
            update: {},
            create: {
                url: articleData.url,
                domain: articleData.domain,
                headlineExact: articleData.headlineExact || 'Processing...',
                ledeExact: articleData.ledeExact || 'Processing...',
                summaryConservativeMd: articleData.summaryConservativeMd || 'Processing...',
                tags: articleData.tags || [],
                status: articleData.status,
                starCountCached: 0,
                createdAt: articleData.createdAt || new Date(),
                createdByUserId: createdUsers[Math.floor(Math.random() * createdUsers.length)].id,
            },
        });
        createdPosts.push(post);
    }

    console.log(`✅ Created ${createdPosts.length} sample articles`);

    // Create stars on popular articles
    console.log('⭐ Creating article interactions...');
    const publishedPosts = createdPosts.filter(p => p.status === 'PUBLISHED');

    for (let i = 0; i < publishedPosts.length; i++) {
        const post = publishedPosts[i];
        // Each published post gets 1-5 stars from random users
        const starCount = Math.floor(Math.random() * 5) + 1;

        for (let j = 0; j < starCount; j++) {
            const randomUser = createdUsers[Math.floor(Math.random() * createdUsers.length)];

            // Check if star already exists
            const existingStar = await prisma.star.findUnique({
                where: {
                    userId_postId: {
                        userId: randomUser.id,
                        postId: post.id,
                    },
                },
            });

            if (!existingStar) {
                await prisma.star.create({
                    data: {
                        userId: randomUser.id,
                        postId: post.id,
                        createdAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000), // Random within last 7 days
                    },
                });
            }
        }

        // Update star count cache
        const actualStarCount = await prisma.star.count({
            where: { postId: post.id },
        });

        await prisma.post.update({
            where: { id: post.id },
            data: { starCountCached: actualStarCount },
        });
    }

    console.log('✅ Created article star interactions');

    // Note: MagicLink table may not exist yet - skip for now
    console.log('📧 Magic links not created (table exists but may not be migrated)');
    try {
        const magicLinks = [
            {
                email: 'demo@talesofcharlie.com',
                token: 'demo-token-valid',
                expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
            }
        ];

        for (const link of magicLinks) {
            await prisma.magicLink.create({
                data: {
                    email: link.email,
                    token: await require('bcryptjs').hash(link.token, 12),
                    expiresAt: link.expiresAt,
                },
            });
        }
        console.log('✅ Created magic link entries');
    } catch (error) {
        console.log('⚠️  Magic links skipped (table may not exist in current migration)');
    }

    console.log('🎉 Database seeding completed successfully!');
    console.log('\n--- Sample Data Summary ---');
    console.log(`👥 Users: ${createdUsers.length}`);
    console.log(`🌐 Domains: ${whitelistPromises.length} whitelisted, ${blacklistedDomains.length} blacklisted`);
    console.log(`📋 Domain Reviews: ${domainReviews.length}`);
    console.log(`📰 Articles: ${publishedPosts.length} published`);
    console.log('⭐ Star interactions: Created');
    console.log('📧 Magic links: Demo links available');
    console.log('\n🚀 Tales of Charlie is ready for development and demos!');
}

main()
    .then(() => prisma.$disconnect())
    .catch((e) => {
        console.error('❌ Database seeding failed:', e);
        return prisma.$disconnect().finally(() => process.exit(1));
    });

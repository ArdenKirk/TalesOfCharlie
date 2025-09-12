export type MockAiSummary = { decision: 'APPROVE'|'DENY', summaryMd: string, tags: string[] };

export function getMockChoices(url: string): MockAiSummary[] {
    return [
        { decision: 'APPROVE', summaryMd: `**Strong conservative summary** for ${url}`, tags: ['politics','media-bias'] },
        { decision: 'DENY', summaryMd: `Not aligned with site standards.`, tags: [] }
    ];
}

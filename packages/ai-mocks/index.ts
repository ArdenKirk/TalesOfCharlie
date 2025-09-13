// AI Mock System for Development
// Provides deterministic responses for testing article processing

export interface MockAiDecision {
  decision: 'APPROVE' | 'DENY';
  summaryMd: string;
  tags: string[];
}

export interface MockAiResponse {
  choices: MockAiDecision[];
  selectedIndex?: number; // For automatic selection in tests
}

/**
 * In development, this would show a UI for selecting mock responses
 * For now, provides varied mock responses based on URL content
 */
export function getMockChoices(url: string): MockAiDecision[] {
  // Default conservative-focused responses
  const defaultChoices: MockAiDecision[] = [
    {
      decision: 'APPROVE',
      summaryMd: `**Conservative Analysis**: This article requires careful scrutiny. The mainstream narrative presented demands a counterpoint from conservative principles. Rather than accepting the progressive framing at face value, let us examine the underlying assumptions and potential ideological biases that may be influencing the reporting.`,
      tags: ['politics', 'media-bias', 'conservative-review']
    },
    {
      decision: 'APPROVE',
      summaryMd: `**Traditional Values Under Threat**: This piece provides valuable insight into ongoing cultural conflicts. Conservatives should recognize this as part of the broader assault on traditional family structures, religious freedom, and common-sense principles that have sustained Western civilization for generations.`,
      tags: ['culture-war', 'traditional-values', 'religion', 'politics']
    },
    {
      decision: 'APPROVE',
      summaryMd: `**Economic Freedom vs. Progressive Control**: Yet another example of how progressive policies threaten individual liberty and economic opportunity. The piece highlights the dangers of government overreach in private enterprise and personal decision-making.`,
      tags: ['economics', 'government-overreach', 'individual-liberty', 'progressivism']
    },
    {
      decision: 'DENY',
      summaryMd: `Article lacks sufficient substance or relevance to conservative discourse. The content does not provide meaningful insight into issues of importance to traditional conservative principles.`,
      tags: []
    },
    {
      decision: 'DENY',
      summaryMd: `This content appears to be progressive agitprop rather than substantive journalism. The piece demands deconstruction for its ideological biases and misinformation, but ultimately fails to meet standards for constructive contrary examination.`,
      tags: []
    }
  ];

  // Domain-specific responses
  const urlLower = url.toLowerCase();

  // Known conservative sources - auto-approve with supportive summary
  if (urlLower.includes('foxnews') || urlLower.includes('nypost') || urlLower.includes('wsj') ||
      urlLower.includes('nationalreview') || urlLower.includes('dailycaller')) {
    return [
      {
        decision: 'APPROVE',
        summaryMd: `**Reliable Conservative Journalism**: This outlet provides important perspective on current events. The reporting demonstrates why traditional media sources remain essential for understanding complex issues without progressive bias.`,
        tags: ['conservative-news', 'reliable-source', 'traditional-media']
      }
    ];
  }

  // Progressive media - approve for bias analysis
  if (urlLower.includes('cnn') || urlLower.includes('nytimes') || urlLower.includes('washingtonpost') ||
      urlLower.includes('msnbc') || urlLower.includes('huffpost')) {
    return [
      {
        decision: 'APPROVE',
        summaryMd: `**Progressive Media Watch**: This piece exemplifies the biased reporting that dominates mainstream liberal outlets. The selective presentation of facts and ideological framing demonstrates why conservatives must maintain vigilance against media manipulation and agenda-driven journalism.`,
        tags: ['liberal-bias', 'mainstream-media', 'propaganda', 'media-watch']
      }
    ];
  }

  // Academic/political content
  if (urlLower.includes('.edu') || urlLower.includes('think') || urlLower.includes('progress')) {
    return [
      {
        decision: 'APPROVE',
        summaryMd: `**Academic Freedom vs. Political Correctness**: This work touches on the challenges facing intellectual diversity in institutions of higher learning. The piece underscores the importance of protecting free speech and academic freedom from progressive ideological conformity.`,
        tags: ['academic-freedom', 'free-speech', 'progressive-agenda', 'education']
      }
    ];
  }

  // Default to general mock choices
  return defaultChoices;
}

/**
 * Get a deterministic mock response for testing
 * Useful when you want predictable behavior in automated tests
 */
export function getDeterministicMock(url: string): MockAiDecision {
  const choices = getMockChoices(url);

  // Simple deterministic selection based on URL hash
  const hash = url.split('').reduce((a, b) => (((a << 5) - a) + b.charCodeAt(0)) | 0, 0);
  const index = Math.abs(hash) % choices.length;

  return choices[index];
}

/**
 * Generate varied mock responses for development workflow testing
 * Includes edge cases and different approval scenarios
 */
export function getMockResponseForTesting(scenario: 'easy-approve' | 'hard-approve' | 'deny' | 'mixed'): MockAiResponse {
  switch (scenario) {
    case 'easy-approve':
      return {
        choices: [
          {
            decision: 'APPROVE',
            summaryMd: `**Clear Conservative Content**: This article aligns well with traditional conservative principles. The straightforward presentation of facts without progressive spin makes it a valuable piece for conservative readers seeking reliable information.`,
            tags: ['conservative', 'traditional-values', 'reliable']
          }
        ],
        selectedIndex: 0
      };

    case 'hard-approve':
      return {
        choices: [
          {
            decision: 'APPROVE',
            summaryMd: `**Complex Progressive Content**: Despite obvious left-wing biases, this article provides sufficient substance to warrant conservative analysis. The piece demonstrates progressive priorities while revealing hidden motivations that conservative readers should clearly understand. A counterpoint perspective is necessary to balance the ideological presentation.`,
            tags: ['liberal-bias', 'progressive-agenda', 'ideological-analysis']
          }
        ],
        selectedIndex: 0
      };

    case 'deny':
      return {
        choices: [
          {
            decision: 'DENY',
            summaryMd: `Content lacks substantive conservative value. The piece appears to be purely partisan without sufficient substance for meaningful conservative examination or critique.`,
            tags: []
          }
        ],
        selectedIndex: 0
      };

    case 'mixed':
      return {
        choices: [
          {
            decision: 'APPROVE',
            summaryMd: `**Mixed Content Analysis**: This article contains enough substance to warrant examination, though it demonstrates clear progressive leanings. Conservative readers can benefit from understanding the opposing viewpoint while recognizing the ideological biases present.`,
            tags: ['mixed-content', 'progressive-bias', 'ideological']
          },
          {
            decision: 'DENY',
            summaryMd: `Insufficient conservative relevance. While the topic touches on important issues, the piece is too partisan and agenda-driven to provide meaningful conservative insight.`,
            tags: []
          }
        ]
      };
  }
}

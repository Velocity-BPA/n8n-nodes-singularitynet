/**
 * SingularityNET Known Organizations
 *
 * Contains information about well-known organizations on the platform.
 */

export interface OrganizationInfo {
	id: string;
	name: string;
	description: string;
	website?: string;
	featured: boolean;
}

/**
 * Featured/Well-known organizations on SingularityNET
 */
export const KNOWN_ORGANIZATIONS: OrganizationInfo[] = [
	{
		id: 'snet',
		name: 'SingularityNET',
		description: 'Official SingularityNET organization providing core AI services',
		website: 'https://singularitynet.io',
		featured: true,
	},
	{
		id: 'nunet',
		name: 'NuNet',
		description: 'Decentralized computing platform for AI workloads',
		website: 'https://nunet.io',
		featured: true,
	},
	{
		id: 'rejuve',
		name: 'Rejuve.AI',
		description: 'AI-powered longevity research platform',
		website: 'https://rejuve.ai',
		featured: true,
	},
	{
		id: 'singularitynetfoundation',
		name: 'SingularityNET Foundation',
		description: 'Foundation providing public AI research services',
		website: 'https://singularitynet.io',
		featured: true,
	},
	{
		id: 'opencog',
		name: 'OpenCog',
		description: 'Artificial General Intelligence research organization',
		website: 'https://opencog.org',
		featured: true,
	},
	{
		id: 'mindplex',
		name: 'Mindplex',
		description: 'AI-powered content curation and social platform',
		website: 'https://mindplex.ai',
		featured: true,
	},
	{
		id: 'hypercycle',
		name: 'HyperCycle',
		description: 'High-speed ledgerless blockchain for AI',
		website: 'https://hypercycle.ai',
		featured: true,
	},
	{
		id: 'sophiaverse',
		name: 'SophiaVerse',
		description: 'AI-powered metaverse experiences',
		website: 'https://sophiaverse.ai',
		featured: false,
	},
	{
		id: 'awakening-health',
		name: 'Awakening Health',
		description: 'Healthcare AI services and robotics',
		website: 'https://awakeninghealth.ai',
		featured: false,
	},
	{
		id: 'zarqa',
		name: 'Zarqa',
		description: 'AI services for Arabic language processing',
		website: '',
		featured: false,
	},
];

/**
 * Get organization by ID
 */
export function getOrganizationById(id: string): OrganizationInfo | undefined {
	return KNOWN_ORGANIZATIONS.find((org) => org.id === id);
}

/**
 * Get featured organizations
 */
export function getFeaturedOrganizations(): OrganizationInfo[] {
	return KNOWN_ORGANIZATIONS.filter((org) => org.featured);
}

/**
 * Organization categories
 */
export const ORGANIZATION_CATEGORIES = [
	'AI Research',
	'Healthcare',
	'Language Processing',
	'Computer Vision',
	'Robotics',
	'Finance',
	'Education',
	'Entertainment',
	'Data Analysis',
	'Infrastructure',
];

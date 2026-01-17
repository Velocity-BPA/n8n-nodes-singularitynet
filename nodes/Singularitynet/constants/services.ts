/**
 * SingularityNET Service Constants
 *
 * Contains service categories, tags, and example service information.
 */

/**
 * Service categories on the marketplace
 */
export const SERVICE_CATEGORIES = [
	{
		id: 'computer-vision',
		name: 'Computer Vision',
		description: 'Image and video analysis services',
		icon: 'eye',
	},
	{
		id: 'nlp',
		name: 'Natural Language Processing',
		description: 'Text analysis, translation, and generation',
		icon: 'message-square',
	},
	{
		id: 'speech',
		name: 'Speech & Audio',
		description: 'Speech recognition, synthesis, and audio processing',
		icon: 'mic',
	},
	{
		id: 'reasoning',
		name: 'Reasoning & AGI',
		description: 'Logic, reasoning, and general AI services',
		icon: 'cpu',
	},
	{
		id: 'data-analysis',
		name: 'Data Analysis',
		description: 'Statistical analysis and data processing',
		icon: 'bar-chart',
	},
	{
		id: 'robotics',
		name: 'Robotics',
		description: 'Robot control and simulation services',
		icon: 'settings',
	},
	{
		id: 'healthcare',
		name: 'Healthcare',
		description: 'Medical AI and health analysis',
		icon: 'heart',
	},
	{
		id: 'finance',
		name: 'Finance',
		description: 'Financial analysis and prediction',
		icon: 'dollar-sign',
	},
	{
		id: 'generative',
		name: 'Generative AI',
		description: 'Content generation and creative AI',
		icon: 'image',
	},
	{
		id: 'utilities',
		name: 'Utilities',
		description: 'Helper services and tools',
		icon: 'tool',
	},
];

/**
 * Common service tags
 */
export const COMMON_TAGS = [
	'image-classification',
	'object-detection',
	'face-recognition',
	'sentiment-analysis',
	'text-generation',
	'translation',
	'summarization',
	'question-answering',
	'speech-to-text',
	'text-to-speech',
	'image-generation',
	'video-analysis',
	'time-series',
	'anomaly-detection',
	'recommendation',
	'chatbot',
	'ocr',
	'named-entity-recognition',
	'semantic-similarity',
	'language-detection',
];

/**
 * Example/popular services on the platform
 */
export const EXAMPLE_SERVICES = [
	{
		organizationId: 'snet',
		serviceId: 'example-service',
		name: 'Example Service',
		description: 'A simple example service demonstrating the platform',
		category: 'utilities',
		tags: ['example', 'demo'],
	},
	{
		organizationId: 'snet',
		serviceId: 'face-detect',
		name: 'Face Detection',
		description: 'Detect faces in images with bounding boxes',
		category: 'computer-vision',
		tags: ['face-recognition', 'object-detection'],
	},
	{
		organizationId: 'snet',
		serviceId: 'named-entity-recognition',
		name: 'Named Entity Recognition',
		description: 'Extract named entities from text',
		category: 'nlp',
		tags: ['named-entity-recognition', 'nlp'],
	},
	{
		organizationId: 'snet',
		serviceId: 'sentiment-analysis',
		name: 'Sentiment Analysis',
		description: 'Analyze sentiment in text documents',
		category: 'nlp',
		tags: ['sentiment-analysis', 'nlp'],
	},
	{
		organizationId: 'snet',
		serviceId: 'image-generation',
		name: 'Image Generation',
		description: 'Generate images from text descriptions',
		category: 'generative',
		tags: ['image-generation', 'generative'],
	},
	{
		organizationId: 'snet',
		serviceId: 'translation',
		name: 'Language Translation',
		description: 'Translate text between languages',
		category: 'nlp',
		tags: ['translation', 'nlp'],
	},
	{
		organizationId: 'snet',
		serviceId: 'speech-recognition',
		name: 'Speech Recognition',
		description: 'Convert speech audio to text',
		category: 'speech',
		tags: ['speech-to-text', 'audio'],
	},
	{
		organizationId: 'snet',
		serviceId: 'text-to-speech',
		name: 'Text to Speech',
		description: 'Convert text to natural sounding speech',
		category: 'speech',
		tags: ['text-to-speech', 'audio'],
	},
	{
		organizationId: 'snet',
		serviceId: 'summarization',
		name: 'Text Summarization',
		description: 'Generate summaries of long documents',
		category: 'nlp',
		tags: ['summarization', 'nlp'],
	},
	{
		organizationId: 'snet',
		serviceId: 'question-answering',
		name: 'Question Answering',
		description: 'Answer questions based on provided context',
		category: 'nlp',
		tags: ['question-answering', 'nlp'],
	},
];

/**
 * Service pricing tiers
 */
export const PRICING_TIERS = {
	FREE: 0,
	BASIC: 1,
	STANDARD: 10,
	PREMIUM: 100,
	ENTERPRISE: 1000,
};

/**
 * Default service group name
 */
export const DEFAULT_SERVICE_GROUP = 'default_group';

/**
 * Service metadata schema version
 */
export const METADATA_VERSION = '1.0.0';

/**
 * Service encoding types
 */
export const ENCODING_TYPES = {
	PROTO: 'proto',
	JSON: 'json',
	GRPC: 'grpc',
};

/**
 * Service protocol types
 */
export const PROTOCOL_TYPES = {
	GRPC: 'grpc',
	HTTP: 'http',
	HTTPS: 'https',
	PROCESS: 'process',
};

/**
 * Maximum values for service operations
 */
export const SERVICE_LIMITS = {
	MAX_FREE_CALLS: 15,
	MAX_BATCH_SIZE: 100,
	MAX_TIMEOUT_MS: 300000, // 5 minutes
	MAX_INPUT_SIZE_MB: 10,
	MAX_OUTPUT_SIZE_MB: 50,
};

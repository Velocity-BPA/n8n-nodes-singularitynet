/**
 * Protobuf Utilities
 *
 * Handles Protocol Buffer encoding and decoding for SingularityNET
 * service invocations. Services define their API using .proto files.
 */

import * as protobuf from 'protobufjs';

/**
 * Service method definition
 */
export interface ServiceMethod {
	name: string;
	inputType: string;
	outputType: string;
	clientStreaming: boolean;
	serverStreaming: boolean;
}

/**
 * Service definition
 */
export interface ServiceDefinition {
	name: string;
	methods: ServiceMethod[];
	package: string;
}

/**
 * Parsed proto result
 */
export interface ParsedProto {
	root: protobuf.Root;
	services: ServiceDefinition[];
	messages: string[];
}

/**
 * Parse a proto file content
 */
export function parseProtoContent(protoContent: string): ParsedProto {
	const root = protobuf.parse(protoContent).root;
	const services: ServiceDefinition[] = [];
	const messages: string[] = [];

	// Extract services
	root.nestedArray.forEach((nested) => {
		if (nested instanceof protobuf.Service) {
			const service: ServiceDefinition = {
				name: nested.name,
				package: nested.parent?.fullName?.replace(/^\./, '') || '',
				methods: [],
			};

			nested.methodsArray.forEach((method) => {
				service.methods.push({
					name: method.name,
					inputType: method.requestType,
					outputType: method.responseType,
					clientStreaming: method.requestStream || false,
					serverStreaming: method.responseStream || false,
				});
			});

			services.push(service);
		} else if (nested instanceof protobuf.Type) {
			messages.push(nested.fullName);
		}
	});

	return { root, services, messages };
}

/**
 * Load proto from URL (IPFS or HTTP)
 */
export async function loadProtoFromUrl(url: string): Promise<ParsedProto> {
	const response = await fetch(url);
	if (!response.ok) {
		throw new Error(`Failed to fetch proto file: ${response.statusText}`);
	}
	const content = await response.text();
	return parseProtoContent(content);
}

/**
 * Get method input type schema
 */
export function getMethodInputSchema(
	proto: ParsedProto,
	serviceName: string,
	methodName: string
): Record<string, unknown> | null {
	const service = proto.services.find((s) => s.name === serviceName);
	if (!service) return null;

	const method = service.methods.find((m) => m.name === methodName);
	if (!method) return null;

	const messageType = proto.root.lookupType(method.inputType);
	return extractMessageSchema(messageType);
}

/**
 * Get method output type schema
 */
export function getMethodOutputSchema(
	proto: ParsedProto,
	serviceName: string,
	methodName: string
): Record<string, unknown> | null {
	const service = proto.services.find((s) => s.name === serviceName);
	if (!service) return null;

	const method = service.methods.find((m) => m.name === methodName);
	if (!method) return null;

	const messageType = proto.root.lookupType(method.outputType);
	return extractMessageSchema(messageType);
}

/**
 * Extract schema from protobuf message type
 */
function extractMessageSchema(messageType: protobuf.Type): Record<string, unknown> {
	const schema: Record<string, unknown> = {
		type: 'object',
		properties: {} as Record<string, unknown>,
		required: [] as string[],
	};

	const properties = schema.properties as Record<string, unknown>;
	const required = schema.required as string[];

	messageType.fieldsArray.forEach((field) => {
		const fieldSchema: Record<string, unknown> = {
			type: protoTypeToJsonType(field.type),
		};

		if (field.repeated) {
			fieldSchema.type = 'array';
			fieldSchema.items = { type: protoTypeToJsonType(field.type) };
		}

		if (field.comment) {
			fieldSchema.description = field.comment;
		}

		properties[field.name] = fieldSchema;

		if (field.required) {
			required.push(field.name);
		}
	});

	return schema;
}

/**
 * Convert proto type to JSON Schema type
 */
function protoTypeToJsonType(protoType: string): string {
	const typeMap: Record<string, string> = {
		double: 'number',
		float: 'number',
		int32: 'integer',
		int64: 'integer',
		uint32: 'integer',
		uint64: 'integer',
		sint32: 'integer',
		sint64: 'integer',
		fixed32: 'integer',
		fixed64: 'integer',
		sfixed32: 'integer',
		sfixed64: 'integer',
		bool: 'boolean',
		string: 'string',
		bytes: 'string', // Base64 encoded
	};

	return typeMap[protoType] || 'object';
}

/**
 * Encode a message using protobuf
 */
export function encodeMessage(
	proto: ParsedProto,
	messageTypeName: string,
	data: Record<string, unknown>
): Uint8Array {
	const messageType = proto.root.lookupType(messageTypeName);
	const errMsg = messageType.verify(data);
	if (errMsg) {
		throw new Error(`Invalid message: ${errMsg}`);
	}
	const message = messageType.create(data);
	return messageType.encode(message).finish();
}

/**
 * Decode a protobuf message
 */
export function decodeMessage(
	proto: ParsedProto,
	messageTypeName: string,
	buffer: Uint8Array
): Record<string, unknown> {
	const messageType = proto.root.lookupType(messageTypeName);
	const message = messageType.decode(buffer);
	return messageType.toObject(message, {
		longs: String,
		enums: String,
		bytes: String, // Base64
		defaults: true,
	});
}

/**
 * Get all methods for a service
 */
export function getServiceMethods(proto: ParsedProto, serviceName: string): ServiceMethod[] {
	const service = proto.services.find((s) => s.name === serviceName);
	return service?.methods || [];
}

/**
 * Generate method signature string
 */
export function getMethodSignature(method: ServiceMethod): string {
	let signature = '';

	if (method.clientStreaming) {
		signature += 'stream ';
	}

	signature += `${method.inputType} -> `;

	if (method.serverStreaming) {
		signature += 'stream ';
	}

	signature += method.outputType;

	return signature;
}

/**
 * Create a JSON representation of service API
 */
export function serviceToJson(proto: ParsedProto): Record<string, unknown> {
	return {
		services: proto.services.map((service) => ({
			name: service.name,
			package: service.package,
			methods: service.methods.map((method) => ({
				name: method.name,
				input: method.inputType,
				output: method.outputType,
				signature: getMethodSignature(method),
				streaming: {
					client: method.clientStreaming,
					server: method.serverStreaming,
				},
			})),
		})),
		messages: proto.messages,
	};
}

/**
 * Validate input data against method input type
 */
export function validateMethodInput(
	proto: ParsedProto,
	serviceName: string,
	methodName: string,
	input: Record<string, unknown>
): { valid: boolean; errors: string[] } {
	const errors: string[] = [];

	const service = proto.services.find((s) => s.name === serviceName);
	if (!service) {
		errors.push(`Service '${serviceName}' not found`);
		return { valid: false, errors };
	}

	const method = service.methods.find((m) => m.name === methodName);
	if (!method) {
		errors.push(`Method '${methodName}' not found in service '${serviceName}'`);
		return { valid: false, errors };
	}

	try {
		const messageType = proto.root.lookupType(method.inputType);
		const errMsg = messageType.verify(input);
		if (errMsg) {
			errors.push(errMsg);
		}
	} catch (err) {
		errors.push(`Failed to validate input: ${err}`);
	}

	return { valid: errors.length === 0, errors };
}

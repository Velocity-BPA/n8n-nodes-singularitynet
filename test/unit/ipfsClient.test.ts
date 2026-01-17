/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import { IpfsClient } from '../../nodes/Singularitynet/transport/ipfsClient';

describe('IPFS Client', () => {
	describe('Hash validation', () => {
		test('validates CIDv0 hashes correctly', () => {
			expect(IpfsClient.isValidHash('QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG')).toBe(true);
			expect(IpfsClient.isValidHash('QmInvalidHash')).toBe(false);
		});

		test('validates CIDv1 hashes correctly', () => {
			expect(IpfsClient.isValidHash('bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi')).toBe(true);
		});

		test('handles ipfs:// prefix', () => {
			expect(IpfsClient.isValidHash('ipfs://QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG')).toBe(true);
		});

		test('handles /ipfs/ prefix', () => {
			expect(IpfsClient.isValidHash('/ipfs/QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG')).toBe(true);
		});
	});

	describe('URL generation', () => {
		test('generates correct URLs', () => {
			const client = new IpfsClient('https://ipfs.io/ipfs/');
			expect(client.getUrl('QmTest123')).toBe('https://ipfs.io/ipfs/QmTest123');
		});

		test('handles trailing slash in gateway', () => {
			const client1 = new IpfsClient('https://ipfs.io/ipfs/');
			const client2 = new IpfsClient('https://ipfs.io/ipfs');
			expect(client1.getGateway()).toBe('https://ipfs.io/ipfs/');
			expect(client2.getGateway()).toBe('https://ipfs.io/ipfs/');
		});
	});
});

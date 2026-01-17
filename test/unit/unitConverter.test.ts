/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import {
	cogsToAgix,
	agixToCogs,
	weiToEth,
	ethToWei,
	lovelaceToAda,
	adaToLovelace,
	formatAgix,
	formatEth,
	formatAda,
} from '../../nodes/Singularitynet/utils/unitConverter';

describe('Unit Converter', () => {
	describe('AGIX/Cogs conversion', () => {
		test('cogsToAgix converts correctly', () => {
			expect(cogsToAgix(BigInt(100000000))).toBe('1');
			expect(cogsToAgix(BigInt(250000000))).toBe('2.5');
			expect(cogsToAgix(BigInt(0))).toBe('0');
		});

		test('agixToCogs converts correctly', () => {
			expect(agixToCogs(1)).toBe(BigInt(100000000));
			expect(agixToCogs(2.5)).toBe(BigInt(250000000));
			expect(agixToCogs(0)).toBe(BigInt(0));
		});
	});

	describe('ETH/Wei conversion', () => {
		test('weiToEth converts correctly', () => {
			expect(weiToEth(BigInt('1000000000000000000'))).toBe('1');
			expect(weiToEth(BigInt(0))).toBe('0');
		});

		test('ethToWei converts correctly', () => {
			expect(ethToWei(1)).toBe(BigInt('1000000000000000000'));
			expect(ethToWei(0)).toBe(BigInt(0));
		});
	});

	describe('ADA/Lovelace conversion', () => {
		test('lovelaceToAda converts correctly', () => {
			expect(lovelaceToAda(BigInt(1000000))).toBe('1');
			expect(lovelaceToAda(BigInt(0))).toBe('0');
		});

		test('adaToLovelace converts correctly', () => {
			expect(adaToLovelace(1)).toBe(BigInt(1000000));
			expect(adaToLovelace(0)).toBe(BigInt(0));
		});
	});

	describe('Formatting functions', () => {
		test('formatAgix formats correctly', () => {
			expect(formatAgix(BigInt(100000000))).toBe('1 AGIX');
			expect(formatAgix(BigInt(250000000))).toBe('2.5 AGIX');
		});

		test('formatEth formats correctly', () => {
			expect(formatEth(BigInt('1000000000000000000'))).toBe('1 ETH');
		});

		test('formatAda formats correctly', () => {
			expect(formatAda(BigInt(1000000))).toBe('1 ADA');
		});
	});
});

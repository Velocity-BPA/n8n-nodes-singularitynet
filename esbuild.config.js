const esbuild = require('esbuild');
const { glob } = require('glob');
const path = require('path');

async function build() {
	// Find all TypeScript entry points
	const nodeFiles = await glob('nodes/**/*.node.ts');
	const credentialFiles = await glob('credentials/**/*.credentials.ts');
	
	const entryPoints = [...nodeFiles, ...credentialFiles];
	
	console.log('Building entry points:', entryPoints);

	// Build each entry point
	for (const entry of entryPoints) {
		const outfile = entry
			.replace(/\.ts$/, '.js')
			.replace(/^nodes\//, 'dist/nodes/')
			.replace(/^credentials\//, 'dist/credentials/');
		
		const outdir = path.dirname(outfile);
		
		try {
			await esbuild.build({
				entryPoints: [entry],
				bundle: true,
				platform: 'node',
				target: 'node18',
				outfile,
				format: 'cjs',
				sourcemap: true,
				// Mark n8n-workflow as external since it's provided by n8n
				external: ['n8n-workflow', 'n8n-core'],
				// Resolve node_modules
				resolveExtensions: ['.ts', '.js', '.json'],
				// Handle TypeScript
				loader: {
					'.ts': 'ts',
				},
				// Log level
				logLevel: 'info',
			});
			console.log(`Built: ${outfile}`);
		} catch (error) {
			console.error(`Failed to build ${entry}:`, error);
			process.exit(1);
		}
	}

	// Copy SVG icons
	const fs = require('fs');
	const svgFiles = await glob('nodes/**/*.svg');
	for (const svg of svgFiles) {
		const dest = svg.replace(/^nodes\//, 'dist/nodes/');
		const destDir = path.dirname(dest);
		if (!fs.existsSync(destDir)) {
			fs.mkdirSync(destDir, { recursive: true });
		}
		fs.copyFileSync(svg, dest);
		console.log(`Copied: ${dest}`);
	}

	console.log('Build complete!');
}

build().catch((err) => {
	console.error(err);
	process.exit(1);
});

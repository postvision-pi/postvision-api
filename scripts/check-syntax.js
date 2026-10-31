import { readdir } from 'node:fs/promises';
import { resolve } from 'node:path';
import { spawnSync } from 'node:child_process';

const ignored = new Set(['node_modules', '.git', 'coverage']);

async function checkDirectory(directory) {
    const entries = await readdir(directory, { withFileTypes: true });

    for (const entry of entries) {
        if (ignored.has(entry.name)) continue;
        const path = resolve(directory, entry.name);

        if (entry.isDirectory()) {
            await checkDirectory(path);
        } else if (entry.isFile() && /\.(js|mjs|cjs)$/.test(entry.name)) {
            const result = spawnSync(process.execPath, ['--check', path], { stdio: 'inherit' });
            if (result.error) throw result.error;
            if (result.status !== 0) throw new Error(`Sintaxe inválida em ${path}`);
        }
    }
}

try {
    await checkDirectory(process.cwd());
    console.log('Sintaxe JavaScript verificada com sucesso.');
} catch (err) {
    console.error(err.message);
    process.exitCode = 1;
}

import { defineConfig } from 'vite';
import fs from 'node:fs/promises';
import path from 'node:path';

function copyDirPlugin() {
  return {
    name: 'copy-static-content',
    async closeBundle() {
      const root = process.cwd();
      const srcDir = path.join(root, 'Content');
      const outDir = path.join(root, 'dist', 'Content');

      // If the template's Content folder doesn't exist, do nothing.
      // (Keeps the build robust even if you reorganize assets later.)
      try {
        await fs.access(srcDir);
      } catch {
        return;
      }

      await fs.rm(outDir, { recursive: true, force: true });
      await fs.mkdir(path.dirname(outDir), { recursive: true });
      await fs.cp(srcDir, outDir, { recursive: true });
    },
  };
}

export default defineConfig({
  plugins: [copyDirPlugin()],
});


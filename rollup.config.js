import fs from 'fs';
import cp from 'child_process';

import svelte from 'rollup-plugin-svelte';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import css from 'rollup-plugin-css-only';
import copy from 'rollup-plugin-copy';
import { terser } from 'rollup-plugin-terser';

const isProduction = process.env.NODE_ENV === 'production';

function nukeSourceMaps() {
  return {
    name: 'nukeSourceMaps',
    generateBundle() {
      fs.rmSync('public/build/bundle.css.map', { force: true });
      removeSourcemapLineFrom('public/build/app.css');
    }
  }
}

function removeSourcemapLineFrom(file) {
  if (fs.existsSync(file)) {
    const line = `sourceMappingURL=`;
    let input = fs.readFileSync(file, { encoding: 'utf-8' });
    let output = input.split('\n').filter(row => row.indexOf(line) === -1);
    fs.writeFileSync(file, output.join('\n'));
  } else {
    console.log(`${file} not found.`);
  }
}

function createConfig({ jsInputFile, jsOutputFile, cssOutputFile }) {
  return {
    input: jsInputFile,
    output: {
      sourcemap: false,
      format: 'iife',
      name: 'app',
      inlineDynamicImports: true,
      file: jsOutputFile,
    },
    plugins: [
      copy({
        targets: [
          {
            src: 'static/*',
            dest: 'public'
          },
          {
            src: 'src/index.html',
            dest: `public`,
            rename: `index.html`
          }
        ]
      }),

      svelte(),

      css({
        output: cssOutputFile
      }),

      // If you have external dependencies installed from
      // npm, you'll most likely need these plugins. In
      // some cases you'll need additional configuration -
      // consult the documentation for details:
      // https://github.com/rollup/plugins/tree/master/packages/commonjs
      resolve({
        browser: true,
        dedupe: ['svelte']
      }),
      commonjs(),

      // If we're building for production (npm run build
      // instead of npm run dev), minify
      isProduction && terser(),

      // for whatever reason, sourcemaps aren't deleted in the CSS bundle,
      // so let's delete them ourselves.
      isProduction && nukeSourceMaps(),
    ]
  };
}

const simulatorConfig = createConfig({
  jsInputFile: 'src/simulator.js',
  jsOutputFile: `public/simulator.js`,
  cssOutputFile: 'simulator.css'
});

let configs = [simulatorConfig];

export default configs;

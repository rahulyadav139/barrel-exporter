#! /usr/bin/env node

import { readdirSync, statSync, unlinkSync, writeFileSync } from 'fs';
import { join } from 'path';
import { question } from 'readline-sync';

const directory = process.env.npm_config_path;

const rootIndexRegex = new RegExp(`^${directory}/index.(js|ts)$`);

const getPaths = (dir: string): string[] => {
  const subDirectories = readdirSync(dir);

  let paths: string[] = [];

  for (const subDir of subDirectories) {
    //ignore hidden files and folders
    if (subDir.startsWith('.')) continue;

    const absolutePath = join(dir, subDir);

    const isDirectory = statSync(absolutePath).isDirectory();

    if (isDirectory) {
      const tempPaths = getPaths(absolutePath);
      paths = paths.concat(tempPaths);
    } else {
      paths.push(absolutePath);
    }
  }

  return paths;
};

(async () => {
  if (!directory) {
    return console.log(
      "\u001b[1;31m \nError \u001b[0m\n\nYou haven't mentioned path where you want to implement barrel exporting.\n\nPlease use command 'npm run <script_name> --path=<file_path>"
    );
  }
  try {
    const directories = getPaths(directory);
    const index = directories.findIndex(dir => rootIndexRegex.test(dir));

    const [rootIndexFilePath] =
      index !== -1 ? directories.splice(index, 1) : [];

    let ext = process.env.npm_config_ts ? '.ts' : '.js';

    if (rootIndexFilePath) {
      const doOverride = question(
        'This directory already has index file!\n\nDo you want to overwrite index file? (y/n)\n'
      )
        ?.trim()
        .toLowerCase();

      if (['n', 'no'].includes(doOverride)) {
        return console.log(
          '\u001b[1;34m \nThe process is terminated! \u001b[0m'
        );
      } else if (!['y', 'yes'].includes(doOverride)) {
        return console.log('\u001b[1;31m \nError \u001b[0m\n\nInvalid input');
      }
    }

    let content = '';

    for (const dir of directories) {
      const exportFrom = dir
        .replace(new RegExp(`^${directory}`), '.')
        .replace(new RegExp(`(|\/index)${ext}(|x)$`), '');
      // .replace(ext, '');

      content += `export * from "${exportFrom}";\n`;
    }

    if (rootIndexFilePath) {
      unlinkSync(rootIndexFilePath);
      writeFileSync(rootIndexFilePath.slice(0, -3) + ext, content);
    } else writeFileSync(`./${directory}/index${ext}`, content);

    console.log('\u001b[1;32m \nEnjoy Coding! \u001b[0m');
  } catch (err) {
    console.log(err);
  }
})();

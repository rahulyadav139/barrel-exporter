#! /usr/bin/env node

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const { stdin, stdout } = require('process');

const rl = readline.Interface(stdin, stdout);

const folderPath = process.env.npm_config_path;

const allFilePathsData = [];

const getAllFilePaths = directory => {
  fs.readdirSync(directory).forEach(subDirectory => {
    if (!subDirectory.startsWith('.')) {
      const absolutePath = path.join(directory, subDirectory);

      if (fs.statSync(absolutePath).isDirectory())
        return getAllFilePaths(absolutePath);
      else return allFilePathsData.push(absolutePath);
    }
  });
};

const hasIndexFile = directory => {
  const subDirectories = fs
    .readdirSync(directory)
    .map(subDirectory => subDirectory.toLowerCase())
    .filter(subDirectory => !subDirectory.startsWith('.'));

  return subDirectories.includes('index.js') ? true : false;
};

const getExportData = filepaths => {
  let exportData = '';

  const allJSFilePaths = filepaths.filter(filePath => filePath.includes('.js'));

  for (const JSFilePath of allJSFilePaths) {
    let content = fs.readFileSync(JSFilePath).toString();

    //regex for keywords

    const regexForMultipleNamedExport =
      /(?<!\/\/\s*)export\s*{\s*([a-zA-Z]+\s*(,\s*[0-9a-zA-Z]+)*)\s*}/gi;

    const regexForFunctionKeywordExport =
      /(?<!\/\/\s*)export\s*function\s*[a-z]+/gi;

    const regexForVariableKeywordExport =
      /(?<!\/\/\s*)export\s*const\s*[a-z]+/gi;

    const regexForExportDefault = /(?<!\/\/\s*)export\s*default\s*[a-z]+/gi;

    const regexForRemovingJsxTextOneType =
      /(?<=<[a-z]>)(.*)(?=<\/[a-z]>)|(?<=<[a-z])(.*)(?=\/>)/gi;

    const regexForRemovingJsxTextSecondType =
      /(?<=')(.*)(?<=')|(?<=")(.*)(?<=")/gi;

    //check is there any export keyword available inside any JSX or as a string, if available then removing it
    content = content
      .replaceAll(regexForRemovingJsxTextOneType, '')
      .replaceAll(regexForRemovingJsxTextSecondType, '');

    const updatedStr = [];

    //path created
    const updatedPath = JSFilePath.replaceAll('\\', '/')
      .replaceAll('//', '/')
      .replace(folderPath, '.');

    // src//components//

    //check for 'is there any export default available in any component'

    if (!!content.match(regexForExportDefault)) {
      return console.log(
        'Error: export default is not allowed for barrel exporting. Error in file ' +
          updatedPath
      );
    }

    //check for 'export { function1, function2 }' keyword
    if (!!content.match(regexForMultipleNamedExport)) {
      const str = content
        .match(regexForMultipleNamedExport)
        .map(matchedStr =>
          matchedStr
            .replace('export', '')
            .replace('}', '')
            .replace('{', '')
            .trim()
        )
        .join(', ');

      updatedStr.push(str);
    }
    //check for 'export function Component' keyword
    if (!!content.match(regexForFunctionKeywordExport)) {
      const str = content
        .match(regexForFunctionKeywordExport)
        .map(matchedStr =>
          matchedStr.replace('export', '').replace('function', '').trim()
        )
        .join(', ');

      updatedStr.push(str);
    }

    //check for 'export const Component' keyword
    if (!!content.match(regexForVariableKeywordExport)) {
      const str = content
        .match(regexForVariableKeywordExport)
        .map(el => el.replace('export', '').replace('const', '').trim())
        .join(', ');

      updatedStr.push(str);
    }

    if (updatedStr?.length > 0) {
      exportData +=
        'export { ' +
        updatedStr.join(', ') +
        " } from '" +
        updatedPath +
        "';\n";
      updatedStr.length = 0;
    }
    //barrel exporting string created
  }

  if (exportData.length) {
    const newFile = fs.createWriteStream(folderPath + '/index.js');

    newFile.write(exportData);

    //new index file created with exporting data
  }

  console.log('\u001b[1;32m \nEnjoy Coding! \u001b[0m');
};

const initializeExporter = () => {
  if (!folderPath)
    return console.log(
      "Error: You haven't mentioned path where you want to implement barrel exporting.\n\nPlease use command 'npm run <script_name> --path=<file_path>"
    );

  if (hasIndexFile(folderPath)) {
    console.log(
      'This directory already has index file!\n\nDo you want to overwrite index file? (y/n)\n'
    );

    rl.question('-> ', userInput => {
      rl.close();

      if (!userInput?.trim()) {
        return console.log('\u001b[1;31m \nInvalid input \u001b[0m');
      } else if (
        userInput?.toLowerCase() === 'n' ||
        userInput?.toLowerCase() === 'no'
      ) {
        return console.log(
          '\u001b[1;34m \nThe process is terminated! \u001b[0m'
        );
      } else if (
        userInput?.toLowerCase() === 'y' ||
        userInput?.toLowerCase() === 'yes'
      ) {
        getAllFilePaths(folderPath);

        getExportData(allFilePathsData);
      } else {
        return console.log('\u001b[1;31m \nInvalid input \u001b[0m');
      }
    });
  } else {
    rl.close();
    getAllFilePaths(folderPath);

    getExportData(allFilePathsData);
  }
};

initializeExporter();

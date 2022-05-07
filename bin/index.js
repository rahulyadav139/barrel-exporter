#! /usr/bin/env node

const fs = require('fs');
const path = require('path');

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

getAllFilePaths(folderPath);

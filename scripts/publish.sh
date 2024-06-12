#!/bin/bash

npm ci;
npm run build;
npm version patch --no-commit-hooks --no-git-tag-version;
cp package* dist/;
cp README* dist/;
npm publish ./dist;
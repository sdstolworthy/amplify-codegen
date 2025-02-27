import * as path from 'path';
import * as fs from 'fs-extra';
import * as rimraf from 'rimraf';
import { config } from 'dotenv';
import execa from 'execa';

export * from './add-ci-tags';
export * from './api';
export * from './appsync';
export * from './envVars';
export * from './getAppId';
export * from './headless';
export * from './nexpect';
export * from './pinpoint';
export * from './projectMeta';
export * from './readJsonFile';
export * from './request';
export * from './retrier';
export * from './sdk-calls';
export * from './selectors';
export * from './sleep';
export * from './transformConfig';
export * from './admin-ui';
export * from './frontend-config-helper';
export * from './graphql-config-helper';

// run dotenv config to update env variable
config();

export function deleteProjectDir(root: string) {
  rimraf.sync(root);
}

export function deleteAmplifyDir(root: string) {
  rimraf.sync(path.join(root, 'amplify'));
}

export function overrideFunctionSrc(root: string, name: string, code: string) {
  let indexPath = path.join(getPathToFunction(root, name), 'src', 'index.js');
  fs.writeFileSync(indexPath, code);
}

export function overrideFunctionCode(root: string, name: string, fileName: string) {
  let indexPath = path.join(getPathToFunction(root, name), 'src', 'index.js');
  let functionPath = path.join(__dirname, '..', '..', '..', 'amplify-codegen-e2e-tests', 'functions', fileName);
  fs.copySync(functionPath, indexPath);
}

export function addNodeJSDependencies(root: string, name: string, dependencies: string[]) {
  let indexPath = path.join(getPathToFunction(root, name), 'src');
  execa.commandSync(`yarn add ${dependencies.join(' ')}`, { cwd: indexPath });
}

export function getFunctionSrc(root: string, name: string): Buffer {
  let indexPath = path.join(getPathToFunction(root, name), 'src', 'index.js');
  return fs.readFileSync(indexPath);
}

//overriding code for node
export function overrideLayerCode(root: string, name: string, code: string, fileName: string) {
  const dirPath = path.join(getPathToFunction(root, name), 'lib', 'nodejs', 'node_modules', name);
  fs.ensureDirSync(dirPath);
  const filePath = path.join(dirPath, fileName);
  fs.writeFileSync(filePath, code);
}

// overriding code for python
export function overrideFunctionSrcPython(root: string, name: string, source: string) {
  const destFilePath = path.join(getPathToFunction(root, name), 'src', 'index.py');
  fs.copyFileSync(source, destFilePath);
}

export function overrideLayerCodePython(root: string, name: string, source: string) {
  const dirPath = path.join(getPathToFunction(root, name), 'lib', 'python', 'lib', 'python3.8', 'site-packages');
  fs.ensureDirSync(dirPath);
  const destfilePath = path.join(dirPath, 'testfunc.py');
  fs.copyFileSync(source, destfilePath);
}

export function overridefunctionSrcJava(root: string, name: string, source: string) {
  const destFilePath = path.join(getPathToFunction(root, name), 'build.gradle');
  fs.copyFileSync(source, destFilePath);
}

export function overrideLayerCodeJava(root: string, layerName: string, functionName: string) {
  const destDir = path.join(getPathToFunction(root, layerName), 'lib', 'java', 'lib');
  const srcDir = path.join(getPathToFunction(root, layerName), 'build', 'java', 'lib');

  fs.copySync(srcDir, destDir);
}

const getPathToFunction = (root: string, funcName: string) => path.join(root, 'amplify', 'backend', 'function', funcName);

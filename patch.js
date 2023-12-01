import { readFileSync, writeFileSync } from 'fs';

const manifestPath = './manifest.json'; 
const packagePath = './package.json';
const packageLockPath = './package-lock.json';

const manifestData = readFileSync(manifestPath, 'utf8');
const packagePathData = readFileSync(packagePath, 'utf8');
const packageLockData = readFileSync(packageLockPath, 'utf8');

const manifestObject = JSON.parse(manifestData);
const packageObject = JSON.parse(packagePathData);
const packageLockObject = JSON.parse(packageLockData);

const manifestCurrentVersion = manifestObject.version;
let versionArray = manifestCurrentVersion.split('.');
versionArray[versionArray.length - 1] = (parseInt(versionArray[versionArray.length - 1]) + 1).toString();


const newVersionString = versionArray.join('.');

manifestObject.version = newVersionString;
packageObject.version = newVersionString;
packageLockObject.version = newVersionString;

writeFileSync(manifestPath, JSON.stringify(manifestObject, null, 2));
writeFileSync(packagePath, JSON.stringify(packageObject, null, 2));
writeFileSync(packageLockPath, JSON.stringify(packageLockObject, null, 2));

console.log('Project version updated: ', manifestObject.version);

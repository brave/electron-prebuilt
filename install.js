#!/usr/bin/env node

// maintainer note - x.y.z-ab version in package.json -> x.y.z
var version = process.env.npm_config_brave_electron_version
if (!version) {
  throw new Error('Missing target Electron version. Please set brave_electron_version in .npmrc.')
}
version = version.replace(/-.*/, '')

var fs = require('fs')
var os = require('os')
var path = require('path')
var extract = require('extract-zip')
var download = require('electron-download')

var installedVersion = null
try {
  installedVersion = fs.readFileSync(path.join(__dirname, 'dist', 'version'), 'utf-8').replace(/^v/, '')
} catch (err) {
  // do nothing
}

var platform = os.platform()

function onerror (err) {
  throw err
}

var paths = {
  darwin: 'dist/Brave.app/Contents/MacOS/Brave',
  linux: 'dist/brave',
  win32: 'dist/brave.exe'
}

if (!paths[platform]) throw new Error('Unknown platform: ' + platform)

if (installedVersion === version && fs.existsSync(path.join(__dirname, paths[platform]))) {
  process.exit(0)
}

// downloads if not cached
download({version: version, arch: process.env.npm_config_arch, mirror: 'https://github.com/brave/electron/releases/download/v'}, extractFile)

// unzips and makes path.txt point at the correct executable
function extractFile (err, zipPath) {
  if (err) return onerror(err)
  fs.writeFile(path.join(__dirname, 'path.txt'), paths[platform], function (err) {
    if (err) return onerror(err)
    extract(zipPath, {dir: path.join(__dirname, 'dist')}, function (err) {
      if (err) return onerror(err)
    })
  })
}

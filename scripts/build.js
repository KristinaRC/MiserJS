'use strict';
import fs from 'node:fs';
import path from 'node:path';
import { exit } from 'node:process';
import pc from 'picocolors';
import { minify as terserMinify } from 'terser';
import zlib from 'node:zlib';
import /**@type {Build_Target[]}*/ targets from '../config/build-targets.json' with { type: 'json' };
import packageJSON from '../package.json' with { type: 'json' };

const __dirname = import.meta.dirname;
const packageVersion = packageJSON.version;

// Define paths.

const sourceBaseDir = 'src';
const distBaseDir = 'dist';
const packageRootPath = path.join(__dirname, "../");
const packageSrcPath = path.join(packageRootPath, sourceBaseDir);
/** Ex: /home/user/MiserJS/dist */
const packageDistPath = path.join(packageRootPath, distBaseDir);

console.log(`Package Root Path: ${packageRootPath}`);
console.log(`Package Src Path: ${packageSrcPath}`);
console.log(`Package Dist Path: ${packageDistPath}`);

// Regex to check if a file needs a version number.
const versionRegex = new RegExp('{version}');
// Filetypes to scan for filepath/filename references.
const sourceFileExtensions = ['.css', '.js', '.mjs', '.html', '.webmanifest'];
// Filetypes to use text compression on, rather than binary. (For brotli and gzip.)
const textFileExtensions = [...sourceFileExtensions, '.txt']

let buildError = false;

// Build all targets.
for (const buildTarget of targets) {
  console.time('BuildTargetTime');
  let logBuildTargetName = pc.bgBlue(pc.black(`${buildTarget.name.toUpperCase()}: `));
  console.log(`\n${'-'.repeat(buildTarget.description.length)}\n${pc.bgBlue(pc.white('Build Target:'))} ${logBuildTargetName}\n${buildTarget.description}\n${'-'.repeat(buildTarget.description.length)}`);
  let buildTargetDistPathBaseDir = `${packageDistPath}/${buildTarget.name}`;
  console.log(`Target Dist Path Base Dir: ${buildTargetDistPathBaseDir}`);
  /** RegExp to strip the absolute base path from an individual file distPath */
  let buildTargetDistPathBaseMatchRegex = RegExp(String.raw`${packageDistPath}/${buildTarget.name}/`);


  let distDeleteDir = `${buildTargetDistPathBaseDir}`;
  if (fs.existsSync(distDeleteDir)) {
    fs.rmSync(distDeleteDir, { recursive: true });
    console.log(pc.bgRed(pc.white('Package Dist Path Directory was deleted.')));
  } else {
    console.log(pc.bgRed(pc.white('Package dist directory did not exist to be deleted.')));
  }
  
  let unmodifiedFiles = [];

  // Every src file in a build target will need to be copied to dist.
  // Some src files will need their source code changed to reference the 
  // updated filepaths and possibly the filename as well.

  // Update all file distPaths first.
  for ( const file of buildTarget.files) {
    file.srcPath = path.join(packageRootPath, file.srcPath);
    file.distPath = path.join(packageRootPath, file.distPath);
    
    // Update filenames where version numbers are required.
    if (versionRegex.test(file.distPath)) {
      file.distPath = file.distPath.replace(versionRegex, packageVersion);
    }

    let distPathParts = path.parse(file.distPath);

    // Update filenames where minification is required.
    if ( file.minify) {
      file.distPath = path.join(`${distPathParts.dir}`, `${distPathParts.name}.min${distPathParts.ext}`);
    }

    let directory = distPathParts.dir;
    if (!fs.existsSync(directory)) {
      fs.mkdirSync(directory, { recursive: true });
    }
  }

  // src and dist paths have been finalized.

  for (const file of buildTarget.files) {

    let sourceFileExtension = path.extname(file.srcPath);
    let sourceScan = sourceFileExtensions.includes(sourceFileExtension);

    if (!sourceScan && !file.minify && !file.compress ) {
      // Straight copy the file.
      copyFile(file.srcPath, file.distPath);
      unmodifiedFiles.push(file.distPath);
      continue;
    }

    console.group(pc.bgYellow(pc.black(`Working on file:'${file.srcPath}':`)));
    console.log('');
    
    /**@type {string | Buffer | undefined} */
    let srcFinal = '';
    
    /**@type {string}*/
    let srcFiletype = textFileExtensions.includes( path.extname(file.srcPath)) ? 'text' : 'binary';

    // Read text or binary here into srcFinal.
    // Determine by extension.

    if ( srcFiletype == 'text') {
      srcFinal = fs.readFileSync(file.srcPath, { encoding: 'utf8' });
    } else {
      srcFinal = fs.readFileSync(file.srcPath, { encoding: 'binary' });
    }

    if ( buildTarget.name == 'browser' &&  path.basename(file.srcPath) == 'miserjs-engine.js') {
      console.group(pc.green('Special Browser build generation:'));
      // Modify source text in some way.
      srcFinal  = srcFinal.replaceAll(/MiserEngine/gs, 'MiserJS.MiserEngine');
      srcFinal = srcFinal.replace(/^.*export default class MiserJS.MiserEngine/m, '// @ts-nocheck\nwindow.MiserJS = window.MiserJS || {};\n\nMiserJS.MiserEngine = class ');
      sourceScan = false;
      console.groupEnd();
    }

    if (sourceScan) {
      // Update source code files to reference new filepath and possibly a new filename.
      // New filename can come from a version number update and/or minification.
      // Now scan sourceFileText for possible file references
      // to any of the existing buildTarget.files.

      console.group(`${logBuildTargetName}${pc.bgGreen(pc.bold(pc.black(`Source Scan:'${file.srcPath}':`)))}`);
      
      let sourceFileText = srcFinal;
      /** Source file directory in distPath. */
      let sourceFileDir = path.dirname(file.distPath);

      let modifiedSourceFile = '';

      for (const fileRef of buildTarget.files) {
        /**
         * Name of the file to match in the source file.  
         * This will not be the final, altered filename with new version or  
         * extensions added (e.g. '.min.');
        */
        let fileRefName = path.basename(fileRef.srcPath);
        /** The final output filename, with possible version and intermediate  
         * extensions (.min.) added.
         */
        let fileRefDistName = path.basename(fileRef.distPath);
        let fileRefDistDir = path.dirname(fileRef.distPath);
        let fileRefDistBaseDir = `${packageDistPath}/${buildTarget.name}`;

        // Get the whole line where the filename matches.
        // The entire line will be tested for statements that require only absolute or relative URLs.
        let sourceFileRegex = new RegExp(String.raw`.+["'(](.*?${fileRefName})["')].*`, 'g');
        let matchedLines = sourceFileText.matchAll(sourceFileRegex);
        
        for (const match of matchedLines) {
          console.log(`${pc.underline('Found file reference to:')} ${fileRefName}`);

          // RelativePath will not have a trailing slash.
          // A trailing slash will have to be added when adding a basename to the relativePath.
          // RelativePath will be '..' at the start if going up to parent directory.
          // RelativePath will be blank '' if same directory.

          let relativePath = `${path.relative(sourceFileDir, fileRefDistDir)}`;
          /** This is the fileRef.distPath with just the base path in the dist/targetName directory.  
           * Ex: /home/user/projectName/dist/browser/css/filename.ext becomes just css/filename.ext  
           */
          let replacePath = fileRef.distPath.replace(`${fileRefDistBaseDir}/`, '');
          let modifiedFilename = '';

          // The  sourceFileDir + relative path + replace path must match the final distPath to select the right fileRef.


          console.group();
          console.log(`From: ${sourceFileDir}`);
          console.log(`To: ${fileRefDistDir}`);
          console.log(` Path.relative: ${relativePath}`);
          console.log(`   replacePath: ${replacePath}`)
          console.log(`     Path.join: ${path.join(sourceFileDir, relativePath, fileRefDistName)}`);
          console.groupEnd();

          // match[0] holds the entire line that needs to be searched for
          // statements requiring absolute or relative URLs.
          // Ex: import statements in JavaScript should be relative.
          // Ex: Service Worker register URls should be absolute.

          let logMatchModifier = '';

          if (fileRef.specialCaseMatches && Array.isArray(fileRef.specialCaseMatches)) {
            // Search the whole specialCaseMatches array for the first line match.
            specialSearch: for (const specialCase of fileRef.specialCaseMatches) {
              let lineMatch = new RegExp(specialCase.regex);
              if (lineMatch.test(match[0])) {
                logMatchModifier = `[SPECIAL CASE for "${specialCase.regex}":${specialCase.basePathReplaceType}] `;
                switch (specialCase.basePathReplaceType.toLowerCase()) {
                  case 'absolute':
                    if (buildTarget.baseHref) {
                      modifiedFilename = `${buildTarget.baseHref}${replacePath}`;
                    } else {
                      modifiedFilename = `${fileRefDistBaseDir}/${replacePath}`;
                    }
                    break;
                  case 'domainroot':
                    if (buildTarget.baseHref) {
                      modifiedFilename = `${buildTarget.domainRoot}${buildTarget.baseHref}${replacePath}`;
                    } else {
                      modifiedFilename = `${buildTarget.domainRoot}${replacePath}`;
                    }
                    break;
                  case 'relativewithdots':
                    if (!relativePath) {
                      relativePath = './' + fileRefDistName;
                    } else {
                      // relativePath is '..' here.
                      relativePath += '/' + replacePath;
                    }

                    modifiedFilename = relativePath;

                    break;
                  default:
                    // For a supplied base path in the basePathReplaceType string.
                    modifiedFilename = `${specialCase.basePathReplaceType}${replacePath}`;
                }
                break specialSearch;  // Break the for loop.
              }
            }
          }
          
          if (!modifiedFilename) {
            logMatchModifier = '[RELATIVE:DEFAULT] ';
            if (!relativePath) {
              relativePath = fileRefDistName;
            } else {
              // relativePath is '..' here.
              relativePath += '/' + fileRefDistName;
            }


            modifiedFilename = relativePath;
          }

          console.group();
          console.log(String.raw`Found  : ${match[0]}`);
          console.log(`Match  : ${logMatchModifier} ${match[1]}`);
          let replacedLine = match[0].replace(new RegExp(String.raw`${match[1]}`), `${modifiedFilename}`);
          console.log(`${pc.bgGreen(pc.black('Replace:'))} ${replacedLine}`);
          console.groupEnd();

          // The sourceFileText may be modified if many different file references are found in it.
          // This fileRef loop has to see those changes on each iteration.
          if (!modifiedSourceFile) {
            modifiedSourceFile = sourceFileText.replace(match[0], replacedLine);
          } else {
            modifiedSourceFile = modifiedSourceFile.replace(match[0], replacedLine);
          }
        }
      }

      // If the source is modified above, variable modifiedSourceFile will have the modified source code.
      if (modifiedSourceFile) {
        srcFinal = modifiedSourceFile;
      } else {
        srcFinal = sourceFileText;
        console.log('No file references found.');

      }
      console.groupEnd(); // Source Scan
    }
  
    if (file.minify) {
      // Minify based on extension.
      let filename = path.basename(file.distPath);
      switch (path.extname(file.srcPath)) {
        case '.js':
        case '.mjs':
          console.log(`${logBuildTargetName}${pc.bgGreen(pc.bold(pc.black(`Minifying JavaScript file: ${filename}`)))}`);
          try {
            srcFinal = await jsMinify(filename, srcFinal);
          } catch ( /**@type {any}*/ e) {
            buildError = true;
            console.log(`JS Minify error in ${filename}.\n${e.toString()}`);
            exit(1);
          }
          break;
      }
    }

    if (file.compress) {
      /**
       *  Do not update file.distPath. 
       * The file is either the original or minified (above).  
       * The webserver will select the compressed file based on the extension.  
       * This is for 'brotli_static on' and 'gzip_static on' directives, so the webserver doesn't  
       * have to waste CPU time compressing these files over and over with every response.
       * Can copy br and gz files with their unique extensions (br,gz) to the dist directory in this function.  
       */
      console.log(`${logBuildTargetName}${pc.bgGreen(pc.bold(pc.black(`Compressing ${srcFiletype} file: ${path.basename(file.distPath)}`)))}`);
      compressSource(srcFinal, srcFiletype, file.distPath);
    }

    if ( srcFiletype == 'binary') {
      copyFile(file.srcPath, file.distPath);
    } else {
      copySource(srcFinal, file.distPath);  
    }
    
    console.groupEnd(); // After a buildTarget file has been fully processed.
  }

  
  if (unmodifiedFiles.length > 0) {
    console.group(pc.bgBlue(pc.white('Files copied directly to dist directory:')));
    for ( const fileCopy of unmodifiedFiles) {
      console.log(fileCopy);
    }
    console.groupEnd();
  }

  // Single BuildTarget completed.
  console.log('');
  console.timeEnd('BuildTargetTime');
}

if (buildError) {
  console.log('\n\nBUILD ERROR.\nNo files copied to the server directory.');
  exit(1);
}

console.groupEnd();

console.log('\n');
console.log(pc.bgGreenBright(pc.black(pc.bold("Build success!"))));
console.log('\n');
exit(0);

/**
 * 
 * @param {String} srcPath 
 * @param {String} distPath 
 */
function copyFile(srcPath, distPath) {
  let distPathParts = path.parse(distPath);
  // Write file.
  if (!fs.existsSync(distPathParts.dir)) {
    fs.mkdirSync(distPathParts.dir, { recursive: true });
  }
  fs.copyFileSync(srcPath, distPath, fs.constants.COPYFILE_FICLONE);
}

/**
 * 
 * @param {String|Buffer|undefined} source 
 * @param {String} distPath 
 */
function copySource( source, distPath) {
  if ( !source ) {
    console.log(`File source for ${distPath} was undefined`);
    return;
  }
  let distPathParts = path.parse(distPath);
  if (!fs.existsSync(distPathParts.dir)) {
    fs.mkdirSync(distPathParts.dir, { recursive: true });
  }
  fs.writeFileSync(distPath, source, { mode: 0o644, flush: true});
}

/**
 * Minify JavaScript source file.
 * @param {string} filename Name of file where the source code is stored.
 * @param {string} source The source code in a string.
 * @returns {Promise<string|undefined>}
 */
async function jsMinify(filename, source) {
  
  let terserResult;

  const terserOptions = {
    module: true,
    compress: {
      defaults: true,
    },
    mangle: { module: true },
    sourceMap: false
  };
  
  try {
    terserResult = await terserMinify(source, terserOptions);
    return terserResult.code;
  } catch (/**@type {any}*/ error) {
    console.error(error.toString());
    throw new Error(`Terser reported an error in ${filename}.`);
  }
}

/**
 * Compresses to brotli and gzip at the same time.
 * @param {string|Buffer|undefined} source
 * @param {string} sourceType 'text' or 'binary'.
 * @param {string} absOutputFilepath The full absolute pathname, including the filename itself.
 */
function compressSource(source, sourceType, absOutputFilepath) {

  if (!source) {
    throw new Error('CompressSource function was passed an empty source.');
  }

  let brotliOptions;
  
  if ( sourceType == 'binary') {
    brotliOptions = {
      params: {
        [zlib.constants.BROTLI_PARAM_MODE]: zlib.constants.BROTLI_MODE_GENERIC,
        [zlib.constants.BROTLI_PARAM_QUALITY]: zlib.constants.BROTLI_MAX_QUALITY,
        [zlib.constants.BROTLI_PARAM_SIZE_HINT]: source.length
      }
    }
  } else {
    brotliOptions = {
      params: {
        [zlib.constants.BROTLI_PARAM_MODE]: zlib.constants.BROTLI_MODE_TEXT,
        [zlib.constants.BROTLI_PARAM_QUALITY]: zlib.constants.BROTLI_MAX_QUALITY,
        [zlib.constants.BROTLI_PARAM_SIZE_HINT]: source.length
      }
    }
  }


  const brotliBuffer = zlib.brotliCompressSync(source, brotliOptions);

  const gzipOptions = {
    level: 9
  };

  const gzipBuffer = zlib.gzipSync(source, gzipOptions);

  // Save brotli compressed file.
  fs.writeFileSync(`${absOutputFilepath}.br`, brotliBuffer);
  // Save gzip compressed file.
  fs.writeFileSync(`${absOutputFilepath}.gz`, gzipBuffer);
}

/** 
 * @typedef {Object} SpecialCaseMatch
 * @property {string} regex Regular expression to match a special source code line.
 * @property {string} basePathReplaceType One of:  absolute, domainRoot, or relativeWithDots
 */

/** 
 * @typedef {Object} TargetFile
 * @property {string} srcPath Absolute
 * @property {string} distPath Path to final destination in the dist directory.
 * @property {SpecialCaseMatch[]|boolean} specialCaseMatches
 * @property {boolean} minify
 * @property {boolean} compress
 * @property {boolean} pwaCache
 */

/**
 * @typedef {Object} Build_Target
 * @property {string} name
 * @property {string} description
 * @property {string|boolean} domainRoot
 * @property {string|boolean} baseHref
 * @property {boolean} isPWA
 * @property {TargetFile[]} files
 */

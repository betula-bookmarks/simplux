"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const chalk_1 = __importDefault(require("chalk"));
const fs_1 = __importDefault(require("fs"));
const glob_1 = __importDefault(require("glob"));
const path_1 = __importDefault(require("path"));
const pretty_time_1 = __importDefault(require("pretty-time"));
const shelljs_1 = __importDefault(require("shelljs"));
const util_1 = require("util");
const yargs_1 = __importDefault(require("yargs"));
const globals_1 = require("./globals");
const util_2 = require("./util");
const argv = yargs_1.default
    .scriptName('build-pacakge')
    .option('packageDir', {
    default: process.cwd(),
})
    .option('forceEnableColors', {
    default: false,
}).argv;
if (argv.forceEnableColors) {
    chalk_1.default.enabled = true;
    chalk_1.default.level = 3 /* TrueColor */;
}
// tslint:disable: no-var-requires
// tslint:disable: no-require-imports
// tslint:disable-next-line: no-floating-promises
build().catch(err => {
    shelljs_1.default.echo(chalk_1.default.red(`Error while building: ${err}`));
    shelljs_1.default.exit(1);
});
async function build() {
    const PACKAGE_DIR = argv.packageDir;
    const OUTPUT_DIR = path_1.default.join(PACKAGE_DIR, `dist`);
    const BUNDLES_DIR = path_1.default.join(OUTPUT_DIR, `bundles`);
    const ROOT_DIR = path_1.default.resolve(path_1.default.join(__dirname, `..`));
    const PACKAGE = require(path_1.default.join(PACKAGE_DIR, 'package.json'));
    const buildStart = process.hrtime();
    shelljs_1.default.echo(`Building package '${chalk_1.default.cyan(PACKAGE.name)}'...`);
    await executeStep(`Cleaning output directory`, () => {
        shelljs_1.default.rm(`-Rf`, `${OUTPUT_DIR}/*`);
        shelljs_1.default.mkdir(`-p`, BUNDLES_DIR);
    });
    await executeStep(`Linting`, () => util_2.execAsync(`tslint`, `-c ${path_1.default.join(ROOT_DIR, 'tslint.json')}`, `-t stylish`, `--project ${PACKAGE_DIR} ${PACKAGE_DIR}/**/*.ts`));
    await executeStep(`Compiling`, () => util_2.execAsync(`tsc -p ${PACKAGE_DIR}/tsconfig.json`));
    await executeStep(`Compiling esm5`, async () => {
        const ret = await util_2.execAsync(`tsc`, `${PACKAGE_DIR}/index.ts`, `--target es5`, `--module es2015`, `--outDir ${OUTPUT_DIR}/esm5`, `--noLib`, `--sourceMap`);
        // 2 indicates failure with output still being generated
        // (this command will usually fail because of the --noLib flag)
        if (![0, 2].includes(ret.code)) {
            return ret;
        }
        const globPromise = util_1.promisify(glob_1.default);
        const jsFiles = await globPromise(`${OUTPUT_DIR}/esm5/**/*.js`);
        let code = 0;
        for (const file of jsFiles) {
            code += await mapSources(file, false);
        }
        return code;
    });
    await executeStep(`Compiling esm2015`, async () => {
        const ret = await util_2.execAsync(`tsc`, `${PACKAGE_DIR}/index.ts`, `--target es2015`, `--module es2015`, `--outDir ${OUTPUT_DIR}/esm2015`, `--noLib`, `--sourceMap`);
        // 2 indicates failure with output still being generated
        // (this command will usually fail because of the --noLib flag)
        if (![0, 2].includes(ret.code)) {
            return ret;
        }
        const globPromise = util_1.promisify(glob_1.default);
        const jsFiles = await globPromise(`${OUTPUT_DIR}/esm2015/**/*.js`);
        let code = 0;
        for (const file of jsFiles) {
            code += await mapSources(file, false);
        }
        return code;
    });
    await executeStep(`Bundling`, async () => {
        const externalsArr = Object.keys(PACKAGE.dependencies || {})
            .concat(Object.keys(PACKAGE.devDependencies || {}))
            .concat(Object.keys(PACKAGE.peerDependencies || {}));
        // a bit of special handling for rxjs since it has two entry
        // points that make the dependencies heuristic fail
        if (externalsArr.includes('rxjs')) {
            externalsArr.push('rxjs/operators');
        }
        const externalsCsv = externalsArr.join(',');
        const externalsArg = externalsCsv ? ` -e ${externalsCsv}` : '';
        const ret = await util_2.execAsync(`rollup`, `-f esm`, `-n ${PACKAGE.name}`, `-i ${OUTPUT_DIR}/index.js`, `-o ${BUNDLES_DIR}/bundle.js`, `-m`, externalsArg);
        if (ret.code !== 0) {
            return ret;
        }
        ret.code = await mapSources(`${BUNDLES_DIR}/bundle.js`);
        return ret;
    });
    await executeStep(`Downleveling ES2015 to ESM/ES5`, async () => {
        shelljs_1.default.cp(`${BUNDLES_DIR}/bundle.js`, `${BUNDLES_DIR}/bundle.es5.ts`);
        const ret = await util_2.execAsync(`tsc`, `${BUNDLES_DIR}/bundle.es5.ts`, `--target es5`, `--module es2015`, `--noLib`, `--sourceMap`);
        // 2 indicates failure with output still being generated
        // (this command will usually fail because of the --noLib flag)
        if (![0, 2].includes(ret.code)) {
            return ret;
        }
        const code = await mapSources(`${BUNDLES_DIR}/bundle.es5.js`);
        if (code !== 0) {
            return code;
        }
        shelljs_1.default.rm(`-f`, `${BUNDLES_DIR}/bundle.es5.ts`);
        return code;
    });
    await executeStep(`Bundling UMD`, async () => {
        const externalsArr = Object.keys(PACKAGE.dependencies || {})
            .concat(Object.keys(PACKAGE.devDependencies || {}))
            .concat(Object.keys(PACKAGE.peerDependencies || {}));
        // a bit of special handling for rxjs since it has two entry
        // points that make the dependencies heuristic fail
        if (externalsArr.includes('rxjs')) {
            externalsArr.push('rxjs/operators');
        }
        const externalsCsv = externalsArr.join(',');
        const externalsArg = externalsCsv ? ` -e ${externalsCsv}` : '';
        const globalsArg = externalsArr.length > 0
            ? `-g ${externalsArr.map(e => `${e}:${globals_1.GLOBALS[e] || e}`).join(',')}`
            : '';
        const ret = await util_2.execAsync(`rollup`, `-c ${path_1.default.join(ROOT_DIR, 'rollup.config.js')}`, `-f umd`, `-i ${BUNDLES_DIR}/bundle.es5.js`, `-o ${BUNDLES_DIR}/bundle.umd.js`, `-n ${PACKAGE.name}`, `-m`, `--exports named`, externalsArg, globalsArg);
        if (ret.code !== 0) {
            return ret;
        }
        ret.code = await mapSources(`${BUNDLES_DIR}/bundle.umd.js`);
        return ret;
    });
    await executeStep(`Minifying`, async () => {
        let code = await util_2.execAsync(`${path_1.default.join(ROOT_DIR, 'node_modules/.bin/uglifyjs')}`, false, `-c`, `-m`, `--comments`, `-o ${BUNDLES_DIR}/bundle.umd.min.js`, 
        // tslint:disable-next-line: max-line-length
        `--source-map "filename='bundle.umd.min.js.map',url='bundle.umd.min.js.map',includeSources"`, `${BUNDLES_DIR}/bundle.umd.js`);
        if (code !== 0) {
            return code;
        }
        code = await mapSources(`${BUNDLES_DIR}/bundle.umd.min.js`);
        return code;
    });
    await executeStep(`Adjusting bundle sourcemap sources paths`, async () => {
        const globPromise = util_1.promisify(glob_1.default);
        const bundleMapFiles = await globPromise(`${OUTPUT_DIR}/**/*.map`);
        await Promise.all(bundleMapFiles.map(async (mapFile) => {
            const fileContent = await util_1.promisify(fs_1.default.readFile)(mapFile);
            const fileContentJson = JSON.parse(fileContent);
            fileContentJson.sources = fileContentJson.sources.map(s => {
                const sourcePath = path_1.default.resolve(path_1.default.join(path_1.default.dirname(mapFile), s));
                const packagePrefixSourcePath = sourcePath.replace(PACKAGE_DIR, PACKAGE.name);
                return packagePrefixSourcePath.replace(/\\/g, '/');
            });
            await util_1.promisify(fs_1.default.writeFile)(mapFile, JSON.stringify(fileContentJson));
        }));
    });
    await executeStep(`Cleaning build files`, () => {
        shelljs_1.default.rm(`-Rf`, `${OUTPUT_DIR}/*.js`);
        shelljs_1.default.rm(`-Rf`, `${OUTPUT_DIR}/*.js.map`);
        shelljs_1.default.rm(`-Rf`, `${OUTPUT_DIR}/*.spec.d.ts`);
        shelljs_1.default.rm(`-Rf`, `${OUTPUT_DIR}/src/**/*.js`);
        shelljs_1.default.rm(`-Rf`, `${OUTPUT_DIR}/src/**/*.js.map`);
        shelljs_1.default.rm(`-Rf`, `${OUTPUT_DIR}/src/**/*.spec.d.ts`);
    });
    await executeStep(`Copying static assets`, () => {
        shelljs_1.default.cp(`-Rf`, [`${PACKAGE_DIR}/package.json`], OUTPUT_DIR);
        shelljs_1.default.cp(`-Rf`, [`${ROOT_DIR}/LICENSE`], OUTPUT_DIR);
        shelljs_1.default.cp(`-Rf`, [`${PACKAGE_DIR}/README.md`], OUTPUT_DIR);
    });
    const buildTime = process.hrtime(buildStart);
    const formattedBuildTime = chalk_1.default.yellow(pretty_time_1.default(buildTime, 'ms'));
    shelljs_1.default.echo(chalk_1.default.green(`Finished building package '${chalk_1.default.cyan(PACKAGE.name)}' in ${formattedBuildTime}!`));
}
async function executeStep(stepName, fn) {
    const start = process.hrtime();
    shelljs_1.default.echo(`${stepName}...`);
    let code = 0;
    try {
        const fnResult = await fn();
        code =
            typeof fnResult === 'object'
                ? fnResult.code
                : typeof fnResult === 'number'
                    ? fnResult
                    : code;
        if (typeof fnResult === 'object') {
            if (fnResult.stdout) {
                shelljs_1.default.echo(fnResult.stdout);
            }
            if (fnResult.stderr) {
                shelljs_1.default.echo(fnResult.stderr);
            }
        }
    }
    catch (err) {
        shelljs_1.default.echo(chalk_1.default.red(`${err}`));
        code = 1;
    }
    const time = process.hrtime(start);
    const formattedTime = chalk_1.default.yellow(pretty_time_1.default(time, 'ms'));
    if (code !== 0) {
        shelljs_1.default.echo(chalk_1.default.red(`${stepName} failed after ${formattedTime}!`));
        shelljs_1.default.exit(code);
    }
    shelljs_1.default.echo(chalk_1.default.green(`${stepName} successful in ${formattedTime}!`));
}
async function mapSources(file, useTwoPasses = true) {
    const sorcery = require('sorcery');
    await sorcery.loadSync(file).write();
    if (useTwoPasses) {
        // another second run of mapping the sources is required for sorcery to
        // properly map the sources since after the first run the source files
        // are correctly identified, but their content is not properly added to
        // the source mapping
        await sorcery.loadSync(file).write();
    }
    return 0;
}

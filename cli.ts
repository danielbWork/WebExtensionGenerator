import yargs from "https://deno.land/x/yargs@v17.6.2-deno/deno.ts";
import Ask from "https://deno.land/x/ask@1.0.6/mod.ts";
import { Arguments } from "./Arguments.ts";
import { NumberOpts } from "https://deno.land/x/ask@1.0.6/src/types/number.ts";
import { ConfirmOpts } from "https://deno.land/x/ask@1.0.6/src/types/confirm.ts";
import { PromptOpts } from "https://deno.land/x/ask@1.0.6/src/core/prompt.ts";

const REPO_URL =
  "https://raw.githubusercontent.com/danielbWork/WebExtensionGenerator/main/";

const DEFAULT_ARGUMENTS: Arguments = {
  name: "MyExtension",
  description: "Creates world peace",
  version: "1.0.0",
  useBackgroundScript: false,
  useContentScript: false,
  useBrowserPopupScript: false,
  usePagePopupScript: false,
  useOptionsPage: false,
  isTypescript: false,
  outputDir: "./",
};

/**
 * @returns The parsed arguments passed to the commend by the user
 */
function parseInputArgs() {
  const inputArgs = yargs(Deno.args).command(
    "webExtensionGenerator",
    "Generates a webextension",
  ).option("name", {
    alias: "n",
    type: "string",
    description: "Name for the webextension. If not entered shows prompt.",
  }).option("description", {
    alias: "d",
    type: "string",
    description:
      "Description for the webextension. If not entered shows prompt",
  }).option("ext-version", {
    type: "string",
    description: "Version for the webextension. If not entered shows prompt",
  }).option("background", {
    alias: "b",
    default: false,
    type: "boolean",
    description: "Adds background script. If not entered shows prompt",
  }).option("content", {
    alias: "c",
    default: false,
    type: "boolean",
    description: "Adds content script. If not entered shows prompt",
  }).option("browser-popup", {
    type: "boolean",
    default: false,
    description: "Adds browser popup script. If not entered shows prompt",
  }).option("page-popup", {
    type: "boolean",
    default: false,
    description: "Adds page popup script. If not entered shows prompt",
  }).option("options-page", {
    alias: "o",
    default: false,
    type: "boolean",
    description: "Adds options page. If not entered shows prompt",
  }).option("typescript", {
    alias: "t",
    default: false,
    type: "boolean",
    description: "Makes application type script. If not entered shows prompt",
  }).option("disable-prompt", {
    type: "boolean",
    description:
      "Disables prompts from displaying taking only values given by command, and entering default values for params not passed in the command",
  }).option("output-dir", {
    alias: "w",
    type: "string",
    description:
      "The folder to output the extension in if not passed uses current dir",
    default: "./",
  }).parse();
  return inputArgs;
}

/**
 * Creates default arguments based on the the user input
 * @param inputArgs The arguments passed by the user
 */
function generateArgsByCommands(
  inputArgs: {
    name?: string;
    description?: string;
    extVersion?: string;
    background: boolean;
    content: boolean;
    browserPopup: boolean;
    pagePopup: boolean;
    optionsPage: boolean;
    typescript: boolean;
    outputDir: string;
  },
) {
  const args: Arguments = {
    name: inputArgs.name || DEFAULT_ARGUMENTS.name,
    description: inputArgs.description || DEFAULT_ARGUMENTS.description,
    version: inputArgs.extVersion || DEFAULT_ARGUMENTS.version,
    useBackgroundScript: inputArgs.background,
    useContentScript: inputArgs.content,
    useBrowserPopupScript: inputArgs.browserPopup,
    usePagePopupScript: inputArgs.pagePopup,
    useOptionsPage: inputArgs.optionsPage,
    isTypescript: inputArgs.typescript,
    outputDir: inputArgs.outputDir,
  };

  return args;
}

/**
 * Asks the user about the various settings for the extension
 * @param inputArgs info inputted by that shouldn't be asked about
 * @returns The answers of the user
 */
async function inquire(inputArgs: {
  name?: string;
  description?: string;
  extVersion?: string;
  background: boolean;
  content: boolean;
  browserPopup: boolean;
  pagePopup: boolean;
  optionsPage: boolean;
  typescript: boolean;
  outputDir: string;
}) {
  const ask = new Ask();

  const questions: (PromptOpts | ConfirmOpts | NumberOpts)[] = [];
  const args = generateArgsByCommands(inputArgs);

  if (!inputArgs.name) {
    questions.push({
      name: "name",
      message: "Extension name:",
      type: "input",
      default: DEFAULT_ARGUMENTS.name,
      validate: (val) => {
        return !val || val.trim() !== "";
      },
    });
  }

  if (!inputArgs.description) {
    questions.push({
      name: "description",
      message: "Description:",
      type: "input",
      default: DEFAULT_ARGUMENTS.description,
    });
  }

  if (!inputArgs.extVersion) {
    questions.push({
      name: "version",
      message: "Version:",
      type: "input",
      default: DEFAULT_ARGUMENTS.version,
      validate: (val) => {
        return !val || new RegExp(/^\d+(\.\d+)*$/g).test(val);
      },
    });
  }

  if (!inputArgs.typescript) {
    questions.push({
      name: "isTypescript",
      message: "Have extension be in typescript:",
      type: "confirm",
    });
  }

  if (!inputArgs.background) {
    questions.push({
      name: "useBackgroundScript",
      message: "Include background script:",
      type: "confirm",
    });
  }

  if (!inputArgs.content) {
    questions.push({
      name: "useContentScript",
      message: "Include content script:",
      type: "confirm",
    });
  }

  if (!inputArgs.browserPopup) {
    questions.push({
      name: "useBrowserPopupScript",
      message: "Include browser action popup script:",
      type: "confirm",
    });
  }

  if (!inputArgs.pagePopup) {
    questions.push({
      name: "usePagePopupScript",
      message: "Include page action popup script:",
      type: "confirm",
    });
  }

  if (!inputArgs.optionsPage) {
    questions.push({
      name: "useOptionsPage",
      message: "Include options page:",
      type: "confirm",
    });
  }

  let answers = {};

  answers = await ask.prompt(questions);

  // Does conversion for linter
  return { ...args, ...answers };
}

/**
 * Creates text for teh manifest file
 * @param args The arguments we base the text on
 * @returns The text to be written in the manifest file
 */
function generateManifestText(args: Arguments) {
  // deno-lint-ignore no-explicit-any
  const manifest: any = {
    manifest_version: 2,
    name: args.name,
    description: args.description,
    version: args.version,
    icons: {},
    permissions: [],
  };

  if (args.useBackgroundScript) {
    manifest.background = { page: "src/background/index.html" };
  }

  if (args.useContentScript) {
    manifest.content_scripts = [{
      matches: ["https://deno.land/"],
      js: [`src/content/index.${args.isTypescript ? "ts" : "js"}`],
    }];
  }

  // TODO Check if popups require icons
  if (args.useBrowserPopupScript) {
    manifest.browser_action = {
      default_popup: "src/browserAction/index.html",
      default_title: args.name,
    };
  }

  if (args.usePagePopupScript) {
    manifest.page_action = {
      default_popup: "src/pageAction/index.html",
      default_title: args.name,
      browser_style: true,
      show_matches: ["https://deno.land/"],
    };
  }

  if (args.useOptionsPage) {
    manifest.options_ui = { page: "src/options/index.html" };
  }

  // writeJsonSync(`${args.name}/manifest.json`, manifest, {});

  return JSON.stringify(manifest, null, "\t");
}

/**
 * Loads a raw file from the app's repo and returns it's contents
 * @param file The file we get the text of
 * @returns The text in the file
 */
async function loadFileText(file: string) {
  const response = await fetch(REPO_URL + file);

  const fileText = await response.text();

  return fileText;
}

/**
 * Creates the scripts for the extension
 * @param args The arguments deciding which scripts to create
 */
async function createScripts(args: Arguments) {
  const extensionDir = args.outputDir + args.name;

  const parentDir = `${extensionDir}/src/`;

  const scriptSuffix = args.isTypescript ? ".ts" : ".js";

  const fileText = await loadFileText(
    args.isTypescript ? "indexTS.html" : "index.html",
  );

  Deno.mkdirSync(parentDir);

  const writeScripts = (dirName: string) => {
    const dir = `${parentDir}${dirName}`;
    Deno.mkdirSync(dir);
    Deno.createSync(`${dir}/index${scriptSuffix}`);
    Deno.writeTextFileSync(`${dir}/index.html`, fileText);
  };
  fileText;
  if (args.useBackgroundScript) {
    writeScripts("background");
  }

  if (args.useContentScript) {
    Deno.mkdirSync(`${parentDir}/content`);
    Deno.createSync(`${parentDir}content/index${scriptSuffix}`);
  }

  if (args.useBrowserPopupScript) {
    writeScripts("browserAction");
  }
  if (args.usePagePopupScript) {
    writeScripts("pageAction");
  }
  if (args.useOptionsPage) {
    writeScripts("options");
  }
}

/**
 * Creates the various files of the extension
 * @param args The arguments we base the create files with
 */
async function createFiles(args: Arguments) {
  const extensionDir = args.outputDir + args.name;

  Deno.mkdirSync(extensionDir, { recursive: true });

  const manifestText = generateManifestText(args);

  Deno.writeTextFileSync(
    `${extensionDir}/manifest.json`,
    manifestText,
  );

  await createScripts(args);
}

/**
 * Adds everything needed to make project into typescript
 * @param args The arguments regarding the web extension
 */
async function setupTypescript(args: Arguments) {
  const extensionDir = args.outputDir + args.name;

  const init = Deno.run({
    cmd: ["npm", "init", "-y"],
    cwd: extensionDir,
    stdout: "null",
  });
  await init.status();
  init.close();

  const tsConfigText = await loadFileText("tsconfig.json");

  await Deno.writeTextFile(
    `${extensionDir}/tsconfig.json`,
    tsConfigText,
  );

  const packageFile = Deno.readTextFileSync(`${extensionDir}/package.json`);
  const packageObject = JSON.parse(packageFile);
  packageObject.name = args.name;
  packageObject.description = args.description;
  packageObject.version = args.version;

  packageObject.scripts = {
    start:
      "parcel manifest.json --host localhost --config @parcel/config-webextension --target webext-dev",
    build:
      "parcel build manifest.json --config @parcel/config-webextension --target webext-prod",
  };

  packageObject.targets = {
    "webext-dev": {},
    "webext-prod": {},
  };

  // Adds necessary changes in package.json
  Deno.writeTextFileSync(
    `${extensionDir}/package.json`,
    JSON.stringify(packageObject, null, "\t"),
  );

  const installDependencies = Deno.run({
    cmd: [
      "npm",
      "i",
      "typescript",
      "web-ext",
      "webextension-polyfill",
      "--save",
    ],
    cwd: extensionDir,
  });
  await installDependencies.status();
  installDependencies.close();

  const installDevDependencies = Deno.run({
    cmd: [
      "npm",
      "i",
      "parcel",
      "@parcel/config-webextension",
      "@types/webextension-polyfill",
      "--save-dev",
    ],
    cwd: extensionDir,
  });
  await installDevDependencies.status();
  installDevDependencies.close();

  const build = Deno.run({
    cmd: [
      "npm",
      "run",
      "build",
    ],
    cwd: extensionDir,
  });
  await build.status();
  build.close();
}

try {
  const inputArgs = parseInputArgs();

  let args;

  // Checks if we just use default values or no
  if (inputArgs.disablePrompt) {
    args = generateArgsByCommands(inputArgs);
  } else {
    args = await inquire(inputArgs);
  }

  if (!args.outputDir.endsWith("/")) {
    args.outputDir = args.outputDir + "/";
  }

  await createFiles(args);

  if (args.isTypescript) {
    await setupTypescript(args);
  }

  console.log(`Extension ${args.name} Complete`);
} catch (error) {
  console.log(error);
}

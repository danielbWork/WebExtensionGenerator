// import yargs from "https://cdn.deno.land/yargs/versions/yargs-v16.2.1-deno/raw/deno.ts";
import Ask from "https://deno.land/x/ask@1.0.6/mod.ts";
import { Arguments } from "./Arguments.ts";

const REPO_URL =
  "https://raw.githubusercontent.com/danielbWork/WebExtensionGenerator/main/";

/**
 * Asks the user about the various settings for the extension
 * @returns The answers of the user
 */
async function inquire() {
  const ask = new Ask();

  const answers = await ask.prompt([{
    name: "name",
    message: "Extension name:",
    type: "input",
    default: "MyExtension",
    validate: (val) => {
      return !val || val.trim() !== "";
    },
  }, {
    name: "description",
    message: "Description:",
    type: "input",
    default: "Creates world peace",
  }, {
    name: "version",
    message: "Version:",
    type: "input",
    default: "1.0.0",
    validate: (val) => {
      return !val || new RegExp(/^\d+(\.\d+)*$/g).test(val);
    },
  }, {
    name: "isTypescript",
    message: "Have extension be in typescript:",
    type: "confirm",
  }, {
    name: "useBackgroundScript",
    message: "Include background script:",
    type: "confirm",
  }, {
    name: "useContentScript",
    message: "Include content script:",
    type: "confirm",
  }, {
    name: "useBrowserPopupScript",
    message: "Include browser action popup script:",
    type: "confirm",
  }, {
    name: "usePagePopupScript",
    message: "Include page action popup script:",
    type: "confirm",
  }, {
    name: "useOptionsPage",
    message: "Include options page:",
    type: "confirm",
  }]);

  // Does conversion for linter
  return (answers as unknown as Arguments);
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
  const parentDir = `${args.name}/src/`;

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
  Deno.mkdirSync(args.name);

  const manifestText = generateManifestText(args);

  Deno.writeTextFileSync(`${args.name}/manifest.json`, manifestText);

  await createScripts(args);
}

/**
 * Adds everything needed to make project into typescript
 * @param args The arguments regarding the web extension
 */
async function setupTypescript(args: Arguments) {
  const init = Deno.run({
    cmd: ["npm", "init", "-y"],
    cwd: args.name,
    stdout: "null",
  });
  await init.status();
  init.close();

  const tsConfigText = await loadFileText("tsconfig.json");

  await Deno.writeTextFile(`${args.name}/tsconfig.json`, tsConfigText);

  const packageFile = Deno.readTextFileSync(`${args.name}/package.json`);
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
    `${args.name}/package.json`,
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
    cwd: args.name,
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
    cwd: args.name,
  });
  await installDevDependencies.status();
  installDevDependencies.close();

  const build = Deno.run({
    cmd: [
      "npm",
      "run",
      "build",
    ],
    cwd: args.name,
  });
  await build.status();
  build.close();
}

try {
  const args = await inquire();

  await createFiles(args);

  if (args.isTypescript) {
    await setupTypescript(args);
  }

  console.log(`Extension ${args.name} Complete`);
} catch (error) {
  console.log(error);
}

// const inputArgs: Arguments = yargs(Deno.args)
// .command()
//   .alias("n", "name")
//   .alias("d", "description")
//   .alias("b", "backgroundPage")
//   .alias("p", "browserPopupPage")
//   .alias("u", "pagePopupPage")
//   .alias("c", "contentScriptUrl").argv;

// console.log(inputArgs);

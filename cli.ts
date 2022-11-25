// import yargs from "https://cdn.deno.land/yargs/versions/yargs-v16.2.1-deno/raw/deno.ts";
import Ask from "https://deno.land/x/ask@1.0.6/mod.ts";
import { Arguments } from "./Arguments.ts";
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
    manifest_version: 3,
    name: args.name,
    description: args.description,
    version: args.version,
    icons: {}, // TODO Maybe add custom icons
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
 * Creates the scripts for the extension
 * @param args The arguments deciding which scripts to create
 */
function createScripts(args: Arguments) {
  const parentDir = `${args.name}/src/`;

  const scriptSuffix = args.isTypescript ? ".ts" : ".js";
  // TODO check how to have this work on outside project
  const htmlPath = args.isTypescript ? "indexTS.html" : "index.html";

  Deno.mkdirSync(parentDir);

  const writeScripts = (dirName: string) => {
    const dir = `${parentDir}${dirName}`;
    Deno.mkdirSync(dir);
    Deno.createSync(`${dir}/index${scriptSuffix}`);
    Deno.copyFileSync(htmlPath, `${dir}/index.html`);
  };

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
function createFiles(args: Arguments) {
  Deno.mkdirSync(args.name);

  const manifestText = generateManifestText(args);

  Deno.writeTextFileSync(`${args.name}/manifest.json`, manifestText);

  createScripts(args);
}

async function main() {
  const args = await inquire();

  console.log(args);

  createFiles(args);

  console.log(`Extension ${args.name} Complete`);
}

main().catch((e) => {
  console.log(e);
});

// const inputArgs: Arguments = yargs(Deno.args)
// .command()
//   .alias("n", "name")
//   .alias("d", "description")
//   .alias("b", "backgroundPage")
//   .alias("p", "browserPopupPage")
//   .alias("u", "pagePopupPage")
//   .alias("c", "contentScriptUrl").argv;

// console.log(inputArgs);

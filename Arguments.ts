/**
 * Arguments for the cli
 */
export interface Arguments {
  /**
   * The extension name
   */
  name: string;

  /**
   * The description of the extension
   */
  description: string;

  /**
   * The version of the extension
   */
  version: string;

  /**
   * Includes a background script
   */
  useBackgroundScript: boolean;

  /**
   * Includes a content script
   */
  useContentScript: boolean;

  /**
   * Includes a browser action popup script
   */
  useBrowserPopupScript: boolean;

  /**
   * Includes a page action popup script
   */
  usePagePopupScript: boolean;

  /**
   * Includes a options page
   */
  useOptionsPage: boolean;

  /**
   * Whether or not the extension should be written in typescript or javascript
   */
  isTypescript: boolean;

  /**
   * Where we put the extension
   */
  outputDir: string;
}

import fs from "fs";
import {
  crawlInputDirectory,
  createFiles,
  FileToGenerate,
  generateLocalizedFrontmatter,
  overwriteAstroFrontmatter,
  parseFrontmatter,
} from "./utils";

/**
 * Reads all files inside inputPath
 *
 * @param inputPath
 * @param languages
 * @param outputPath
 */
export const generate = (
  inputPath: string,
  defaultLanguage: string,
  languages: string[],
  outputPath: string = inputPath
) => {
  const files = crawlInputDirectory(inputPath);

  const allLanguages = [defaultLanguage, ...languages];

  const filesToGenerate: FileToGenerate[] = [];

  files.forEach(async function (file) {
    const inputFilePath = [inputPath, file].join("/");
    const extension = file.split(".").pop();

    // only parse astro files
    if (extension === "astro") {
      const fileContents = fs.readFileSync(inputFilePath);
      const fileContentsString = fileContents.toString();

      const parsedFrontmatter = parseFrontmatter(fileContentsString);

      allLanguages.forEach((language) => {
        const frontmatterCode = generateLocalizedFrontmatter(
          parsedFrontmatter,
          language
        );

        // get the astro file contents
        const newFileContents = overwriteAstroFrontmatter(
          fileContentsString,
          frontmatterCode
        );

        filesToGenerate.push({
          path: [
            outputPath,
            language === defaultLanguage ? null : language,
            file,
          ]
            .filter(Boolean)
            .join("/"),
          source: newFileContents,
        });
      });
    }
  });

  createFiles(filesToGenerate);
};

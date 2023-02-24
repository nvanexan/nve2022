import fs from "fs";
import path from "path";

class BuildHelpers {
  static BUILD_DIR: string = "./dist";
  static TEMPLATES_DIR: string = "./src/templates";
  static CONTENTS_DIR: string = "./content";
  static PUBLIC_DIR: string = "./public";
  static BASE_URL: string = "https://nick.vanexan.ca";

  static getTemplateAsync(contentPath: string) {
    // For now we just have two templates, handling this in code
    // Should convert to configuration if becomes more complex over time
    const template = contentPath.includes("post") ? "[post]" : "[page]";
    return fs.promises.readFile(
      path.resolve(this.TEMPLATES_DIR, `${template}.html`),
      "utf-8"
    );
  }

  static async getContentAsync(fileName: string) {
    return fs.promises.readFile(
      path.resolve(this.CONTENTS_DIR, fileName),
      "utf-8"
    );
  }

  static getPublicFileSync(fileName: string) {
    return fs.readFileSync(path.resolve(this.PUBLIC_DIR, fileName), "utf-8");
  }

  static async *getAllFiles(dir: string): AsyncGenerator<string> {
    const dirEntries = await fs.promises.readdir(dir, { withFileTypes: true });
    for (const dirent of dirEntries) {
      const res = path.resolve(dir, dirent.name);
      if (dirent.isDirectory()) {
        yield* BuildHelpers.getAllFiles(res);
      } else {
        yield res.replace(/.*content\//, "");
      }
    }
  }

  static async writeFileAsync(dir: string, fileName: string, html: string) {
    const path = dir ? `${this.BUILD_DIR}/${dir}` : `${this.BUILD_DIR}`;
    if (!fs.existsSync(path)) {
      fs.mkdirSync(path, { recursive: true });
    }
    return fs.promises.writeFile(`${path}/${fileName}.html`, html);
  }

  static async writeRss(xml: string) {
    const path = this.BUILD_DIR;
    return fs.promises.writeFile(`${path}/feed.xml`, xml);
  }

  static copyFileSync(source: string, target: string) {
    var targetFile = target;

    // If target is a directory, a new file with the same name will be created
    if (fs.existsSync(target)) {
      if (fs.lstatSync(target).isDirectory()) {
        targetFile = path.join(target, path.basename(source));
      }
    }

    fs.writeFileSync(targetFile, fs.readFileSync(source));
  }

  static copyFolderRecursiveSync(source: string, target: string) {
    let files = [];

    // Check if folder needs to be created or integrated
    let targetFolder = path.join(target, path.basename(source));
    if (!fs.existsSync(targetFolder)) {
      fs.mkdirSync(targetFolder, { recursive: true });
    }

    // Copy
    if (fs.lstatSync(source).isDirectory()) {
      files = fs.readdirSync(source);
      files.forEach((file) => {
        let curSource = path.join(source, file);
        if (fs.lstatSync(curSource).isDirectory()) {
          this.copyFolderRecursiveSync(curSource, targetFolder);
        } else {
          this.copyFileSync(curSource, targetFolder);
        }
      });
    }
  }
}

export default BuildHelpers;

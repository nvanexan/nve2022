import fs from "fs";
import path from "path";

class BuildHelpers {
  static BUILD_DIR: string = "./dist";
  static TEMPLATES_DIR: string = "./src/templates";
  static CONTENTS_DIR: string = "./content";

  static getTemplate(fileName: string) {
    return fs.readFileSync(
      path.resolve(this.TEMPLATES_DIR, `${fileName}.html`),
      "utf-8"
    );
  }

  static getContent(fileName: string) {
    return fs.readFileSync(
      path.resolve(this.CONTENTS_DIR, `${fileName}.md`),
      "utf-8"
    );
  }

  static writeFile(dir: string, fileName: string, html: string) {
    const path = dir ? `${this.BUILD_DIR}/${dir}` : `${this.BUILD_DIR}`;
    if (!fs.existsSync(path)) {
      fs.mkdirSync(path, { recursive: true });
    }
    fs.writeFileSync(`${path}/${fileName}.html`, html);
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

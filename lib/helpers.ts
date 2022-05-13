import fs from "fs";
import path from "path";

export function getTemplate(fileName: string) {
  // TODO: make async
  return fs.readFileSync(
    path.resolve("./src/templates", `${fileName}.html`),
    "utf-8"
  );
}

export function getContent(fileName: string) {
  // TODO: make async
  return fs.readFileSync(path.resolve("./content", `${fileName}.md`), "utf-8");
}

export function copyFileSync(source: string, target: string) {
  var targetFile = target;

  // If target is a directory, a new file with the same name will be created
  if (fs.existsSync(target)) {
    if (fs.lstatSync(target).isDirectory()) {
      targetFile = path.join(target, path.basename(source));
    }
  }

  fs.writeFileSync(targetFile, fs.readFileSync(source));
}

export function copyFolderRecursiveSync(source: string, target: string) {
  var files = [];

  // Check if folder needs to be created or integrated
  var targetFolder = path.join(target, path.basename(source));
  if (!fs.existsSync(targetFolder)) {
    fs.mkdirSync(targetFolder);
  }

  // Copy
  if (fs.lstatSync(source).isDirectory()) {
    files = fs.readdirSync(source);
    files.forEach(function (file) {
      var curSource = path.join(source, file);
      if (fs.lstatSync(curSource).isDirectory()) {
        copyFolderRecursiveSync(curSource, targetFolder);
      } else {
        copyFileSync(curSource, targetFolder);
      }
    });
  }
}

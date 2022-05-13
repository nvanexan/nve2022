function parseFileName(path: string) {
  const paths = path.split("/");
  const fileName = paths.pop() || "";
  const [, name] = fileName.match(/(.+?)(\.[^.]*$|$)/im) || [fileName, "", ""];
  return name;
}

const result = parseFileName("foo/bar/baz.html");

console.log(result);

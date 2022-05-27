import watch from "glob-watcher";
import parseArgs from "minimist";
import { Parcel } from "@parcel/core";
import { config } from "../schema/config.markdoc";
import BuildHelpers from "./helpers";
import Compiler from "./compiler";

class Build {
  private argv: parseArgs.ParsedArgs;
  private compiler: Compiler;

  constructor() {
    this.argv = parseArgs(process.argv.slice(2));
    this.compiler = new Compiler(config);
  }

  public async start() {
    if (this.argv.watch) {
      this.copyPublic();
      this.runParcelWatcher();
      this.runPublicWatcher();
      this.runContentWatcher();
    } else {
      this.copyPublic();
      await this.compiler.compilePages();
      process.exit();
    }
  }

  private copyPublic() {
    BuildHelpers.copyFolderRecursiveSync("./public", "./dist/");
  }

  private runContentWatcher() {
    const watcher = watch(["./content/**/*.md", "./schema/**/*.markdoc.ts"]);
    watcher.on("change", async (path) => {
      console.log("A file has changed, recompiling pages...");
      await this.compiler.compilePages();
    });
    watcher.on("add", async (path) => {
      console.log("A file has been added, recompiling pages...");
      await this.compiler.compilePages();
    });
  }

  private runPublicWatcher() {
    const watcher = watch(["./public"]);
    watcher.on("change", (path) => {
      console.log(`Public contents have changed, recopying...`);
      this.copyPublic();
    });
  }

  private async runParcelWatcher() {
    let bundler = new Parcel({
      entries: ["./src/main.ts", "./src/components/**/*", "./src/styles/**/*"],
      defaultConfig: "@parcel/config-default",
    });

    await bundler.watch((err, event) => {
      if (err) {
        // fatal error
        throw err;
      }

      if (event?.type === "buildSuccess") {
        let bundles = event.bundleGraph.getBundles();
        console.log(
          `✨ Built ${bundles.length} bundles in ${event.buildTime}ms!`
        );
        this.compiler.compilePages();
      } else if (event?.type === "buildFailure") {
        console.log(event.diagnostics);
      }
    });
  }
}

// Run the build
const builder = new Build();
builder.start();

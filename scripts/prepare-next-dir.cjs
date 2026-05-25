/* eslint-disable no-console */
const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");

function main() {
  if (process.platform !== "win32") {
    return;
  }

  const projectRoot = process.cwd();
  const projectNextPath = path.join(projectRoot, ".next");

  if (fs.existsSync(projectNextPath)) {
    try {
      const stat = fs.lstatSync(projectNextPath);
      if (stat.isSymbolicLink()) {
        fs.unlinkSync(projectNextPath);
      } else {
        fs.rmSync(projectNextPath, { recursive: true, force: true });
      }
    } catch {
      spawnSync("cmd.exe", ["/d", "/s", "/c", "rmdir /s /q .next"], {
        cwd: projectRoot,
        stdio: "ignore",
      });
    }
  }

  fs.mkdirSync(projectNextPath, { recursive: true });

  spawnSync("attrib", ["+P", ".next", "/S", "/D"], {
    cwd: projectRoot,
    stdio: "ignore",
  });

  console.log("[prepare:next-dir] Reset local .next directory");
}

main();

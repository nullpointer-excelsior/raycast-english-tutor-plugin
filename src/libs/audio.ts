import * as child_process from "node:child_process";

export function playAudio(filePath: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const proc = child_process.spawn("afplay", [filePath]);
    proc.on("close", (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`afplay exited with code ${code}`));
      }
    });
    proc.on("error", (err) => {
      reject(err);
    });
  });
}

import * as child_process from "node:child_process";
import { playAudio } from "../libs/audio";

jest.mock("node:child_process");

const mockChildProcess = child_process as jest.Mocked<typeof child_process>;

function makeProc(events: { close?: number; error?: Error }) {
  const listeners: Record<string, ((...args: unknown[]) => void)[]> = {};

  const proc: { on: jest.Mock } = {
    on: jest.fn((event: string, cb: (...args: unknown[]) => void) => {
      listeners[event] = listeners[event] ?? [];
      listeners[event].push(cb);
      return proc;
    }),
  };

  // Emit events asynchronously so the Promise chain can set up
  setImmediate(() => {
    if (events.error !== undefined) {
      listeners["error"]?.forEach((cb) => cb(events.error));
    } else {
      listeners["close"]?.forEach((cb) => cb(events.close));
    }
  });

  return proc;
}

describe("playAudio", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("resolves when afplay exits with code 0", async () => {
    const proc = makeProc({ close: 0 });
    mockChildProcess.spawn.mockReturnValue(proc as never);

    await expect(playAudio("/tmp/test.mp3")).resolves.toBeUndefined();
    expect(mockChildProcess.spawn).toHaveBeenCalledWith("afplay", ["/tmp/test.mp3"]);
  });

  it("rejects when afplay exits with non-zero code", async () => {
    const proc = makeProc({ close: 1 });
    mockChildProcess.spawn.mockReturnValue(proc as never);

    await expect(playAudio("/tmp/test.mp3")).rejects.toThrow("afplay exited with code 1");
  });

  it("rejects when spawn emits an error event", async () => {
    const spawnError = new Error("spawn ENOENT");
    const proc = makeProc({ error: spawnError });
    mockChildProcess.spawn.mockReturnValue(proc as never);

    await expect(playAudio("/tmp/test.mp3")).rejects.toThrow("spawn ENOENT");
  });
});

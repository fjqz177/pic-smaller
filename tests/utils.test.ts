import { expect, test } from "vitest";
import {
  getUniqNameOnNames,
  normalize,
  formatSize,
  splitFileName,
} from "@/functions";

test("Path normalize check", () => {
  expect(normalize("")).toBe("");
  expect(normalize("/a/b")).toBe("a/b");
  expect(normalize("/sub/a/b", "/sub")).toBe("a/b");
  expect(normalize("/a/b", "/sub")).toBe("error404");
});

test("Rename check", () => {
  const names = new Set<string>(["a.jpg", "b.png"]);
  expect(getUniqNameOnNames(names, "a.jpg")).toBe("a(1).jpg");
  names.add("a(1).jpg");
  expect(getUniqNameOnNames(names, "a.jpg")).toBe("a(1)(1).jpg");
});

test("formatSize converts bytes to human readable", () => {
  expect(formatSize(1024)).toBe("1 KB");
  expect(formatSize(1024 * 1024)).toBe("1 MB");
  expect(formatSize(512)).toBe("512 B");
  expect(formatSize(1.5 * 1024 * 1024)).toBe("1.5 MB");
});

test("splitFileName extracts name and suffix", () => {
  expect(splitFileName("test.jpg")).toEqual({ name: "test", suffix: "jpg" });
  expect(splitFileName("archive.tar.gz")).toEqual({
    name: "archive.tar",
    suffix: "gz",
  });
  expect(splitFileName("file")).toEqual({ name: "", suffix: "file" });
  expect(splitFileName(".hidden")).toEqual({ name: "", suffix: "hidden" });
  expect(splitFileName("TEST.JPG")).toEqual({ name: "TEST", suffix: "jpg" });
});

test("getUniqNameOnNames edge cases", () => {
  expect(getUniqNameOnNames(new Set(), "test.png")).toBe("test.png");

  const namesNoExt = new Set(["file", "file(1)"]);
  expect(getUniqNameOnNames(namesNoExt, "file")).toBe("(1).file");

  const namesWithDots = new Set(["my.test.file.png", "my.test.file(1).png"]);
  expect(getUniqNameOnNames(namesWithDots, "my.test.file.png")).toBe(
    "mytestfile(1).png",
  );
});

import { filesize } from "filesize";
import { Mimes } from "@/mimes";
import type { ImageItem } from "@/states/home";
import type { CompressOption } from "@/engines/ImageBase";

export function formatSize(num: number) {
  const result = filesize(num, { standard: "jedec", output: "array" });
  return result[0] + " " + result[1];
}

export function splitFileName(fileName: string) {
  const index = fileName.lastIndexOf(".");
  const name = fileName.substring(0, index);
  const suffix = fileName.substring(index + 1).toLowerCase();
  return { name, suffix };
}

export function getOutputFileName(
  item: ImageItem,
  option: CompressOption,
): string {
  if (item.blob.type === item.compress?.blob.type) {
    return item.name;
  }

  const { name, suffix } = splitFileName(item.name);
  let resultSuffix = suffix;
  for (const key in Mimes) {
    if (item.compress!.blob.type === Mimes[key]) {
      resultSuffix = key;
      break;
    }
  }

  if (["jpg", "jpeg"].includes(resultSuffix)) {
    resultSuffix = option.format.target?.toLowerCase() || resultSuffix;
  }

  return name + "." + resultSuffix;
}

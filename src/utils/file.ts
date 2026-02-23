import { Mimes } from "@/mimes";

export async function getFilesFromEntry(
  entry: FileSystemEntry,
): Promise<Array<File>> {
  if (entry.isFile) {
    const fileEntry = entry as FileSystemFileEntry;
    return new Promise<Array<File>>((resolve) => {
      fileEntry.file(
        (result) => {
          const types = Object.values(Mimes);
          resolve(types.includes(result.type) ? [result] : []);
        },
        () => [],
      );
    });
  }

  if (entry.isDirectory) {
    const dirEntry = entry as FileSystemDirectoryEntry;
    const list = await new Promise<Array<FileSystemEntry>>((resolve) => {
      dirEntry.createReader().readEntries(resolve, () => []);
    });
    const result: Array<File> = [];
    for (const item of list) {
      const subList = await getFilesFromEntry(item);
      result.push(...subList);
    }
    return result;
  }

  return [];
}

export async function getFilesFromHandle(
  handle: FileSystemHandle,
): Promise<Array<File>> {
  if (handle.kind === "file") {
    const fileHandle = handle as FileSystemFileHandle;
    const file = await fileHandle.getFile();
    const types = Object.values(Mimes);
    return types.includes(file.type) ? [file] : [];
  }

  if (handle.kind === "directory") {
    const result: Array<File> = [];
    for await (const item of (handle as any).values()) {
      const subList = await getFilesFromHandle(item);
      result.push(...subList);
    }
    return result;
  }

  return [];
}

export async function getFilesFromClipboard(
  event: ClipboardEvent,
): Promise<Array<File>> {
  const files: Array<File> = [];

  if (!event.clipboardData) {
    return files;
  }

  const items = event.clipboardData.items;

  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    if (item.type.startsWith("image/")) {
      const file = item.getAsFile();
      if (file) {
        const types = Object.values(Mimes);
        if (types.includes(file.type)) {
          files.push(file);
        }
      }
    }
  }

  return files;
}

export function hasImageInClipboard(event: ClipboardEvent): boolean {
  if (!event.clipboardData) {
    return false;
  }

  const items = event.clipboardData.items;

  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    if (item.type.startsWith("image/")) {
      return true;
    }
  }

  return false;
}

export function createDownload(name: string, blob: Blob) {
  const anchor = document.createElement("a");
  anchor.href = URL.createObjectURL(blob);
  anchor.download = name;
  anchor.click();
  anchor.remove();
}

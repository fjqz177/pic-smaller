export function normalize(
  pathname: string,
  base = import.meta.env.BASE_URL,
): string {
  pathname = "/" + pathname.replace(/^\/*/, "");
  base = "/" + base.replace(/^\/*/, "");
  if (!pathname.startsWith(base)) return "error404";
  return pathname.substring(base.length).replace(/^\/*|\/*$/g, "");
}

let __UniqIdIndex = 0;
export function uniqId(): number {
  __UniqIdIndex += 1;
  return __UniqIdIndex;
}

export async function wait(millisecond: number): Promise<void> {
  return new Promise<void>((resolve) => {
    window.setTimeout(resolve, millisecond);
  });
}

export async function preloadImage(src: string): Promise<void> {
  return new Promise<void>((resolve) => {
    const img = new Image();
    img.src = src;
    img.onload = () => resolve();
    img.onerror = () => resolve();
  });
}

export function getUniqNameOnNames(names: Set<string>, name: string): string {
  const getName = (checkName: string): string => {
    if (names.has(checkName)) {
      const nameParts = checkName.split(".");
      const extension = nameParts.pop();
      const newName = nameParts.join("") + "(1)." + extension;
      return getName(newName);
    } else {
      return checkName;
    }
  };
  return getName(name);
}

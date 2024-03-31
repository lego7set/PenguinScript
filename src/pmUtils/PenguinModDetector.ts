export const SupportsExtensions = typeof window === "object" && window && typeof window.document === "object" && window.document && typeof window.Scratch === "object" && window.Scratch;
export const IsPenguinMod = SupportsExtensions && window.Scratch.extensions.isPenguinMod; // we need this for loops later, cuz we need to be able to yield to the compiler if its penguinmod

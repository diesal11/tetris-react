export default function assertNever(value: never): never {
  throw new Error(`Unhandled value: ${value}`);
}

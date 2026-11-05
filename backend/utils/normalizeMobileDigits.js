export function normalizeMobileDigits(value) {
  return value
    .replace(/[۰-۹]/g, (digit) =>
      String.fromCharCode(digit.charCodeAt(0) - 0x06f0 + 0x30),
    )
    .replace(/[٠-٩]/g, (digit) =>
      String.fromCharCode(digit.charCodeAt(0) - 0x0660 + 0x30),
    )
    .replace(/\s/g, "");
}

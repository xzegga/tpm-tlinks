export function toPascalCase(...strings: string[]): string {
    // Join all strings into one with spaces between them
    const combinedString = strings.join(' ');

    // Split the combined string into an array of words
    const words: string[] = combinedString.split(/\s+/);

    // Capitalize the first letter of each word and concatenate them
    const pascalCasePhrase: string = words.map((word) => word.charAt(0).toUpperCase() + word.slice(1)).join('');

    return pascalCasePhrase;
}

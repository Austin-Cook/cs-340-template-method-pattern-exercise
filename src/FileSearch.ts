import { LineSearchTemplate } from "./LineSearchTemplate";

class FileSearch extends LineSearchTemplate {
  private searchRegExp: RegExp;

  public static main(): void {
    let fileSearch: FileSearch;

    if (process.argv.length === 5) {
      fileSearch = new FileSearch(
        process.argv[2],
        process.argv[3],
        process.argv[4]
      );
    } else if (process.argv.length === 6 && process.argv[2].match("-r")) {
      fileSearch = new FileSearch(
        process.argv[3],
        process.argv[4],
        process.argv[5],
        true
      );
    } else {
      this.usage();
      return;
    }

    fileSearch.run();
  }

  private static usage(): void {
    console.log(
      "USAGE: npx ts-node src/FileSearch.ts {-r} <dir> <file-pattern> <search-pattern>"
    );
  }

  private constructor(
    dirName: string,
    filePattern: string,
    searchPattern: string,
    recurse: boolean = false
  ) {
    super(dirName, filePattern, recurse);
    this.searchRegExp = new RegExp(searchPattern);
  }

  protected countInFile(lines: string[], filePath: string): number {
    let matches = 0;

    lines.forEach((line) => {
      if (this.searchRegExp.test(line)) {
        if (++matches == 1) {
          console.log();
          console.log(`FILE: ${filePath}`);
        }

        console.log(line);
      }
    });

    return matches;
  }

  protected logResults(): void {
    console.log();
    console.log(`TOTAL MATCHES: ${this.totalCount}`);
  }

  protected logCountInFile(currentCount: number, filePath: string): void {
    if (currentCount > 0) {
      console.log(`MATCHES: ${currentCount}`);
    }
  }
}

FileSearch.main();

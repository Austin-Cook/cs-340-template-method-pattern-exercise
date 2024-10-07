import * as fs from "fs";
import * as path from "path";

export abstract class LineSearchTemplate {
  protected dirName: string;
  protected fileRegExp: RegExp;
  protected recurse: boolean;
  protected totalCount: number = 0

  constructor(
    dirName: string,
    filePattern: string,
    recurse: boolean = false
  ) {
    this.dirName = dirName;
    this.fileRegExp = new RegExp(filePattern);
    this.recurse = recurse;
  }

  protected async run() {
    await this.searchDirectory(this.dirName);
    this.logResults();
  }

  protected abstract countInFile(lines: string[], filePath: string): number;
  protected abstract logResults(): void;
  protected abstract logCountInFile(currentCount: number, filePath: string): void;

  private async searchDirectory(filePath: string) {
    if (!this.isDirectory(filePath)) {
      this.nonDirectory(filePath);
      return;
    }

    if (!this.isReadable(filePath)) {
      this.unreadableDirectory(filePath);
      return;
    }

    const files = fs.readdirSync(filePath);

    for (let file of files) {
      const fullPath = path.join(filePath, file);
      if (this.isFile(fullPath)) {
        if (this.isReadable(fullPath)) {
          await this.searchFile(fullPath); // unique op
        } else {
          this.unreadableFile(fullPath);
        }
      }
    }

    if (this.recurse) {
      for (let file of files) {
        const fullPath = path.join(filePath, file);
        if (this.isDirectory(fullPath)) {
          await this.searchDirectory(fullPath);
        }
      }
    }
  }

  private async searchFile(filePath: string) {
    if (this.fileRegExp.test(filePath)) {
      let currentCount = 0;

      try {
        const fileContent: string = await fs.promises.readFile(
          filePath,
          "utf-8"
        );

        const lines: string[] = fileContent.split(/\r?\n/);

        currentCount += this.countInFile(lines, filePath);
        this.totalCount += currentCount;
      } catch (error) {
        this.unreadableFile(filePath);
      } finally {
        this.logCountInFile(currentCount, filePath);
      }
    }
  }

  protected isDirectory(path: string): boolean {
    try {
      return fs.statSync(path).isDirectory();
    } catch (error) {
      return false;
    }
  }

  protected isFile(path: string): boolean {
    try {
      return fs.statSync(path).isFile();
    } catch (error) {
      return false;
    }
  }

  protected isReadable(path: string): boolean {
    try {
      fs.accessSync(path, fs.constants.R_OK);
      return true;
    } catch (error) {
      return false;
    }
  }

  protected nonDirectory(dirName: string): void {
    console.log(`${dirName} is not a directory`);
  }

  protected unreadableDirectory(dirName: string): void {
    console.log(`Directory ${dirName} is unreadable`);
  }

  protected unreadableFile(fileName: string): void {
    console.log(`File ${fileName} is unreadable`);
  }
}

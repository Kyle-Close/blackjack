import fs from 'node:fs';

export class Logger {
  writeStream: fs.WriteStream;

  constructor(path: fs.PathLike) {
    this.writeStream = fs.createWriteStream(path, { flags: 'a', encoding: 'utf8' });

    this.writeStream.on('error', (err) => {
      console.error(`Logger encountered a critical stream error:`, err);
    });
  }

  log(message: string) {
    this.writeStream.write(`${message}\n`);
  }

  public close(): Promise<void> {
    return new Promise((resolve) => {
      this.writeStream.end(resolve);
    });
  }
}

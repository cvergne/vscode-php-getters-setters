'use strict';

import Configuration from "./Configuration";
import fs = require('fs');
import path = require('path');
import os = require('os');

export default class TemplatesManager {

    config: Configuration;

    constructor() {
        this.config = new Configuration;
        this.initTemplatesDir();
    }

    public exists(fileName: string): boolean {
        return fs.existsSync(path.join(this.templatesDir(), fileName));
    }

    public path(fileName: string) : string {
        return path.join(this.templatesDir(), fileName);
    }

    public templatesDir(): string {
        const settingsDir = this.config.get('templatesDir', null);

        if (settingsDir && fs.existsSync(settingsDir)) {
            return settingsDir;
        }

        return this.defaultTemplatesDir();
    }

    private defaultTemplatesDir(): string {
        let userDataDir = '';

        switch (process.platform) {
            case 'linux':
                userDataDir = path.join(os.homedir(), '.config');
                break;
            case 'darwin':
                userDataDir = path.join(os.homedir(), 'Library', 'Application Support');
                break;
            case 'win32':
                userDataDir = process.env.APPDATA ?? '';
                break;
            default:
                throw Error("Unrecognizable operative system");
        }

        return path.join(userDataDir, 'Code', 'User', 'phpGettersSetters');
    }

    private initTemplatesDir() {
        const templatesDir = this.templatesDir();

        fs.mkdir(templatesDir, '0755', function (err) {
            if (err && err.code != 'EEXIST') {
                throw Error("Failed to created templates directory " + templatesDir);
            }
        });
    }
}

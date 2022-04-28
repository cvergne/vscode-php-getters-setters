'use strict';

import * as vscode from 'vscode';
import Redirector from "./Redirector";
import Property from "./Property";
import Configuration from "./Configuration";
import TemplatesManager from './TemplatesManager';

class Resolver {
    config: Configuration;
    templatesManager: TemplatesManager;

    /**
     * Types that won't be recognised as valid type hints
     */
    pseudoTypes = ['mixed', 'number', 'callback', 'object', 'void'];

    public constructor()
    {
        const editor = this.activeEditor();

        if (!editor) {
            throw new Error('Error while initializing extension');
        }

        if (editor.document.languageId !== 'php') {
            throw new Error('Not a PHP file.');
        }

        this.config = new Configuration;
        this.templatesManager = new TemplatesManager;
    }

    activeEditor() {
        return vscode.window.activeTextEditor;
    }

    closingClassLine() {
        const editor = this.activeEditor();

        if (!editor) {
            throw new Error('Error editor not available');
        }

        for (let lineNumber = editor.document.lineCount - 1; lineNumber > 0; lineNumber--) {
            const line = editor.document.lineAt(lineNumber);
            const text = line.text.trim();

            if (text.startsWith('}')) {
                return line;
            }
        }

        return {lineNumber: 1};
    }

    insertGetter() {
        const editor = this.activeEditor();
        let property = null;
        let content = '';

        if (!editor) {
            throw new Error('Error editor not available');
        }

        for (let index = 0; index < editor.selections.length; index++) {
            const selection = editor.selections[index];

            try {
                property = Property.fromEditorPosition(editor, selection.active);
            } catch (error: any) {
                this.showErrorMessage(error.message);
                return null;
            }

            content += this.getterTemplate(property);
        }

        this.renderTemplate(content);
    }

    insertGetterAndSetter(){
        const editor = this.activeEditor();
        let property = null;
        let content = '';

        if (!editor) {
            throw new Error('Error editor not available');
        }

        for (let index = 0; index < editor.selections.length; index++) {
            const selection = editor.selections[index];

            try {
                property = Property.fromEditorPosition(editor, selection.active);
            } catch (error: any) {
                this.showErrorMessage(error.message);
                return null;
            }

            content += this.getterTemplate(property) + this.setterTemplate(property);
        }

        this.renderTemplate(content);
    }

    insertSetter() {
        const editor = this.activeEditor();
        let property = null;
        let content = '';

        if (!editor) {
            throw new Error('Error editor not available');
        }

        for (let index = 0; index < editor.selections.length; index++) {
            const selection = editor.selections[index];

            try {
                property = Property.fromEditorPosition(editor, selection.active);
            } catch (error: any) {
                this.showErrorMessage(error.message);
                return null;
            }

            content += this.setterTemplate(property);
        }

        this.renderTemplate(content);
    }

    /**
     * Iterates all lines in the active document searching for properties,
     * and create getters and setters for every property.
     * Does NOT recognize different classes in a single document.
     */
    insertAllGetterAndSetter() {
        const editor = this.activeEditor();
        let content = '';

        if (!editor) {
            throw new Error('Error editor not available');
        }

        let hasProperties = false;

        for (let i = 0; i < editor.document.lineCount; i++) {
            const line = editor.document.lineAt(i);
            // End loop asap
            if (line.text == '') continue;

            let property;
            try {
                property = Property.fromLine(editor, line);
            } catch (error: any) {
                continue;
            }
            if (!property) continue;

            content +=
                this.getterTemplate(property) + this.setterTemplate(property);

            hasProperties = true;
        }

        if (!hasProperties) {
            this.showErrorMessage('No properties found in this file.');
            return;
        }

        this.renderTemplate(content);
    }

    getterTemplate(prop: Property) {
        const name = prop.getName();
        const description = prop.getDescription();
        const tab = prop.getIndentation();
        const type = prop.getType();
        const nullable = prop.isNullable();
        const spacesAfterReturn = Array(this.config.getInt('spacesAfterReturn', 2) + 1).join(' ');
        const templateFile = this.config.get('getterTemplate', 'getter.js');

        if (this.templatesManager.exists(templateFile)) {
            // eslint-disable-next-line @typescript-eslint/no-var-requires
            const template = require(this.templatesManager.path(templateFile));

            return template(prop);
        }

        let preGetter = `\n`;

        if (this.shouldGeneratePHPDoc()) {
            preGetter += tab + `/**\n`
                + tab + ` * ` + prop.getterDescription() + `\n`
                + (type && !this.isPHP7TypeHintsEnabled() ? tab + ` *\n` : ``)
                + (type && !this.isPHP7TypeHintsEnabled() ? tab + ` * @return` + spacesAfterReturn + this.getPHPDocType(type, nullable) + `\n` : ``)
                + tab + ` */\n`;
        }

        return  (preGetter
            + tab + `public function ` + prop.getterName() + `()` + this.getReturnTypeHint(type, nullable) + `\n`
            + tab + `{\n`
            + tab + tab + `return $this->` + name + `;\n`
            + tab + `}\n`
        );
    }

    setterTemplate(prop: Property) {
        const name = prop.getName();
        const description = prop.getDescription();
        const tab = prop.getIndentation();
        const type = prop.getType();
        const nullable = prop.isNullable();
        const typeHint = prop.getTypeHint();
        const spacesAfterParam = Array(this.config.getInt('spacesAfterParam', 2) + 1).join(' ');
        const spacesAfterParamVar = Array(this.config.getInt('spacesAfterParamVar', 2) + 1).join(' ');
        const spacesAfterReturn = Array(this.config.getInt('spacesAfterReturn', 2) + 1).join(' ');

        const templateFile = this.config.get('setterTemplate', 'setter.js');

        if (this.templatesManager.exists(templateFile)) {
            // eslint-disable-next-line @typescript-eslint/no-var-requires
            const template = require(this.templatesManager.path(templateFile));

            return template(prop);
        }

        let preSetter = `\n`;

        if (this.shouldGeneratePHPDoc()) {
            preSetter += tab + `/**\n`
            + tab + ` * ` + prop.setterDescription() + `\n`
            + (!this.isPHP7TypeHintsEnabled() ?
                (type ? tab + ` *\n` : ``)
                + (type ? tab + ` * @param` + spacesAfterParam + this.getPHPDocType(type, nullable) + spacesAfterParamVar + `$` + name + (description ? `  ` + description : ``) + `\n` : ``)
                + tab + ` *\n`
                + tab + ` * @return` + spacesAfterReturn + `self\n`
            : ``)
            + tab + ` */\n`;
        }

        return (preSetter
            + tab + `public function ` + prop.setterName() + `(` + (typeHint ? this.getSetterTypeHint(typeHint, nullable) + ` ` : ``) + `$` + name + `)` + this.getReturnTypeHint('self') + `\n`
            + tab+ `{\n`
            + tab + tab + `$this->` + name + ` = $` + name + `;\n`
            + `\n`
            + tab + tab + `return $this;\n`
            + tab + `}\n`);
    }

    renderTemplate(template: string) {
        if (!template) {
            this.showErrorMessage('Missing template to render.');
            return;
        }

        const insertLine = this.insertLine();

        if (!insertLine) {
            this.showErrorMessage('Unable to detect insert line for template.');
            return;
        }

        const editor = this.activeEditor();

        if (!editor) {
            throw new Error('Error editor not available');
        }

        // eslint-disable-next-line @typescript-eslint/no-this-alias
        const resolver = this;

        editor.edit(function(edit: vscode.TextEditorEdit){
            edit.replace(
                new vscode.Position(insertLine.lineNumber, 0),
                template
            );
        }).then(
            success => {
                if (resolver.isRedirectEnabled() && success) {
                    const redirector = new Redirector(editor);
                    redirector.goToLine(this.closingClassLine().lineNumber - 1);
                }
            },
            error => {
                this.showErrorMessage(`Error generating functions: ` + error);
            }
        );
    }

    insertLine() {
        return this.closingClassLine();
    }

    isRedirectEnabled() : boolean {
        return true === this.config.get('redirect', true);
    }

    isPHP7TypeHintsEnabled(): boolean {
        return true === this.config.get('enablePHP7TypeHints', true);
    }

    shouldGeneratePHPDoc(): boolean {
        return true === this.config.get('generatePHPDoc', true);
    }

    getSetterTypeHint(type: string, nullable = false): string {
        if (this.isPHP7TypeHintsEnabled()) {
            return (nullable ? `?` : ``) + type;
        }

        return '';
    }

    getReturnTypeHint(type: null|string, nullable = false): string {
        if (null === type) {
            return '';
        }

        if (this.isPHP7TypeHintsEnabled()) {
            return `: ` + (nullable ? `?` : ``) + type;
        }

         return '';
    }

    getPHPDocType(type: string, nullable = false): string {
        if (nullable) {
            return `null|` + type;
        }

        return type;
    }

    showErrorMessage(message: string) {
        message = 'phpGettersSetters error: ' + message.replace(/\$\(.+?\)\s\s/, '');

        vscode.window.showErrorMessage(message);
    }

    showInformationMessage(message: string) {
        message = 'phpGettersSetters info: ' + message.replace(/\$\(.+?\)\s\s/, '');

        vscode.window.showInformationMessage(message);
    }
}

function activate(context: vscode.ExtensionContext) {
    const resolver = new Resolver;

    const insertGetter = vscode.commands.registerCommand('phpGettersSetters.insertGetter', () => resolver.insertGetter());
    const insertSetter = vscode.commands.registerCommand('phpGettersSetters.insertSetter', () => resolver.insertSetter());
    const insertGetterAndSetter = vscode.commands.registerCommand('phpGettersSetters.insertGetterAndSetter', () => resolver.insertGetterAndSetter());
    const insertAllGetterAndSetter = vscode.commands.registerCommand('phpGettersSetters.insertAllGetterAndSetter', () => resolver.insertAllGetterAndSetter());

    context.subscriptions.push(insertGetter);
    context.subscriptions.push(insertSetter);
    context.subscriptions.push(insertGetterAndSetter);
    context.subscriptions.push(insertAllGetterAndSetter);
}

// eslint-disable-next-line @typescript-eslint/no-empty-function
function deactivate() {
}

exports.activate = activate;
exports.deactivate = deactivate;

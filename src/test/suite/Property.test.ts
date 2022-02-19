import * as assert from 'assert';

// You can import and use all API from the 'vscode' module
// as well as import your extension to test it
import * as vscode from 'vscode';
import Property from '../../Property';

const fakeRange = new vscode.Range(new vscode.Position(0, 0), new vscode.Position(0, 0));

class TextLine implements vscode.TextLine {
    lineNumber: number = 0;
    range: vscode.Range = fakeRange;
    rangeIncludingLineBreak: vscode.Range = fakeRange;
    firstNonWhitespaceCharacterIndex: number = 0;
    isEmptyOrWhitespace: boolean = false;

    public constructor(
        readonly text: string
    ) {}
}

// Defines a Mocha test suite to group tests of similar kind together
suite("Property", () => {
    test("isAProperty well detect properties", () => {
        const shouldPass = (textLine: string): void => {
            assert.equal(
                Property.isAProperty(new TextLine(textLine)),
                true,
                `Expected "${textLine}" to be a propery`
            );
        };

        shouldPass('private $foo;');
        shouldPass('    private $foo;');
        shouldPass('private $foo = "ok";');
        shouldPass('private string $foo;');
        shouldPass('private string $foo7;');
        shouldPass('private string $foo = "ok";');
        shouldPass('private string $foo8 = "ok";');
        shouldPass('private DateTime $foo;');
        shouldPass('private \\DateTime $foo;');
        shouldPass('private ?string $foo;');
        shouldPass('private ?string $foo = null;');
        shouldPass('private Sub\\Namespace $foo;');
        shouldPass('private \\Sub\\Namespace $foo;');
        shouldPass('protected \\Sub\\Namespace $foo;');
        shouldPass('public \\Sub\\Namespace $foo;');
        shouldPass('public ?\\DateTime $foo;');
        shouldPass('public T $foo;');
        shouldPass('public \\T $foo;');
        shouldPass('public ?\\T $foo = new T();');
        shouldPass('public string $foo; // comment');

        const shallNotPass = (textLine: string): void => {
            assert.strictEqual(
                Property.isAProperty(new TextLine(textLine)),
                false,
                `Expected "${textLine}" to NOT be a propery`
            );
        };

        shallNotPass('class Hello');
        shallNotPass('private function hello()');
    });
});

# Change Log
All notable changes to the "php-getters-setters" extension will be documented in this file.

## [Unreleased]

## [1.6.2] - 2023-06-02
- Add phpcsCompliant in extension's settings 
- Add checkPropertiesNames() function: if the new options is checked, this functions will throw an error if properties names are not in snake case
- Add code to optionally create getters and setter following phpcs conventions: snake case, opening braces inline with method declaration and so on
- Modified the code to optionally create comments following phpcs conventions (to imporve)
- added "noImplicitAny": false rule in tsconfig.json to avoid error "implicitly has an 'any' type" on success and error parameter (extension.ts, lines 352 and 358)
- removed the null value assignmnet to the variables 'property' (lines 107, 132, 157 e 200 of the original code of extension.ts file) because this throwed the following error: "Type 'Property' is not assignable to type 'null'."

## [1.6.1] - 2022-04-29
- Fix a wrong colon inserted in getter function just after (), which breaks php code. by @AlexJBSilva in https://github.com/cvergne/vscode-php-getters-setters/pull/27

## [1.6.0] - 2022-04-27
- Add a new option to generate or not PHPDoc
- Add a new option to enable PHP 7+ type hints
- Handle nullable types in setter param and getter return (*require PHP 7+ type hints option to be enabled*)
- Handle PHP 8 properties
- Handle properties with comments
- Bumped minimal VSCode version to 1.63 to handle pre-release
- Fix: default values, like private string $foo5 = "ok";, generating invalid getter/setter: (by @alcalyn)
- Fix: static properties, like public static $foo = 'bar';, generating invalid getter/setter: (by @alcalyn)
- For better understanding, error Missing template has been replaced by No properties found in the file when no properties found in the file (by @alcalyn)

## [1.4.0] - 2021-11-19
- Add command to insert all getters & setters + fixes - #13

## [1.3.1] - 2021-11-16
- Improve getterName for bool props — #9

## [1.3.0] - 2021-01-08
- Fix vscode compatibility (https://github.com/phproberto/vscode-php-getters-setters/pull/23)
- Add support for 7.4 typed properties (https://github.com/phproberto/vscode-php-getters-setters/pull/31)
- Add PSR-1 method names (https://github.com/phproberto/vscode-php-getters-setters/pull/33)
- Handle specified array type hints (https://github.com/phproberto/vscode-php-getters-setters/pull/27)
- Experimental: Handle from any cursor place in the line

## [1.2.0] - 2017-04-29
- Added support for custom templates. See #3, #10, #11

## [1.1.0] - 2018-02-19
- Add multiple cursor support. Issue #4

## [1.0.7] - 2018-02-19
- command not found on windows machines. #1

## [1.0.6] - 2018-02-19
- Fixed functions not inserted on classes defined in files with indentantion. #1

## [1.0.5] - 2017-12-21
- Fixed `No property found` when switching between editors. Thanks for reporting Carlos Alfonso Pérez Rivera!

## [1.0.3] - 2017-12-14
- Added context menu links to insert getters and setters

## [1.0.0] - 2017-12-08
- Initial release

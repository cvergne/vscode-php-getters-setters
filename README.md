# PHP getters and setters for Visual Studio Code

> Fast generator of getters and setters for your PHP class properties.

### Note

_This repository is a fork of the Christopher Vergne extension [ cvergne/vscode-php-getters-setters](https://github.com/cvergne/vscode-php-getters-setters) which is a fork of the original extension [phproberto/vscode-php-getters-setters](https://github.com/phproberto/vscode-php-getters-setters)_  

_I'm new to VS Code extensions development. I'm developing a WordPress plugin but when it come the moment to use php-getter-setter extension I realized it didn't work: I had the original verzion by phproberto. So I browsed the extension repo and I g¡have found the CV fork. This one worked but it didn't use phpcs conventions which we use developing WordPress plugins and themes. So I wanted to fix this and I thought it could be useful for other WordPress developers._

_At first, I just wanted to create a pull request and merge my change with the main brnch but once I have cloned the repo using Github Desktop I see it gave me several errors: .vscode was not found, exports method was not recognized and so on. I tried to install missing dependencies but I have not been able to solve those errors. So I just created a new extension using `yo code` command and then pasted the code from the forked repo. I’m sorry but this is the best I could do in the little time I had available_

_I leave here the rest of the readme file as it is. See CHANGELOG.md to learn more about new changes_

_Feel free to submit issues or pull requests, and thanks @phproberto for its work !_  

![Demo](images/demo.gif)


## Features

This extension allows you to quickly generate getters and setters with one single command.

Features:

* Detects indentation. No matter if you use spaces or tabs.
* Uses configuration options to show doc blocks as you like them.
* Generates method's descriptions based on the property description.
* Detects valid type hints to use them in the setter.

It adds 3 comands to vscode's command palette:

* Insert PHP getter.
* Insert PHP setter.
* Insert PHP getter and setter.

You can also access commands from contextual menu when clicking on a class property:

![Contexttual menu](images/context-menu.jpg)

## Extension Settings

This extension contributes the following settings:

* `phpGettersSetters.spacesAfterParam`: Number of spaces to insert between @param tag and variable name in doc blocks. Default: 2
* `phpGettersSetters.spacesAfterParamVar`: Number of spaces to insert after the variable name in the @param tag line. Default: 2
* `phpGettersSetters.spacesAfterReturn`: Number of spaces to insert after the @return tag. Default: 2
* `phpGettersSetters.redirect`: Redirect editor to generated functions after generating them? Default: true
* `phpGettersSetters.phpcsCompliant`: Use phpcs conventions (snake case names, opening braces in the same line of methods declarations, etc)? Default: false
* `phpGettersSetters.templatesDir`: Folder where custom templates are stored
* `phpGettersSetters.getterTemplate`: File to use as template for getters. Default: getter.js
* `phpGettersSetters.setterTemplate`: File to use as template for setters. Default :setter.js

## Custom Templates

By default this extension will use a custom function to generate your getters & setters but you can fully customise the markup used to generate them. By default templates are stored in:

* Linux: `~/.config/Code/User/phpGettersSetters`
* OSX: `~/Library/Application Support/Code/User/phpGettersSetters`
* Windows: `%APPDATA%\Code\User\phpGettersSetters`

You can also set a custom templates dir entering a custom folder in `phpGettersSetters.templatesDir` setting.

Template Literals are used for templating because the flexibility they provide. With them you can easily create a custom template with no knowledge and also invest some time for complex things. For advanced usage you will have to google about template literals but here are 2 sample templates.

Sample getter.js template:

```
module.exports = (property) => `
	/**
	 * ${property.getterDescription()}
	 *
	 * @return  ${property.getType() ? property.getType() : 'mixed'}
	 */
	public function ${property.getterName()}()
	{
		return $this->${property.getName()};
	}
`
```

Sample setter.js template:

```
module.exports = (property) => `
	/**
	 * ${property.setterDescription()}
	 *
	 * @param   ${property.getType() ? property.getType() : 'mixed'}  \$${property.getName()}  ${property.getDescription() ? property.getDescription() : ''}
	 *
	 * @return  self
	 */
	public function ${property.setterName()}(${property.getTypeHint() ? property.getTypeHint() + ' ' : '' }\$${property.getName()})
	{
		$this->${property.getName()} = \$${property.getName()};

		return $this;
	}
`
```

As you can see a [Property](src/Property.ts) object is passed to templates so you can access any public method there. I also like the idea of adding more stuff as users find limits. Open an issue if you find something you cannot achieve.

## Release Notes

Relevant releases:

### 1.2.0
* Added support for custom templates

### 1.1.0
* Added support for multiple cursor

### 1.0.5
* Fixed `No property found` when switching between editors. Thanks for reporting Carlos Alfonso Pérez Rivera!

### 1.0.3

* Added context menu links

### 1.0.0

* Initial version

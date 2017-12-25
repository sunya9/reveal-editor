# Reveal editor
![license](https://img.shields.io/github/license/mashape/apistatus.svg?style=flat-square)

Reveal editor is a presentation tool that is able to write with markdown.

![Reveal editor](https://raw.githubusercontent.com/sunya9/reveal-editor/master/docs/assets/img/screenshot.png)


## Features
* Rich markdown view by [SimpleMDE](https://github.com/sparksuite/simplemde-markdown-editor)
* Supports `::` style emoji
* Assets manager
* Speaker notes and its tool

## Usage
Currently Linux only.

:arrow_down: [Download latest version from release page](https://github.com/sunya9/reveal-editor/releases)

## Contribution
1. [Fork it](https://github.com/sunya9/reveal-editor/fork)
2. Create your feature branch (`git checkout -b my-new-feature`)
3. Commit your changes (`git commit -am 'Add some feature'`)
4. Push to the branch (`git push origin my-new-feature`)
5. Create new Pull Request

## Development
1. Clone forked repository
2. `cd reveal-editor`
3. `yarn`
4. `yarn start`

Note: Press `Ctrl+R` in electron's development tool after make sure that `webpack-dev-server` finish compiling if `index.html` is failed to load bundle.js.

Please add to `devDependencies` if you would like to add a module that related main process. Because `electron-packager` copy only `devDependencies` modules when packaging.
If modules are used only on renderer process or tools like webpack or test frameworks, add to `dependencies`.

### Build
`yarn run build`

### Test
Coming soon...

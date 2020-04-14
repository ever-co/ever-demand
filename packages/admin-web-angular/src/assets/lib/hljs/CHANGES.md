## Version 9.12.0

New language:

-   _MikroTik_ RouterOS Scripting language by [Ivan Dementev][].

New style:

-   _VisualStudio 2015 Dark_ by [Nicolas LLOBERA][]

Improvements:

-   _Crystal_ updated with new keywords and syntaxes by [Tsuyusato Kitsune][].
-   _Julia_ updated to the modern definitions by [Alex Arslan][].
-   _julia-repl_ added by [Morten Piibeleht][].
-   [Stanislav Belov][] wrote a new definition for _1C_, replacing the one that
    has not been updated for more than 8 years. The new version supports syntax
    for versions 7.7 and 8.
-   [Nicolas LLOBERA][] improved C# definition fixing edge cases with function
    titles detection and added highlighting of `[Attributes]`.
-   [nnnik][] provided a few correctness fixes for _Autohotkey_.
-   [Martin Clausen][] made annotation collections in _Clojure_ to look
    consistently with other kinds.
-   [Alejandro Alonso][] updated _Swift_ keywords.

[tsuyusato kitsune]: https://github.com/MakeNowJust
[alex arslan]: https://github.com/ararslan
[morten piibeleht]: https://github.com/mortenpi
[stanislav belov]: https://github.com/4ppl
[ivan dementev]: https://github.com/DiVAN1x
[nicolas llobera]: https://github.com/Nicolas01
[nnnik]: https://github.com/nnnik
[martin clausen]: https://github.com/maacl
[alejandro alonso]: https://github.com/Azoy

## Version 9.11.0

New languages:

-   _Shell_ by [Tsuyusato Kitsune][]
-   _jboss-cli_ by [Raphaël Parrëe][]

Improvements:

-   [Joël Porquet] has [greatly improved the definition of _makefile_][5b3e0e6].
-   _C++_ class titles are now highlighted as in other languages with classes.
-   [Jordi Petit][] added rarely used `or`, `and` and `not` keywords to _C++_.
-   [Pieter Vantorre][] fixed highlighting of negative floating point values.

[tsuyusato kitsune]: https://github.com/MakeNowJust
[jordi petit]: https://github.com/jordi-petit
[raphaël parrëe]: https://github.com/rparree
[pieter vantorre]: https://github.com/NuclearCookie
[5b3e0e6]: https://github.com/isagalaev/highlight.js/commit/5b3e0e68bfaae282faff6697d6a490567fa9d44b

## Version 9.10.0

Apologies for missing the previous release cycle. Some thing just can't be
automated… Anyway, we're back!

New languages:

-   _Hy_ by [Sergey Sobko][]
-   _Leaf_ by [Hale Chan][]
-   _N1QL_ by [Andres Täht][] and [Rene Saarsoo][]

Improvements:

-   _Rust_ got updated with new keywords by [Kasper Andersen][] and then
    significantly modernized even more by [Eduard-Mihai Burtescu][] (yes, @eddyb,
    Rust core team member!)
-   _Python_ updated with f-literals by [Philipp A][].
-   _YAML_ updated with unquoted strings support.
-   _Gauss_ updated with new keywords by [Matt Evans][].
-   _Lua_ updated with new keywords by [Joe Blow][].
-   _Kotlin_ updated with new keywords by [Philipp Hauer][].
-   _TypeScript_ got highlighting of function params and updated keywords by
    [Ike Ku][].
-   _Scheme_ now correctly handles \`-quoted lists thanks to [Guannan Wei].
-   [Sam Wu][] fixed handling of `<<` in _C++_ defines.

[philipp a]: https://github.com/flying-sheep
[philipp hauer]: https://github.com/phauer
[sergey sobko]: https://github.com/profitware
[hale chan]: https://github.com/halechan
[matt evans]: https://github.com/matthewevans
[joe blow]: https://github.com/mossarelli
[kasper andersen]: https://github.com/kasma1990
[eduard-mihai burtescu]: https://github.com/eddyb
[andres täht]: https://github.com/andrestaht
[rene saarsoo]: https://github.com/nene
[philipp hauer]: https://github.com/phauer
[ike ku]: https://github.com/dempfi
[guannan wei]: https://github.com/Kraks
[sam wu]: https://github.com/samsam2310

## Version 9.9.0

New languages

-   _LLVM_ by [Michael Rodler][]

Improvements:

-   _TypeScript_ updated with annotations and param lists inside constructors, by
    [Raphael Parree][].
-   _CoffeeScript_ updated with new keywords and fixed to recognize JavaScript
    in \`\`\`, thanks to thanks to [Geoffrey Booth][].
-   Compiler directives in _Delphi_ are now correctly highlighted as "meta".

[raphael parree]: https://github.com/rparree
[michael rodler]: https://github.com/f0rki
[geoffrey booth]: https://github.com/GeoffreyBooth

## Version 9.8.0 "New York"

This version is the second one that deserved a name. Because I'm in New York,
and the release isn't missing the deadline only because it's still Tuesday on
West Coast.

New languages:

-   _Clean_ by [Camil Staps][]
-   _Flix_ by [Magnus Madsen][]

Improvements:

-   [Kenton Hamaluik][] did a comprehensive update for _Haxe_.
-   New commands for _PowerShell_ from [Nicolas Le Gall][].
-   [Jan T. Sott][] updated _NSIS_.
-   _Java_ and _Swift_ support unicode characters in identifiers thanks to
    [Alexander Lichter][].

[camil staps]: https://github.com/camilstaps
[magnus madsen]: https://github.com/magnus-madsen
[kenton hamaluik]: https://github.com/FuzzyWuzzie
[nicolas le gall]: https://github.com/darkitty
[jan t. sott]: https://github.com/idleberg
[alexander lichter]: https://github.com/manniL

## Version 9.7.0

A comprehensive bugfix release. This is one of the best things about
highlight.js: even boring things keep getting better (even if slow).

-   VHDL updated with PSL keywords and uses more consistent styling.
-   Nested C-style comments no longer break highlighting in many languages.
-   JavaScript updated with `=>` functions, highlighted object attributes and
    parsing within template string substitution blocks (`${...}`).
-   Fixed another corner case with self-closing `<tag/>` in JSX.
-   Added `HEALTHCHECK` directive in Docker.
-   Delphi updated with new Free Pascal keywords.
-   Fixed digit separator parsing in C++.
-   C# updated with new keywords and fixed to allow multiple identifiers within
    generics `<...>`.
-   Fixed another slow regex in Less.

## Version 9.6.0

New languages:

-   _ABNF_ and _EBNF_ by [Alex McKibben][]
-   _Awk_ by [Matthew Daly][]
-   _SubUnit_ by [Sergey Bronnikov][]

New styles:

-   _Atom One_ in both Dark and Light variants by [Daniel Gamage][]

Plus, a few smaller updates for _Lasso_, _Elixir_, _C++_ and _SQL_.

[alex mckibben]: https://github.com/mckibbenta
[daniel gamage]: https://github.com/danielgamage
[matthew daly]: https://github.com/matthewbdaly
[sergey bronnikov]: https://github.com/ligurio

## Version 9.5.0

New languages:

-   _Excel_ by [Victor Zhou][]
-   _Linden Scripting Language_ by [Builder's Brewery][]
-   _TAP_ (Test Anything Protocol) by [Sergey Bronnikov][]
-   _Pony_ by [Joe Eli McIlvain][]
-   _Coq_ by [Stephan Boyer][]
-   _dsconfig_ and _LDIF_ by [Jacob Childress][]

New styles:

-   _Ocean Dark_ by [Gavin Siu][]

Notable changes:

-   [Minh Nguyễn][] added more built-ins to Objective C.
-   [Jeremy Hull][] fixed corner cases in C++ preprocessor directives and Diff
    comments.
-   [Victor Zhou][] added support for digit separators in C++ numbers.

[gavin siu]: https://github.com/gavsiu
[builder's brewery]: https://github.com/buildersbrewery
[victor zhou]: https://github.com/OiCMudkips
[sergey bronnikov]: https://github.com/ligurio
[joe eli mcilvain]: https://github.com/jemc
[stephan boyer]: https://github.com/boyers
[jacob childress]: https://github.com/braveulysses
[minh nguyễn]: https://github.com/1ec5
[jeremy hull]: https://github.com/sourrust

## Version 9.4.0

New languages:

-   _PureBASIC_ by [Tristano Ajmone][]
-   _BNF_ by [Oleg Efimov][]
-   _Ada_ by [Lars Schulna][]

New styles:

-   _PureBASIC_ by [Tristano Ajmone][]

Improvements to existing languages and styles:

-   We now highlight function declarations in Go.
-   [Taisuke Fujimoto][] contributed very convoluted rules for raw and
    interpolated strings in C#.
-   [Boone Severson][] updated Verilog to comply with IEEE 1800-2012
    SystemVerilog.
-   [Victor Zhou][] improved rules for comments and strings in PowerShell files.
-   [Janis Voigtländer][] updated the definition of Elm to version 0.17 of the
    languages. Elm is now featured on the front page of <https://highlightjs.org>.
-   Special variable `$this` is highlighted as a keyword in PHP.
-   `usize` and `isize` are now highlighted in Rust.
-   Fixed labels and directives in x86 assembler.

[tristano ajmone]: https://github.com/tajmone
[taisuke fujimoto]: https://github.com/temp-impl
[oleg efimov]: https://github.com/Sannis
[boone severson]: https://github.com/BooneJS
[victor zhou]: https://github.com/OiCMudkips
[lars schulna]: https://github.com/captain-hanuta
[janis voigtländer]: https://github.com/jvoigtlaender

## Version 9.3.0

New languages:

-   _Tagger Script_ by [Philipp Wolfer][]
-   _MoonScript_ by [Billy Quith][]

New styles:

-   _xt256_ by [Herbert Shin][]

Improvements to existing languages and styles:

-   More robust handling of unquoted HTML tag attributes
-   Relevance tuning for QML which was unnecessary eager at seizing other
    languages' code
-   Improve GAMS language parsing
-   Fixed a bunch of bugs around selectors in Less
-   Kotlin's got a new definition for annotations, updated keywords and other
    minor improvements
-   Added `move` to Rust keywords
-   Markdown now recognizes \`\`\`-fenced code blocks
-   Improved detection of function declarations in C++ and C#

[philipp wolfer]: https://github.com/phw
[billy quith]: https://github.com/billyquith
[herbert shin]: https://github.com/initbar

## Version 9.2.0

New languages:

-   _QML_ by [John Foster][]
-   _HTMLBars_ by [Michael Johnston][]
-   _CSP_ by [Taras][]
-   _Maxima_ by [Robert Dodier][]

New styles:

-   _Gruvbox_ by [Qeole][]
-   _Dracula_ by [Denis Ciccale][]

Improvements to existing languages and styles:

-   We now correctly handle JSX with arbitrary node tree depth.
-   Argument list for `(lambda)` in Scheme is no longer highlighted as a function
    call.
-   Stylus syntax doesn't break on valid CSS.
-   More correct handling of comments and strings and other improvements for
    VimScript.
-   More subtle work on the default style.
-   We now use anonymous modules for AMD.
-   `macro_rules!` is now recognized as a built-in in Rust.

[john foster]: https://github.com/jf990
[qeole]: https://github.com/Qeole
[denis ciccale]: https://github.com/dciccale
[michael johnston]: https://github.com/lastobelus
[taras]: https://github.com/oxdef
[robert dodier]: https://github.com/robert-dodier

## Version 9.1.0

New languages:

-   _Stan_ by [Brendan Rocks][]
-   _BASIC_ by [Raphaël Assénat][]
-   _GAUSS_ by [Matt Evans][]
-   _DTS_ by [Martin Braun][]
-   _Arduino_ by [Stefania Mellai][]

New Styles:

-   _Arduino Light_ by [Stefania Mellai][]

Improvements to existing languages and styles:

-   Handle return type annotations in Python
-   Allow shebang headers in Javascript
-   Support strings in Rust meta
-   Recognize `struct` as a class-level definition in Rust
-   Recognize b-prefixed chars and strings in Rust
-   Better numbers handling in Verilog

[brendan rocks]: http://brendanrocks.com
[raphaël assénat]: https://github.com/raphnet
[matt evans]: https://github.com/matthewevans
[martin braun]: https://github.com/mbr0wn
[stefania mellai]: https://github.com/smellai

## Version 9.0.0

The new major version brings a reworked styling system. Highlight.js now defines
a limited set of highlightable classes giving a consistent result across all the
styles and languages. You can read a more detailed explanation and background in
the [tracking issue][#348] that started this long process back in May.

This change is backwards incompatible for those who uses highlight.js with a
custom stylesheet. The [new style guide][sg] explains how to write styles
in this new world.

Bundled themes have also suffered a significant amount of improvements and may
look different in places, but all the things now consistent and make more sense.
Among others, the Default style has got a refresh and will probably be tweaked
some more in next releases. Please do give your feedback in our
[issue tracker][issues].

New languages in this release:

-   _Caché Object Script_ by [Nikita Savchenko][]
-   _YAML_ by [Stefan Wienert][]
-   _MIPS Assembler_ by [Nebuleon Fumika][]
-   _HSP_ by [prince][]

Improvements to existing languages and styles:

-   ECMAScript 6 modules import now do not require closing semicolon.
-   ECMAScript 6 classes constructors now highlighted.
-   Template string support for Typescript, as for ECMAScript 6.
-   Scala case classes params highlight fixed.
-   Built-in names introduced in Julia v0.4 added by [Kenta Sato][].
-   Refreshed Default style.

Other notable changes:

-   [Web workers support][webworkers] added bu [Jan Kühle][].
-   We now have tests for compressed browser builds as well.
-   The building tool chain has been switched to node.js 4.x. and is now
    shamelessly uses ES6 features all over the place, courtesy of [Jeremy Hull][].
-   License added to non-compressed browser build.

[jan kühle]: https://github.com/frigus02
[stefan wienert]: https://github.com/zealot128
[kenta sato]: https://github.com/bicycle1885
[nikita savchenko]: https://github.com/ZitRos
[webworkers]: https://github.com/isagalaev/highlight.js#web-workers
[jeremy hull]: https://github.com/sourrust
[#348]: https://github.com/isagalaev/highlight.js/issues/348
[sg]: http://highlightjs.readthedocs.org/en/latest/style-guide.html
[issues]: https://github.com/isagalaev/highlight.js/issues
[nebuleon fumika]: https://github.com/Nebuleon
[prince]: https://github.com/prince-0203

## Version 8.9.1

Some last-minute changes reverted due to strange bug with minified browser build:

-   Scala case classes params highlight fixed
-   ECMAScript 6 modules import now do not require closing semicolon
-   ECMAScript 6 classes constructors now highlighted
-   Template string support for Typescript, as for ECMAScript 6
-   License added to not minified browser build

## Version 8.9.0

New languages:

-   _crmsh_ by [Kristoffer Gronlund][]
-   _SQF_ by [Soren Enevoldsen][]

[kristoffer gronlund]: https://github.com/krig
[soren enevoldsen]: https://github.com/senevoldsen90

Notable fixes and improvements to existing languages:

-   Added `abstract` and `namespace` keywords to TypeScript by [Daniel Rosenwasser][]
-   Added `label` support to Dockerfile by [Ladislav Prskavec][]
-   Crystal highlighting improved by [Tsuyusato Kitsune][]
-   Missing Swift keywords added by [Nate Cook][]
-   Improve detection of C block comments
-   ~~Scala case classes params highlight fixed~~
-   ~~ECMAScript 6 modules import now do not require closing semicolon~~
-   ~~ECMAScript 6 classes constructors now highlighted~~
-   ~~Template string support for Typescript, as for ECMAScript 6~~

Other notable changes:

-   ~~License added to not minified browser build~~

[kristoffer gronlund]: https://github.com/krig
[søren enevoldsen]: https://github.com/senevoldsen90
[daniel rosenwasser]: https://github.com/DanielRosenwasser
[ladislav prskavec]: https://github.com/abtris
[tsuyusato kitsune]: https://github.com/MakeNowJust
[nate cook]: https://github.com/natecook1000

## Version 8.8.0

New languages:

-   _Golo_ by [Philippe Charrière][]
-   _GAMS_ by [Stefan Bechert][]
-   _IRPF90_ by [Anthony Scemama][]
-   _Access logs_ by [Oleg Efimov][]
-   _Crystal_ by [Tsuyusato Kitsune][]

Notable fixes and improvements to existing languages:

-   JavaScript highlighting no longer fails with ES6 default parameters
-   Added keywords `async` and `await` to Python
-   PHP heredoc support improved
-   Allow preprocessor directives within C++ functions

Other notable changes:

-   Change versions to X.Y.Z SemVer-compatible format
-   Added ability to build all targets at once

[philippe charrière]: https://github.com/k33g
[stefan bechert]: https://github.com/b-pos465
[anthony scemama]: https://github.com/scemama
[oleg efimov]: https://github.com/Sannis
[tsuyusato kitsune]: https://github.com/MakeNowJust

## Version 8.7

New languages:

-   _Zephir_ by [Oleg Efimov][]
-   _Elm_ by [Janis Voigtländer][]
-   _XQuery_ by [Dirk Kirsten][]
-   _Mojolicious_ by [Dotan Dimet][]
-   _AutoIt_ by Manh Tuan from [J2TeaM][]
-   _Toml_ (ini extension) by [Guillaume Gomez][]

New styles:

-   _Hopscotch_ by [Jan T. Sott][]
-   _Grayscale_ by [MY Sun][]

Notable fixes and improvements to existing languages:

-   Fix encoding of images when copied over in certain builds
-   Fix incorrect highlighting of the word "bug" in comments
-   Treat decorators different from matrix multiplication in Python
-   Fix traits inheritance highlighting in Rust
-   Fix incorrect document
-   Oracle keywords added to SQL language definition by [Vadimtro][]
-   Postgres keywords added to SQL language definition by [Benjamin Auder][]
-   Fix registers in x86asm being highlighted as a hex number
-   Fix highlighting for numbers with a leading decimal point
-   Correctly highlight numbers and strings inside of C/C++ macros
-   C/C++ functions now support pointer, reference, and move returns

[oleg efimov]: https://github.com/Sannis
[guillaume gomez]: https://github.com/GuillaumeGomez
[janis voigtländer]: https://github.com/jvoigtlaender
[jan t. sott]: https://github.com/idleberg
[dirk kirsten]: https://github.com/dirkk
[my sun]: https://github.com/simonmysun
[vadimtro]: https://github.com/Vadimtro
[benjamin auder]: https://github.com/ghost
[dotan dimet]: https://github.com/dotandimet
[j2team]: https://github.com/J2TeaM

## Version 8.6

New languages:

-   _C/AL_ by [Kenneth Fuglsang][]
-   _DNS zone file_ by [Tim Schumacher][]
-   _Ceylon_ by [Lucas Werkmeister][]
-   _OpenSCAD_ by [Dan Panzarella][]
-   _Inform7_ by [Bruno Dias][]
-   _armasm_ by [Dan Panzarella][]
-   _TP_ by [Jay Strybis][]

New styles:

-   _Atelier Cave_, _Atelier Estuary_,
    _Atelier Plateau_ and _Atelier Savanna_ by [Bram de Haan][]
-   _Github Gist_ by [Louis Barranqueiro][]

Notable fixes and improvements to existing languages:

-   Multi-line raw strings from C++11 are now supported
-   Fix class names with dashes in HAML
-   The `async` keyword from ES6/7 is now supported
-   TypeScript functions handle type and parameter complexity better
-   We unified phpdoc/javadoc/yardoc etc modes across all languages
-   CSS .class selectors relevance was dropped to prevent wrong language detection
-   Images is now included to CDN build
-   Release process is now automated

[bram de haan]: https://github.com/atelierbram
[kenneth fuglsang]: https://github.com/kfuglsang
[louis barranqueiro]: https://github.com/LouisBarranqueiro
[tim schumacher]: https://github.com/enko
[lucas werkmeister]: https://github.com/lucaswerkmeister
[dan panzarella]: https://github.com/pzl
[bruno dias]: https://github.com/sequitur
[jay strybis]: https://github.com/unreal

## Version 8.5

New languages:

-   _pf.conf_ by [Peter Piwowarski][]
-   _Julia_ by [Kenta Sato][]
-   _Prolog_ by [Raivo Laanemets][]
-   _Docker_ by [Alexis Hénaut][]
-   _Fortran_ by [Anthony Scemama][] and [Thomas Applencourt][]
-   _Kotlin_ by [Sergey Mashkov][]

New styles:

-   _Agate_ by [Taufik Nurrohman][]
-   _Darcula_ by [JetBrains][]
-   _Atelier Sulphurpool_ by [Bram de Haan][]
-   _Android Studio_ by [Pedro Oliveira][]

Notable fixes and improvements to existing languages:

-   ES6 features in JavaScript are better supported now by [Gu Yiling][].
-   Swift now recognizes body-less method definitions.
-   Single expression functions `def foo, do: ...` now work in Elixir.
-   More uniform detection of built-in classes in Objective C.
-   Fixes for number literals and processor directives in Rust.
-   HTML `<script>` tag now allows any language, not just JavaScript.
-   Multi-line comments are supported now in MatLab.

[taufik nurrohman]: https://github.com/tovic
[jet brains]: https://www.jetbrains.com/
[peter piwowarski]: https://github.com/oldlaptop
[kenta sato]: https://github.com/bicycle1885
[bram de haan]: https://github.com/atelierbram
[raivo laanemets]: https://github.com/rla
[alexis hénaut]: https://github.com/AlexisNo
[anthony scemama]: https://github.com/scemama
[pedro oliveira]: https://github.com/kanytu
[gu yiling]: https://github.com/Justineo
[sergey mashkov]: https://github.com/cy6erGn0m
[thomas applencourt]: https://github.com/TApplencourt

## Version 8.4

We've got the new [demo page][]! The obvious new feature is the new look, but
apart from that it's got smarter: by presenting languages in groups it avoids
running 10000 highlighting attempts after first load which was slowing it down
and giving bad overall impression. It is now also being generated from test
code snippets so the authors of new languages don't have to update both tests
and the demo page with the same thing.

Other notable changes:

-   The `template_comment` class is gone in favor of the more general `comment`.
-   Number parsing unified and improved across languages.
-   C++, Java and C# now use unified grammar to highlight titles in
    function/method definitions.
-   The browser build is now usable as an AMD module, there's no separate build
    target for that anymore.
-   OCaml has got a [comprehensive overhaul][ocaml] by [Mickaël Delahaye][].
-   Clojure's data structures and literals are now highlighted outside of lists
    and we can now highlight Clojure's REPL sessions.

New languages:

-   _AspectJ_ by [Hakan Özler][]
-   _STEP Part 21_ by [Adam Joseph Cook][]
-   _SML_ derived by [Edwin Dalorzo][] from OCaml definition
-   _Mercury_ by [mucaho][]
-   _Smali_ by [Dennis Titze][]
-   _Verilog_ by [Jon Evans][]
-   _Stata_ by [Brian Quistorff][]

[hakan özler]: https://github.com/ozlerhakan
[adam joseph cook]: https://github.com/adamjcook
[demo page]: https://highlightjs.org/static/demo/
[ivan sagalaev]: https://github.com/isagalaev
[edwin dalorzo]: https://github.com/edalorzo
[mucaho]: https://github.com/mucaho
[dennis titze]: https://github.com/titze
[jon evans]: https://github.com/craftyjon
[brian quistorff]: https://github.com/bquistorff
[ocaml]: https://github.com/isagalaev/highlight.js/pull/608#issue-46190207
[mickaël delahaye]: https://github.com/polazarus

## Version 8.3

We streamlined our tool chain, it is now based entirely on node.js instead of
being a mix of node.js, Python and Java. The build script options and arguments
remained the same, and we've noted all the changes in the [documentation][b].
Apart from reducing complexity, the new build script is also faster from not
having to start Java machine repeatedly. The credits for the work go to [Jeremy
Hull][].

Some notable fixes:

-   PHP and JavaScript mixed in HTML now live happily with each other.
-   JavaScript regexes now understand ES6 flags "u" and "y".
-   `throw` keyword is no longer detected as a method name in Java.
-   Fixed parsing of numbers and symbols in Clojure thanks to [input from Ivan
    Kleshnin][ik].

New languages in this release:

-   _Less_ by [Max Mikhailov][]
-   _Stylus_ by [Bryant Williams][]
-   _Tcl_ by [Radek Liska][]
-   _Puppet_ by [Jose Molina Colmenero][]
-   _Processing_ by [Erik Paluka][]
-   _Twig_ templates by [Luke Holder][]
-   _PowerShell_ by [David Mohundro][], based on [the work of Nicholas Blumhardt][ps]
-   _XL_ by [Christophe de Dinechin][]
-   _LiveScript_ by [Taneli Vatanen][] and [Jen Evers-Corvina][]
-   _ERB_ (Ruby in HTML) by [Lucas Mazza][]
-   _Roboconf_ by [Vincent Zurczak][]

[b]: http://highlightjs.readthedocs.org/en/latest/building-testing.html
[jeremy hull]: https://github.com/sourrust
[ik]: https://twitter.com/IvanKleshnin/status/514041599484231680
[max mikhailov]: https://github.com/seven-phases-max
[bryant williams]: https://github.com/scien
[radek liska]: https://github.com/Nindaleth
[jose molina colmenero]: https://github.com/Moliholy
[erik paluka]: https://github.com/paluka
[luke holder]: https://github.com/lukeholder
[david mohundro]: https://github.com/drmohundro
[ps]: https://github.com/OctopusDeploy/Library/blob/master/app/shared/presentation/highlighting/powershell.js
[christophe de dinechin]: https://github.com/c3d
[taneli vatanen]: https://github.com/Daiz-
[jen evers-corvina]: https://github.com/sevvie
[lucas mazza]: https://github.com/lucasmazza
[vincent zurczak]: https://github.com/vincent-zurczak

## Version 8.2

We've finally got [real tests][test] and [continuous testing on Travis][ci]
thanks to [Jeremy Hull][] and [Chris Eidhof][]. The tests designed to cover
everything: language detection, correct parsing of individual language features
and various special cases. This is a very important change that gives us
confidence in extending language definitions and refactoring library core.

We're going to redesign the old [demo/test suite][demo] into an interactive
demo web app. If you're confident front-end developer or designer and want to
help us with it, drop a comment into [the issue][#542] on GitHub.

[test]: https://github.com/isagalaev/highlight.js/tree/master/test
[demo]: https://highlightjs.org/static/test.html
[#542]: https://github.com/isagalaev/highlight.js/issues/542
[ci]: https://travis-ci.org/isagalaev/highlight.js
[jeremy hull]: https://github.com/sourrust
[chris eidhof]: https://github.com/chriseidhof

As usually there's a handful of new languages in this release:

-   _Groovy_ by [Guillaume Laforge][]
-   _Dart_ by [Maxim Dikun][]
-   _Dust_ by [Michael Allen][]
-   _Scheme_ by [JP Verkamp][]
-   _G-Code_ by [Adam Joseph Cook][]
-   _Q_ from Kx Systems by [Sergey Vidyuk][]

[guillaume laforge]: https://github.com/glaforge
[maxim dikun]: https://github.com/dikmax
[michael allen]: https://github.com/bfui
[jp verkamp]: https://github.com/jpverkamp
[adam joseph cook]: https://github.com/adamjcook
[sergey vidyuk]: https://github.com/sv

Other improvements:

-   [Erik Osheim][] heavily reworked Scala definitions making it richer.
-   [Lucas Mazza][] fixed Ruby hashes highlighting
-   Lisp variants (Lisp, Clojure and Scheme) are unified in regard to naming
    the first symbol in parentheses: it's "keyword" in general case and also
    "built_in" for built-in functions in Clojure and Scheme.

[erik osheim]: https://github.com/non
[lucas mazza]: https://github.com/lucasmazza

## Version 8.1

New languages:

-   _Gherkin_ by [Sam Pikesley][]
-   _Elixir_ by [Josh Adams][]
-   _NSIS_ by [Jan T. Sott][]
-   _VIM script_ by [Jun Yang][]
-   _Protocol Buffers_ by [Dan Tao][]
-   _Nix_ by [Domen Kožar][]
-   _x86asm_ by [innocenat][]
-   _Cap’n Proto_ and _Thrift_ by [Oleg Efimov][]
-   _Monkey_ by [Arthur Bikmullin][]
-   _TypeScript_ by [Panu Horsmalahti][]
-   _Nimrod_ by [Flaviu Tamas][]
-   _Gradle_ by [Damian Mee][]
-   _Haxe_ by [Christopher Kaster][]
-   _Swift_ by [Chris Eidhof][] and [Nate Cook][]

New styles:

-   _Kimbie_, light and dark variants by [Jan T. Sott][]
-   _Color brewer_ by [Fabrício Tavares de Oliveira][]
-   _Codepen.io embed_ by [Justin Perry][]
-   _Hybrid_ by [Nic West][]

[sam pikesley]: https://github.com/pikesley
[sindre sorhus]: https://github.com/sindresorhus
[josh adams]: https://github.com/knewter
[jan t. sott]: https://github.com/idleberg
[jun yang]: https://github.com/harttle
[dan tao]: https://github.com/dtao
[domen kožar]: https://github.com/iElectric
[innocenat]: https://github.com/innocenat
[oleg efimov]: https://github.com/Sannis
[arthur bikmullin]: https://github.com/devolonter
[panu horsmalahti]: https://github.com/panuhorsmalahti
[flaviu tamas]: https://github.com/flaviut
[damian mee]: https://github.com/chester1000
[christopher kaster]: http://christopher.kaster.ws
[fabrício tavares de oliveira]: https://github.com/fabriciotav
[justin perry]: https://github.com/ourmaninamsterdam
[nic west]: https://github.com/nicwest
[chris eidhof]: https://github.com/chriseidhof
[nate cook]: https://github.com/natecook1000

Other improvements:

-   The README is heavily reworked and brought up to date by [Jeremy Hull][].
-   Added [`listLanguages()`][ll] method in the API.
-   Improved C/C++/C# detection.
-   Added a bunch of new language aliases, documented the existing ones. Thanks to
    [Sindre Sorhus][] for background research.
-   Added phrasal English words to boost relevance in comments.
-   Many improvements to SQL definition made by [Heiko August][],
    [Nikolay Lisienko][] and [Travis Odom][].
-   The shorter `lang-` prefix for language names in HTML classes supported
    alongside `language-`. Thanks to [Jeff Escalante][].
-   Ruby's got support for interactive console sessions. Thanks to
    [Pascal Hurni][].
-   Added built-in functions for R language. Thanks to [Artem A. Klevtsov][].
-   Rust's got definition for lifetime parameters and improved string syntax.
    Thanks to [Roman Shmatov][].
-   Various improvements to Objective-C definition by [Matt Diephouse][].
-   Fixed highlighting of generics in Java.

[ll]: http://highlightjs.readthedocs.org/en/latest/api.html#listlanguages
[sindre sorhus]: https://github.com/sindresorhus
[heiko august]: https://github.com/auge8472
[nikolay lisienko]: https://github.com/neor-ru
[travis odom]: https://github.com/Burstaholic
[jeff escalante]: https://github.com/jenius
[pascal hurni]: https://github.com/phurni
[jiyin yiyong]: https://github.com/jiyinyiyong
[artem a. klevtsov]: https://github.com/unikum
[roman shmatov]: https://github.com/shmatov
[jeremy hull]: https://github.com/sourrust
[matt diephouse]: https://github.com/mdiep

## Version 8.0

This new major release is quite a big overhaul bringing both new features and
some backwards incompatible changes. However, chances are that the majority of
users won't be affected by the latter: the basic scenario described in the
README is left intact.

Here's what did change in an incompatible way:

-   We're now prefixing all classes located in [CSS classes reference][cr] with
    `hljs-`, by default, because some class names would collide with other
    people's stylesheets. If you were using an older version, you might still want
    the previous behavior, but still want to upgrade. To suppress this new
    behavior, you would initialize like so:

    ```html
    <script type="text/javascript">
    	hljs.configure({ classPrefix: '' });
    	hljs.initHighlightingOnLoad();
    </script>
    ```

-   `tabReplace` and `useBR` that were used in different places are also unified
    into the global options object and are to be set using `configure(options)`.
    This function is documented in our [API docs][]. Also note that these
    parameters are gone from `highlightBlock` and `fixMarkup` which are now also
    rely on `configure`.

-   We removed public-facing (though undocumented) object `hljs.LANGUAGES` which
    was used to register languages with the library in favor of two new methods:
    `registerLanguage` and `getLanguage`. Both are documented in our [API docs][].

-   Result returned from `highlight` and `highlightAuto` no longer contains two
    separate attributes contributing to relevance score, `relevance` and
    `keyword_count`. They are now unified in `relevance`.

Another technically compatible change that nonetheless might need attention:

-   The structure of the NPM package was refactored, so if you had installed it
    locally, you'll have to update your paths. The usual `require('highlight.js')`
    works as before. This is contributed by [Dmitry Smolin][].

New features:

-   Languages now can be recognized by multiple names like "js" for JavaScript or
    "html" for, well, HTML (which earlier insisted on calling it "xml"). These
    aliases can be specified in the class attribute of the code container in your
    HTML as well as in various API calls. For now there are only a few very common
    aliases but we'll expand it in the future. All of them are listed in the
    [class reference][cr].

-   Language detection can now be restricted to a subset of languages relevant in
    a given context — a web page or even a single highlighting call. This is
    especially useful for node.js build that includes all the known languages.
    Another example is a StackOverflow-style site where users specify languages
    as tags rather than in the markdown-formatted code snippets. This is
    documented in the [API reference][] (see methods `highlightAuto` and
    `configure`).

-   Language definition syntax streamlined with [variants][] and
    [beginKeywords][].

New languages and styles:

-   _Oxygene_ by [Carlo Kok][]
-   _Mathematica_ by [Daniel Kvasnička][]
-   _Autohotkey_ by [Seongwon Lee][]
-   _Atelier_ family of styles in 10 variants by [Bram de Haan][]
-   _Paraíso_ styles by [Jan T. Sott][]

Miscellaneous improvements:

-   Highlighting `=>` prompts in Clojure.
-   [Jeremy Hull][] fixed a lot of styles for consistency.
-   Finally, highlighting PHP and HTML [mixed in peculiar ways][php-html].
-   Objective C and C# now properly highlight titles in method definition.
-   Big overhaul of relevance counting for a number of languages. Please do report
    bugs about mis-detection of non-trivial code snippets!

[api reference]: http://highlightjs.readthedocs.org/en/latest/api.html
[cr]: http://highlightjs.readthedocs.org/en/latest/css-classes-reference.html
[api docs]: http://highlightjs.readthedocs.org/en/latest/api.html
[variants]: https://groups.google.com/d/topic/highlightjs/VoGC9-1p5vk/discussion
[beginkeywords]: https://github.com/isagalaev/highlight.js/commit/6c7fdea002eb3949577a85b3f7930137c7c3038d
[php-html]: https://twitter.com/highlightjs/status/408890903017689088
[carlo kok]: https://github.com/carlokok
[bram de haan]: https://github.com/atelierbram
[daniel kvasnička]: https://github.com/dkvasnicka
[dmitry smolin]: https://github.com/dimsmol
[jeremy hull]: https://github.com/sourrust
[seongwon lee]: https://github.com/dlimpid
[jan t. sott]: https://github.com/idleberg

## Version 7.5

A catch-up release dealing with some of the accumulated contributions. This one
is probably will be the last before the 8.0 which will be slightly backwards
incompatible regarding some advanced use-cases.

One outstanding change in this version is the addition of 6 languages to the
[hosted script][d]: Markdown, ObjectiveC, CoffeeScript, Apache, Nginx and
Makefile. It now weighs about 6K more but we're going to keep it under 30K.

New languages:

-   OCaml by [Mehdi Dogguy][mehdid] and [Nicolas Braud-Santoni][nbraud]
-   [LiveCode Server][lcs] by [Ralf Bitter][revig]
-   Scilab by [Sylvestre Ledru][sylvestre]
-   basic support for Makefile by [Ivan Sagalaev][isagalaev]

Improvements:

-   Ruby's got support for characters like `?A`, `?1`, `?\012` etc. and `%r{..}`
    regexps.
-   Clojure now allows a function call in the beginning of s-expressions
    `(($filter "myCount") (arr 1 2 3 4 5))`.
-   Haskell's got new keywords and now recognizes more things like pragmas,
    preprocessors, modules, containers, FFIs etc. Thanks to [Zena Treep][treep]
    for the implementation and to [Jeremy Hull][sourrust] for guiding it.
-   Miscellaneous fixes in PHP, Brainfuck, SCSS, Asciidoc, CMake, Python and F#.

[mehdid]: https://github.com/mehdid
[nbraud]: https://github.com/nbraud
[revig]: https://github.com/revig
[lcs]: http://livecode.com/developers/guides/server/
[sylvestre]: https://github.com/sylvestre
[isagalaev]: https://github.com/isagalaev
[treep]: https://github.com/treep
[sourrust]: https://github.com/sourrust
[d]: http://highlightjs.org/download/

## New core developers

The latest long period of almost complete inactivity in the project coincided
with growing interest to it led to a decision that now seems completely obvious:
we need more core developers.

So without further ado let me welcome to the core team two long-time
contributors: [Jeremy Hull][] and [Oleg
Efimov][].

Hope now we'll be able to work through stuff faster!

P.S. The historical commit is [here][1] for the record.

[jeremy hull]: https://github.com/sourrust
[oleg efimov]: https://github.com/sannis
[1]: https://github.com/isagalaev/highlight.js/commit/f3056941bda56d2b72276b97bc0dd5f230f2473f

## Version 7.4

This long overdue version is a snapshot of the current source tree with all the
changes that happened during the past year. Sorry for taking so long!

Along with the changes in code highlight.js has finally got its new home at
<http://highlightjs.org/>, moving from its cradle on Software Maniacs which it
outgrew a long time ago. Be sure to report any bugs about the site to
<mailto:info@highlightjs.org>.

On to what's new…

New languages:

-   Handlebars templates by [Robin Ward][]
-   Oracle Rules Language by [Jason Jacobson][]
-   F# by [Joans Follesø][]
-   AsciiDoc and Haml by [Dan Allen][]
-   Lasso by [Eric Knibbe][]
-   SCSS by [Kurt Emch][]
-   VB.NET by [Poren Chiang][]
-   Mizar by [Kelley van Evert][]

[robin ward]: https://github.com/eviltrout
[jason jacobson]: https://github.com/jayce7
[joans follesø]: https://github.com/follesoe
[dan allen]: https://github.com/mojavelinux
[eric knibbe]: https://github.com/EricFromCanada
[kurt emch]: https://github.com/kemch
[poren chiang]: https://github.com/rschiang
[kelley van evert]: https://github.com/kelleyvanevert

New style themes:

-   Monokai Sublime by [noformnocontent][]
-   Railscasts by [Damien White][]
-   Obsidian by [Alexander Marenin][]
-   Docco by [Simon Madine][]
-   Mono Blue by [Ivan Sagalaev][] (uses a single color hue for everything)
-   Foundation by [Dan Allen][]

[noformnocontent]: http://nn.mit-license.org/
[damien white]: https://github.com/visoft
[alexander marenin]: https://github.com/ioncreature
[simon madine]: https://github.com/thingsinjars
[ivan sagalaev]: https://github.com/isagalaev

Other notable changes:

-   Corrected many corner cases in CSS.
-   Dropped Python 2 version of the build tool.
-   Implemented building for the AMD format.
-   Updated Rust keywords (thanks to [Dmitry Medvinsky][]).
-   Literal regexes can now be used in language definitions.
-   CoffeeScript highlighting is now significantly more robust and rich due to
    input from [Cédric Néhémie][].

[dmitry medvinsky]: https://github.com/dmedvinsky
[cédric néhémie]: https://github.com/abe33

## Version 7.3

-   Since this version highlight.js no longer works in IE version 8 and older.
    It's made it possible to reduce the library size and dramatically improve code
    readability and made it easier to maintain. Time to go forward!

-   New languages: AppleScript (by [Nathan Grigg][ng] and [Dr. Drang][dd]) and
    Brainfuck (by [Evgeny Stepanischev][bolk]).

-   Improvements to existing languages:

    -   interpreter prompt in Python (`>>>` and `...`)
    -   @-properties and classes in CoffeeScript
    -   E4X in JavaScript (by [Oleg Efimov][oe])
    -   new keywords in Perl (by [Kirk Kimmel][kk])
    -   big Ruby syntax update (by [Vasily Polovnyov][vast])
    -   small fixes in Bash

-   Also Oleg Efimov did a great job of moving all the docs for language and style
    developers and contributors from the old wiki under the source code in the
    "docs" directory. Now these docs are nicely presented at
    <http://highlightjs.readthedocs.org/>.

[ng]: https://github.com/nathan11g
[dd]: https://github.com/drdrang
[bolk]: https://github.com/bolknote
[oe]: https://github.com/Sannis
[kk]: https://github.com/kimmel
[vast]: https://github.com/vast

## Version 7.2

A regular bug-fix release without any significant new features. Enjoy!

## Version 7.1

A Summer crop:

-   [Marc Fornos][mf] made the definition for Clojure along with the matching
    style Rainbow (which, of course, works for other languages too).
-   CoffeeScript support continues to improve getting support for regular
    expressions.
-   Yoshihide Jimbo ported to highlight.js [five Tomorrow styles][tm] from the
    [project by Chris Kempson][tm0].
-   Thanks to [Casey Duncun][cd] the library can now be built in the popular
    [AMD format][amd].
-   And last but not least, we've got a fair number of correctness and consistency
    fixes, including a pretty significant refactoring of Ruby.

[mf]: https://github.com/mfornos
[tm]: http://jmblog.github.com/color-themes-for-highlightjs/
[tm0]: https://github.com/ChrisKempson/Tomorrow-Theme
[cd]: https://github.com/caseman
[amd]: http://requirejs.org/docs/whyamd.html

## Version 7.0

The reason for the new major version update is a global change of keyword syntax
which resulted in the library getting smaller once again. For example, the
hosted build is 2K less than at the previous version while supporting two new
languages.

Notable changes:

-   The library now works not only in a browser but also with [node.js][]. It is
    installable with `npm install highlight.js`. [API][] docs are available on our
    wiki.

-   The new unique feature (apparently) among syntax highlighters is highlighting
    _HTTP_ headers and an arbitrary language in the request body. The most useful
    languages here are _XML_ and _JSON_ both of which highlight.js does support.
    Here's [the detailed post][p] about the feature.

-   Two new style themes: a dark "south" _[Pojoaque][]_ by Jason Tate and an
    emulation of*XCode* IDE by [Angel Olloqui][ao].

-   Three new languages: _D_ by [Aleksandar Ružičić][ar], _R_ by [Joe Cheng][jc]
    and _GLSL_ by [Sergey Tikhomirov][st].

-   _Nginx_ syntax has become a million times smaller and more universal thanks to
    remaking it in a more generic manner that doesn't require listing all the
    directives in the known universe.

-   Function titles are now highlighted in _PHP_.

-   _Haskell_ and _VHDL_ were significantly reworked to be more rich and correct
    by their respective maintainers [Jeremy Hull][sr] and [Igor Kalnitsky][ik].

And last but not least, many bugs have been fixed around correctness and
language detection.

Overall highlight.js currently supports 51 languages and 20 style themes.

[node.js]: http://nodejs.org/
[api]: http://softwaremaniacs.org/wiki/doku.php/highlight.js:api
[p]: http://softwaremaniacs.org/blog/2012/05/10/http-and-json-in-highlight-js/en/
[pojoaque]: http://web-cms-designs.com/ftopict-10-pojoaque-style-for-highlight-js-code-highlighter.html
[ao]: https://github.com/angelolloqui
[ar]: https://github.com/raleksandar
[jc]: https://github.com/jcheng5
[st]: https://github.com/tikhomirov
[sr]: https://github.com/sourrust
[ik]: https://github.com/ikalnitsky

## Version 6.2

A lot of things happened in highlight.js since the last version! We've got nine
new contributors, the discussion group came alive, and the main branch on GitHub
now counts more than 350 followers. Here are most significant results coming
from all this activity:

-   5 (five!) new languages: Rust, ActionScript, CoffeeScript, MatLab and
    experimental support for markdown. Thanks go to [Andrey Vlasovskikh][av],
    [Alexander Myadzel][am], [Dmytrii Nagirniak][dn], [Oleg Efimov][oe], [Denis
    Bardadym][db] and [John Crepezzi][jc].

-   2 new style themes: Monokai by [Luigi Maselli][lm] and stylistic imitation of
    another well-known highlighter Google Code Prettify by [Aahan Krish][ak].

-   A vast number of [correctness fixes and code refactorings][log], mostly made
    by [Oleg Efimov][oe] and [Evgeny Stepanischev][es].

[av]: https://github.com/vlasovskikh
[am]: https://github.com/myadzel
[dn]: https://github.com/dnagir
[oe]: https://github.com/Sannis
[db]: https://github.com/btd
[jc]: https://github.com/seejohnrun
[lm]: http://grigio.org/
[ak]: https://github.com/geekpanth3r
[es]: https://github.com/bolknote
[log]: https://github.com/isagalaev/highlight.js/commits/

## Version 6.1 — Solarized

[Jeremy Hull][jh] has implemented my dream feature — a port of [Solarized][]
style theme famous for being based on the intricate color theory to achieve
correct contrast and color perception. It is now available for highlight.js in
both variants — light and dark.

This version also adds a new original style Arta. Its author pumbur maintains a
[heavily modified fork of highlight.js][pb] on GitHub.

[jh]: https://github.com/sourrust
[solarized]: http://ethanschoonover.com/solarized
[pb]: https://github.com/pumbur/highlight.js

## Version 6.0

New major version of the highlighter has been built on a significantly
refactored syntax. Due to this it's even smaller than the previous one while
supporting more languages!

New languages are:

-   Haskell by [Jeremy Hull][sourrust]
-   Erlang in two varieties — module and REPL — made collectively by [Nikolay
    Zakharov][desh], [Dmitry Kovega][arhibot] and [Sergey Ignatov][ignatov]
-   Objective C by [Valerii Hiora][vhbit]
-   Vala by [Antono Vasiljev][antono]
-   Go by [Stephan Kountso][steplg]

[sourrust]: https://github.com/sourrust
[desh]: http://desh.su/
[arhibot]: https://github.com/arhibot
[ignatov]: https://github.com/ignatov
[vhbit]: https://github.com/vhbit
[antono]: https://github.com/antono
[steplg]: https://github.com/steplg

Also this version is marginally faster and fixes a number of small long-standing
bugs.

Developer overview of the new language syntax is available in a [blog post about
recent beta release][beta].

[beta]: http://softwaremaniacs.org/blog/2011/04/25/highlight-js-60-beta/en/

P.S. New version is not yet available on a Yandex CDN, so for now you have to
download [your own copy][d].

[d]: /soft/highlight/en/download/

## Version 5.14

Fixed bugs in HTML/XML detection and relevance introduced in previous
refactoring.

Also test.html now shows the second best result of language detection by
relevance.

## Version 5.13

Past weekend began with a couple of simple additions for existing languages but
ended up in a big code refactoring bringing along nice improvements for language
developers.

### For users

-   Description of C++ has got new keywords from the upcoming [C++ 0x][] standard.
-   Description of HTML has got new tags from [HTML 5][].
-   CSS-styles have been unified to use consistent padding and also have lost
    pop-outs with names of detected languages.
-   [Igor Kalnitsky][ik] has sent two new language descriptions: CMake & VHDL.

This makes total number of languages supported by highlight.js to reach 35.

Bug fixes:

-   Custom classes on `<pre>` tags are not being overridden anymore
-   More correct highlighting of code blocks inside non-`<pre>` containers:
    highlighter now doesn't insist on replacing them with its own container and
    just replaces the contents.
-   Small fixes in browser compatibility and heuristics.

[c++ 0x]: http://ru.wikipedia.org/wiki/C%2B%2B0x
[html 5]: http://en.wikipedia.org/wiki/HTML5
[ik]: http://kalnitsky.org.ua/

### For developers

The most significant change is the ability to include language submodes right
under `contains` instead of defining explicit named submodes in the main array:

    contains: [
      'string',
      'number',
      {begin: '\\n', end: hljs.IMMEDIATE_RE}
    ]

This is useful for auxiliary modes needed only in one place to define parsing.
Note that such modes often don't have `className` and hence won't generate a
separate `<span>` in the resulting markup. This is similar in effect to
`noMarkup: true`. All existing languages have been refactored accordingly.

Test file test.html has at last become a real test. Now it not only puts the
detected language name under the code snippet but also tests if it matches the
expected one. Test summary is displayed right above all language snippets.

## CDN

Fine people at [Yandex][] agreed to host highlight.js on their big fast servers.
[Link up][l]!

[yandex]: http://yandex.com/
[l]: http://softwaremaniacs.org/soft/highlight/en/download/

## Version 5.10 — "Paris".

Though I'm on a vacation in Paris, I decided to release a new version with a
couple of small fixes:

-   Tomas Vitvar discovered that TAB replacement doesn't always work when used
    with custom markup in code
-   SQL parsing is even more rigid now and doesn't step over SmallTalk in tests

## Version 5.9

A long-awaited version is finally released.

New languages:

-   Andrew Fedorov made a definition for Lua
-   a long-time highlight.js contributor [Peter Leonov][pl] made a definition for
    Nginx config
-   [Vladimir Moskva][vm] made a definition for TeX

[pl]: http://kung-fu-tzu.ru/
[vm]: http://fulc.ru/

Fixes for existing languages:

-   [Loren Segal][ls] reworked the Ruby definition and added highlighting for
    [YARD][] inline documentation
-   the definition of SQL has become more solid and now it shouldn't be overly
    greedy when it comes to language detection

[ls]: http://gnuu.org/
[yard]: http://yardoc.org/

The highlighter has become more usable as a library allowing to do highlighting
from initialization code of JS frameworks and in ajax methods (see.
readme.eng.txt).

Also this version drops support for the [WordPress][wp] plugin. Everyone is
welcome to [pick up its maintenance][p] if needed.

[wp]: http://wordpress.org/
[p]: http://bazaar.launchpad.net/~isagalaev/+junk/highlight/annotate/342/src/wp_highlight.js.php

## Version 5.8

-   Jan Berkel has contributed a definition for Scala. +1 to hotness!
-   All CSS-styles are rewritten to work only inside `<pre>` tags to avoid
    conflicts with host site styles.

## Version 5.7.

Fixed escaping of quotes in VBScript strings.

## Version 5.5

This version brings a small change: now .ini-files allow digits, underscores and
square brackets in key names.

## Version 5.4

Fixed small but upsetting bug in the packer which caused incorrect highlighting
of explicitly specified languages. Thanks to Andrew Fedorov for precise
diagnostics!

## Version 5.3

The version to fulfil old promises.

The most significant change is that highlight.js now preserves custom user
markup in code along with its own highlighting markup. This means that now it's
possible to use, say, links in code. Thanks to [Vladimir Dolzhenko][vd] for the
[initial proposal][1] and for making a proof-of-concept patch.

Also in this version:

-   [Vasily Polovnyov][vp] has sent a GitHub-like style and has implemented
    support for CSS @-rules and Ruby symbols.
-   Yura Zaripov has sent two styles: Brown Paper and School Book.
-   Oleg Volchkov has sent a definition for [Parser 3][p3].

[1]: http://softwaremaniacs.org/forum/highlightjs/6612/
[p3]: http://www.parser.ru/
[vp]: http://vasily.polovnyov.ru/
[vd]: http://dolzhenko.blogspot.com/

## Version 5.2

-   at last it's possible to replace indentation TABs with something sensible
    (e.g. 2 or 4 spaces)
-   new keywords and built-ins for 1C by Sergey Baranov
-   a couple of small fixes to Apache highlighting

## Version 5.1

This is one of those nice version consisting entirely of new and shiny
contributions!

-   [Vladimir Ermakov][vooon] created highlighting for AVR Assembler
-   [Ruslan Keba][rukeba] created highlighting for Apache config file. Also his
    original visual style for it is now available for all highlight.js languages
    under the name "Magula".
-   [Shuen-Huei Guan][drake] (aka Drake) sent new keywords for RenderMan
    languages. Also thanks go to [Konstantin Evdokimenko][ke] for his advice on
    the matter.

[vooon]: http://vehq.ru/about/
[rukeba]: http://rukeba.com/
[drake]: http://drakeguan.org/
[ke]: http://k-evdokimenko.moikrug.ru/

## Version 5.0

The main change in the new major version of highlight.js is a mechanism for
packing several languages along with the library itself into a single compressed
file. Now sites using several languages will load considerably faster because
the library won't dynamically include additional files while loading.

Also this version fixes a long-standing bug with Javascript highlighting that
couldn't distinguish between regular expressions and division operations.

And as usually there were a couple of minor correctness fixes.

Great thanks to all contributors! Keep using highlight.js.

## Version 4.3

This version comes with two contributions from [Jason Diamond][jd]:

-   language definition for C# (yes! it was a long-missed thing!)
-   Visual Studio-like highlighting style

Plus there are a couple of minor bug fixes for parsing HTML and XML attributes.

[jd]: http://jason.diamond.name/weblog/

## Version 4.2

The biggest news is highlighting for Lisp, courtesy of Vasily Polovnyov. It's
somewhat experimental meaning that for highlighting "keywords" it doesn't use
any pre-defined set of a Lisp dialect. Instead it tries to highlight first word
in parentheses wherever it makes sense. I'd like to ask people programming in
Lisp to confirm if it's a good idea and send feedback to [the forum][f].

Other changes:

-   Smalltalk was excluded from DEFAULT_LANGUAGES to save traffic
-   [Vladimir Epifanov][voldmar] has implemented javascript style switcher for
    test.html
-   comments now allowed inside Ruby function definition
-   [MEL][] language from [Shuen-Huei Guan][drake]
-   whitespace now allowed between `<pre>` and `<code>`
-   better auto-detection of C++ and PHP
-   HTML allows embedded VBScript (`<% .. %>`)

[f]: http://softwaremaniacs.org/forum/highlightjs/
[voldmar]: http://voldmar.ya.ru/
[mel]: http://en.wikipedia.org/wiki/Maya_Embedded_Language
[drake]: http://drakeguan.org/

## Version 4.1

Languages:

-   Bash from Vah
-   DOS bat-files from Alexander Makarov (Sam)
-   Diff files from Vasily Polovnyov
-   Ini files from myself though initial idea was from Sam

Styles:

-   Zenburn from Vladimir Epifanov, this is an imitation of a
    [well-known theme for Vim][zenburn].
-   Ascetic from myself, as a realization of ideals of non-flashy highlighting:
    just one color in only three gradations :-)

In other news. [One small bug][bug] was fixed, built-in keywords were added for
Python and C++ which improved auto-detection for the latter (it was shame that
[my wife's blog][alenacpp] had issues with it from time to time). And lastly
thanks go to Sam for getting rid of my stylistic comments in code that were
getting in the way of [JSMin][].

[zenburn]: http://en.wikipedia.org/wiki/Zenburn
[alenacpp]: http://alenacpp.blogspot.com/
[bug]: http://softwaremaniacs.org/forum/viewtopic.php?id=1823
[jsmin]: http://code.google.com/p/jsmin-php/

## Version 4.0

New major version is a result of vast refactoring and of many contributions.

Visible new features:

-   Highlighting of embedded languages. Currently is implemented highlighting of
    Javascript and CSS inside HTML.
-   Bundled 5 ready-made style themes!

Invisible new features:

-   Highlight.js no longer pollutes global namespace. Only one object and one
    function for backward compatibility.
-   Performance is further increased by about 15%.

Changing of a major version number caused by a new format of language definition
files. If you use some third-party language files they should be updated.

## Version 3.5

A very nice version in my opinion fixing a number of small bugs and slightly
increased speed in a couple of corner cases. Thanks to everybody who reports
bugs in he [forum][f] and by email!

There is also a new language — XML. A custom XML formerly was detected as HTML
and didn't highlight custom tags. In this version I tried to make custom XML to
be detected and highlighted by its own rules. Which by the way include such
things as CDATA sections and processing instructions (`<? ... ?>`).

[f]: http://softwaremaniacs.org/forum/viewforum.php?id=6

## Version 3.3

[Vladimir Gubarkov][xonix] has provided an interesting and useful addition.
File export.html contains a little program that shows and allows to copy and
paste an HTML code generated by the highlighter for any code snippet. This can
be useful in situations when one can't use the script itself on a site.

[xonix]: http://xonixx.blogspot.com/

## Version 3.2 consists completely of contributions:

-   Vladimir Gubarkov has described SmallTalk
-   Yuri Ivanov has described 1C
-   Peter Leonov has packaged the highlighter as a Firefox extension
-   Vladimir Ermakov has compiled a mod for phpBB

Many thanks to you all!

## Version 3.1

Three new languages are available: Django templates, SQL and Axapta. The latter
two are sent by [Dmitri Roudakov][1]. However I've almost entirely rewrote an
SQL definition but I'd never started it be it from the ground up :-)

The engine itself has got a long awaited feature of grouping keywords
("keyword", "built-in function", "literal"). No more hacks!

[1]: http://roudakov.ru/

## Version 3.0

It is major mainly because now highlight.js has grown large and has become
modular. Now when you pass it a list of languages to highlight it will
dynamically load into a browser only those languages.

Also:

-   Konstantin Evdokimenko of [RibKit][] project has created a highlighting for
    RenderMan Shading Language and RenderMan Interface Bytestream. Yay for more
    languages!
-   Heuristics for C++ and HTML got better.
-   I've implemented (at last) a correct handling of backslash escapes in C-like
    languages.

There is also a small backwards incompatible change in the new version. The
function initHighlighting that was used to initialize highlighting instead of
initHighlightingOnLoad a long time ago no longer works. If you by chance still
use it — replace it with the new one.

[ribkit]: http://ribkit.sourceforge.net/

## Version 2.9

Highlight.js is a parser, not just a couple of regular expressions. That said
I'm glad to announce that in the new version 2.9 has support for:

-   in-string substitutions for Ruby -- `#{...}`
-   strings from from numeric symbol codes (like #XX) for Delphi

## Version 2.8

A maintenance release with more tuned heuristics. Fully backwards compatible.

## Version 2.7

-   Nikita Ledyaev presents highlighting for VBScript, yay!
-   A couple of bugs with escaping in strings were fixed thanks to Mickle
-   Ongoing tuning of heuristics

Fixed bugs were rather unpleasant so I encourage everyone to upgrade!

## Version 2.4

-   Peter Leonov provides another improved highlighting for Perl
-   Javascript gets a new kind of keywords — "literals". These are the words
    "true", "false" and "null"

Also highlight.js homepage now lists sites that use the library. Feel free to
add your site by [dropping me a message][mail] until I find the time to build a
submit form.

[mail]: mailto:Maniac@SoftwareManiacs.Org

## Version 2.3

This version fixes IE breakage in previous version. My apologies to all who have
already downloaded that one!

## Version 2.2

-   added highlighting for Javascript
-   at last fixed parsing of Delphi's escaped apostrophes in strings
-   in Ruby fixed highlighting of keywords 'def' and 'class', same for 'sub' in
    Perl

## Version 2.0

-   Ruby support by [Anton Kovalyov][ak]
-   speed increased by orders of magnitude due to new way of parsing
-   this same way allows now correct highlighting of keywords in some tricky
    places (like keyword "End" at the end of Delphi classes)

[ak]: http://anton.kovalyov.net/

## Version 1.0

Version 1.0 of javascript syntax highlighter is released!

It's the first version available with English description. Feel free to post
your comments and question to [highlight.js forum][forum]. And don't be afraid
if you find there some fancy Cyrillic letters -- it's for Russian users too :-)

[forum]: http://softwaremaniacs.org/forum/viewforum.php?id=6

# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.2.5]

### Added

- parseJson and attempt utils

### Fixed

- Incorrect dependency on rollup

## [1.2.4]

### Fixed

- Use rollup for better importing
- Emit a CommonJS and Module distribution
- Include typescript source files for source mapping

## [1.2.3]

### Changed

- Fix compiler error with returning a ResultP from an async function

## [1.2.2]

### Changed

- Consistently bind generics late for better type inference
- Allow more versions of node

## [1.2.1]

### Changed

- Make isOk/Error work correctly with undefined data.

## [1.2.0]

### Added

- Side-effect-only `do` functions
- allOkAsync

### Changed

- Pipeable function names to be prefixed with `ok` or `error`
- Better type inference for pipeAsync

## [1.1.0]

### Added

- Side effect-only functions

### Changed

- Function names from mapOk/Error to ifOk/Error

## [1.0.0]

### Added

- Collection functions
- CI/code coverage

### Changed

- Reorganized code

## [0.1.0]

### Added

- Types and basic functions

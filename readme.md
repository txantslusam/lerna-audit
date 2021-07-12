![](https://github.com/txantslusam/lerna-audit-yarn/workflows/CI/badge.svg)

# Lerna Audit Yarn

Micro util to run npm audit for lerna packages (with autofix).

## How to use

### Install

In the root of your lerna monorepo run:

`npm i lerna-audit-yarn -D`

or

`yarn add lerna-audit-yarn -D`

### Use

In the root of your lerna monorepo run:

`npx lerna-audit-yarn [OPTIONS]`

Or add a script to your `package.json` in root:

```jsonc
{
  "scripts": {
    "audit": "lerna-audit-yarn"
  }
}
```

#### Options

| Parameter | Default | Description                                                 |
|-----------|---------|-------------------------------------------------------------|
| `--help`|    | Display all available options | 
| `--fix`| false   | (optional) Audit will try to autofix vunerabilities | 
| `--no-report`| false   | (optional) Do not show summary for packages | 
| `--json`| false   | (optional) Log in JSON format | 
| `--force`| false   | (optional) Have audit fix install semver-major updates to toplevel dependencies, not just semver-compatible ones | 
| `--audit-level [level]`| low   | (optional) Include a vulnerability with a level as defined or higher | 
| `--only [scope]`|    | (optional) Set package updating scope | 

## Why

Lerna works in a way that it manages "internal" dependencies within your monorepo by managing all relevant `npm link` commands for you in local development. So you can keep the dependencies to other packages in the monorepo in your package.json while linking the latest versions during development. The downside is that all commands that depend on the dependencies defined in `package.json`s will fail because "internal" packages are just linked and not yet published. One of this commands is `yarn audit` because it tires to analyse the dependency tree. `lerna-audit-yarn` mimics the behavior of lerna - removing internal packages from package.json, run the command, restore package.json - to run a `yarn-audit-fix` in every lerna managed package.

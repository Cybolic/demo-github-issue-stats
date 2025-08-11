# What is this?

This is a quick exploration of visualising the number of open GitHub issues for
one or more projects over the last 5 months.

This can be useful to see if a project has stagnated or is seeing an increase
in issues. As a developer, there are often multiple projects that offer similar
functionality, and this might help to narrow down which one to further
investigate.

# Setup instructions

## Install the dependencies (requires Node to already be installed):
```bash
npm install
```

## Compile/Transpile and run the server:
```bash
npm run build
npm start
```

## Or, start a live-reload development server:
```bash
npm run dev
```

# Quick test
Since it can take some time to fetch all issues, to get a quick overview you
can try the following URLs which don't have that many issues:

```
https://github.com/chalk/chalk
https://github.com/open-cli-tools/concurrently
```


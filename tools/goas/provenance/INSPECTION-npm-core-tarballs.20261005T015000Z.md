# Inspeccion read-only de tarballs N01-N09 — run 20261005T015000Z

Sin extraccion a disco ni ejecucion de contenido. Listados completos: `listing-<ID>.20261005T015000Z.txt` y `listing-<ID>.20261005T015000Z.verbose.txt`.

## N01 — yaml@2.9.1 (yaml-2.9.1.tgz)

- entries=233 top_level=package node_modules_entries=0
- package.json: OK pj_name=yaml pj_version=2.9.1 name_match=true version_match=true
- engines={"node":">= 14.6"}
- dependencies={}
- peerDependencies={} peerDependenciesMeta={} optionalDependencies={}
- bundledDependencies=[]
- scripts={"build":"npm run build:node && npm run build:browser","build:browser":"rollup -c config/rollup.browser-config.mjs","build:node":"rollup -c config/rollup.node-config.mjs","clean":"git clean -fdxe node_modules","lint":"eslint config/ src/","prettier":"prettier --write .","prestart":"rollup --sourcemap -c config/rollup.node-config.mjs","start":"node --enable-source-maps -i -e 'YAML=require(\"./dist/index.js\");const{parse,parseDocument,parseAllDocuments}=YAML'","test":"jest --config config/jest.config.js","test:all":"npm test && npm run test:types && npm run test:dist && npm run test:dist:types","test:browsers":"cd playground && npm test","test:dist":"npm run build:node && jest --config config/jest.config.js","test:dist:types":"tsc --allowJs --moduleResolution node --noEmit --target es5 dist/index.js","test:types":"tsc --noEmit && tsc --noEmit -p tests/tsconfig.json","docs:install":"cd docs-slate && bundle install","predocs:deploy":"node docs/prepare-docs.mjs","docs:deploy":"cd docs-slate && ./deploy.sh","predocs":"node docs/prepare-docs.mjs","docs":"cd docs-slate && bundle exec middleman server","preversion":"npm test && npm run build","prepublishOnly":"npm run clean && npm test && npm run build"}
- lifecycle_scripts=["prepublishOnly"]
- path_traversal_findings=none
- link_findings=none
- escaping_link_findings=none

## N02 — jsonc-parser@3.3.1 (jsonc-parser-3.3.1.tgz)

- entries=19 top_level=package node_modules_entries=0
- package.json: OK pj_name=jsonc-parser pj_version=3.3.1 name_match=true version_match=true
- engines={}
- dependencies={}
- peerDependencies={} peerDependenciesMeta={} optionalDependencies={}
- bundledDependencies=[]
- scripts={"prepack":"npm run clean && npm run compile-esm && npm run test && npm run remove-sourcemap-refs","compile":"tsc -p ./src && npm run lint","compile-esm":"tsc -p ./src/tsconfig.esm.json","remove-sourcemap-refs":"node ./build/remove-sourcemap-refs.js","clean":"rimraf lib","watch":"tsc -w -p ./src","test":"npm run compile && mocha ./lib/umd/test","lint":"eslint src/**/*.ts"}
- lifecycle_scripts=["prepack"]
- path_traversal_findings=none
- link_findings=none
- escaping_link_findings=none

## N03 — @redocly/cli@2.57.0 (redocly-cli-2.57.0.tgz)

- entries=163 top_level=package node_modules_entries=0
- package.json: OK pj_name=@redocly/cli pj_version=2.57.0 name_match=true version_match=true
- engines={"node":">=22.12.0 || >=20.19.0 <21.0.0","npm":">=10"}
- dependencies={}
- peerDependencies={} peerDependenciesMeta={} optionalDependencies={}
- bundledDependencies=[]
- scripts={}
- lifecycle_scripts=[]
- path_traversal_findings=none
- link_findings=none
- escaping_link_findings=none

## N04 — ajv@8.20.0 (ajv-8.20.0.tgz)

- entries=466 top_level=package node_modules_entries=0
- package.json: OK pj_name=ajv pj_version=8.20.0 name_match=true version_match=true
- engines={}
- dependencies={"fast-deep-equal":"^3.1.3","fast-uri":"^3.0.1","json-schema-traverse":"^1.0.0","require-from-string":"^2.0.2"}
- peerDependencies={} peerDependenciesMeta={} optionalDependencies={}
- bundledDependencies=[]
- scripts={"eslint":"eslint \"lib/**/*.ts\" \"spec/**/*.*s\" --ignore-pattern spec/JSON-Schema-Test-Suite","prettier:write":"prettier --write \"./**/*.{json,yaml,js,ts}\"","prettier:check":"prettier --list-different \"./**/*.{json,yaml,js,ts}\"","test-spec":"cross-env TS_NODE_PROJECT=spec/tsconfig.json mocha -r ts-node/register \"spec/**/*.spec.{ts,js}\" -R dot","test-codegen":"nyc cross-env TS_NODE_PROJECT=spec/tsconfig.json mocha -r ts-node/register 'spec/codegen.spec.ts' -R spec","test-debug":"npm run test-spec -- --inspect-brk","test-cov":"nyc npm run test-spec","rollup":"rm -rf bundle && rollup -c","bundle":"rm -rf bundle && node ./scripts/bundle.js ajv ajv7 ajv7 && node ./scripts/bundle.js 2019 ajv2019 ajv2019 && node ./scripts/bundle.js 2020 ajv2020 ajv2020 && node ./scripts/bundle.js jtd ajvJTD ajvJTD","build":"rm -rf dist && tsc && cp -r lib/refs dist && rm dist/refs/json-schema-2019-09/index.ts && rm dist/refs/json-schema-2020-12/index.ts && rm dist/refs/jtd-schema.ts","json-tests":"rm -rf spec/_json/*.js && node scripts/jsontests","test-karma":"karma start","test-browser":"rm -rf .browser && npm run bundle && scripts/prepare-tests && karma start","test-all":"npm run test-cov","test":"npm run json-tests && npm run prettier:check && npm run eslint && npm link && npm link --legacy-peer-deps ajv && npm run test-cov","test-ci":"AJV_FULL_TEST=true npm test","prepublish":"npm run build","benchmark":"npm i && npm run build && npm link && cd ./benchmark && npm link --legacy-peer-deps ajv && npm i && node ./jtd","docs:dev":"./scripts/prepare-site && vuepress dev docs","docs:build":"./scripts/prepare-site && vuepress build docs"}
- lifecycle_scripts=["prepublish"]
- path_traversal_findings=none
- link_findings=none
- escaping_link_findings=none

## N05 — ajv-formats@3.0.1 (ajv-formats-3.0.1.tgz)

- entries=15 top_level=package node_modules_entries=0
- package.json: OK pj_name=ajv-formats pj_version=3.0.1 name_match=true version_match=true
- engines={}
- dependencies={"ajv":"^8.0.0"}
- peerDependencies={"ajv":"^8.0.0"} peerDependenciesMeta={"ajv":{"optional":true}} optionalDependencies={}
- bundledDependencies=[]
- scripts={"build":"tsc","prettier:write":"prettier --write \"./**/*.{md,json,yaml,js,ts}\"","prettier:check":"prettier --list-different \"./**/*.{md,json,yaml,js,ts}\"","eslint":"eslint --ext .ts ./src/**/*","test-spec":"jest","test-cov":"jest --coverage","test":"npm run prettier:check && npm run build && npm run eslint && npm run test-cov","ci-test":"npm run test"}
- lifecycle_scripts=[]
- path_traversal_findings=none
- link_findings=none
- escaping_link_findings=none

## N06 — fast-deep-equal@3.1.3 (fast-deep-equal-3.1.3.tgz)

- entries=11 top_level=package node_modules_entries=0
- package.json: OK pj_name=fast-deep-equal pj_version=3.1.3 name_match=true version_match=true
- engines={}
- dependencies={}
- peerDependencies={} peerDependenciesMeta={} optionalDependencies={}
- bundledDependencies=[]
- scripts={"eslint":"eslint *.js benchmark/*.js spec/*.js","build":"node build","benchmark":"npm i && npm run build && cd ./benchmark && npm i && node ./","test-spec":"mocha spec/*.spec.js -R spec","test-cov":"nyc npm run test-spec","test-ts":"tsc --target ES5 --noImplicitAny index.d.ts","test":"npm run build && npm run eslint && npm run test-ts && npm run test-cov","prepublish":"npm run build"}
- lifecycle_scripts=["prepublish"]
- path_traversal_findings=none
- link_findings=none
- escaping_link_findings=none

## N07 — fast-uri@3.1.8 (fast-uri-3.1.8.tgz)

- entries=44 top_level=package node_modules_entries=0
- package.json: OK pj_name=fast-uri pj_version=3.1.8 name_match=true version_match=true
- engines={}
- dependencies={}
- peerDependencies={} peerDependenciesMeta={} optionalDependencies={}
- bundledDependencies=[]
- scripts={"lint":"eslint","lint:fix":"eslint --fix","test":"npm run test:unit && npm run test:typescript","test:browser:chromium":"playwright-test ./test/* --runner tape --browser=chromium","test:browser:firefox":"playwright-test ./test/* --runner tape --browser=firefox","test:browser:webkit":"playwright-test ./test/* --runner tape --browser=webkit","test:browser":"npm run test:browser:chromium && npm run test:browser:firefox && npm run test:browser:webkit","test:unit":"tape test/**/*.js","test:unit:dev":"npm run test:unit -- --coverage-report=html","test:typescript":"tsd"}
- lifecycle_scripts=[]
- path_traversal_findings=none
- link_findings=none
- escaping_link_findings=none

## N08 — json-schema-traverse@1.0.0 (json-schema-traverse-1.0.0.tgz)

- entries=12 top_level=package node_modules_entries=0
- package.json: OK pj_name=json-schema-traverse pj_version=1.0.0 name_match=true version_match=true
- engines={}
- dependencies={}
- peerDependencies={} peerDependenciesMeta={} optionalDependencies={}
- bundledDependencies=[]
- scripts={"eslint":"eslint index.js spec","test-spec":"mocha spec -R spec","test":"npm run eslint && nyc npm run test-spec"}
- lifecycle_scripts=[]
- path_traversal_findings=none
- link_findings=none
- escaping_link_findings=none

## N09 — require-from-string@2.0.2 (require-from-string-2.0.2.tgz)

- entries=4 top_level=package node_modules_entries=0
- package.json: OK pj_name=require-from-string pj_version=2.0.2 name_match=true version_match=true
- engines={"node":">=0.10.0"}
- dependencies={}
- peerDependencies={} peerDependenciesMeta={} optionalDependencies={}
- bundledDependencies=[]
- scripts={"test":"mocha"}
- lifecycle_scripts=[]
- path_traversal_findings=none
- link_findings=none
- escaping_link_findings=none


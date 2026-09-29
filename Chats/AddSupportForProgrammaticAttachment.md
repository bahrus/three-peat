# Add Support For Programmatic Attachment

## Bruce's Ask

Can you please follow the example of [be-persistent](https://github.com/bahrus/be-persistent) and [be-bound](../../be-bound) and [be-calculating](../../be-calculating/) and [the addendum](../types/ImportantEnhancementAddendum.md) to add demos and adjust three-peat.js as needed and add def.js to support programmatic attachment of this enhancement?

Please add your implementation notes below.

## Implementation Notes

I followed the addendum's checklist, including step 6 (README wording), with
the previous enhancements as models.

### ⚠️ First: the existing tests were already failing, because of an upstream bug

Both existing tests (`BasicExample`, `ListPropUpdate`) failed **before I
changed anything**. I confirmed this by stashing my changes. The rows render,
but every cell is empty.

The cause is in assign-gingerly 0.0.97's inferencer
(`inferencer/inferencer.ts`, `#queryScoped`):

```TS
return filtered.map(x => new Infer(x, propName));
```

`['|'](itempropAttr)` passes the *itemprop name* through as the match's
`propName`. The `value` setter then uses it as the element property to
write:

- expected: `td.textContent = 'USA'`
- actual: `td.noc = 'USA'`

So `processInferredAssignments` (`fromEachItem.withOptions.infer.byItemprop`,
three-peat's default) silently writes nothing visible. The same would hit
anything else that relies on `Infer['|']` / `['@']` / `['%']` / `['#']` /
`['.']` followed by `.value = ...`.

Earlier in this session, `npm run update` bumped three-peat from
assign-gingerly 0.0.87 to 0.0.97. That's the likely point where this
started, but I didn't bisect.

To confirm this was the *only* problem, I temporarily patched
`node_modules/.../inferencer.js` to `new Infer(x)`. With that patch, all 6
tests pass (the 2 existing ones and the 4 new ones). I then restored the
file, so `node_modules` is untouched and the suite fails as it did before.
The real fix belongs in assign-gingerly's inferencer, followed by a publish
and a version bump here. I haven't made it, because it's a different repo
and I'm not sure whether `propName` is also relied on there, e.g. by
`setDisplay`, which reads `vm[this.#propName]`.

### three-peat changes

three-peat was already partly there. `init` already awaited `roundabout`
and set `initialized`, and `hydrate` already gated on it
(`ifKeyIn: ['src', 'listProp', 'initialized']`). Every end-user property
(`src`, `listProp`, `each`, `target`, `updateOn`) is already a plain
property, so no new one was needed. What remained:

1. **`ctx.emc || ctx.config`.** Without it, `customData` is undefined on the
   programmatic path, so no actions are configured.
2. **`enhKey` renamed: `three-peat` → `threePeat`.** The kebab-case key would
   have made the API `tbody.enh.set['three-peat']`. It now matches
   `beBound` / `doAssign` / etc. The emoji variant still uses `🔁`. Nothing in
   this repo read `enh['three-peat']`.
3. **`hydrate` is now safe to re-run.** Programmatic callers reassign
   properties, and frameworks re-render.
   - **Template captured once.** For a non-template adorned element, the
     first pass moves the first child into a template and removes it. On a
     second pass, `firstElementChild` was a *rendered clone*, so it would
     have been used as the template. The template and the default target are
     now cached on the instance.
   - **Listeners torn down.** The change listener (`updateOn`, the propagator,
     or `items-changed`) is attached with an `AbortController` signal, and
     the previous pass's controller is aborted first.
   - A re-run with a fresh `ManageTemplateListHandler` is fine.
     assign-gingerly keeps the list state in a `WeakMap` keyed by the marker
     comments in the DOM, not on the handler instance. So the new handler
     reconciles against the rows already rendered.
4. **All end-user props are monitored.** `hydrate`'s `ifKeyIn` now also lists
   `each`, `target` and `updateOn`, so reassigning any of them re-renders.
   (Changing `target` renders into the new target; rows already in the old
   target stay put.)
5. **`def.js`** exports `defThreePeat(ref)`. `package.json` has no `exports`
   map, and `files` already includes `*.js` / `*.json`, so no change was
   needed there.
6. **README.** Added a "Programmatic attachment (no attribute)" section
   before "Viewing Demos Locally". It has the editorial intro (the
   configuration spans up to five attributes, one of them JSON),
   registration, an attribute → property table, and both patterns.
   `AGENTS.md`'s file map now lists `def.js`.

No type changes were needed. `types/three-peat/types.d.ts` already
described every property.

### Demos and tests

Each demo has a `<world-ranking id=rankings>` host with a propagator and two
lists (`list`, `paralympics`), and a table whose `<tbody>` is enhanced:

- `demo/Programmatic/DeclarativeInSequence.html`: `src` + `listProp` via
  `enh.set`.
- `demo/Programmatic/DeclarativeOutOfSequence.html`: the same, set before
  `defThreePeat`. The test also calls `rankings.addItem(...)` and expects the
  new row, which checks list-change re-rendering.
- `demo/Programmatic/Imperative.html`: `enh.get()` with
  `target: 'destination'`. Rows render into a second `<tbody>`.
- `demo/Programmatic/ImperativeReassign.html`: `listProp: 'list'`, then
  reassigned to `'paralympics'`. The test expects:
  - one visible row, cloned from the original six-cell template;
  - that `addItem` on the old list no longer re-renders.
- `tests/Programmatic/*` mirror these.

With the upstream bug temporarily patched, these checks show the new tests
catch real problems:

- With the original `three-peat.js` / `emc.json`, all 4 new tests fail.
- With only the template caching disabled, `ImperativeReassign` fails.

`emc.json` / `🔁.json` were regenerated with `npm run build`.


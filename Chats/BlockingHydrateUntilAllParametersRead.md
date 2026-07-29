# Blocking Hydrate Until All Parameters Read

---

## Human Ask

Kimi did a great job of understanding all the documentation and, with no changes, one of the two tests worked (BasicExample.html)

When it came to ListPropUpdate.html, however, I was getting an error because hydrate was immediately called before the values of src and listProp were read.

I partially fixed this by adding "ifKeyIn" to emj.mjs:

```JS
    customData: {
        weakRef: {
            properties: ['enhancedElement']
        },
        actions: {
            hydrate: {
                ifKeyIn: ['src', 'listProp'],
                ifAllOf: ['enhancedElement']
            }
        }
    }
```

Editing emc.mjs did **not** trigger an automatic run of npm run build as I was hoping.  Let's revisit that separately.

My change still resulted in  an error the first time hydrate has been hit, but then worked the second time, because it saw src change from undefined to a value.

I feel like I've encountered this scenario many times in the past, but couldn't find a working example of how to address this.

We need to solve this, in a predictable way, so you can update the instructions for creating an enhancement with this scenario with a proven solution.

My proposal, unless you think of a better way is:

1.  I added initialized to AllProps in types/three-peat/types.d.ts

```TS
export interface AllProps extends EndUserProps{
    enhancedElement: Element & ElementEnhancementGateway;
    resolved?: boolean;
    initialized?: boolean;
}
```

2.  I made the init do an await, then set self.initialized to true

3.  I added initialized to "ifAllOf" above

I haven't committed the code yet, so you can examine the git status to confirm my changes.

Unless you can think of a better way, can you document this where you think it is most appropriate?  I'm thinking both types/NewEnhancementInstructions.md and types/EnhancementConversionInstructions.md

It should only be done if there is a scenario like this where it is predictable that nothing should happen until all the relevant attributes have been read.

---

## Kimi responds

No problem — I'll hold off on changes. Here's what I found from the runtime code and a test run, which should save you some troubleshooting time:

**Test status with your current uncommitted change:** both tests fail — `hydrate` never fires at all now.

**Root cause** (in `node_modules/roundabout-lib/processors/actions.js`):

1. When `ifKeyIn` is combined with other conditions like `ifAllOf`, an action only executes when the property that *changed* is in the `ifKeyIn` list (`actions.js:129-143`: `shouldExecute = conditionsMet && changedIsInKeyIn`).
2. Your `initialized` flag is in `ifAllOf` but not in `ifKeyIn`. So when `self.initialized = true` fires its change event after `roundabout()` returns, `changedProperty` is `'initialized'`, which isn't in `ifKeyIn: ['src', 'listProp']` → `shouldExecute` is false → hydrate is skipped.
3. And by that point, `src`/`listProp` have already been assigned (during `roundabout()`'s `initialPropVals` pass), so they never change again — no further trigger ever comes.

**Why your earlier `ifKeyIn`-only attempt errored once then worked:** `evaluateConditions` treats `ifKeyIn` as *at least one* defined (`actions.js:264-270`), not *all*. `initialPropVals` are assigned one at a time by `assignGingerly`, so when `src` was set first, conditions passed with `listProp` still undefined → hydrate fired early and threw; when `listProp` was then set, it fired again and succeeded.

**The likely one-line fix** (untested — was about to try it when you cancelled): add `'initialized'` to `ifKeyIn` too:

```js
hydrate: {
    ifKeyIn: ['src', 'listProp', 'initialized'],
    ifAllOf: ['enhancedElement', 'initialized']
}
```

That way the `initialized = true` flip itself satisfies `changedIsInKeyIn`, all attribute reads are guaranteed done (it happens after `roundabout()` returns), and later `src`/`listProp` changes still re-trigger hydrate as originally intended.

Happy to try that and rerun the tests whenever you're ready, or leave the troubleshooting to you — your call.


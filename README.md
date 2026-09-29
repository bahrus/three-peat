# three-peat (🔁)

three-peat is a DOM element enhancement library that uses [assign-gingerly](https://github.com/bahrus/assign-gingerly/) and [mount-observer](https://github.com/bahrus/mount-observer) as the basis for defining the element enhancement.

three-peat helps manage an HTML template list.

The name "three-peat" refers to the fact that in order to define an HTML loop, you need:

1.  A DOM fragment to instantiate and repeat
2.  A place in the DOM tree to repeat it.
3.  The source of the list

Typical usage, using the canonical name "three-peat"

```html
<my-element>
    <template shadowrootmode=open>
        <table>
            <thead><tr><th>Rank</th><th>NOC</th><th>Gold</th><th>Silver</th><th>Bronze</th><th>Total</th></tr></thead>
            <tbody three-peat>
                <tr>
                    <td itemprop="rank"></td>
                    <td itemprop="noc"></td>
                    <td itemprop="gold"></td>
                    <td itemprop="silver"></td>
                    <td itemprop="bronze"></td>
                    <td itemprop="total"></td>
                </tr>
            </tbody>
        </table>
        <be-hive></be-hive>
    </template>
</my-element>
```

In more constrained environments where name spacing is well monitored, a shorter, or alternative name can be used.  This package provides one such alternative shorter name, 🔁:

```html
<my-element>
    <template shadowrootmode=open>
        <table>
            <thead><tr><th>Rank</th><th>NOC</th><th>Gold</th><th>Silver</th><th>Bronze</th><th>Total</th></tr></thead>
            <tbody 🔁>
                <tr>
                    <td itemprop="rank"></td>
                    <td itemprop="noc"></td>
                    <td itemprop="gold"></td>
                    <td itemprop="silver"></td>
                    <td itemprop="bronze"></td>
                    <td itemprop="total"></td>
                </tr>
            </tbody>
        </table>
        <be-hive></be-hive>
    </template>
</my-element>
```

On Windows, this emoji can be located via 🪟+"repeat".


What this does is it makes many assumptions.  But don't panic if what it assumes doesn't match your use case:

1.  Finds the host that contains the three-peat adorned element.  In this case, it's my-element.
2.  Assumes the host is iterable.  That may be strange for custom elements.  See below.
3.  Assumes each item of the iterable list has properties rank, noc, gold, silver, bronze, total in this case, and populates each item accordingly.
4.  Turns the first child of the adorned element into a template if applicable.
5.  Assumes the placement of the repeating elements should be appended to the children of the adorned element.
6.  Renders the list.
7.  Listens to the host for event "..." to know when list changed

Each of these assumptions can be made explicit:

> 1. Finds the host that contains the three-peat adorned element

🔁-src can also specify a peer element to get the list from via id.

Also, finding the host first checks for a containing element with [an itemscope manager](https://github.com/bahrus/assign-gingerly#itemscope-managers-chrome-146).

<details>
    <summary>Technical details of how the host is found</summary>

    Uses assign-gingerly/inferencer/upSearch.js


</details>

<details>
    <summary>Technical details of how the repeated content is rendered</summary>
    We use [assign-gingerly's manageTemplateList handler](https://github.com/bahrus/assign-gingerly/blob/baseline/docs/manage-template-list.md) behind the scenes.
</details>

> 2.  Assumes the host is iterable....

🔁-listProp can point to the property of the element that has the list.

> 3. Assumes each item of the iterable list has properties...

🔁-each can specify how each item's values are distributed into the cloned document fragment.

> 5.  Assumes the placement of the repeating elements should be appended to the children of the adorned element.

🔁-target can specify where to place the repeating cloned fragments.

> 7.  Listens to the host for event "..." to know when list changed

If 🔁-listProp is specified, assumes there's a propagator, and if doesn't exist, creates one.  Can alternatively specify 🔁-update-on

## Defining a custom element or itemscope manager that works seamlessly with *three-peat*.  [assign-gingerly](https://github.com/bahrus/assign-gingerly#use-case-iterable-classes-with-private-lists) provides a generic class mixin that makes it easy to define custom elements or itemscope managers that work most seamlessly with three-peat.

## Programmatic attachment (no attribute)

The attribute syntax shown above shines for server-rendered HTML and progressive enhancement:  the markup alone says what list gets repeated, and where.  But most web development today renders on the client, with a framework (Lit, React, Vue, Svelte, etc.) that already has a JavaScript reference to each element it creates.  In that setting, attaching three-peat programmatically is the better fit:

1.  **A less clunky API.**  Frameworks tend to be awkward about setting arbitrary (let alone emoji) attributes -- and three-peat's configuration is spread across up to five of them (`🔁-src`, `🔁-list-prop`, `🔁-each`, `🔁-target`, `🔁-update-on`), one of which (`🔁-each`) holds JSON.  Setting plain properties -- with `each` as an actual object -- is ordinary JavaScript, which the framework, your editor, and TypeScript all understand.
2.  **Less stringifying and parsing.**  With attributes, the framework serializes each setting to a string (and `each` to JSON), which three-peat then reads back and `JSON.parse`s.  Setting the properties directly skips both steps.
3.  **Less overhead monitoring attributes.**  The attribute approach relies on [be-hive](https://github.com/bahrus/be-hive) / [mount-observer](https://github.com/bahrus/mount-observer) watching the DOM for elements that carry (or gain) the attribute, and for changes to its value.  The programmatic approach needs none of that -- `def.js` just registers the enhancement's config, and the enhancement is attached exactly when, and to exactly the elements, your code says.

Both approaches produce the same enhancement, with the same assumptions and defaults, so you can mix them in one app -- attributes for server-rendered islands, programmatic attachment inside client-rendered components.

First register the enhancement's config once:

```JS
import { defThreePeat } from 'three-peat/def.js';
const emc = await defThreePeat(document.body); // or a shadow root's host, for a scoped registry
```

Then set the properties the attributes map to.  All are optional -- with none set, the assumptions listed above apply, just as with a bare `🔁` attribute.

| Attribute       | Property   |
|-----------------|------------|
| `🔁-src`         | `src`      |
| `🔁-list-prop`   | `listProp` |
| `🔁-each`        | `each` (an object, not JSON) |
| `🔁-target`      | `target`   |
| `🔁-update-on`   | `updateOn` |

### Declarative -- via `enh.set`

```JS
// equivalent to <tbody 🔁-src=rankings 🔁-list-prop=list>
// only the first property needs .set -- it triggers the attachment.
tbody.enh.set.threePeat.src = 'rankings';
tbody.enh.threePeat.listProp = 'list';
```

This can be done before or after `defThreePeat` has been called.

### Imperative -- via `enh.get()`

```JS
// equivalent to <tbody 🔁-src=rankings 🔁-list-prop=list 🔁-target=destination>
Object.assign(tbody.enh.get(emc), {
    src: 'rankings',
    listProp: 'list',
    target: 'destination',
});
```

Reassigning any of these properties later (e.g. when a framework re-renders with new props) re-renders from the original template, and replaces the change listener from the previous settings rather than adding another.

### Passing elements directly

`src` (the list host) and `target` (where the clones go) can also be given by reference -- the element itself, or a `WeakRef` to it -- instead of an id.  Handy when they have no ids, or when a framework already holds references to them.

```JS
Object.assign(tbody.enh.get(emc), {
    src: worldRanking,                       // an element...
    listProp: 'list',
    target: new WeakRef(destinationTbody),   // ...or a WeakRef to one
});
```

Either way, the enhancement only ever holds them **weakly** -- an element is swapped for a `WeakRef` as soon as the enhancement sees it, including in the stored property value (your own object isn't modified).  So it never keeps a removed element alive; if one is garbage collected, it's simply skipped.  (Your own code may of course still hold it strongly -- that's up to you.)  (Reading `src` / `target` back yields the element.)

See [demo/Programmatic](demo/Programmatic/) for runnable examples.

## Viewing Demos Locally

Any web server that can serve static files with server-side includes will do, but...


1. Install git
2. Fork/clone this repo
3. Install node.js
4. Open command window to folder where you cloned this repo
5. > git submodule add https://github.com/bahrus/types.git types
6. > git submodule update --init --recursive
7. > npm install
8. > npm run serve
9. Open http://localhost:8000/ in a modern browser

## Running Tests

```
> npm run test
```


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


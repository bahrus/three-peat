# three-peat (🔁)

Manage an HTML template list.

The name "three-peat" refers to the fact that in order to define loop, you need:

1.  A DOM fragment to repeat
2.  A place in the DOM tree to repeat it.
3.  The source of the list

Typical usage

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

What this does is it makes many assumptions.  But don't panic if what it assumes doesn't match your use case:

1.  Finds the host that contains the three-peat adorned element.  In this case, it's my-element.
2.  Assumes the host is iterable.  That may be strange for custom elements.  See below.
3.  Assumes each item of the iterable list has properties rank, noc, gold, silver, bronze, total in this case, and populates each item accordingly.
4.  Turns the first child of the aroned element into a template if applicable.
5.  Assumes the placement of the repeating elements should be appended to the children of the adorned element.
6.  Renders the list.
7.  Listens to the host for event "..." to know when list changed

Each of these assumptions can be made explicit:

> 2.  Assumes the host is iterable....

🔁-listProp can point to the property of the list

> 3. Assumes each item of the iterable list has properties...

🔁-each can specify how each item's values are distributed into the cloned document fragment.

> 5.  Assumes the placement of the repeating elements should could right after the adorned element

🔁-target can specify where to place the repeating cloned fragments.

> 7.  Listens to the host for event "." to know when list changed

If 🔁-listProp is specified, assumes there's a propagator, and if doesn't exist, creates one.  Can alternatively specify 🔁-update-on

## Viewing Demos Locally

Any web server that can serve static files will do, but...


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


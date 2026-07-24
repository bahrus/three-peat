# three-peat

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
            <tbody>
                <tr three-peat>
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

1.  Finds the host that contains the three-peat adorned element..  In this case, it's my-element.
2.  Assumes the host is iterable.  That may be strange for custom elements.  See below.
3.  Assumes each item of the iterable list has properties rank, noc, gold, silver, bronze, total.
4.  Turns the adorned tr element into a template.
5.  Assumes the placement of the repeating elements should could right after the tr
6.  Renders the list.
7.  Listens to the host for event "tbd"


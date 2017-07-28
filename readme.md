# Promotions Manager

A simple "promotions" manager that assists with dynamically displaying content to the user. Especially useful if you want to limit the frequency with which the promotion is shown. The manager does not assume anything about the "showing" and "hiding" functionality, it serves only as a means of verifying that a promotion should be shown based on its frequency parameters.

## Example

Create a new promotion:

```
var example = promotion.create({
  name: 'My Fancy Promotion',

  // will be shown once every five days
  frequency: {
    occurences: 1,
    period: 'days',
    count: 5
  },

  onShow: function() {
    console.log( 'showing ' + this.name + '!' );
  },
  onHide: function() {
    console.log( 'hiding ' + this.name + '!' );
  }
});
```

When appropriate, fire the promotion's show command. The promotion manager automatically checks to see if the promotion should be shown based on the frequency parameters and, if so, fires the `onShow()` property:

```
example.show();
```

Once you're done with the promotion, hide it, if you want:

```
example.hide();
```

Since the promotion will only show once (`frequency.occurences`) every 5 (`frequency.count`) days (`frequency.period`), firing the show property again will do nothing:

```
example.show(); // zip, zilch, nada
```
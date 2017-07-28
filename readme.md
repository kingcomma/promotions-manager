# Promotions Manager

A simple "promotions" manager that assists with dynamically displaying content to the user. Especially useful if you want to limit the frequency with which the promotion is shown. Promotions Manager makes the following assumptions:

  * You have some piece of content you want to display to a user at a certain frequency (eg, once per day, once per hour, 5 times per week, or even *always*)
  * You have some process for "showing" that content
  * You have some process for "hiding" that content

That's it, no more assumptions. *How* you actually show and hide the content is entirely up to you.

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
// if frequency conditions are passed, this fires the custom onShow() function
example.show();
```

Once you're done with the promotion, hide it, if you want:

```
// fires custom onHide() function
example.hide();
```

Since the promotion will only show once (`frequency.occurences`) every 5 (`frequency.count`) days (`frequency.period`), firing the show property again will do nothing:

```
example.show(); // zip, zilch, nada
```
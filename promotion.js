(function() {
  var manager,
      collection,
      proto,
      helpers;


  //  We'll use this to store references to each promotion that is created
  collection = [];


  //  Helper functions
  helpers = {
    localStorage: null,

    clone: function ( object ) {
      var new_object = {},
          key;

      for ( key in object ) {
        new_object[key] = object[key];
      }

      return new_object;
    },

    testLocalStorage: function() {

      var ether = 'nothingness';

      //  Remember our previous findings
      if ( this.localStorage !== null ) return this.localStorage;

      try {
        localStorage.setItem( ether, ether );
        localStorage.removeItem( ether );
        this.localStorage = true;
        return true;
      }
      catch( e ) {
        this.localStorage = false;
        return false;
      }

    },

    slugify: function ( text ) {
      //  Thanks: https://gist.github.com/mathewbyrne/1280286
      return text.toString().toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^\w\-]+/g, '')
        .replace(/\-\-+/g, '-')
        .replace(/^-+/, '')
        .replace(/-+$/, '');
    },
    
    checkCustomConditions: function ( promotion ) {
      return ( typeof promotion.condition === 'function' && promotion.condition.call( promotion ) )
        || promotion.condition;
    },

    checkCustomFrequency: function ( promotion ) {

      var history = promotion.recall( promotion.name ),
          multipliers = {
            'hours':  60 * 60 * 1000,
            'days':   24 * 60 * 60 * 1000,
            'weeks':  7 * 24 * 60 * 60 * 1000,
            'years':  365 * 24 * 60 * 60 * 1000
          },
          threshold,
          now;

      if ( !promotion.frequency || !history || (history && history.occurences === -1) ) return true;

      //  History might not "exist" if this is the first time a promotion is being shown.
      if ( history ) {
        now = Date.now();
        threshold = history.initialized + (promotion.frequency.count * multipliers[ promotion.frequency.period ]);

        if ( now < threshold && history.occurences >= promotion.frequency.occurences ) {
          return false;
        }
      }
      
      return true;

    },

    getStorage: function ( name ) {

      var stowed = null;

      if ( this.testLocalStorage() ) {
        stowed = window.localStorage.getItem( name );
      }
      else {
        // More difficult...
        document.cookie.split( /\s*;\s*/ ).find(function( item ) {
          var keyVal = item.split( /\s*=\s*/ );
          return keyVal[0] === name && (stowed = keyVal[1]);
        });
      }

      return stowed ? JSON.parse( decodeURIComponent( stowed ) ) : null;
    },

    setStorage: function ( name, info ) {

      var toStow = encodeURIComponent( JSON.stringify( info ) );

      if ( this.testLocalStorage() ) {
        window.localStorage.setItem( name, toStow );
      }
      else {
        document.cookie = name + "=" + toStow + "; expires=Tue, 19 Jan 2038 03:14:07 GMT; path=/";
      }

      return toStow;

    },

    removeStorage: function ( name ) {

      if ( this.testLocalStorage() ) {
        window.localStorage.removeItem( name );
      }
      else {
        document.cookie = name + "=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/";
      }

    },

    validateCustomFrequency: function ( frequency ) {

      var valid = true,
          periods = [ 'hours', 'days', 'weeks', 'years' ];

      if ( !frequency.hasOwnProperty( 'occurences' ) || !frequency.hasOwnProperty( 'count' ) ) {
        return false;
      }

      //  Help a brother out
      frequency.occurences = +frequency.occurences || 1;
      frequency.count = +frequency.count || 1;

      return (periods.indexOf( frequency.period ) > 0) && (!isNaN( frequency.occurences )) && (!isNaN( frequency.count ));

    }

  };


  //  Our traffic cop.
  manager = {

    create: function( specs ) {

      var Promotion = function() {},
          model = helpers.clone( proto ),
          newbie;

      if ( !specs.name ) {
        throw 'A name must be specified for a new promotion to be created.';
      }
      if ( !helpers.validateCustomFrequency( specs.frequency ) ) {
        throw 'Invalid frequency specs.';
      }

      Promotion.prototype = model;
      newbie = new Promotion();

      //  Unfold our specs into the promotion prototype
      for ( var spec in specs ) {
        newbie[spec] = specs[spec]
      }

      return collection[ collection.push( newbie ) - 1 ];

    },

    get_all:  function() {
      return collection.slice(); // return copy of collection, not collection itself
    }

  };


  //  The meat of the library, our prototype of a promotion
  proto = {

    name: '',
    condition: true,

    //  Show promotion by first checking if gatekeeper allows us
    //  to pass and then firing the option onShow function passed
    //  to the promotion creator.
    show: function ( force ) {
      var force = force || false,
          history = helpers.getStorage( this.name);

      if ( force || this.gatekeeper() ) {
        if ( this.onShow && typeof this.onShow === 'function' ) this.onShow.call( this );

        if ( history ) {
          history.occurences += 1;
          this.record( history );
        }
        else {
          this.record({
            occurences: 1,
            initialized: Date.now()
          });
        }
      }

      return this;
    },

    //  Hide promotion by first checking if status is "visible" and
    //  then running the onHide function if it exists.
    hide: function () {
      if ( this.onHide && typeof this.onHide === 'function' ) this.onHide.call( this );
      return this;
    },

    //  Helper function for checking all the various conditions
    //  that must be true for a promotion to be shown.
    gatekeeper: function () {
      console.log( 'custom conditions: ', helpers.checkCustomConditions( this ) );
      console.log( 'custom frequency: ', helpers.checkCustomFrequency( this ) );
      return helpers.checkCustomConditions( this ) && helpers.checkCustomFrequency( this );
    },

    //  Helper function for setting necessary cookie / storage to
    //  suppress the promotion for this user "forever"
    never_again: function () {
      return helpers.setStorage( this.storageName(), { 'occurences': -1, 'initialized': 0 } );
    },

    //  Helper function for "forgetting" any knowledge of whether or
    //  not the user has seen this promotion.
    reset: function () {
      return helpers.removeStorage( this.storageName() );
    },

    recall: function () {
      return helpers.getStorage( this.storageName() );
    },

    record: function ( info ) {
      return helpers.setStorage( this.storageName(), info )
    },

    storageName: function() {
      return 'promo_' + helpers.slugify( this.name );
    }
  };

  window.promotion = manager;

})();
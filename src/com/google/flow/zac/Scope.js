/**
 * @license
 * Copyright 2024 The FLOW Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'com.google.flow.zac',
  name: 'Scope',

  documentation: '',

  exports: [ 'scope' ],

  properties: [
    {
      name: 'scope',
      factory: function() {
        var self = this;
        var scope = {
          this: self,
          repeat: function(n, fn) {
            for ( var i = 1 ; i <= n ; i++ ) fn.call(this, i);
            return this;
          },
          clear: function() {
            self.updateMemento().then(function() {
              // TODO: replace 4 with something more meaningful
              self.properties.skip(4).removeAll();
            });
          },
          copy: function(obj, opt_n) {
            var n = opt_n || 1;
            for ( var i = 1 ; i <= n ; i++ ) {
              var m = {};
              com.google.flow.Property.VALUE.cloneProperty(obj, m);
              m.value.x += 30*i;
              m.value.y += 30*i;
              this.add(m.value);
            }
            return 'copied';
          },
          add: function(obj, opt_name, opt_parent) {
            this.addProperty(obj, opt_name, undefined, opt_parent || 'canvas1');
          }.bind(this),
          rename: this.renameProperty.bind(this),
          hsl: function(h, s, l) {
            return 'hsl(' + (h%360) + ',' + s + '%,' + l + '%)';
          },
          fib: (function() {
            var fib_ = foam.Function.memoize1(function(n) {
              if ( n < 1 ) return 0;
              if ( n < 3 ) return 1;
              return fib_(n-1) + fib_(n-2);
            });

            return function(i) {
              if ( i < 0 ) return 0;
              var floor = Math.floor(i);
              var frac  = i-floor;
              return fib_(floor) + frac * ( floor < 1 ? 1 : fib_(floor-1));
            };
          })(),
          hsla: function(h, s, l, a) {
            return 'hsla(' + (h%360) + ',' + s + '%,' + l + '%,' + a + ')';
          },
          sin: Math.sin,
          cos: Math.cos,
          PI: Math.PI,
          degToRad: function(d) { return d * Math.PI / 180; },
          radToDeg: function(r) { return r * 180 / Math.PI; },
          load: this.loadFlow.bind(this),
          save: this.saveFlow.bind(this)
        };
        scope.scope = scope;
        return scope;
      },
      documentation: 'Scope to run reactive formulas in.'
    }
  ]
});

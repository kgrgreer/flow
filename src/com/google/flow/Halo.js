/**
 * @license
 * Copyright 2016 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'com.google.flow',
  name: 'HaloBorder',
  extends: 'foam.graphics.Box',

  properties: [
    [ 'border', 'blue' ],
    {
      name: 'lineDash',
      factory: function() { return [ 10, 10 ]; }
    }
  ],

  methods: [
    function hitTest(p) { return false; }
  ]
});


foam.CLASS({
  package: 'com.google.flow',
  name: 'Halo',
  extends: 'foam.graphics.Box',

  requires: [ 'com.google.flow.HaloBorder' ],

  imports: [ 'showHalos' ],

  exports: [
    'view',
    'anchorRadius'
  ],

  classes: [
    {
      name: 'Anchor',
      extends: 'foam.graphics.Box',

      imports: [ 'anchorRadius', 'view' ],

      properties: [
        [ 'alpha', 0.3 ],
        [ 'color', 'blue' ],
        [ 'border', null ],
        'viewStart',
        'mouseStartX', 'mouseStartY',
        {
          class: 'Function',
          name: 'callback',
          value: function(view, viewStart, dx, dy) {
            console.log(viewStart, dx, dy);
          }
        }
      ],

      methods: [
        function init() {
          this.SUPER();
          this.height = this.width = this.anchorRadius*2 + 1;
        }
      ],

      listeners: [
        function onMouseDown(evt) {
          // console.log('AnchorMouseDown: ', evt);
          if ( ! this.view ) return;
          this.viewStart = {
            x: this.view.x,
            y: this.view.y,
            radius: this.view.radius,
            width: this.view.width,
            height: this.view.height,
            endX: this.view.endX,
            endY: this.view.endY,
            rotation: this.view.rotation
          };
          this.mouseStartX = evt.offsetX;
          this.mouseStartY = evt.offsetY;
        },

        function onMouseMove(evt) {
          if ( ! this.view ) return;
          this.callback(
            this.view,
            this.viewStart,
            evt.offsetX - this.mouseStartX,
            evt.offsetY - this.mouseStartY,
            evt.offsetX,
            evt.offsetY,
            this.mouseStartX,
            this.mouseStartY);
        }
      ]
    }
  ],

  properties: [
    [ 'anchorRadius', 8 ],
    [ 'alpha', 0 ],
    [ 'border', null ],
    'selectedSub',
    {
      name: 'haloBorder',
      factory: function() { return this.HaloBorder.create(); }
    },
    { name: 'x1', expression: function() { return -0.5; } },
    { name: 'x2', expression: function(width) { return this.width/2-this.anchorRadius-0.5; } },
    { name: 'x3', expression: function(width) { return this.width-this.anchorRadius*2-0.5; } },
    { name: 'y1', expression: function() { return -0.5; } },
    { name: 'y2', expression: function(height) { return this.height/2-this.anchorRadius-0.5; } },
    { name: 'y3', expression: function(height) { return this.height-this.anchorRadius*2-0.5; } },
    {
      name: 'selected',
      postSet: function(_, n) {
        this.view = n && n.value;

        if ( this.selectedSub ) {
          this.selectedSub.detach();
          this.selectedSub = null;
        }

        this.parent && this.parent.remove(this);

        if (
            n && n.value &&
            this.viewPredicate(n.value) &&
            // Avoid selecting top-level 'canvas' objects
            n.value.parent &&
            // Avoid selecting zero-size objects like Cursor
           ( n.value.radius || n.value.width || n.value.height )
        ) {
          var v = n.value;
          v.add(this);

          // Make the halo be the first child so that it will
          // get mouse touch and move events. Replace with
          // z-index when supported.
          v.children.pop(); v.children.unshift(this);

          this.alpha = 1;
          this.selectedSub = v.sub('propertyChange', this.onSelectedPropertyChange);
          this.onSelectedPropertyChange();
        } else {
          this.alpha = 0;
        }
      }
    },
    // TODO: maybe FLOW should bind 'view' instead of 'selected'
    {
      name: 'view'
    },
    'startX', 'startY', 'mouseStartX', 'mouseStartY'
  ],

  methods: [
    function init() {
      this.SUPER();

      this.addAnchors();
    },

    function viewPredicate(v) {
      return foam.graphics.CView.isInstance(v) && ! foam.graphics.Circle.isInstance(v);
    },

    function addAnchors() {
      var halo = this;

      this.add(
        this.haloBorder,
        this.Anchor.create({x$: this.x2$, y: -26, callback: function(v, vs, _, __, x, y, sx, sy) {
          v.originX    = v.width/2;
          v.originY    = v.height/2;
          halo.originX = halo.width/2;
          halo.originY = halo.height/2;

          function toA(x, y) {
            var dx = x-vs.x-halo.originX
            var dy = y-v.y-halo.originY;
            return Math.atan2(dy, dx);
          }

          var startA = toA(sx, sy);
          var a = toA(x, y);

          v.rotation = vs.rotation + startA - a;
        }}),
        this.Anchor.create({x$: this.x1$, y$: this.y1$, callback: function(v, vs, dx, dy) {
          v.x      = vs.x + dx;
          v.y      = vs.y + dy;
          v.width  = vs.width  - dx;
          v.height = vs.height - dy;
        }}),
        this.Anchor.create({x$: this.x2$, y$: this.y1$, callback: function(v, vs, dx, dy) {
          v.y      = vs.y + dy;
          v.height = vs.height - dy;
        }}),
        this.Anchor.create({x$: this.x3$, y$: this.y1$, callback: function(v, vs, dx, dy) {
          v.y      = vs.y + dy;
          v.width  = vs.width  + dx;
          v.height = vs.height - dy;
        }}),
        this.Anchor.create({x$: this.x1$, y$: this.y2$, callback: function(v, vs, dx, dy) {
          v.x      = vs.x + dx;
          v.width  = vs.width  - dx;
        }}),
        this.Anchor.create({x$: this.x3$, y$: this.y2$, callback: function(v, vs, dx, dy) {
          v.width  = vs.width + dx;
        }}),
        this.Anchor.create({x$: this.x1$, y$: this.y3$, callback: function(v, vs, dx, dy) {
          v.x      = vs.x + dx;
          v.width  = vs.width  - dx;
          v.height = vs.height + dy;
        }}),
        this.Anchor.create({x$: this.x2$, y$: this.y3$, callback: function(v, vs, dx, dy) {
          v.height = vs.height + dy;
        }}),
        this.Anchor.create({x$: this.x3$, y$: this.y3$, callback: function(v, vs, dx, dy) {
          v.width  = vs.width  + dx;
          v.height = vs.height + dy;
        }}));
    },

    function paintChildren(x) {
      if ( ! this.showHalos ) return;
      var alpha = x.globalAlpha;
      x.globalAlpha = 1.0
      this.SUPER(x);
      x.globalAlpha = alpha;
    },

    function resizeOnViewChange(v) {
      var r = this.anchorRadius;

      this.x = this.y = -2*r-4;
      this.width      = v.scaleX * v.width  + 2 * ( r * 2 + 4 );
      this.height     = v.scaleY * v.height + 2 * ( r * 2 + 4 );
      this.originX    = v.originX+2*r+4
      this.originY    = v.originY+2*r+4;
    }
  ],

  listeners: [
    {
      name: 'onSelectedPropertyChange',
      code: function() {
        var v = this.view;
        if ( ! v ) return;

        var r = this.anchorRadius;

        this.resizeOnViewChange(v);

        this.haloBorder.x      = r;
        this.haloBorder.y      = r;
        this.haloBorder.width  = this.width  - 2 * r;
        this.haloBorder.height = this.height - 2 * r;

//        this.rotation = v.rotation;
      }
    },

    function onMouseDown(evt) {
      if ( ! this.view ) return;
      this.startX       = this.view.x;
      this.startY       = this.view.y;
      this.mouseStartX  = evt.offsetX;
      this.mouseStartY  = evt.offsetY;
    },

    function onMouseMove(evt) {
      if ( ! this.view ) return;
      this.view.x = this.startX + evt.offsetX - this.mouseStartX;
      this.view.y = this.startY + evt.offsetY - this.mouseStartY;
    }
  ]
});


foam.CLASS({
  package: 'com.google.flow',
  name: 'CircleHalo',
  extends: 'com.google.flow.Halo',

  methods: [
    function addAnchors() {
      var halo = this;

      function calcR(x, y) { return Math.sqrt(x*x + y*y)/Math.sqrt(2); }

      this.add(
        this.haloBorder,
        this.Anchor.create({x$: this.x2$, y: -26, callback: function(v, vs, _, __, x, y, sx, sy) {
          v.originX    = 0;
          v.originY    = 0;
          halo.originX = 0;
          halo.originY = 0;

          function toA(x, y) {
            var dx = x-vs.x; // -halo.originX
            var dy = y-v.y; //-halo.originY;
            return Math.atan2(dy, dx);
          }

          var startA = toA(sx, sy);
          var a = toA(x, y);

          v.rotation = vs.rotation + startA - a;
        }}),

        this.Anchor.create({x$: this.x1$, y$: this.y1$, callback: function(v, vs, dx, dy) {
          v.radius = calcR(dx-vs.radius, dy-vs.radius);
        }}),
        this.Anchor.create({x$: this.x3$, y$: this.y1$, callback: function(v, vs, dx, dy) {
          v.radius = calcR(dx+vs.radius, dy-vs.radius);
        }}),
        this.Anchor.create({x$: this.x1$, y$: this.y3$, callback: function(v, vs, dx, dy) {
          v.radius = calcR(dx-vs.radius, dy+vs.radius);
        }}),
        this.Anchor.create({x$: this.x3$, y$: this.y3$, callback: function(v, vs, dx, dy) {
          v.radius = calcR(dx+vs.radius, dy+vs.radius);
        }}),

        /*
        this.Anchor.create({x$: this.x2$, y$: this.y1$, callback: function(v, vs, dx, dy) {
          v.y = vs.y + dy;
        }}),
        this.Anchor.create({x$: this.x1$, y$: this.y2$, callback: function(v, vs, dx, dy) {
          v.x  = vs.x + dx;
        }}),
        this.Anchor.create({x$: this.x3$, y$: this.y2$, callback: function(v, vs, dx, dy) {
          v.x  = vs.x + dx;
        }}),
        this.Anchor.create({x$: this.x2$, y$: this.y3$, callback: function(v, vs, dx, dy) {
          v.y = vs.y + dy;
        }})
        */
      );

    },

    function resizeOnViewChange(v) {
      var r = this.anchorRadius;

      this.height  = this.width = (v.radius + v.arcWidth + 3 + r*2) * 2;
      this.x       = - v.radius - v.arcWidth - r*2 - 3;
      this.y       = - v.radius - v.arcWidth - r*2 - 3;
      this.originX = v.x-this.x;
      this.originY = v.y-this.y;
    },

    function viewPredicate(v) {
      return foam.graphics.Circle.isInstance(v);
    }
  ]
});

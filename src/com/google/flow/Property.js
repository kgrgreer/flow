/**
 * @license
 * Copyright 2016 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'com.google.flow',
  name: 'Property',

  ids: [ 'name' ],

  properties: [
    {
      class: 'String',
      name: 'name'
    },
    {
      name: 'value',
      /*
      fromJSON: function(json, x) {
        return foam.json.parse(json, null, x);
      },
      */
      cloneProperty: function(o, m) {
        if ( ! o || ! o.cls_ ) return;
        // TODO: This is very error prone if you forget to add new properties here.
        // Why is this done?
        m[this.name] = o.cls_.create({
          alpha:       o.alpha,
          arcWidth:    o.arcWidth,
          border:      o.border,
          code:        o.code,
          color:       o.color,
          compressionStrength: o.compressionStrength,
          delegate:    o.delegate,
          end:         o.end,
          friction:    o.friction,
          gravity:     o.gravity,
          head:        o.head,
          height:      o.height,
          length:      o.length,
          lineDash:    o.lineDash,
          mass:        o.mass,
          maxCount:    o.maxCount,
          maxDepth:    o.maxDepth,
          name:        o.name,
          radius:      o.radius,
          radiusX:     o.radiusX,
          radiusY:     o.radiusY,
          scaleX:      o.scaleX,
          scaleY:      o.scaleY,
          springWidth: o.springWidth,
          start:       o.start,
          stretchStrength: o.stretchStrength,
          tail:        o.tail,
          text:        o.text,
          visible:     o.visible,
          width:       o.width,
          x:           o.x,
          y:           o.y
        }, o.__context__);
        m[this.name].instance_.reactions_ = o.reactions_;
      }
    },
    {
      class: 'String',
      name: 'json_',
      hidden: true
    }
  ],

  actions: [
    {
      name: 'deleteRow',
      label: 'X',
      code: function deleteRow(X) {
        X.properties.remove(this);
        X.updateMemento();
      }
    }
  ]
});


foam.RELATIONSHIP({
  forwardName: 'children',
  inverseName: 'parent',
  cadinality: '1:*',
  sourceModel: 'com.google.flow.Property',
  targetModel: 'com.google.flow.Property',
  targetDAOKey: 'properties',
  sourceProperty: { hidden: true, shortName: 'c' },
  targetProperty: { hidden: true, shortName: 'p' }
});

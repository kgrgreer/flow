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
      cloneProperty: function(o, m) {
        if ( ! o || ! o.cls_ ) return;
        m[this.name] = o.cls_.create({
          arcWidth:    o.arcWidth,
          border:      o.border,
          code:        o.code,
          color:       o.color,
          compressionStrength: o.compressionStrength,
          end:         o.end,
          friction:    o.friction,
          gravity:     o.gravity,
          head:        o.head,
          height:      o.height,
          length:      o.length,
          mass:        o.mass,
          name:        o.name,
          radius:      o.radius,
          radiusX:     o.radiusX,
          radiusY:     o.radiusY,
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
      },
      xxxpostSet: function(o, n) {
        if ( this.feedback_ ) return;
        this.feedback_ = true;
        try {
          this.instance_.json_ = foam.json.Short.stringify(n);
          console.log('***********', this.instance_.json_);
        } catch(x) {
        } finally {
          this.feedback = false;
        }
      }
    },
    {
      class: 'String',
      name: 'json_',
      hidden: true,
      xxxpostSet: function(o, n) {
        if ( this.feedback_ ) return;
        this.feedback_ = true;
        try {
          this.instance_.value = foam.json.parseString(n, this.__context__);
          // console.log(foam.json.parse(n, null, this.__context__));
        } catch(x) {
        } finally {
          this.feedback = false;
        }
      }
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

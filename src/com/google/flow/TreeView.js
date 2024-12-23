/**
 * @license
 * Copyright 2016 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'com.google.flow',
  name: 'TreeView',
  extends: 'foam.u2.view.TreeView',

  methods: [
    function onObjDrop(obj, target) {
      // console.log('***************** target: ', o, target, target.value);
      // Adjust position of object so that it stays in its current
      // location. TODO: something better with transforms as this
      // probably doesn't work with scaling and rotation.
      var o      = obj.value;
      var parent = o.parent
      while ( parent ) {
        o.x -= parent.x;
        o.y -= parent.y;
        parent = parent.parent;
      }
    }
  ]
});


// TODO: Should have a GUID 'id' instead of name, since now
// you can't have two properties with the same name but
// different parents.

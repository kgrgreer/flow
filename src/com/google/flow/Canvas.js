/**
 * @license
 * Copyright 2016 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'com.google.flow',
  name: 'Canvas',
  extends: 'foam.graphics.Box',

  properties: [
    [ 'autoRepaint', true ],
    [ 'width', 800 ],
    [ 'height', 800 ],
    [ 'color', '#f3f3f3' ]
  ]
});

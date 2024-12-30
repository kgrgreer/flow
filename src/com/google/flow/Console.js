/**
 * @license
 * Copyright 2024 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'com.google.flow',
  name: 'Console',
  extends: 'foam.u2.Element',

  css: `
    ^ {
      box-shadow: 3px 3px 6px 0 gray;
      width: 100%;
      height: 70%;
      margin-bottom: 8px;
    }
  `,

  methods: [
    function render() {
      this.SUPER();

      this.addClass().attrs({contenteditable: true});
      this.add('> ');
    }
  ]
});

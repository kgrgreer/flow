/**
 * @license
 * Copyright 2025 The FLOW Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'com.google.flow',
  name: 'DocumentReadWriteView',
  extends: 'foam.u2.ReadWriteView',

  requires: [ 'foam.flow.MarkupEditor', 'foam.flow.Document' ],

  documentation: 'Document viewer / editor.',

  css: `
    ^ .foam-flow-Document {
      margin-top: 0 !important;
    }
  `,

  methods: [
    function render() {
      this.SUPER();
      this.addClass();
    },

    function isLoaded() { return true; },

    function toReadE() {
      return this.Document.create({markup: this.data}).toE({}, this.__context__);
    },

    function toWriteE() {
      return this.MarkupEditor.create({data$: this.data$}); // Disable preview
    }
  ]
});

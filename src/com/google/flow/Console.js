/**
 * @license
 * Copyright 2024 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'com.google.flow',
  name: 'Console',
  extends: 'foam.u2.Controller',

  css: `
    ^ {
      box-shadow: 3px 3px 3px 0 gray;
      width: 100%;
      height: 70%;
//      margin-bottom: 8px;
    }
   ^output {
     font-family: monospace;
     text-align: left;
   }
  `,

  properties: [
    {
      class: 'String',
      name: 'input'
//      view: { class: 'foam.u2.tag.TextArea', rows: 2, cols: 80 }
    },
    {
      name: 'output'
    },
    {
      class: 'StringArray',
      name: 'history'
    }
  ],


  methods: [
    function render() {
      this.SUPER();

      this.addClass(this.myClass()).
      start('div', null, this.output$).addClass(this.myClass('output')).end().
      tag('br').add(this.INPUT).
      input$.sub(this.onInput);
    }
  ],

  listeners: [
    function onInput() {
      if ( ! this.input ) return;
      this.history.push(this.input);
      this.output.tag('br').start('b').add('> ').end().add(this.input);
      this.input = '';
    }
  ]
});

/**
 * @license
 * Copyright 2024 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'com.google.flow',
  name: 'Console',
  extends: 'foam.u2.Controller',

  imports: [ 'flows', 'scope' ],

  css: `
    ^ {
      box-shadow: 3px 3px 6px 0 gray;
      overflow-y: auto;
      width: 100%;
      height: 75%;
      margin-bottom: 4px;
      padding-left: 8px;
      width: 800px;
      max-height: 800px;
    }
    ^output {
      font-family: monospace;
      text-align: left;
    }
    ^input {
      padding-right: 20px;
      display: block;
      margin-bottom: 12px;
    }
    ^ .property-input {
      border: none !important;
    }
  `,

  properties: [
    {
      class: 'String',
      name: 'input',
      view: 'foam.u2.TextField', // Avoids ModeAltView focus() issue
      width: 105
//      view: { class: 'foam.u2.tag.TextArea', rows: 2, cols: 80 }
    },
    'input_',
    {
      name: 'output'
    },
    {
      class: 'StringArray',
      name: 'history_'
    },
    {
      name: 'localScope',
      factory: function() {
        return {
          history: this.history.bind(this),
          log:     this.log.bind(this),
          dir:     this.dir.bind(this),
          this:    this,
          cls:     this.cls.bind(this),
          output:  this.output
        };
      }
    }
  ],


  methods: [
    function render() {
      this.SUPER();

      this.
        addClass(this.myClass()).
        start('div', null, this.output$).addClass(this.myClass('output')).end().
        start('span').
          style({display: 'inline-flex', float: 'left'}).
          start('b').style({'margin-top': '6px', 'margin-right': '4px'}).add('> ').end().
          start(this.INPUT, null, this.input_$).focus().addClass(this.myClass('input')).end().
        end().
        on('click', () => { console.log('click'); this.input_.focus(); });

      this.input$.sub(this.onInput);
    },

    function log(...args) {
      if ( args.length == 0 ) return;
      this.output.tag('br');
      this.output.add(args.join(' '));
      this.element_.scrollTop = this.element_.scrollHeight;
    },

    function cls() {
      this.output$.removeAllChildren();
    },

    function history() {
      this.history_.forEach(h => {
        this.output.tag('br');
        this.outputLink(h, () => this.eval_(h));
      });
    },

    function outputLink(text, action) {
      this.output.start('a').style({
        color: '-webkit-link',
        cursor: 'pointer',
        'text-decoration': 'underline'
      }).on('click', action).add(text).end();
      return this;
    },

    function dir() {
      return this.flows.select({
        put: o => {
          this.output.tag('br');
          this.outputLink(o.name, () => this.scope.load(o.name));
        }
      }).then(function() { return undefined; });
    },

    async function eval_(cmd) {
      cmd = cmd.trim();
      if ( ! cmd ) return;
      if ( cmd != 'history' && cmd != 'history()' )
        this.history_.push(cmd);
      this.output.tag('br').start('b').add('> ').end().add(cmd);

      with ( this.scope ) {
        with ( this.localScope ) {
          var r = eval(cmd);
          if ( typeof r === 'function' ) {
            r = r();
          }
          if ( r instanceof Promise ) {
            r = await r;
          }
        }
      }

      this.log(r);
    }
  ],

  listeners: [
    function onInput() {
      var input = this.input;
      this.input = '';
      this.eval_(input);
    }
  ]
});

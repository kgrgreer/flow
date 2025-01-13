/**
 * @license
 * Copyright 2024 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'com.google.flow',
  name: 'AxiomInfo',

  ids: [ 'name' ],

  properties: [
    {
      class: 'String',
      name: 'type',
      label: 'Axiom Type'
    },
    {
      class: 'String',
      name: 'source',
      label: 'Source Class'
    },
    {
      class: 'String',
      name: 'name'
    },
    {
      class: 'String',
      name: 'path',
      label: 'Source Path'
    }
  ]
});


foam.CLASS({
  package: 'com.google.flow',
  name: 'Console',
  extends: 'foam.u2.Controller',

  requires: [
    'com.google.flow.DAOPrompt',
    'com.google.flow.DocumentReadWriteView',
    'foam.dao.ArrayDAO',
    'foam.demos.sevenguis.Cells',
    'foam.flow.Document',
    'foam.nanos.boot.NSpec'
  ],

  imports: [ 'flowDAO', 'nSpecDAO', 'scope' ],

  exports: [ 'modelDAO' ],

  css: `
    ^ {
      box-shadow: 3px 3px 6px 0 gray;
      overflow-y: auto;
      width: 100%;
      height: 90%;
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
      __copyFrom__: 'foam.doc.ModelBrowser.MODEL_DAO'
    },
    {
      class: 'String',
      name: 'input',
      view: 'foam.u2.TextField', // Avoids ModeAltView focus() issue
      width: 105
//      view: { class: 'foam.u2.tag.TextArea', rows: 2, cols: 80 }
    },
    'input_',
    {
      name: 'outputDiv'
    },
    {
      class: 'Boolean',
      name: 'showPrompts',
      value: true
    },
    {
      class: 'StringArray',
      name: 'history_'
    },
    {
      name: 'localScope',
      factory: function() {
        // TODO: include DAOs in scope
        // TODO: include MLang's from foam.mlang.Expressions in scope
        return {
          '#':      this.h1.bind(this),
          '##':     this.h2.bind(this),
          '###':    this.h3.bind(this),
          '**':     this.bold.bind(this),
          '*':      this.italic.bind(this),
          '>':      this.blockquote.bind(this),
          models:   this.models.bind(this),
          cells:    this.cells.bind(this),
          describe: this.describeClass.bind(this),
          doc:      this.doc.bind(this),
          history:  this.history.bind(this),
          log:      this.log.bind(this),
          flows:    this.listFlows.bind(this),
          help:     this.help.bind(this),
          dao:      this.dao.bind(this),
          this:     this,
          cls:      this.cls.bind(this),
          daos:     this.services.bind(this, foam.mlang.Expressions.create().ENDS_WITH(this.NSpec.NAME, 'DAO')),
          services: this.services.bind(this, null),
          output:   this.output
        };
      }
    }
  ],

  methods: [
    function render() {
      this.SUPER();

      var self = this;

      this.
        addClass(this.myClass()).
        start('div', null, this.outputDiv$).addClass(this.myClass('output')).end().
        start('span').
          style({display: 'inline-flex', float: 'left'}).
        start('b').style({'margin-top': '6px', 'margin-right': '4px', display: 'flex', 'white-space': 'pre'}).call(function() { self.outputLink('help', () => self.eval_('help'), this); }).add(' >').end().
          start(this.INPUT, null, this.input_$).focus().addClass(this.myClass('input')).end().
        end();
        /* on('click', this.onClick) causes issues with embedded views that need focus */

       this.input$.sub(this.onInput);
    },

    function log(...args) {
      if ( args.length == 0 ) return;
      this.outputDiv.tag('br');
      this.outputDiv.add(args.join(' '));
      this.element_.scrollTop = this.element_.scrollHeight;
    },

    function h1(h) { this.outputDiv.start('h1').add(h).end(); },
    function h2(h) { this.outputDiv.start('h2').add(h).end(); },
    function h3(h) { this.outputDiv.start('h3').add(h).end(); },
    function bold(h) { this.outputDiv.start('b').add(h).end(); },
    function italic(h) { this.outputDiv.start('i').add(h).end(); },
    function blockquote(h) { this.outputDiv.start('blockquote').add(h).end(); },

    function models() {
      this.outputDiv.tag(foam.doc.DocBrowser);
    },

    function cells() {
      this.outputDiv.tag(this.Cells);
    },

    function doc() {
      this.outputDiv.tag(this.DocumentReadWriteView.create({data: '<i>insert text here</i>'}));
    },

    function dao(daoKey) {
      this.outputDiv.tag(this.DAOPrompt.create({daoKey: daoKey}));
    },

    function describeClass(cls) {
      if ( foam.String.isInstance(cls) ) {
        cls = foam.lookup(cls);
        if ( cls == null ) {
          log('Unknown class');
          return;
        }
      }
      // TODO: add ability to specify how SimpleClassView writes links so it can hyperlink back to this command
      this.outputDiv.tag(foam.doc.SimpleClassView, {data: cls});
      return;
      /*
      this.outputDiv.br().add('CLASS:  ', cls.name, ' extends: ');
      this.outputLink(cls.__proto__.id, () => this.eval_('describe(' + cls.__proto__.id + ')'), this.outputDiv);
      var dao = foam.dao.ArrayDAO.create({of: com.google.flow.AxiomInfo});

      for ( var key in cls.axiomMap_ ) {
        var a = cls.axiomMap_[key];
        dao.put(com.google.flow.AxiomInfo.create({
          type: a.cls_ ? a.cls_.name : 'anonymous',
          source: (a.sourceCls_ && a.sourceCls_.name) || 'unknown',
          name: a.name,
          path: a.source || ''
        }));
      }
      dao.select(console);

      this.outputDiv.tag({class: 'foam.u2.table.TableView', data: dao});
      */
    },

    function cls() {
      // TODO: add optional parameter to control number of commands to clear?
      this.outputDiv.removeAllChildren();
    },

    function history() {
      this.history_.forEach(h => {
        this.outputDiv.tag('br');
        this.outputLink(h, () => this.eval_(h));
      });
    },

    // TODO: Just make be a View class
    function outputLink(text, action, self) {
      self = self || this.outputDiv;
      self.start('a').style({
        color: '-webkit-link',
        cursor: 'pointer',
        'text-decoration': 'underline'
      }).on('click', action).add(text).end();
      return this;
    },

    function listFlows() {
      return this.flowDAO.select({
        put: o => {
          this.outputDiv.tag('br');
          this.outputLink(o.name, () => this.scope.load(o.name));
        }
      }).then(function() { return undefined; });
    },

    function help() {
      var self = this;
      this.outputDiv.tag('br');
      var cmds = [
        [ 'help',     'Display help' ],
        [ '#',        'Heading 1' ],
        [ '##',       'Heading 2' ],
        [ '##',       'Heading 3' ],
        [ '**',       'Bold' ],
        [ '*',        'Italic' ],
        [ '>',        'Blockquote' ],
        [ 'models',   'Browse Models', true ],
        [ 'cells',    'Embed spreadsheet', true ],
        [ 'describe', 'Describe a Class' ],
        [ 'doc',      'Embed document', true ],
        [ 'flows',    'Display saved flows', true ],
        [ 'cls',      'Clear console output', true ],
        [ 'dao',      'Perform DAO operation' ], // ???: Combine with daos with args?
        [ 'daos',     'Display availabe DAO services', true ],
        [ 'history',  'Display past executed commands', true ],
        [ 'load',     'Load a specified flow' ],
        [ 'services', 'Display available services', true ],
        [ 'save',     'Save the current flow to a specified name' ]
      ];
      this.outputDiv.start('table').attr('width', '100%').
        forEach(cmds, function(c) {
          this.start('tr').
            start('th').attr('align', 'left').call(function() {
              if ( c[2] ) {
                self.outputLink(c[0], () => self.eval_(c[0]), this);
              } else {
                this.add(c[0]);
              }
            }).end().
            start('td').attr('align', 'left').add(c[1]);
        });
    },

    async function services(opt_query, opt_nameQuery) {
      var dao = this.nSpecDAO.where(this.EQ(this.NSpec.SERVE, this.True));
      if ( opt_query ) dao = dao.where(opt_query);
      if ( opt_nameQuery ) dao = dao.where(this.CONTAINS_IC(this.NSpec.NAME, opt_nameQuery));
      var self = this;
      var sdao;
      this.outputDiv.tag('br');
      this.outputDiv.start('table').attr('width', '100%').
        select(dao, function(n) {
          this.start('tr').
            start('th').attr('align', 'left').call(function() {
              if ( n.name.endsWith('DAO') ) {
                self.outputLink(n.name, () => self.eval_('dao("' + n.name + '")'), this);
                sdao = self.__context__[n.name];
              } else {
                this.add(n.name);
                sdao = undefined;
              }
            }).end().
            start('td').attr('align', 'left').call(function() {
              if ( ! sdao ) return;
              var of = sdao.of;
              self.outputLink(of.id, () => self.eval_('describe(' + of.id + ')'), this);
            }).end().
            start('td').attr('align', 'left').add(n.description);
        });;
    },

    // TODO: better to add newlines after

    async function eval_(cmd) {
      var self = this;
      cmd = cmd.trim();
      if ( ! cmd ) return;
      if ( cmd != 'history' && cmd != 'history()' && cmd != 'help' ) this.history_.push(cmd);
      this.outputDiv.tag('br').start().show(self.showPrompts$).start('b').add('> ').end().add(cmd);

      with ( this.scope ) {
        with ( this.localScope ) {
          var r, arg
          try {
            r = eval(cmd);
          } catch (x) {
            var i = cmd.indexOf(' ');
            if ( i != -1 ) {
              arg = cmd.substring(i+1);
              cmd = cmd.substring(0,i);
              r = this.localScope[cmd];
            }
          }
          if ( typeof r === 'function' ) {
            r = arg ? r(arg) : r();
          }
          if ( r instanceof Promise ) {
            r = await r;
          }
        }
      }

      this.log(r);
    }
  ],

  actions: [
    {
      name: 'togglePrompts',
      code: function() { this.showPrompts = ! this.showPrompts; },
      keyboardShortcuts: [ 'esc' ]
    }
  ],

  listeners: [
    function onInput() {
      var input = this.input;
      this.input = '';
      this.eval_(input);
    },
    {
      name: 'onClick',
      // TODO: introduce a merge delay so that cut&paste still works
      // but a better solution might be to wait for a keypress then set the focus
      // and copy the key
      isMerged: true,
      mergeDelay: 600,
      code: function() { this.input_.focus(); }
    }
  ]
});

/* TODO:
   modes: Doc, Prompt/Console, Calc
   Input
   describe: SimpleClassView
   help MQL
   help keyboard shortcut
   scrollbar to skip
*/

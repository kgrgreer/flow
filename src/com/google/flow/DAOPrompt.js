/**
 * @license
 * Copyright 2024 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'com.google.flow',
  name: 'DAOPrompt',
  extends: 'foam.u2.Controller',

  implements: [
    'foam.mlang.Expressions'
  ],

  requires: [
    'foam.parse.QueryParser',
    'foam.u2.DetailView'
  ],

  css: `
    ^ .foam-u2-TextInputCSS {
      width: auto;
      height: 22px;
    }
    ^ select[name="selectChoice"] {
      width: 130px;
    }
  `,

  properties: [
    {
      class: 'String',
      name: 'daoKey',
      adapt: function(o, n) {
        if ( this.__context__[n] ) return n;
        if ( this.__context__[n + 'DAO'] ) return n + 'DAO';
        if ( n.endsWith('s') ) return n.substring(0, n.length-1) + 'DAO';
        return n;
      }
    },
    {
      name: 'dao',
      factory: function() {
        return this.__context__[this.daoKey];
      }
    },
    {
      class: 'Int',
      name: 'skip',
      displayWidth: 5
    },
    {
      class: 'Int',
      name: 'limit',
      placeholder: '',
      size: 4
    },
    {
      class: 'String',
      name: 'where',
      // TODO: support canned queries
      displayWidth: 70
    },
    {
      class: 'String',
      name: 'order',
      displayWidth: 70
    },
    {
      // TODO: add support for Detail, Table, Citation, CSV, XML, JSON, Group By, Grid By, Count, Projection, ...
      name: 'select'
    },
    {
      name: 'orderChoice',
      view: function(_, X) {
        var choices = [ '--' ];
        X.data.dao.of.getAxiomsByClass(foam.core.Property).forEach(p => {
          if ( p.hidden ) return;
          choices.push(p.name);
          choices.push('-' + p.name);
        });
        return { class: 'foam.u2.view.ChoiceView', choices: choices };
      },
      postSet: function(o, n) {
        if ( n == '--' ) return;
        if ( this.order ) this.order += ',';
        this.order += n;
      }
    },
    {
      name: 'whereChoice',
      view: function(_, X) {
        var choices = [
          'MQL',
          'MLang',
          'FScript'
        ];
        X.data.dao.of.getAxiomsByClass(foam.comics.v2.CannedQuery).forEach(q => {
          choices.push([ q.predicate, q.label ]);
        });
        return { class: 'foam.u2.view.ChoiceView', choices: choices };
      }
    },
    {
      name: 'selectChoice',
      view: { class: 'foam.u2.view.ChoiceView', choices: [
        'CONTROLLER',
        'VIEW',
        'EDIT',
        'CITATION',
        'TABLE', // foam.u2.mlang.Table.create();
        'CSV',
        'JSON',
        'XML',
        'COUNT',
        'GROUP_BY',
        'GRID_BY',
        'PIE',
        'SEQUENCE',
        'TEMPLATE',
        'FUNCTION',
        'JS',
        'TREE'
        // A..Z Grid
        // PROJECTION ? Same as Sequence?
        // Array (store in variable?
      ] }
    },
    'content',
    'count'
  ],

  // TODO: add describe/help support?

  methods: [
    function render() {
      this.SUPER();

      this.addClass();

      this.
      add(this.daoKey$, '.').
      start('blockquote').style({'margin-top': '0'}).
        add('skip(',    this.SKIP,  ').').br().
        add('limit(',   this.LIMIT, ').').br().
        add('where(').start(this.WHERE_CHOICE).style({'display': 'inline-flex'}).end().add(' ', this.WHERE, ').').br().
        add('orderBy(', this.ORDER, ' ').start(this.ORDER_CHOICE).style({'display': 'inline-flex'}).end().add(').').br().
        add('select(').start(this.SELECT_CHOICE).style({'display': 'inline-flex'}).end().add(' ',  this.SELECT, ')').
      end().
      add(this.RUN, ' ', this.CLEAR).br().
      start().
        style({'padding-top': '10px'}).
        show(this.count$.map(c=>c !== undefined)).
        add(this.count$, ' selected').
      end().br().
      start('div', {}, this.content$).end().br();
    }
  ],

  actions: [
    {
      name: 'run',
      code: function() {
        this.clear();
        this.count = 0;
        var dao = this.dao;
        if ( this.where ) dao = dao.where(this.MQL(this.where));
        if ( this.limit ) dao = dao.limit(this.limit);
        if ( this.skip  ) dao = dao.skip(this.skip);
        if ( this.order ) {
          // TODO: Move this logic somewhere more reusable (to QueryParser maybe?)
          // QueryParser already knows how to find properties using either the name, shortName, or alias, case-insensitive
          // So just reuse it.
          var parser = this.QueryParser.create({of: dao.of});
          var c = null; // created compartor
          var s = '';   // created string

          this.order.trim().split(',').reverse().forEach(n => {
            n = n.trim();
            var desc = n.startsWith('-');
            if ( desc ) n = n.substring(1);
            var prop = parser.parseString(n, 'fieldname');
            if ( prop ) {
              if ( s ) s = ',' + s;
              s = prop.name + s;
              if ( desc ) s = '-' + s;
              if ( desc ) prop = this.DESC(prop);
              c = c ? this.THEN_BY(prop, c) : prop;
            }
          });
          this.order = s;
          if ( c ) dao = dao.orderBy(c);
        }
//        dao.select(o => { this.count++; this.add(o); });
        dao.select(o => { this.count++; setTimeout(() => this.add(o), 1); });
      }
    },
    function clear() {
      this.content.removeAllChildren();
    }
  ]
});

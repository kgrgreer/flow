/**
 * @license
 * Copyright 2024 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'com.google.flow',
  name: 'AbstractDAOAgent',

  implements: [
    'foam.mlang.Expressions'
  ],

  properties: [
    'dao',
    {
      name: 'of',
      factory: function() { return this.dao.of; }
    }
  ],

  methods: [
    function addConfigToE() {},
    function execute() { }
  ]
});


foam.CLASS({
  package: 'com.google.flow',
  name: 'CountDAOAgent',
  extends: 'com.google.flow.AbstractDAOAgent',

  methods: [
    function execute(e) {
      return this.dao.select(this.COUNT()).then(c => {
        e.start('b').add('Count: ').end().add(c.value).br();
      });
    }
  ]
});


foam.CLASS({
  package: 'com.google.flow',
  name: 'ScrollTableDAOAgent',
  extends: 'com.google.flow.AbstractDAOAgent',

  methods: [
    function execute(e) {
      e.tag({class: 'foam.u2.table.TableView', data: this.dao});
    }
  ]
});


foam.CLASS({
  package: 'com.google.flow',
  name: 'TableDAOAgent',
  extends: 'com.google.flow.AbstractDAOAgent',

  methods: [
    function execute(e) {
      return this.dao.select(foam.u2.mlang.Table.create({}, this)).then(t => {
        e.add(t);
      });
    }
  ]
});


foam.CLASS({
  package: 'com.google.flow',
  name: 'CSVDAOAgent',
  extends: 'com.google.flow.AbstractDAOAgent',

  requires: [ 'foam.dao.CSVSink' ],

  methods: [
    function execute(e) {
      var csv = this.CSVSink.create({of: this.of});
      return this.dao.select(csv).then(c => {
        e.start('pre').add(c.csv);
      });
    }
  ]
});


foam.CLASS({
  package: 'com.google.flow',
  name: 'XMLDAOAgent',
  extends: 'com.google.flow.AbstractDAOAgent',

  methods: [
    function execute(e) {
      return this.dao.select().then(a => {
        e.start('pre').add(foam.xml.Pretty.stringify(a.array));
      });
    }
  ]
});


foam.CLASS({
  package: 'com.google.flow',
  name: 'JSONDAOAgent',
  extends: 'com.google.flow.AbstractDAOAgent',

  methods: [
    function execute(e) {
      return this.dao.select().then(a => {
        e.start('pre').add(foam.json.Pretty.stringify(a.array));
      });
    }
  ]
});


foam.CLASS({
  package: 'com.google.flow',
  name: 'ViewDAOAgent',
  extends: 'com.google.flow.AbstractDAOAgent',

  methods: [
    function execute(e) {
      e = e.startContext({controllerMode: foam.u2.ControllerMode.VIEW});
      return this.dao.select(o => e.add(o));
    }
  ]
});


foam.CLASS({
  package: 'com.google.flow',
  name: 'EditDAOAgent',
  extends: 'com.google.flow.AbstractDAOAgent',

  methods: [
    function execute(e) {
      return this.dao.select(o => {
        var data = foam.comics.DAOUpdateController.create({data: o, dao: this.dao}, this);
        e.tag({class: 'foam.comics.DAOUpdateControllerView', controllerMode: foam.u2.ControllerMode.EDIT, detailView: 'foam.u2.DetailView', dao: this.dao, data: data });
      });
    }
  ]
});


foam.CLASS({
  package: 'com.google.flow',
  name: 'ControllerDAOAgent',
  extends: 'com.google.flow.AbstractDAOAgent',

  methods: [
    function execute(e) {
      return this.dao.select(o => {
        e.tag({class: 'foam.comics.v3.DAOView', data: this.dao});
      });
    }
  ]
});


foam.CLASS({
  package: 'com.google.flow',
  name: 'CitationDAOAgent',
  extends: 'com.google.flow.AbstractDAOAgent',

  requires: [ 'foam.u2.CitationView' ],

  methods: [
    function execute(e) {
      return this.dao.select(o => e.tag(this.CitationView, {data: o}));
    }
  ]
});


foam.CLASS({
  package: 'com.google.flow',
  name: 'CellsDAOAgent',
  extends: 'com.google.flow.AbstractDAOAgent',

  requires: [ 'foam.demos.sevenguis.Cells' ],

  methods: [
    function execute(e) {
      var ps  = this.of.getAxiomsByClass(foam.core.Property).
          filter(p => ! p.networkTransient && ! p.hidden);
      var cs  = {};
      var row = 1;
      for ( var i = 0 ; i < ps.length ; i++ ) {
        cs[String.fromCharCode(65+i) + 0] = '<b>' + ps[i].label + '</b';
      }
      this.dao.select(o => {
        for ( var i = 0 ; i < ps.length ; i++ ) {
          cs[String.fromCharCode(65+i) + row] = ps[i].get(o);
        }
        row++;
      }).then(() => {
        var cells = this.Cells.create({rows: row+2, columns: ps.length+2}, this);
        cells.loadCells(cs);
        e.tag(cells);
      });
    }
  ]
});


foam.CLASS({
  package: 'com.google.flow',
  name: 'AllDAOAgent',
  extends: 'com.google.flow.AbstractDAOAgent',

  requires: [ 'foam.u2.CitationView' ],

  methods: [
    function execute(e) {
      com.google.flow.DAOPrompt.AGENTS.forEach(a => {
        a = a[0];
        if ( a == 'All' ) return;

        var cls = foam.lookup(this.cls_.package + '.' + a + 'DAOAgent');
        var agent = cls.create({dao: this.dao});
        e.start('h2').add(a).end().start().call(function () { agent.execute(this); });
      });
    }
  ]
});


foam.CLASS({
  package: 'com.google.flow',
  name: 'DAOPrompt',
  extends: 'foam.u2.Controller',

  implements: [
    'foam.mlang.Expressions'
  ],

  requires: [
    'com.google.flow.Link',
    'foam.parse.QueryParser',
    'foam.u2.DetailView'
  ],

  imports: [ 'eval_' ],

  css: `
    ^ .foam-u2-TextInputCSS {
      width: auto;
      height: 22px;
    }
    ^ select[name="selectChoice"] {
      width: 130px;
    }
    ^ .property-skip { display: inline-flex; }
  `,

  constants: {
    AGENTS: [
      // Value  Label
      [ 'CSV', 'CSV' ],
      [ 'XML', 'XML' ],
      [ 'JSON', 'JSON' ],
      [ 'Citation', 'Citation' ],
      [ 'View', 'View' ],
      [ 'Edit', 'Edit' ],
      [ 'Controller', 'Controller' ],
      [ 'Table', 'Table' ],
      [ 'ScrollTable', 'ScrollTable' ],
      [ 'Cells', 'Cells' ],
      [ 'Count', 'COUNT' ],
      [ 'All', 'All' ]
    ]
        /*
        'CONTROLLER',
        'GROUP_BY',
        'GRID_BY',
        'PIE',
        'SEQUENCE',
        'TEMPLATE',
        'FUNCTION',
        'JS',
        'TREE'
        'Cost'
        // A..Z Grid
        // PROJECTION ? Same as Sequence?
        // Array (store in variable?
        */
  },

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
      displayWidth: 5,
      view: function(_, X) {
        return {
          class: 'foam.u2.view.DualView',
          viewa: { class: 'foam.u2.IntView' },
          viewb: { class: 'foam.u2.RangeView', minValue: 0, maxValue: X.data.rowCount-1, onKey: true }
        };
      }
    },
    {
      class: 'Int',
      name: 'limit',
      value: 100,
      placeholder: '',
      size: 5
    },
    {
      class: 'String',
      name: 'where',
      displayWidth: 55
    },
    {
      class: 'String',
      name: 'order',
      displayWidth: 60
    },
    {
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
      name: 'propertyChoice',
      view: function(_, X) {
        var choices = [ '--' ];
        X.data.dao.of.getAxiomsByClass(foam.core.Property).forEach(p => {
          if ( p.hidden ) return;
          choices.push(p.name);
        });
        return { class: 'foam.u2.view.ChoiceView', choices: choices };
      },
      preSet: function(o, n) {
        if ( n == '--' ) return;
        if ( this.where ) this.where += ' ';
        this.where += n;
        return o;
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
      factory: function() { return this.AGENTS[0][0]; },
      view: function(_, X) { return { class: 'foam.u2.view.ChoiceView', choices: X.data.AGENTS }; }
    },
    'content',
    'rowCount',
    { class: 'Boolean', name: 'hasRun' }
  ],

  methods: [
    async function render() {
      this.SUPER();

      this.addClass();

      this.rowCount = (await this.dao.select(this.COUNT())).value;

      this.
        start(this.Link).add(this.daoKey$, '.').on('click', this.describe).end().
        start('blockquote').style({'margin-top': '0', 'margin-left': '20px'}).
        add('skip(',    this.SKIP,  ').').br().
        add('limit(',   this.LIMIT, ').').br().
        add('where(').start(this.WHERE_CHOICE).style({'display': 'inline-flex'}).end().add(' ', this.WHERE, ' ').start(this.PROPERTY_CHOICE).style({'display': 'inline-flex'}).end().add(').').br().
        add('orderBy(', this.ORDER, ' ').start(this.ORDER_CHOICE).style({'display': 'inline-flex'}).end().add(').').br().
        add('select(').start(this.SELECT_CHOICE).style({'display': 'inline-flex'}).end().add(' ',  this.SELECT, ')').
      end().
      add(this.RUN, ' ', this.CLEAR).br().
      start().
        style({'padding-top': '10px'}).
        // show(this.rowCount$.map(c=>c !== undefined)).
        add('Count: ', this.rowCount$).
      end().br().
      start('div', {}, this.content$).end().br();
    }
  ],

  actions: [
    {
      name: 'run',
      code: async function() {
        if ( ! this.hasRun ) {
          this.hasRun = true;
          this.skip$.sub(this.onSkip);
        }
        var dao = this.dao;
        if ( this.whereChoice && typeof this.whereChoice != 'string' ) {
          dao = dao.where(this.whereChoice);
        }
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
        var cls   = foam.lookup(this.cls_.package + '.' + this.selectChoice + 'DAOAgent');
        var agent = cls.create({dao: dao});
        var out   = this.content.start();
        await agent.execute(out);
        this.previousOutput?.remove();
        this.previousOutput = out;
      }
    },
    function clear() {
      this.content.removeAllChildren();
    }
  ],

  listeners: [
    {
      name: 'onSkip',
      isFramed: true,
      code: function() { this.run(); }
    },
    function describe() {
      this.eval_('describe ' + this.dao.of.id);
    }
  ]
});

// Does DAO.orderBy() take vargs? It should.

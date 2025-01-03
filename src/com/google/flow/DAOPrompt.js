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
  `,

  properties: [
    {
      class: 'String',
      name: 'daoKey'
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
      displayWidth: 80
    },
    {
      class: 'String',
      name: 'order',
      displayWidth: 78
    },
    {
      name: 'select'
    },
    'content',
    'count'
  ],


  methods: [
    function render() {
      this.SUPER();

      this.addClass();

      this.add(this.daoKey$, '.').start('blockquote').style({'margin-top': '0'}).
        add('skip(',    this.SKIP,  ').').br().
        add('limit(',   this.LIMIT, ').').br().
        add('where(',   this.WHERE, ').').br().
        add('orderBy(', this.ORDER, ').').br().
        add('select(',  this.SELECT, ')').
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
        var dao = this.__context__[this.daoKey];
        if ( this.where ) dao = dao.where(this.MQL(this.where));
        if ( this.limit ) dao = dao.limit(this.limit);
        if ( this.skip  ) dao = dao.skip(this.skip);
        if ( this.order ) {
          // TODO: Move this logic somewhere more reusable
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
        dao.select(o => { this.count++; this.add(o); });
      }
    },
    function clear() {
      this.content.removeAllChildren();
    }
  ]
});

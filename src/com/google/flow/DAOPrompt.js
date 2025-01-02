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
    'foam.u2.DetailView'
  ],

  css: `
    ^ .foam-u2-TextInputCSS {
      width: auto;
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
      name: 'select'
    },
    'content',
    'count'
  ],


  methods: [
    function render() {
      this.SUPER();

      this.addClass();

      this.add(this.daoKey$).start('blockquote').style({'margin-top': '0'}).
        add('.skip(', this.SKIP,  ').').br().
        add('limit(', this.LIMIT, ').').br().
        add('where(', this.WHERE, ').').br().
        add('select(', this.SELECT, ')').
      end().
      add(this.RUN, ' ', this.CLEAR).br().
      start('span').show(this.count$.map(c=>c !== undefined)).add(this.count$, ' selected').end().br().
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
        if ( this.query ) dao = dao.where(this.MQL(this.query));
        if ( this.limit ) dao = dao.limit(this.limit);
        if ( this.skip  ) dao = dao.skip(this.skip);
        dao.select(o => { this.count++; this.add(o); });
      }
    },
    function clear() {
      this.content.removeAllChildren();
    }
  ]
});

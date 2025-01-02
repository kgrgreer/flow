/**
 * @license
 * Copyright 2024 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'com.google.flow',
  name: 'DAOPrompt',
  extends: 'foam.u2.Controller',

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
    'content'
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
      end().add(this.RUN).
      start('div', {}, this.content$).end();
    }
  ],

  actions: [
    {
      name: 'run',
      code: function() {
        this.content.removeAllChildren();
        this.__context__[this.daoKey].select(o => {
          this.add(o);
        });
        this.add('run' + new Date());
      }
    }
  ]
});

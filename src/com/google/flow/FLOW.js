/**
 * @license
 * Copyright 2016 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'com.google.flow',
  name: 'FLOW',

  ids: [ 'name' ],

  axioms: [
    {
      class: 'foam.comics.v2.CannedQuery',
      label: 'Public',
      predicateFactory: function(e) {
        return e.EQ(this.IS_PUBLIC, e.TRUE);
      }
    },
    {
      class: 'foam.comics.v2.CannedQuery',
      label: 'Private',
      predicateFactory: function(e) {
        return e.EQ(this.IS_PUBLIC, e.FALSE);
      }
    }
  ],

  properties: [
    {
      class: 'String',
      name: 'name'
    },
    {
      class: 'String',
      name: 'description'
    },
    {
      class: 'Boolean',
      name: 'isPublic'
    },
    {
      class: 'FObjectArray',
      of: 'com.google.flow.Property',
      name: 'memento',
      hidden: true,
      transient: true,
      postSet: function(o, n) {
        if ( this.feedback_ ) return;
        this.feedback_ = true;
        try {
          // TODO: should still not output empty reactions_: or children:
          var json = foam.json.Outputter.create({
            pretty: false,
            strict: false,
            formatDatesAsNumbers: true,
            outputDefaultValues: false,
            useShortNames: true
          });
//          this.memento_ = foam.json.Short.stringify(n);
          this.memento_ = json.stringify(n);
        } finally {
          this.feedback_ = false;
        }
      }
    },
    {
      class: 'String',
      name: 'memento_',
      postSet: function(o, n) {
        if ( this.feedback_ ) return;
        this.feedback_ = true;
        try {
        this.memento = foam.json.parseString(n, this.__context__);
        } finally {
          this.feedback_ = false;
        }
      }
    }
  ]
});

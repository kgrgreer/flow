/**
 * @license
 * Copyright 2024 The FLOW Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'com.google.flow',
  name: 'ConsoleZACClient',
  extends: 'foam.u2.Element',

  documentation: 'Install FLOW Console as a ZAC component.',

  requires: [
    'com.google.flow.Console'
  ],

  imports: [
    'auth',
    'subject',
    'ctrl'
  ],


  methods: [
    function init() {
      this.SUPER();

      try {
        if ( foam.nanos.zac.Client.isInstance(this.ctrl) ) {
          this.ctrl.add(this.Console.create({}, this));
        }
      } catch (x) {}
    },

    /*
    function render() {
      this.SUPER();

      debugger;
//      await this.auth.authorizeAnonymous();
   // No need to log in as anon, since it is done automatically
   // var user = await this.auth.login(null, 'anon', '');
   // this.subject.user = this.subject.realUser = user;
      // this.add(this.VerticalMenu.create());
      this.tag(this.Console);
    }*/
  ]
});

foam.POM({
  name: 'flow',

  version: '0.0.1',

  licenses: [
    `
    Copyright 2024 The FLOW Authors. All Rights Reserved.
    http://www.apache.org/licenses/LICENSE-2.0
    `,
    `
    Copyright 2024 The FOAM Authors. All Rights Reserved.
    http://www.apache.org/licenses/LICENSE-2.0
    `,
    `
    Copyright 2016 Google Inc. All Rights Reserved.
    http://www.apache.org/licenses/LICENSE-2.0
    `
  ],

  setFlags: {
    u3: true
  },

  webroot: [
    'favicon'
  ],

  projects: [
    { name: 'foam3/pom' },
    { name: 'src/pom' }
  ],

  files: [
    { name: 'src/com/google/misc/Colors',           flags: 'js' },
    { name: 'foam3/src/foam/audio/Beep',            flags: 'js' },
    { name: 'foam3/src/foam/audio/Speak',           flags: 'js' },
    { name: 'foam3/src/foam/input/Gamepad',         flags: 'js' },
    { name: 'foam3/src/foam/demos/clock/Clock',     flags: 'js' },
    { name: 'foam3/src/foam/demos/robot/Robot',     flags: 'js' },
    { name: 'foam3/src/foam/demos/sevenguis/Cells', flags: 'js' },
    { name: 'foam3/src/foam/core/zac/Client',      flags: 'js' },
    { name: 'foam3/src/foam/demos/olympics/Medal',  flags: 'js|java' },
    { name: 'foam3/src/foam/u2/mlang/Pie',          flags: 'js|java' },
    { name: 'foam3/src/foam/graphics/DataSource',   flags: 'js' },
    { name: 'foam3/src/foam/graphics/PieGraph',     flags: 'js' }
  ]
});

/**
 * @license
 * Copyright 2016 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'com.google.flow',
  name: 'FLOWController',
  extends: 'foam.u2.Element',

  implements: [
    'foam.mlang.Expressions',
    'foam.memento.MementoMgr'
  ],

  requires: [
    'com.google.flow.Calc',
    'com.google.flow.Canvas',
    'com.google.flow.Circle',
    'com.google.flow.DetailPropertyView',
    'com.google.flow.Ellipse',
    'com.google.flow.FLOW',
    'com.google.flow.CircleHalo',
    'com.google.flow.Halo',
    'com.google.flow.LineHalo',
    'com.google.flow.Property',
    'foam.dao.EasyDAO',
    'foam.demos.sevenguis.Cells',
    'foam.flow.Document',
    'foam.google.flow.TreeView',
    'foam.graphics.Box',
    'foam.graphics.CView',
    'foam.physics.Physical',
    'foam.physics.PhysicsEngine',
    'foam.u2.PopupView',
    'foam.u2.TableView',
    'foam.util.Timer'
    //    'com.google.dxf.ui.DXFDiagram', // TODO: move code to flow repository
  ],

  imports: [
    'flowDAO?'
  ],

  exports: [
    'addProperty',
    'as data', // Why not extend Controller instead?
    'dblclick',
    'depth_',
    'physics',
    'properties',
    'scope',
    'showHalos',
    'timer',
    'updateMemento'
  ],

  css: `
      body {
        overflow: hidden;
        -webkit-user-select: none;
        -khtml-user-select: none;
        -moz-user-select: none;
        -ms-user-select: none;
        user-select: none;
        color: #444;
        }

      ^ .foam-u2-Tabs-tabRow { display: flex; }
      ^ { display: flex; }
      ^ > * { padding-left: 16px; padding-right: 16px; }
      ^tools { width: 100px; }
      ^tools, ^properties, ^sheet { box-shadow: 3px 3px 6px 0 gray; height: 100%; padding: 1px; }
      ^sheet { width: 100%; overflow-y: auto; }
      ^tools thead, ^properties thead { display: none; } // Hide Table Column in Tools U2
      ^tools table div { display: none; } // Hide Table Column in Tools U3
      ^tools tr { height: 30px }
      .foam-u2-TableView div tr td { font-weight: bold; } // TODO: I don't think that div should be there (but is)
      .foam-u2-TableView { border-collapse: collapse; }
      .foam-u2-TableView td { padding-left: 6px; }
      .foam-u2-TableView-selected { outline: 1px solid red; }
      // ^ canvas { border: none; width: 800px; height: 700px; }
      ^ canvas { margin-left: 12px; border: 1px solid; border-color: /*$grey400*/ #B2B6BD; box-shadow: 3px 3px 6px 0 gray; }
      ^ .foam-u2-ActionView { margin: 10px; }
      ^cmd { box-shadow: 3px 3px 6px 0 gray; width: 100%; margin-bottom: 8px; }
      ^properties { margin-right: 8px; height: auto; }
      ^properties .foam-u2-view-TreeViewRow { position: relative; width: 220px; }
      ^properties .foam-u2-view-TreeViewRow-heading { min-height: 30px; }
      ^properties .foam-u2-ActionView, ^properties .foam-u2-ActionView:hover {
        background: none;
        border: none;
        box-shadow: none;
        color: gray;
        font-size: medium;
        height: 6px;
        margin: 2px 2px 0 0;
        outline: none;
        padding: 4px;
        position: absolute;
        right: 0;
        top: 12px;
      }
      ^ .foam-u2-RangeView { width: 200px; }
      .foam-u2-Tabs { padding-top: 0 !important; margin-right: -8px; }
//      input[type="range"] { width: 60px; }
      input[type="color"] { width: 60px; }
      .foam-u2-view-TreeViewRow .p-semiBold { font-weight: bold; font-size: 1rem; }
      .foam-u2-view-TreeViewRow-LabelView-select-level-selected { background: #D7E4FF; }
      .property-selectedName input { width: auto; }
      .foam-u2-ActionView-copyProperty, .foam-u2-ActionView-deleteProperty  { float: right; margin: 0 0 8px 8px !important; }
      .com-google-flow-FLOWController-sheet { height: 96% }
      .com-google-flow-FLOWController-tools tr:first-child { font-style: italic; }
`,

  properties: [
    {
      name: 'scope',
      factory: function() {
        var self = this;
        var scope = {
          this: self,
          repeat: function(n, fn) {
            for ( var i = 1 ; i <= n ; i++ ) fn.call(this, i);
            return this;
          },
          clear: function() {
            self.updateMemento().then(function() {
              // TODO: replace 4 with something more meaningful
              self.properties.skip(4).removeAll();
            });
          },
          copy: function(obj, opt_n) {
            var n = opt_n || 1;
            for ( var i = 1 ; i <= n ; i++ ) {
              var m = {};
              com.google.flow.Property.VALUE.cloneProperty(obj, m);
              m.value.x += 30*i;
              m.value.y += 30*i;
              this.add(m.value);
            }
            return 'copied';
          },
          add: function(obj, opt_name, opt_parent) {
            this.addProperty(obj, opt_name, undefined, opt_parent || 'canvas1');
          }.bind(this),
          rename: this.renameProperty.bind(this),
          hsl: function(h, s, l) {
            return 'hsl(' + (h%360) + ',' + s + '%,' + l + '%)';
          },
          fib: (function() {
            var fib_ = foam.Function.memoize1(function(n) {
              if ( n < 1 ) return 0;
              if ( n < 3 ) return 1;
              return fib_(n-1) + fib_(n-2);
            });

            return function(i) {
              if ( i < 0 ) return 0;
              var floor = Math.floor(i);
              var frac  = i-floor;
              return fib_(floor) + frac * ( floor < 1 ? 1 : fib_(floor-1));
            };
          })(),
          hsla: function(h, s, l, a) {
            return 'hsla(' + (h%360) + ',' + s + '%,' + l + '%,' + a + ')';
          },
          log: function() {
            var o = this.cmdLineFeedback_;
            if ( ! o ) self.cmdLineFeedback_ = true;
            self.cmdLine += Array.from(arguments).join(' ') + '\n';
            if ( ! o ) self.cmdLineFeedback_ = false;
          },
          sin: Math.sin,
          cos: Math.cos,
          PI: Math.PI,
          degToRad: function(d) { return d * Math.PI / 180; },
          radToDeg: function(r) { return r * 180 / Math.PI; },
          load: this.loadFlow.bind(this),
          save: this.saveFlow.bind(this),
          dir: function() {
            // TODO: Better to allow commands to return promises and have
            // the cmdLinewait for them to finish
            var log = this.log;
            var first = true;
            self.flows.select({
              put: function(o) {
                if ( first ) {
                  first = false;
                  log('\n');
                }
                log(o.name);
              }
            }).then(function() { if ( ! first ) log('\nflow> '); });
          }
        };
        scope.scope = scope;
        return scope;
      },
      documentation: 'Scope to run reactive formulas in.'
    },
    {
      name: 'physics',
      factory: function() {
        return this.PhysicsEngine.create({
          bounceOnWalls: true,
          bounds: this.canvas
        });
      }
    },
    {
      name: 'timer',
      factory: function() {
        return this.Timer.create();
      }
    },
    'feedback_',
    {
      name: 'currentTool',
      factory: function() {
        return com.google.flow.Select.model_;
      }
    },
    {
      class: 'foam.dao.DAOProperty',
      name: 'tools',
      view: {
        class: 'foam.u2.TableView',
        columns: [ foam.core.Model.NAME ]
      },
      factory: function() {
        var dao = this.EasyDAO.create({
          of: 'foam.core.Model',
          daoType: 'ARRAY'
        });
        dao.put(com.google.flow.Select.model_);
        dao.put(com.google.flow.Line.model_);
        dao.put(com.google.flow.Box.model_);
        dao.put(com.google.flow.Circle.model_);
        dao.put(com.google.flow.Ellipse.model_);
        dao.put(com.google.flow.Text.model_);
        dao.put(com.google.flow.Image.model_);
        dao.put(com.google.flow.Clock.model_);
        dao.put(com.google.flow.Mushroom.model_);
        dao.put(com.google.flow.Turtle.model_);
        dao.put(com.google.flow.Turtle3D.model_);
        dao.put(foam.demos.robot.Robot.model_);
        dao.put(com.google.flow.Desk.model_);
        dao.put(com.google.flow.DuplexDesk.model_);
        dao.put(com.google.flow.Desks.model_);
        dao.put(com.google.flow.Gate.model_);
        dao.put(foam.audio.Speak.model_);
        dao.put(foam.audio.Beep.model_);
        dao.put(com.google.flow.Spring.model_);
        dao.put(com.google.flow.Strut.model_);
        dao.put(com.google.flow.Cursor.model_);
        dao.put(com.google.flow.Script.model_);
        dao.put(com.google.flow.Proxy.model_);
        dao.put(com.google.flow.Reflector.model_);
        dao.put(com.google.flow.Revolver.model_);
        dao.put(foam.input.Gamepad.model_);
        dao.put(foam.core.Model.model_);
        // dao.put(com.google.dxf.ui.DXFDiagram.model_);
        return dao;
      }
    },
    {
      class: 'String',
      name: 'name',
      value: 'Untitled1'
    },
    {
      class: 'foam.dao.DAOProperty',
      name: 'localFLOWDAO',
      factory: function() {
        return this.EasyDAO.create({
          of: com.google.flow.FLOW,
          cache: false,
          daoType: 'IDB'
        });
      }
    },
    {
      class: 'foam.dao.DAOProperty',
      name: 'flows',
      factory: function() { return this.flowDAO || this.localFLOWDAO; }
    },
    {
      name: 'value',
      view: { class: 'com.google.flow.ReactiveDetailView', showActions: true }
//      view: { class: 'foam.u2.DetailView', showActions: true }
    },
    {
      name: 'selected',
      postSet: function(o, n) {
        this.selectedName = n ? n.name : '';
        this.value = n && n.value;
      }
    },
    {
      class: 'String',
      name: 'selectedName',
      postSet: function(o, n) {
        if ( this.selected && n !== this.selected.name ) {
          this.renameProperty(this.selected.name, n);
        }
      }
    },
    {
      name: 'properties',
      view: function(args, x) {
        return {
          class: 'com.google.flow.TreeView',
          draggable: true,
          relationship: com.google.flow.PropertyPropertyChildrenRelationship,
          startExpanded: true,
          formatter: function(data) {
            // We can't use the data.DELETE_ROW action directly for some reason
            var X = this.__subSubContext__;

            this.start('span').start('span').on('click', (e) => { data.deleteRow(X); e.stopPropagation(); } ).add(' X ').end().add(/*data.DELETE_ROW,*/ ' ', data.name).end();
          }
        };
      },
      factory: function() {
        var dao = this.EasyDAO.create({
          of: 'com.google.flow.Property',
          guid: true,
          seqProperty: this.Property.NAME,
          daoType: 'ARRAY'
        });

        var p;

        // TODO: these shouldn't be hard-coded here
        p = this.Property.create({name: 'canvas1', value: this.canvas});
        this.physics.setPrivate_('lpp_', p);
        dao.put(p);

        p = this.Property.create({name: 'sheet1', value: this.sheet});
        this.physics.setPrivate_('lpp_', p);
        dao.put(p);

        p = this.Property.create({name: 'doc1', value: this.doc});
        this.physics.setPrivate_('lpp_', p);
        dao.put(p);

        p = this.Property.create({name: 'timer', value: this.timer, parent: 'canvas1'});
        this.physics.setPrivate_('lpp_', p);
        dao.put(p);

        p = this.Property.create({name: 'physics', value: this.physics, parent: 'canvas1' });
        this.physics.setPrivate_('lpp_', p);
        dao.put(p);

        this.scope.canvas1 = this.canvas;
        var sheet = this.sheet;
        this.scope.sheet1  = function(cell) {
          return sheet.cell(cell.toUpperCase()).data;
        };
        this.scope.physics = this.physics;
        this.scope.timer   = this.timer;
        this.scope.cycle   = this.timer.cycle.bind(this.timer);
        this.scope.range   = this.timer.range.bind(this.timer);

        return dao;
      }
    },
    {
      name: 'canvas',
      factory: function() { return this.Canvas.create(); }
    },
    {
      name: 'sheet',
      factory: function() {
        this.Cells.getAxiomsByClass(foam.core.Property).forEach(function(p) { p.hidden = true; });
        this.Cells.ROWS.hidden = this.Cells.COLUMNS.hidden = false;

        return this.Cells.create({rows: 28, columns:8}).style({width:'650px'});
      }
    },
    {
      name: 'calc',
      factory: function() {
        this.Calc.getAxiomsByClass(foam.core.Property).forEach(function(p) { p.hidden = true; });

        return this.Calc.create().style({width:'650px'});
      }
    },
    {
      name: 'doc',
      factory: function() {
        return this.Document.create();
      }
    },
    'mouseTarget',
    {
      name: 'position',
      view: { class: 'foam.u2.RangeView', onKey: true }
    },
    'cmdLineFeedback_',
    {
      class: 'String',
      name: 'cmdLine',
      value: 'flow> ',
      postSet: function(_, cmd) {
        if ( this.cmdLineFeedback_ ) return;
        this.cmdLineFeedback_ = true;

        try {
          var self = this;
          var i = cmd.lastIndexOf('flow> ');
          cmd = i === -1 ? cmd : cmd.substring(i+6);

          if ( ! cmd.trim() ) return;

          with ( this.scope ) {
            log();
            log(eval(cmd));
          }
        } catch (x) {
          this.scope.log('ERROR:', x);
        } finally {
          this.cmdLineFeedback_ = false;
        }
        this.cmdLine += 'flow> ';
      },
      view: { class: 'foam.u2.tag.TextArea', rows: 8, cols: 80 }
    },
    {
      // Make Simple so that when it updates it doesn't cause a redraw
//      class: 'Simple',
      class: 'Int',
      name: 'depth_',
      hidden: true
    },
    {
      class: 'Boolean',
      name: 'showHalos',
      value: true,
      postSet: function() { this.canvas.invalidate(); }
    }
  ],

  methods: [
    function render() {
      var self = this;

      this.timer.start();

      this.properties.on.put.sub(this.onPropertyPut);
      this.properties.on.remove.sub(this.onPropertyRemove);

      // TODO: A better design for custom Halos which only creates when needed.
      var halo = this.Halo.create();
      halo.selected$.linkFrom(this.selected$);

      var circleHalo = this.CircleHalo.create();
      circleHalo.selected$.linkFrom(this.selected$);

      var lineHalo = this.LineHalo.create();
      lineHalo.selected$.linkFrom(this.selected$);

      this.memento$.sub(this.onMemento);

      this.
          addClass(this.myClass()).
          start('center').
            start(this.CMD_LINE).
              addClass(this.myClass('cmd')).
              // TODO: this should be a feature of TextArea
              on('keydown', function(evt) {
                if ( evt.keyCode === 13 ) {
                  self.cmdLine = evt.srcElement.value;
                  evt.preventDefault();
                  evt.srcElement.focus();
                  evt.srcElement.scrollTop = evt.srcElement.scrollHeight;
                  return false;
                }
              }).
            end().
//            tag('br').
            start(foam.u2.Tabs).
            /*
              start(foam.u2.Tab, {label: 'FLOWs'}).
                style({display: 'flex'}).
                add('ADD CONTENT').
              end().
            */
              start(foam.u2.Tab, {label: 'canvas1'}).
                style({display: 'flex'}).
                start('div').
                  addClass(this.myClass('tools')).
                  start(this.TOOLS, {selection$: this.currentTool$}).end().
                end().
                start(this.canvas).
//                  on('click',       this.onClick).
                  on('mousedown',   this.onMouseDown).
                  on('mouseup',     this.onMouseUp).
                  on('mousemove',   this.onMouseMove).
                  on('contextmenu', this.onRightClick).
                  on('mouseenter',  () => self.showHalos = true).
                  on('mouseleave',  () => self.showHalos = false).
                end().
              end().
              start(foam.u2.Tab, {label: 'sheet1'}).
                start(this.sheet).
                end().
              end().
              start(foam.u2.Tab, {label: 'doc1'}).
                start(this.doc).
                end().
              end().
              start(foam.u2.Tab, {label: 'calc1'}).
                start(this.calc).
                end().
              end().
              start(foam.u2.Tab, {label: '+'}).
              end().
            end().
            start(this.POSITION, {maxValue: this.totalSize_$}).style({width: '50%'}).end().
            start(this.BACK,  {label: 'Undo'}).end().
            start(this.FORTH, {label: 'Redo'}).end().
          end().
          start('div').
            addClass(this.myClass('properties')).
            start(this.PROPERTIES, {selection$: this.selected$}).end().
            on('mouseenter',  () => self.showHalos = true).
            on('mouseleave',  () => self.showHalos = false).
          end().
          start().
            style({width: '100%'}).
            start().add('Property: ', this.SELECTED_NAME, this.DELETE_PROPERTY, this.COPY_PROPERTY).end().
            start(this.VALUE).
              addClass(this.myClass('sheet')).
              show(this.slot(function(selected) { return !! selected; })).
            end().
          end();
    },

    function dblclick() {
      console.log('**** dblclick');
    },

    async function addProperty(value, opt_name, opt_i, opt_parent) {
      var self = this;
      if ( ! opt_name ) {
        var i = opt_i || 1;
        var prefix = value.cls_.name.toLowerCase();
        this.properties.find(prefix + i).then(function (o) {
          if ( o == null )
            self.addProperty(value, prefix+i, null, opt_parent);
          else
            self.addProperty(value, null, i+1, opt_parent);
        });
      } else {
        var p = this.Property.create({
          name: opt_name,
          value: value
        });
        if ( opt_parent ) p.parent = opt_parent;
        value.setPrivate_('lpp_', p);
        p = await this.properties.put(p);
        this.selected = p;
      }
    },

    async function renameProperty(oldName, newName) {
      console.log('***** rename', oldName, newName);
      var p = await this.properties.find(oldName);
      if ( p ) {
        p.name = newName;
        await this.properties.remove(p);
        this.properties.put(p);
        this.selected = p;
      }
    },

    function updateMemento() {
      return this.properties.skip(4).select().then(function(s) {
        console.log('*************** updateMemento: ', s.array.length);
        this.feedback_ = true;
        this.memento = foam.Array.clone(s.array);
        this.feedback_ = false;
      }.bind(this));
    },

    function loadFlow(name) {
      foam.assert(name, 'Name required.')

      this.name = name;
      this.flows.find(name).then(f => {
        // TODO: needed to work around two bugs:
        //  1. the flowDAO doesn't create the objects in the supplied context
        //  2. clone(X) doesn't seem to clone the memento.value object
        f = f.clone(this.__subContext__);
        f.memento_ = f.memento_; // causes f.memento to be regenerated
        this.memento = f.memento;
      });
      return 'loading: ' + name;
    },

    function saveFlow(opt_name) {
      var name = opt_name || this.name;
      this.name = name;
      this.updateMemento().then(function() {
        this.flows.put(this.FLOW.create({
          name: name,
          memento: this.memento
        }));
      }.bind(this));
      return 'saving as: ' + name;
    }
  ],

  listeners: [
    function onPropertyPut(_, __, ___, p) {
      var o = p.value;

      this.scope[p.name] = p.value;
      if ( this.CView.isInstance(o) ) {
        if ( ! p.parent || p.parent === 'canvas1' ) {
          this.canvas.add(o);

          if ( this.Physical.isInstance(o) ) {
            this.physics.add(o);
          }
        } else {
          this.properties.find(p.parent).then(function(target) {
            target.value.add(o);
          });
        }
      }
    },

    function onPropertyRemove(_, __, ___, p) {
      if ( p === this.selected ) this.selected = null;

      var o = p.value;

      delete this.scope[p.name];

      if ( this.CView.isInstance(o) ) {
        if ( ! p.parent || p.parent === 'canvas1' ) {
          this.canvas.remove(o);

          if ( this.Physical.isInstance(o) ) {
            this.physics.remove(o);
          }

          // TODO: This is poor design but the above doesn't work because
          // Spring and Strut aren't physical
          if ( com.google.flow.Spring.isInstance(o) || com.google.flow.Strut.isInstance(o) ) {
            o.detach();
          }
        } else {
          this.properties.find(p.parent).then(function(p2) {
            p2.value.remove(o);
          });
        }
      }
    },

    function onMouseDown(evt) {
      this.onClick(evt);
      var x = evt.offsetX, y = evt.offsetY;
      var c = this.canvas.findFirstChildAt(x, y);

      if ( c === this.canvas ) {
        this.mouseTarget = null;
      } else {
        console.log('mouseDown: ', c && c.cls_.name);
        this.mouseTarget = c;
        if ( c && c.onMouseDown ) c.onMouseDown(evt);
      }
    },

    function onMouseUp(evt) {
      this.mouseTarget = null;
    },

    function onMouseMove(evt) {
      if ( this.mouseTarget && this.mouseTarget.onMouseMove ) this.mouseTarget.onMouseMove(evt);
    },

    function onClick(evt) {
      var x = evt.offsetX, y = evt.offsetY;
      var c = this.canvas.findFirstChildAt(x, y);

      if ( this.Halo.isInstance(c)     ) return;
      if ( this.LineHalo.isInstance(c) ) return;

      if ( c === this.canvas ) {
        var tool = this.currentTool;
        if ( tool === com.google.flow.Select.model_ ) return;
        var cls = this.__context__.lookup(tool.id);
        var o = cls.create({x: x, y: y}, this.__subContext__);
        var p = this.addProperty(o, null, null, 'canvas1');
        // TODO: hack because addProperty is async
        setTimeout(this.updateMemento.bind(this), 100);
      } else {
          // for ( ; c !== this.canvas ; c = c.parent ) {
          // TODO: temporary fix
          for ( ; c && c !== this.canvas ; c = c.parent ) {
          var p = c.getPrivate_('lpp_');
          if ( p ) {
            this.selected = p;
            break;
          }
        }
      }
    },

    function onRightClick(evt) {
      evt.preventDefault();
      if ( ! this.selected ) return;
    },

    {
      name: 'onMemento_',
      isMerged: true,
      mergeDelay: 100,
      code: function() {
        var m = this.memento;
        this.properties.skip(4).removeAll();
        if ( m ) {
          for ( var i = 0 ; i < m.length ; i++ ) {
            var p = m[i];
            this.addProperty(p.value, p.name, null, p.parent);
          }
        }
        this.selected = null;
      }
    },

    function onMemento() {
      if ( this.feedback_ ) return;
      this.onMemento_();
    },

    function createCopyName(original) {
      return original + '_copy';
    }
  ],

  actions: [
    {
      name: 'copyProperty',
      label: 'Copy',
      code: function(X) {
        var copy = this.selected.clone();
        this.addProperty(copy.value, this.createCopyName(this.selected.name), null, copy.parent);
        this.updateMemento();
      }
    },
    {
      name: 'deleteProperty',
      label: 'Delete',
      // TODO: prevents backspacing in text fields
      // keyboardShortcuts: [ 'del', 'backspace' ],
      code: function(X) {
        this.properties.remove(this.selected);
        this.updateMemento();
      }
    },
    {
      name: 'chooseSelectMode',
      keyboardShortcuts: [ 'esc' ],
      code: function() {
        this.currentTool = com.google.flow.Select.model_;
      }
    },
    // ???: Should these two actions be moved to the TreeView?
    {
      name: 'prevProperty',
      keyboardShortcuts: [ 'up' ],
      code: function() {
        console.log('prev');
      }
    },
    {
      name: 'nextProperty',
      keyboardShortcuts: [ 'down' ],
      code: function() {
        console.log('next');
      }
    }
  ]
});

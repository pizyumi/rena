function get_query()
{
	var vars = [], max = 0, hash = "", array = "";
	var url = window.location.search;

	hash  = url.slice(1).split('&');
	max = hash.length;
	for (var i = 0; i < max; i++) {
		array = hash[i].split('=');
		vars.push(array[0]);
		vars[array[0]] = array[1];
	}

	return vars;
}

var query = get_query();
var id = 0;

var context = {};

initialize_context(context);

function initialize_context (context) {
	context.pindex = 0;
	context.sindex = 0;
	context.ss = new Map();
}

function execute_command (context, command) {
  var cs = command.split(' ');

  if (cs[0] === 'prop') {
    context.pindex++;
    var p = create_proposition(context.pindex);

    add_object(context, p);

    return p;
  }
  else if (cs[0] === 'neg') {
    var objs = get_n_objects_from_args(context, 1, cs);
    var p = create_negation(objs[0]);

    add_object(context, p);

    return p;
  }
  else if (cs[0] === 'conj') {
    var objs = get_n_objects_from_args(context, 2, cs);
    var p = create_conjunction(objs[0], objs[1]);

    add_object(context, p);

    return p;
  }
  else if (cs[0] === 'disj') {
    var objs = get_n_objects_from_args(context, 2, cs);
    var p = create_disjunction(objs[0], objs[1]);

    add_object(context, p);

    return p;
  }
  else if (cs[0] === 'imp') {
    var objs = get_n_objects_from_args(context, 2, cs);
    var p = create_implication(objs[0], objs[1]);

    add_object(context, p);

    return p;
  }
  else if (cs[0] === 'equiv') {
    var objs = get_n_objects_from_args(context, 2, cs);
    var p = create_equivalence(objs[0], objs[1]);

    add_object(context, p);

    return p;
  }
  else if (cs[0] === 'prem') {
    var objs = get_n_objects_from_args(context, 1, cs);
    var p = create_premise(objs[0]);

    add_object(context, p);

    return p;
  }
  else if (cs[0] === 'imp_elim') {
    var objs = get_n_objects_from_args(context, 2, cs);
    var p = create_implication_elimination(objs[0], objs[1]);

    add_object(context, p);

    return p;
  }
  else if (cs[0] === 'imp_intro') {
    var objs = get_n_objects_from_args(context, 2, cs);
    var p = create_implication_introduction(objs[0], objs[1]);

    add_object(context, p);

    return p;
  }
  else {
    throw new Error('not supported command.');
  }
}

function add_object (context, obj) {
  context.sindex++;
  context.ss.set(context.sindex, obj);
}

function get_n_objects_from_args (context, n, cs) {
  check_num_arguments(cs, n);

  var objs = [];
  for (var i = 0; i < n; i++) {
    var idx = get_int_argument(cs[1 + i]);
    check_in_range(idx, context.sindex);
    var obj = context.ss.get(idx);
    objs.push(obj);
  }

  return objs;
}

function check_num_arguments (cs, num) {
  if (cs.length < num + 1) {
    throw new Error('missing argument.');
  }
}

function get_int_argument (arg) {
  var i = parseInt(arg);
  if (isNaN(i)) {
    throw new Error('not integer.');
  }
  return i;
}

function check_in_range (arg, max) {
  if (arg < 1 || arg > max) {
    throw new Error('out of range.');
  }
}

var vm = new Vue({
  el: '#main',
  data: {
		loaded: false,
    list: [],
    input: '',
    inputs: '',
    outputs: [],
    commands: [],
    err: '',
    name: '',
    description: ''
  },
  computed: {
    command_text: function () {
      return this.commands.join('\n');
    }
  },
  methods:  {
    execute_command: function () {
      var command = this.input;
      this.input = '';

      try {
        var obj = execute_command(context, command);
        if (obj != undefined && obj != null) {
          id++;
          this.outputs.unshift({
            id: id,
            index: '[' + id + ']',
            html: tohtml(obj),
            command: command
          });
          this.commands.push(command);
          this.inputs = this.command_text;
          this.err = '';
        }
      }
      catch (err) {
        this.err = err.message;
      }
    },
    execute_commands: function () {
      id = 0;
      this.outputs = [];
      this.commands = [];

			initialize_context(context);

      var commands = this.inputs.split('\n');
      for (var i = 0; i < commands.length; i++) {
        try {
          var obj = execute_command(context, commands[i]);
          if (obj != undefined && obj != null) {
            id++;
            this.outputs.unshift({
              id: id,
              index: '[' + id + ']',
              html: tohtml(obj),
              command: commands[i]
            });
            this.commands.push(commands[i]);
          }
        }
        catch (err) {
        }
      }
    },
		load_theorem: function (name) {
			window.location.href = '?name=' + name;
		},
    save_theorem: function () {
      var data = {
        commands: this.commands,
        name: this.name,
        description: this.description
      };
      axios.post('/save?name=' + this.name, data).then((res) => {
        window.location.href = '?name=' + this.name;
      }).catch((err) => {
      });
    },
		new_theorem: function () {
			window.location.href = '?name=';
		}
  }
});

axios.get('/list', {}).then((res) => {
	vm.list = _(res.data).map(function (e, i) {
		return {
			id: i,
			name: e,
			active: e === query.name
		};
	});

	if (query.name) {
		axios.get('/load?name=' + query.name, {}).then((res) => {
			vm.name = res.data.name;
			vm.description = res.data.description;

			var commands = res.data.commands;
			for (var i = 0; i < commands.length; i++) {
				try {
					var obj = execute_command(context, commands[i]);
					if (obj != undefined && obj != null) {
						id++;
						vm.outputs.unshift({
							id: id,
							index: '[' + id + ']',
							html: tohtml(obj),
							command: commands[i]
						});
						vm.commands.push(commands[i]);
					}
				}
				catch (err) {
				}
			}
			vm.inputs = vm.command_text;
			vm.loaded = true;
		}).catch((err) => {
		}).finally(() => {
		});
	}
	else {
		vm.loaded = true;
	}
}).catch((err) => {
}).finally(() => {
});

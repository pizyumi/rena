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
query.cat = query.cat ? query.cat : '';
query.name = query.name ? query.name : '';

var id = 0;

var context = {};

initialize_context(context);

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
			window.location.href = '?name=' + name + '&cat=' + query.cat;
		},
    save_theorem: function () {
      var data = {
        commands: this.commands,
        name: this.name,
        description: this.description
      };
      axios.post('/save?name=' + this.name + '&cat=' + query.cat, data).then((res) => {
        window.location.href = '?name=' + this.name + '&cat=' + query.cat;
      }).catch((err) => {
      });
    },
		view_theorem: function () {
			window.location.href = '/view?name=' + this.name + '&cat=' + query.cat;
		},
		new_theorem: function () {
			window.location.href = '?name=' + '&cat=' + query.cat;
		},
		move_categories: function () {
			window.location.href = '/cats';
		}
  }
});

axios.get('/list?cat=' + query.cat, {}).then((res) => {
	vm.list = _(res.data).map(function (e, i) {
		return {
			id: i,
			name: e,
			active: e === query.name
		};
	});

	if (query.name) {
		axios.get('/load?name=' + query.name + '&cat=' + query.cat, {}).then((res) => {
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

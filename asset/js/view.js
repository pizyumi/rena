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
    name: '',
    description: '',
		commands: []
  },
  computed: {
  },
  methods:  {
		download: function () {
			var data = {
				html: $('#proof').html()
			};
			axios.post('/download?name=' + query.name + '&cat=' + query.cat, data).then((res) => {
				var url = '/asset/screenshot/' + query.cat + '/' + query.name + '.jpg';
				var a = $('<a download id="link" href="' + url + '" style="display: none;"></a>');
				$('#main').prepend(a);
				$('#link')[0].click();
			}).catch((err) => {
			});
		}
  }
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
					vm.commands.push(commands[i]);
				}
			}
			catch (err) {
			}
		}

		var prhtml = '';
		try {
			prhtml = tofitchhtml(context.ss.get(context.sindex));
		}
		catch (err) {
			console.log(err);
		}

		$('#commands').text(vm.commands.join('\n').trim());
		$('#proof').html(prhtml);

		var height = 16 * vm.commands.length;

		$('.background-white').css('height', height + 'px');
		$('.background-black').css('height', height + 'px');

		vm.loaded = true;
	}).catch((err) => {
	}).finally(() => {
	});
}
else {
	vm.loaded = true;
}

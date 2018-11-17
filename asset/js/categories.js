var vm = new Vue({
  el: '#main',
  data: {
		loaded: false,
		list: [],
    category: ''
  },
  computed: {
  },
  methods: {
		new_category: function () {
			var data = {
				name: this.category
			};
			axios.post('/new-cat', data).then((res) => {
				window.location.href = '';
			}).catch((err) => {
			});
		},
    open_category: function (name) {
      window.location.href = '/?cat=' + name;
    }
  }
});

axios.get('/clist', {}).then((res) => {
	vm.list = _(res.data).map(function (e, i) {
		return {
			id: i,
			name: e
		};
	});
	vm.loaded = true;
}).catch((err) => {
}).finally(() => {
});

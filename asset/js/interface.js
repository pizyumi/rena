function initialize_context (context) {
	context.pindex = 0;
	context.dindex = 0;
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
		context.dindex++;
    var objs = get_n_objects_from_args(context, 2, cs);
    var p = create_implication_introduction(objs[0], objs[1], context.dindex);

    add_object(context, p);

    return p;
  }
	else if (cs[0] === 'neg_elim') {
		var objs = get_n_objects_from_args(context, 2, cs);
		var p = create_negation_elimination(objs[0], objs[1]);

		add_object(context, p);

		return p;
	}
	else if (cs[0] === 'neg_intro') {
		context.dindex++;
		var objs = get_n_objects_from_args(context, 2, cs);
		var p = create_negation_introduction(objs[0], objs[1], context.dindex);

		add_object(context, p);

		return p;
	}
	else if (cs[0] === 'raa') {
		context.dindex++;
		var objs = get_n_objects_from_args(context, 2, cs);
		var p = create_raa(objs[0], objs[1], context.dindex);

		add_object(context, p);

		return p;
	}
	else if (cs[0] === 'conj_elim_r') {
		var objs = get_n_objects_from_args(context, 1, cs);
		var p = create_conjunction_elimination_right(objs[0]);

		add_object(context, p);

		return p;
	}
	else if (cs[0] === 'conj_elim_l') {
		var objs = get_n_objects_from_args(context, 1, cs);
		var p = create_conjunction_elimination_left(objs[0]);

		add_object(context, p);

		return p;
	}
	else if (cs[0] === 'conj_intro') {
		var objs = get_n_objects_from_args(context, 2, cs);
		var p = create_conjunction_introduction(objs[0], objs[1]);

		add_object(context, p);

		return p;
	}
	else if (cs[0] === 'disj_elim') {
		context.dindex++;
		var dindex1 = context.dindex;
		context.dindex++;
		var dindex2 = context.dindex;
		var objs = get_n_objects_from_args(context, 5, cs);
		var p = create_disjunction_elimination(objs[0], objs[1], objs[2], objs[3], objs[4], dindex1, dindex2);

		add_object(context, p);

		return p;
	}
	else if (cs[0] === 'disj_intro_r') {
		var objs = get_n_objects_from_args(context, 2, cs);
		var p = create_disjunction_introduction_right(objs[0], objs[1]);

		add_object(context, p);

		return p;
	}
	else if (cs[0] === 'disj_intro_l') {
		var objs = get_n_objects_from_args(context, 2, cs);
		var p = create_disjunction_introduction_left(objs[0], objs[1]);

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

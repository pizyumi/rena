function create_proposition (index) {
  return {
    type: 'prop',
    subtype: 'atom',
    index: index
  }
}

function create_negation (p) {
    if (p.type !== 'prop') {
        throw new Error('not prop.');
    }

    return {
        type: 'prop',
        subtype: 'neg',
        sub: p
    };
}

function create_conjunction (p1, p2) {
    if (p1.type !== 'prop') {
        throw new Error('not prop.');
    }
    if (p2.type !== 'prop') {
        throw new Error('not prop.');
    }

    return {
        type: 'prop',
        subtype: 'conj',
        sub1: p1,
        sub2: p2
    };
}

function create_disjunction (p1, p2) {
    if (p1.type !== 'prop') {
        throw new Error('not prop.');
    }
    if (p2.type !== 'prop') {
        throw new Error('not prop.');
    }

    return {
        type: 'prop',
        subtype: 'disj',
        sub1: p1,
        sub2: p2
    };
}

function create_implication (p1, p2) {
    if (p1.type !== 'prop') {
        throw new Error('not prop.');
    }
    if (p2.type !== 'prop') {
        throw new Error('not prop.');
    }

    return {
        type: 'prop',
        subtype: 'imp',
        sub1: p1,
        sub2: p2
    };
}

function create_equivalence (p1, p2) {
    if (p1.type !== 'prop') {
        throw new Error('not prop.');
    }
    if (p2.type !== 'prop') {
        throw new Error('not prop.');
    }

    return {
        type: 'prop',
        subtype: 'equiv',
        sub1: p1,
        sub2: p2
    };
}

function create_premise (p) {
  if (p.type !== 'prop') {
    throw new Error('not prop.');
  }

  return {
    type: 'proof',
    subtype: 'prem',
    premises: [p],
    conclusion: p,
    sub: p
  };
}

function create_implication_elimination (pr1, pr2) {
  if (pr1.type !== 'proof') {
    throw new Error('not proof.');
  }
  if (pr2.type !== 'proof') {
    throw new Error('not proof.');
  }

  if (pr2.conclusion.subtype !== 'imp') {
    throw new Error('not apply.');
  }
  if (!equal(pr1.conclusion, pr2.conclusion.sub1)) {
    throw new Error('not apply.');
  }

  var premises = [];
  gather_unique_obj(premises, pr1.premises);
  gather_unique_obj(premises, pr2.premises);
  var conclusion = pr2.conclusion.sub2;

  return {
    type: 'proof',
    subtype: 'imp_elim',
    premises: premises,
    conclusion: conclusion,
    sub1: pr1,
    sub2: pr2
  };
}

function create_implication_introduction (pr1, pr2, dindex) {
  if (pr1.type !== 'proof') {
    throw new Error('not proof.');
  }
  if (pr2.type !== 'proof') {
    throw new Error('not proof.');
  }
  if (pr2.subtype !== 'prem') {
    throw new Error('not premise.');
  }

  var premises = [];
  for (var i = 0; i < pr1.premises.length; i++) {
    if (!equal(pr1.premises[i], pr2.conclusion)) {
      premises.push(pr1.premises[i]);
    }
  }
  var conclusion = create_implication(pr2.conclusion, pr1.conclusion);

  var npr2 = shallowcopy(pr2);
  npr2.dindex = dindex;
  replace(pr1, pr2, npr2);
  if (equal(pr1, pr2)) {
    pr1 = npr2;
  }

  return {
    type: 'proof',
    subtype: 'imp_intro',
    premises: premises,
    conclusion: conclusion,
    sub1: pr1,
    sub2: npr2
  };
}

function gather_unique_obj (outs, ins) {
  for (var i = 0; i < ins.length; i++) {
    var f = true;
    for (var j = 0; j < outs.length; j++) {
      if (equal(ins[i], outs[j])) {
        f = false;
        break;
      }
    }
    if (f) {
      outs.push(ins[i]);
    }
  }
}

function equal (obj1, obj2) {
  if (obj1.type !== obj2.type) {
    return false;
  }
  if (obj1.subtype !== obj2.subtype) {
    return false;
  }

  if (obj1.type === 'prop' && obj2.type === 'prop') {
    if (obj1.subtype === 'atom' && obj2.subtype === 'atom') {
      return obj1.index === obj2.index;
    }
    else if (obj1.subtype === 'neg' && obj2.subtype === 'neg') {
      return equal(obj1.sub, obj2.sub);
    }
    else if (obj1.subtype === 'conj' && obj2.subtype === 'conj') {
      return equal(obj1.sub1, obj2.sub1) && equal(obj1.sub2, obj2.sub2);
    }
    else if (obj1.subtype === 'disj' && obj2.subtype === 'disj') {
      return equal(obj1.sub1, obj2.sub1) && equal(obj1.sub2, obj2.sub2);
    }
    else if (obj1.subtype === 'imp' && obj2.subtype === 'imp') {
      return equal(obj1.sub1, obj2.sub1) && equal(obj1.sub2, obj2.sub2);
    }
    else if (obj1.subtype === 'equiv' && obj2.subtype === 'equiv') {
      return equal(obj1.sub1, obj2.sub1) && equal(obj1.sub2, obj2.sub2);
    }
    else {
      throw new Error('not supported object.');
    }
  }
  else if (obj1.type === 'proof' && obj2.type === 'proof') {
    if (obj1.premises.length !== obj2.premises.length) {
      return false;
    }
    for (var i = 0; i < obj1.premises.length; i++) {
      var f = false;
      for (var j = 0; j < obj2.premises.length; j++) {
        if (equal(obj1.premises[i], obj2.premises[j])) {
          f = true;
          break;
        }
      }
      if (!f) {
        return false;
      }
    }
    return equal(obj1.conclusion, obj2.conclusion) && obj1.dindex == obj2.dindex;
  }
  else {
    throw new Error('not supported type.');
  }
}

function shallowcopy (obj) {
  if (obj.type === 'proof') {
    if (obj.subtype === 'prem') {
      return {
        type: 'proof',
        subtype: 'prem',
        premises: obj.premises,
        conclusion: obj.conclusion,
        sub: obj.sub
      };
    }
    else {
      throw new Error('not supported subtype.');
    }
  }
  else {
    throw new Error('not supported type.');
  }
}

function replace (obj1, obj2, obj3) {
  if (obj1.type === 'proof') {
    if (obj1.subtype === 'prem') {
      return;
    }
    else if (obj1.subtype === 'imp_elim' || obj1.subtype === 'imp_intro') {
      if (equal(obj1.sub1, obj2)) {
        obj1.sub1 = obj3;
      }
      else {
        replace(obj1.sub1, obj2, obj3);
      }
      if (equal(obj1.sub2, obj2)) {
        obj1.sub2 = obj3;
      }
      else {
        replace(obj1.sub2, obj2, obj3);
      }
    }
    else {
      throw new Error('not supported subtype.');
    }
  }
  else {
    throw new Error('not supported type.');
  }
}

function containpremise (pr, prem) {
  if (pr.type !== 'proof') {
    throw new Error('not proof.');
  }
  if (prem.subtype !== 'prem') {
    throw new Error('not prem.');
  }

  for (var i = 0; i < pr.premises.length; i++) {
    if (equal(pr.premises[i], prem.conclusion)) {
      return true;
    }
  }
  return false;
}

function tohtml (obj) {
  if (obj.type === 'prop') {
    if (obj.subtype === 'atom') {
      return 'P' + '<sub>' + obj.index + '</sub>';
    }
    else if (obj.subtype === 'neg') {
      return '( ' + '￢' + tohtml(obj.sub) + ' )';
    }
    else if (obj.subtype === 'conj') {
      return '( ' + tohtml(obj.sub1) + ' ∧ ' + tohtml(obj.sub2) + ' )';
    }
    else if (obj.subtype === 'disj') {
      return '( ' + tohtml(obj.sub1) + ' ∨ ' + tohtml(obj.sub2) + ' )';
    }
    else if (obj.subtype === 'imp') {
      return '( ' + tohtml(obj.sub1) + ' → ' + tohtml(obj.sub2) + ' )';
    }
    else if (obj.subtype === 'equiv') {
      return '( ' + tohtml(obj.sub1) + ' ↔ ' + tohtml(obj.sub2) + ' )';
    }
    else {
      throw new Error('not supported subtype.');
    }
  }
  else if (obj.type === 'proof') {
    var premises = [];
    for (var i = 0; i < obj.premises.length; i++) {
      premises.push(tohtml(obj.premises[i]));
    }
    return premises.join(', ') + ' ├ ' + tohtml(obj.conclusion);
  }
  else {
    throw new Error('not supported type.');
  }
}

function tofitchhtml (pr) {
	var ps = [];
	var steps = [];

	tofitchorder(pr, ps, steps);

	var num = 0;
	var prs = [];
	for (var i = 0; i < steps.length; i++) {
		num++;

		steps[i].num = num;
		prs.push(steps[i]);
	}

  var fitch = $('<div class="fitch"></div>');
  var box = $('<div class="box"></div>');

  fitch.append(box);

  var parent = box;
	for (var i = 0; i < prs.length; i++) {
    if (prs[i].subtype === 'imp_intro' && containpremise(prs[i].sub1, prs[i].sub2)) {
      var temp = parent;

      parent = parent.parent();

			if (temp.children().length === 0) {
				temp.remove();
			}
		}

    var cname = '';
    var rname = ''
    if (prs[i].subtype === 'prem') {
      cname = 'prem';
      rname = '仮定' + '[' + prs[i].dindex + ']';
    }
    else if (prs[i].subtype === 'imp_elim') {
      cname = 'normal';
      rname = '含意除去(' + prs[i].sub1.num + ')' + '(' + prs[i].sub2.num + ')';
    }
    else if (prs[i].subtype === 'imp_intro') {
      if (containpremise(prs[i].sub1, prs[i].sub2)) {
        cname = 'conc';
        rname = '含意導入(' + prs[i].sub2.num + ')-(' + prs[i].sub1.num + ')' + '[' + prs[i].sub2.dindex + ']';
      }
      else {
        cname = 'normal';
        rname = '含意導入(' + prs[i].sub1.num + ')' + '[' + prs[i].sub2.dindex + ']';
      }
    }
    else {
      throw new Error('not supported subtype.');
    }

    var line = $('<div class="' + cname + '"></div>');
    var background = $('<div class="' + (i % 2 === 0 ? 'background-white' : 'background-black') + '"></div>');
    var index = $('<div class="index">(' + (i + 1) + ')</div>');
    var rule = $('<div class="rule">' + rname + '</div>');

    line.html(tohtml(prs[i].conclusion));
    line.prepend(rule);
    line.prepend(index);
    line.prepend(background);

    parent.append(line);

		if (prs[i].subtype === 'prem') {
      var preming = $('<div class="preming"></div>');

      parent.append(preming);
      parent = preming;
		}
	}

  var last = $('<div class="background-white"></div>');

  box.append(last);

  return fitch.prop('outerHTML');
}

function tofitchorder (pr, ps, steps) {
  if (pr.type !== 'proof') {
    throw new Error('not proof.');
  }

  if (pr.subtype === 'imp_elim') {
    var f = true;
    for (var i = 0; i < ps.length; i++) {
      if (equal(pr, ps[i])) {
        f = false;
        break;
      }
    }

    if (f) {
      tofitchorder(pr.sub1, ps, steps);
      tofitchorder(pr.sub2, ps, steps);

      ps.push(pr);
      steps.push(pr);
    }
  }
  else if (pr.subtype === 'prem') {
    return;
  }
  else if (pr.subtype === 'imp_intro') {
   if (containpremise(pr.sub1, pr.sub2)) {
     steps.push(pr.sub2);
   }

    var ps2 = [];
    for (var i = 0; i < ps.length; i++) {
      ps2.push(ps[i]);
    }
    ps2.push(pr.sub2);

    tofitchorder(pr.sub1, ps2, steps);

    ps.push(pr);
    steps.push(pr);
  }
}

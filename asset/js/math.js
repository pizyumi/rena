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

function create_implication_introduction (pr1, pr2) {
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

  return {
    type: 'proof',
    subtype: 'imp_intro',
    premises: premises,
    conclusion: conclusion,
    sub1: pr1,
    sub2: pr2
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
    return equal(obj1.conclusion, obj2.conclusion);
  }
  else {
    throw new Error('not supported type.');
  }
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

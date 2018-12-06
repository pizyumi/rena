function create_contradiction() {
  return {
    type: 'prop',
    subtype: 'contra'
  };
}

function create_proposition(index) {
  return {
    type: 'prop',
    subtype: 'atom',
    index: index
  }
}

function create_negation(p) {
  if (p.type !== 'prop') {
    throw new Error('not prop.');
  }

  return {
    type: 'prop',
    subtype: 'neg',
    sub: p
  };
}

function create_conjunction(p1, p2) {
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

function create_disjunction(p1, p2) {
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

function create_implication(p1, p2) {
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

function create_equivalence(p1, p2) {
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

function create_premise(p) {
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

function create_implication_elimination(pr1, pr2) {
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

function create_implication_introduction(pr1, pr2, dindex) {
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

function create_negation_elimination(pr1, pr2) {
  if (pr1.type !== 'proof') {
    throw new Error('not proof.');
  }
  if (pr2.type !== 'proof') {
    throw new Error('not proof.');
  }

  if (pr2.conclusion.subtype !== 'neg') {
    throw new Error('not apply.');
  }
  if (!equal(pr1.conclusion, pr2.conclusion.sub)) {
    throw new Error('not apply.');
  }

  var premises = [];
  gather_unique_obj(premises, pr1.premises);
  gather_unique_obj(premises, pr2.premises);
  var conclusion = create_contradiction();

  return {
    type: 'proof',
    subtype: 'neg_elim',
    premises: premises,
    conclusion: conclusion,
    sub1: pr1,
    sub2: pr2
  };
}

function create_negation_introduction(pr1, pr2, dindex) {
  if (pr1.type !== 'proof') {
    throw new Error('not proof.');
  }
  if (pr2.type !== 'proof') {
    throw new Error('not proof.');
  }
  if (pr2.subtype !== 'prem') {
    throw new Error('not premise.');
  }

  if (pr1.conclusion.subtype !== 'contra') {
    throw new Error('not apply.');
  }

  var premises = [];
  for (var i = 0; i < pr1.premises.length; i++) {
    if (!equal(pr1.premises[i], pr2.conclusion)) {
      premises.push(pr1.premises[i]);
    }
  }
  var conclusion = create_negation(pr2.conclusion);

  var npr2 = shallowcopy(pr2);
  npr2.dindex = dindex;
  replace(pr1, pr2, npr2);
  if (equal(pr1, pr2)) {
    pr1 = npr2;
  }

  return {
    type: 'proof',
    subtype: 'neg_intro',
    premises: premises,
    conclusion: conclusion,
    sub1: pr1,
    sub2: npr2
  };
}

function create_raa(pr1, pr2, dindex) {
  if (pr1.type !== 'proof') {
    throw new Error('not proof.');
  }
  if (pr2.type !== 'proof') {
    throw new Error('not proof.');
  }
  if (pr2.subtype !== 'prem') {
    throw new Error('not premise.');
  }

  if (pr1.conclusion.subtype !== 'contra') {
    throw new Error('not apply.');
  }
  if (pr2.conclusion.subtype !== 'neg') {
    throw new Error('not apply.');
  }

  var premises = [];
  for (var i = 0; i < pr1.premises.length; i++) {
    if (!equal(pr1.premises[i], pr2.conclusion)) {
      premises.push(pr1.premises[i]);
    }
  }
  var conclusion = pr2.conclusion.sub;

  var npr2 = shallowcopy(pr2);
  npr2.dindex = dindex;
  replace(pr1, pr2, npr2);
  if (equal(pr1, pr2)) {
    pr1 = npr2;
  }

  return {
    type: 'proof',
    subtype: 'raa',
    premises: premises,
    conclusion: conclusion,
    sub1: pr1,
    sub2: npr2
  };
}

function create_conjunction_elimination_right(pr) {
  if (pr.type !== 'proof') {
    throw new Error('not proof.');
  }

  if (pr.conclusion.subtype !== 'conj') {
    throw new Error('not apply.');
  }

  var premises = [];
  gather_unique_obj(premises, pr.premises);
  var conclusion = pr.conclusion.sub1;

  return {
    type: 'proof',
    subtype: 'conj_elim_r',
    premises: premises,
    conclusion: conclusion,
    sub: pr
  };
}

function create_conjunction_elimination_left(pr) {
  if (pr.type !== 'proof') {
    throw new Error('not proof.');
  }

  if (pr.conclusion.subtype !== 'conj') {
    throw new Error('not apply.');
  }

  var premises = [];
  gather_unique_obj(premises, pr.premises);
  var conclusion = pr.conclusion.sub2;

  return {
    type: 'proof',
    subtype: 'conj_elim_l',
    premises: premises,
    conclusion: conclusion,
    sub: pr
  };
}

function create_conjunction_introduction(pr1, pr2) {
  if (pr1.type !== 'proof') {
    throw new Error('not proof.');
  }
  if (pr2.type !== 'proof') {
    throw new Error('not proof.');
  }

  var premises = [];
  gather_unique_obj(premises, pr1.premises);
  gather_unique_obj(premises, pr2.premises);
  var conclusion = create_conjunction(pr1.conclusion, pr2.conclusion);

  return {
    type: 'proof',
    subtype: 'conj_intro',
    premises: premises,
    conclusion: conclusion,
    sub1: pr1,
    sub2: pr2
  };
}

function create_disjunction_elimination(pr1, pr2, pr3, pr4, pr5, dindex1, dindex2) {
  if (pr1.type !== 'proof') {
    throw new Error('not proof.');
  }
  if (pr2.type !== 'proof') {
    throw new Error('not proof.');
  }
  if (pr3.type !== 'proof') {
    throw new Error('not proof.');
  }
  if (pr4.type !== 'proof') {
    throw new Error('not proof.');
  }
  if (pr5.type !== 'proof') {
    throw new Error('not proof.');
  }
  if (pr4.subtype !== 'prem') {
    throw new Error('not premise.');
  }
  if (pr5.subtype !== 'prem') {
    throw new Error('not premise.');
  }

  if (pr1.conclusion.subtype !== 'disj') {
    throw new Error('not apply.');
  }
  if (!equal(pr1.conclusion.sub1, pr4.conclusion)) {
    throw new Error('not apply.');
  }
  if (!equal(pr1.conclusion.sub2, pr5.conclusion)) {
    throw new Error('not apply.');
  }
  if (!equal(pr2.conclusion, pr3.conclusion)) {
    throw new Error('not apply.');
  }

  var premises = [];
  var premises2 = [];
  gather_unique_obj(premises, pr1.premises);
  gather_unique_obj(premises, pr2.premises);
  gather_unique_obj(premises, pr3.premises);
  for (var i = 0; i < premises.length; i++) {
    if (!equal(premises[i], pr4.conclusion) && !equal(premises[i], pr5.conclusion)) {
      premises2.push(premises[i]);
    }
  }
  var conclusion = pr2.conclusion; //or pr3.conclusion

  var npr4 = shallowcopy(pr4);
  npr4.dindex = dindex1;
  replace(pr2, pr4, npr4);
  if (equal(pr2, pr4)) {
    pr2 = npr4;
  }

  var npr5 = shallowcopy(pr5);
  npr5.dindex = dindex2;
  replace(pr3, pr5, npr5);
  if (equal(pr3, pr5)) {
    pr3 = npr5;
  }

  return {
    type: 'proof',
    subtype: 'disj_elim',
    premises: premises2,
    conclusion: conclusion,
    sub1: pr1,
    sub2: pr2,
    sub3: pr3,
    sub4: npr4,
    sub5: npr5
  };
}

function create_disjunction_introduction_right(pr, p) {
  if (pr.type !== 'proof') {
    throw new Error('not proof.');
  }
  if (p.type !== 'prop') {
    throw new Error('not prop.');
  }

  var premises = [];
  gather_unique_obj(premises, pr.premises);
  var conclusion = create_disjunction(pr.conclusion, p);

  return {
    type: 'proof',
    subtype: 'disj_intro_r',
    premises: premises,
    conclusion: conclusion,
    sub1: pr,
    sub2: p
  };
}

function create_disjunction_introduction_left(pr, p) {
  if (pr.type !== 'proof') {
    throw new Error('not proof.');
  }
  if (p.type !== 'prop') {
    throw new Error('not prop.');
  }

  var premises = [];
  gather_unique_obj(premises, pr.premises);
  var conclusion = create_disjunction(p, pr.conclusion);

  return {
    type: 'proof',
    subtype: 'disj_intro_l',
    premises: premises,
    conclusion: conclusion,
    sub1: pr,
    sub2: p
  };
}

function gather_unique_obj(outs, ins) {
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

function equal(obj1, obj2) {
  if (obj1.type !== obj2.type) {
    return false;
  }
  if (obj1.subtype !== obj2.subtype) {
    return false;
  }

  if (obj1.type === 'prop' && obj2.type === 'prop') {
    if (obj1.subtype === 'contra' && obj2.subtype === 'contra') {
      return true;
    }
    else if (obj1.subtype === 'atom' && obj2.subtype === 'atom') {
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

function shallowcopy(obj) {
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

function replace(obj1, obj2, obj3) {
  if (obj1.type === 'proof') {
    if (obj1.subtype === 'prem') {
      return;
    }
    else if (obj1.subtype === 'conj_elim_r' || obj1.subtype === 'conj_elim_l') {
      if (equal(obj1.sub, obj2)) {
        obj1.sub = obj3;
      }
      else {
        replace(obj1.sub, obj2, obj3);
      }
    }
    else if (obj1.subtype === 'disj_intro_r' || obj1.subtype === 'disj_intro_l') {
      if (equal(obj1.sub1, obj2)) {
        obj1.sub1 = obj3;
      }
      else {
        replace(obj1.sub1, obj2, obj3);
      }
    }
    else if (obj1.subtype === 'imp_elim' || obj1.subtype === 'imp_intro' || obj1.subtype === 'neg_elim' || obj1.subtype === 'neg_intro' || obj1.subtype === 'raa' || obj1.subtype === 'conj_intro') {
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
    else if (obj1.subtype === 'disj_elim') {
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
      if (equal(obj1.sub3, obj2)) {
        obj1.sub3 = obj3;
      }
      else {
        replace(obj1.sub3, obj2, obj3);
      }
      if (equal(obj1.sub4, obj2)) {
        obj1.sub4 = obj3;
      }
      else {
        replace(obj1.sub4, obj2, obj3);
      }
      if (equal(obj1.sub5, obj2)) {
        obj1.sub5 = obj3;
      }
      else {
        replace(obj1.sub5, obj2, obj3);
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

function containpremise(pr, prem) {
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

function tohtml(obj) {
  if (obj.type === 'prop') {
    if (obj.subtype === 'contra') {
      return '⊥';
    }
    else if (obj.subtype === 'atom') {
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

function tofitchhtml(pr) {
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
    if (((prs[i].subtype === 'imp_intro' || prs[i].subtype === 'neg_intro' || prs[i].subtype === 'raa') && containpremise(prs[i].sub1, prs[i].sub2)) || prs[i].subtype === 'disj_elim') {
      var temp = parent;

      parent = parent.parent();

      if (temp.children().length === 0) {
        temp.remove();
      }
    }
    else if (prs[i].subtype === 'prem' && prs[i].discharge) {
      var temp = parent;

      parent = parent.parent();
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
    else if (prs[i].subtype === 'neg_elim') {
      cname = 'normal';
      rname = '否定除去(' + prs[i].sub1.num + ')' + '(' + prs[i].sub2.num + ')';
    }
    else if (prs[i].subtype === 'neg_intro') {
      if (containpremise(prs[i].sub1, prs[i].sub2)) {
        cname = 'conc';
        rname = '否定導入(' + prs[i].sub2.num + ')-(' + prs[i].sub1.num + ')' + '[' + prs[i].sub2.dindex + ']';
      }
      else {
        cname = 'normal';
        rname = '否定導入(' + prs[i].sub1.num + ')' + '[' + prs[i].sub2.dindex + ']';
      }
    }
    else if (prs[i].subtype === 'raa') {
      if (containpremise(prs[i].sub1, prs[i].sub2)) {
        cname = 'conc';
        rname = '背理法(' + prs[i].sub2.num + ')-(' + prs[i].sub1.num + ')' + '[' + prs[i].sub2.dindex + ']';
      }
      else {
        cname = 'normal';
        rname = '背理法(' + prs[i].sub1.num + ')' + '[' + prs[i].sub2.dindex + ']';
      }
    }
    else if (prs[i].subtype === 'conj_elim_r') {
      cname = 'normal';
      rname = '連言除去右(' + prs[i].sub.num + ')';
    }
    else if (prs[i].subtype === 'conj_elim_l') {
      cname = 'normal';
      rname = '連言除去左(' + prs[i].sub.num + ')';
    }
    else if (prs[i].subtype === 'conj_intro') {
      cname = 'normal';
      rname = '連言導入(' + prs[i].sub1.num + ')' + '(' + prs[i].sub2.num + ')';
    }
    else if (prs[i].subtype === 'disj_elim') {
      cname = 'conc';
      rname = '選言除去(' + prs[i].sub1.num + ')' + '(' + prs[i].sub4.num + ')-(' + prs[i].sub3.num + ')';
    }
    else if (prs[i].subtype === 'disj_intro_r') {
      cname = 'normal';
      rname = '選言導入右(' + prs[i].sub1.num + ')';
    }
    else if (prs[i].subtype === 'disj_intro_l') {
      cname = 'normal';
      rname = '選言導入左(' + prs[i].sub1.num + ')';
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

function tofitchorder(pr, ps, steps) {
  if (pr.type !== 'proof') {
    throw new Error('not proof.');
  }

  if (pr.subtype === 'conj_elim_r' || pr.subtype === 'conj_elim_l') {
    var f = true;
    for (var i = 0; i < ps.length; i++) {
      if (equal(pr, ps[i])) {
        f = false;
        break;
      }
    }

    if (f) {
      tofitchorder(pr.sub, ps, steps);

      ps.push(pr);
      steps.push(pr);
    }
  }
  else if (pr.subtype === 'disj_intro_r' || pr.subtype === 'disj_intro_l') {
    var f = true;
    for (var i = 0; i < ps.length; i++) {
      if (equal(pr, ps[i])) {
        f = false;
        break;
      }
    }

    if (f) {
      tofitchorder(pr.sub1, ps, steps);

      ps.push(pr);
      steps.push(pr);
    }
  }
  else if (pr.subtype === 'imp_elim' || pr.subtype === 'neg_elim' || pr.subtype === 'conj_intro') {
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
  else if (pr.subtype === 'imp_intro' || pr.subtype === 'neg_intro' || pr.subtype === 'raa') {
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
  else if (pr.subtype === 'disj_elim') {
    tofitchorder(pr.sub1, ps, steps);

    steps.push(pr.sub4);

    var ps2 = [];
    for (var i = 0; i < ps.length; i++) {
      ps2.push(ps[i]);
    }
    ps2.push(pr.sub4);

    tofitchorder(pr.sub2, ps2, steps);

    pr.sub5.discharge = true;

    steps.push(pr.sub5);

    var ps3 = [];
    for (var i = 0; i < ps.length; i++) {
      ps3.push(ps[i]);
    }
    ps3.push(pr.sub5);

    tofitchorder(pr.sub3, ps3, steps);

    ps.push(pr);
    steps.push(pr);
  }
  else {
    throw new Error('not supported subtype');
  }
}

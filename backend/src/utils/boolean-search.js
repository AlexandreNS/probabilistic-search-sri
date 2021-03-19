const { ExpressionParser } = require('expressionparser');
const array = require('lodash/array');

// expressions to export 
let indexConj = [];

let listDocs = [];

function getIndexConj() {
  return indexConj;
}

function setIndexConj(conj) {
  indexConj = conj;
}

function getListDocs() {
  return listDocs;
}

function setListDocs(docs) {
  listDocs = docs;
}

const evaluateQuery = (query) => {
  const result = new ExpressionParser(arithmeticLanguage).expressionToValue(query);
  return indexConj[result];
}

// build resources to evaluate Boolean query
const isArgumentsArray = (args) => Array.isArray(args) && args.isArgumentsArray;

const verifyTermsByDistance = (arr1, arr2, distance) => {
  for (const pos1 of arr1) {
    for(const pos2 of arr2) {
      if ( (Math.abs(pos1 - pos2) - 1) <= distance ) return true;
    }
  }
  return false;
}

const unpackArgs = (f) => (expr) => {
  const result = expr();
  if (!isArgumentsArray(result)) {
    if (f.length > 1) {
      throw new Error(
        `Too few arguments. Expected ${f.length}, found 1 (${JSON.stringify(
          result
        )})`
      );
    }
    return f(() => result);
  } else 
  if (result.length === f.length  || f.length === 0) {
    return f.apply(null, result);
  } else {
    throw new Error(`Incorrect number of arguments. Expected ${f.length}`);
  }
};

const prefixOps = {
  'NEAR': (term1, distance, term2) => {
    const indexTerm1 = indexConj[term1()];
    const indexTerm2 = indexConj[term2()];
    const intersectionDocs = array.intersection(indexTerm1.docs, indexTerm2.docs);

    const docsValid = []

    for (const docId of intersectionDocs) {
      const boolDoc = verifyTermsByDistance(
        indexTerm1.posix[docId], 
        indexTerm2.posix[docId], 
        distance()
      );

      if (boolDoc) docsValid.push(docId);
    }

    const result = {
      "termo": `${term1()} NEAR/${distance()} ${term2()}`,
      "docs": docsValid
    };

    indexConj.push(result);

    return indexConj.length-1;
  },
  "NOT": (term) => {
    const docsValid = array.difference(listDocs, indexConj[term()].docs);

    const result = {
      "termo": `NOT ${term()}`,
      "docs": docsValid
    };

    indexConj.push(result);

    return indexConj.length-1;
  }
}

Object.keys(prefixOps).forEach((key) => {
  prefixOps[key] = unpackArgs(prefixOps[key]);
});

const arithmeticLanguage = {
  INFIX_OPS: {
    'AND': (a, b) => {
      const result = {
        "termo": `${a()} AND ${b()}`,
        "docs": array.intersection(indexConj[a()].docs, indexConj[b()].docs)
      };
      indexConj.push(result);
      return indexConj.length-1;
    },
    'OR': (a, b) => {
      const result = {
        "termo": `${a()} OR ${b()}`,
        "docs": array.union(indexConj[a()].docs, indexConj[b()].docs)
      };
      indexConj.push(result);
      return indexConj.length-1;
    },
    ",": (a, b) => {
      const aVal = a();
      const aArr = isArgumentsArray(aVal)
        ? aVal
        : [() => aVal];
      const args = aArr.concat([b]);
      args.isArgumentsArray = true;
      return args;
    },
  },
  PREFIX_OPS: prefixOps,
  PRECEDENCE: [['NEAR'], ['NOT'] ,['AND', 'OR'], [',']],
  GROUP_OPEN: '(',
  GROUP_CLOSE: ')',
  SEPARATOR: ' ',
  SYMBOLS: ['(', ')', ','],
  AMBIGUOUS: {},

  termDelegate: function(term) {
    return parseInt(term);
  }
};

module.exports = {
  evaluateQuery,

  getIndexConj,
  setIndexConj,

  getListDocs,
  setListDocs
};
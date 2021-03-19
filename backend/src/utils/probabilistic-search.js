const array = require('lodash/array');

// expressions to export 
const search = (query, invertedIndex, relevantDocs, docsList) => {
  // substituir os termos da busca pelos idx dos termos no INDEX
  const arrIdxQuery = query.map((word) => {
    return array.findIndex(invertedIndex, { termo: word });;
  }).filter(v => v !== -1);

  // pega todos os documentos que corresponde a query ( logica OR )
  const listDocs = arrIdxQuery.reduce((acc, cur) => {
    return array.union(acc, invertedIndex[cur].docs);
  }, []);

  const R = query.reduce((acc, cur) => {
    if (relevantDocs[cur]) {
      acc.push( ...relevantDocs[cur] )
      acc = array.uniq(acc);
    }
    
    return acc;
  }, []).length;


  let scoreDocs = [];
  if (R > 0){
    // lista de documentos acrescida em 1 unidade
    const N = docsList.length + 1;

    scoreDocs = listDocs.map((docId) => {
      // similaridade
      const sumWeight = arrIdxQuery.reduce((acc, idx_term) => {
        const termo = invertedIndex[idx_term].termo;
        const r = relevantDocs[termo] ? relevantDocs[termo].length - 0.1 : 0;

        const weight = invertedIndex[idx_term].docs.includes(docId) ? 
          r === 0 ? 
            invertedIndex[idx_term].idf : 
            calc_weight(N, R, invertedIndex[idx_term].docs.length, r) 
        : 0;

        return acc + weight;
      }, 0);
      
      return { id: docId, score: sumWeight };
    });

  } else {
    scoreDocs = listDocs.map((docId) => {
      // similaridade
      const sumWeight = arrIdxQuery.reduce((acc, idx_term) => {
        const idf = invertedIndex[idx_term].docs.includes(docId) ? invertedIndex[idx_term].idf : 0;
    
        return acc + idf;
      }, 0);
      
      return { id: docId, score: sumWeight };
    });
  }
  return scoreDocs;
}

const removeDocIdRelevantIndex = (relevantIndex, docId) => {
  const terms = [];
  for (const term in relevantIndex) terms.push(term);

  terms.forEach( value => {
    relevantIndex[value] = relevantIndex[value].filter(v => v !== docId);
    if (relevantIndex[value].length === 0) delete relevantIndex[value]
  });

  return relevantIndex;
};

// business logic
const calc_weight = (N, R, n, r) => {
  return Math.log10( (r * (N-R-n+r)) / ((n-r) * (R-r)) );
}

module.exports = {
  search,
  removeDocIdRelevantIndex
};
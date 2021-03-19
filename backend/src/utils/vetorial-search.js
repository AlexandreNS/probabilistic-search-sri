const array = require('lodash/array');

// expressions to export 
const generate = (corpusIndex, docsList) => {
  const vetorialIndex = [];
  const countDocs = docsList.length;
  const arrMaxFrequencyDocs = getArrMaxFrequencyDocs(corpusIndex, docsList);

  corpusIndex.forEach( ({ termo, docs: docsListTerm, posix: posixListTerm }) => {
    const idf = calc_IDF(docsListTerm.length, countDocs);

    const objTf_idf = {}
    docsListTerm.forEach( docId => {
      const freqTermDoc = posixListTerm[docId].length;
      const maxFreqDoc = arrMaxFrequencyDocs[docId];
      
      const tf = calc_TF(freqTermDoc, maxFreqDoc);
      const tf_idf = tf * idf;
      objTf_idf[docId] = tf_idf;
    });

    vetorialIndex.push({ termo, docs: docsListTerm, tf_idf: objTf_idf, idf });
  });

  return vetorialIndex;
}

const search = (query, indexVetorial) => {
  // substituir os termos da busca pelos idx dos termos no INDEX
  const arrIdxQuery = query.map((word) => {
    return array.findIndex(indexVetorial, { termo: word });;
  });

  // calculo da norma de Q para cada termo, 
  // se termo não tem no INDEX é zero
  const normQ = calc_norm( arrIdxQuery.map((idx) => idx === -1 ? 0 : indexVetorial[idx].idf) );

  // pega todos os documentos que corresponde a query ( logica OR )
  const listDocs = arrIdxQuery.reduce((acc, cur) => {
    return cur === -1 ? acc : array.union(acc, indexVetorial[cur].docs);
  }, []);

  // gera o score de cada documento
  const scoreDocs = listDocs.map((docId) => {
    // numerador do calculo do score
    const num = arrIdxQuery.reduce((acc, idx_term) => {
      const tf_idf = idx_term === -1 ? 0 : indexVetorial[idx_term].tf_idf[docId] || 0;
  
      return acc + (idx_term === -1 ? 0 : indexVetorial[idx_term].idf * tf_idf);
    }, 0);
    
    // calculo da norma de D para cada termo presente no documento, 
    // se termo não tem no INDEX é zero
    // se termo não está no documento é zero
    const normD = calc_norm( arrIdxQuery.map((idx_term) =>
      idx_term === -1 ? 0 : indexVetorial[idx_term].tf_idf[docId] || 0
    ) );

    return { id: docId, score: num/(normD*normQ) || 0};
  });

  return scoreDocs;
}

// business logic
const getArrMaxFrequencyDocs = (corpusIndex, docsList) => {
  const arrMaxFreq = {};

  docsList.forEach( ({ id }) => {
    arrMaxFreq[id] = 0;

    corpusIndex.forEach( ({ posix }) => {
      if ( posix[id] && arrMaxFreq[id] < posix[id].length ) {
        arrMaxFreq[id] = posix[id].length;
      }
    });
  });
  return arrMaxFreq;
}

const calc_TF = (freqTermDoc, maxFreqDoc) => {
  return 0.5 + (0.5 * freqTermDoc/maxFreqDoc);
}

const calc_IDF = (countDocsTerm, countDocs) => {
  return Math.log10( countDocs/countDocsTerm );
}

const calc_norm = (arrValues) => {
  return Math.sqrt( arrValues.reduce((acc, cur) => acc + cur*cur, 0) );
}

module.exports = {
  generate,
  search
};
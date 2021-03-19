const { decode: decodeHtml } = require('html-entities')
const stopwords = require('./../resources/stopwords')
const natural = require('natural');

natural.PorterStemmerPt.attach();

const termFrequency = {};

function sanitizeHtml(textData){
  textData = decodeHtml(textData);
  textData = textData.replace(/(<([^>]+)>)/ig, ' ');
  return textData;
}

termFrequency.generate = (textData, mode = 'html', stemming = true) => {
  if (mode === 'html') {
    textData = sanitizeHtml(textData)
  }

  textData = textData.replace(/([^A-Za-zÀ-ÖØ-öø-ÿ]+)/ig, ' ').toLowerCase().trim()
  
  let bagWords = textData.split(/\s+/).map((v, idx) => [v, idx])
    .filter(( [ word, idx ]) => stopwords.indexOf(word) === -1 && word.length > 2)

  if (stemming) {
    bagWords = bagWords.map(([ word, idx ]) => [word.stem(), idx]);
  } 
  
  const countWords = {}

  bagWords.forEach(function ([word, idx]) {
    if ( !Array.isArray(countWords[word]) ) {
      countWords[word] = []
    }
    countWords[word].push(idx);
  });

  return countWords;
}

module.exports = termFrequency;
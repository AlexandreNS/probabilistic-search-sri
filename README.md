# Probabilistic Search SRI

Trabalho feito para a disciplina de Organização e Recuperação da Informação: realiza a construção de um indice invertido a partir de uma lista de documentos e permite uma busca probabilista no corpus usando o indice invertido.

O corpus de exemplo utilizado pode ser encontrado em [CRPC sub-corpus oral espontÉneo.zip](https://github.com/AlexandreNS/term-frequency-sri/blob/main/CRPC%20sub-corpus%20oral%20espont%C3%89neo.zip?raw=true)

**OBS.:** Esse trabalho pode ser considerado uma melhoria do [vetorial-search-sri](https://github.com/AlexandreNS/vetorial-search-sri) e portanto já foi computado o indice invertido para esse corpus e nessa versão ele se encontra em [probabilistic-search-sri/backend/src/resources/data/](https://github.com/AlexandreNS/probabilistic-search-sri/tree/main/backend/src/resources/data) com `uuid = 80fa9a7d-ee4d-4f38-b24a-f5a11465473c`

O indice vetorial com respectivo valor de TF e IDF pode ser encontrado na pasta [probabilistic-search-sri/backend/src/resources/data/corpus-index-vetorial](https://github.com/AlexandreNS/probabilistic-search-sri/tree/main/backend/src/resources/data/corpus-index-vetorial), arquivo com mesmo `uuid` do corpus.

**Apenas o valor do IDF é aproveitado na busca probabilista**

O indice de documentos relevantes é criado ao longo da execução do software e de acordo com o feedback do usuario ou cadastro na tela de Corpus.

## Requisitos

- NodeJS v14.0.0
- npm 6.14.4

## Instalação e Execução

Para instalação é necessario executar o comando padrão de instalação de pacotes do NPM:

```bash
# backend
# A partir da pasta raiz execute:

cd backend
npm i
```

```bash
# frontend
# A partir da pasta raiz execute:

cd frontend
npm i
```

Para executar os projetos execute `npm run start` dentro das pastas frontend e backend.

Talvez seja necessario configurar a url do backend, ela está configurada em `frontend/src/config/api_links.js`

## Projeto de Construção

Foi utilizado para o projeto o [Express](https://expressjs.com/) para a parte do Backend e o [ReactJS](https://reactjs.org/) para o Frontend

Para refinamento dos termos e construção do indice invertido foram utilizados os seguintes procedimentos:

- [html-entities](https://www.npmjs.com/package/html-entities) --> caracteres especiais do HTML
- Regex `/(<([^>]+)>)/ig` para a remoção de tags no arquivo
- Regex `/([^A-Za-zÀ-ÖØ-öø-ÿ]+)/ig` para manter apenas caracteres de texto
- Remoção de palavras com menos de 3 caracteres ou que estão na lista das [Stopwords](https://github.com/AlexandreNS/boolean-search-sri/blob/main/backend/src/resources/stopwords.js)
- Função de Stemming do pacote [natural](https://www.npmjs.com/package/natural)
- [lodash](https://www.npmjs.com/package/lodash) --> operações de busca dos termos para construir o indice

Para construção do indice vetorial com os valores de TF_IDF e IDF computados para cada termo foi realizado os seguintes procedimentos:

- Utilização do indice invertido citado anteriormente
- TF = `0.5 + ( 0.5 * freq_ij/max_I_freq_Ij )`
    - Com `freq_i`: frequencia do termo *i* no documento *j*
    - Com `max_I_freq_Ij`: a frequencia do termo mais frequente no documento *j*
- IDF = `log10( N/n_i )`
    - Com `n_i`: numero de documentos que contem o termo *i*
    - Com `N`: numero total de documentos do corpus
- TF_IDF = `TF * IDF`
**Apenas o valor do IDF é aproveitado na busca probabilista**

Para a função de busca e calculo da similaridade:

- Remoção das stopWords da String de busca
- Se no conjunto de termos da busca não contiver nenhum termo que remete a um documento relevante é considerado apenas o somatorio do IDF no calculo de similaridade
- Caso contrario para cada documento o calculo da similaridade é:
    - sim(Q, D) = `sum(weight(Q_i, D_i))`
        - Com `weight(Q_i, D_i) = log( (r * (N-R-n+r)) / ((n-r) * (R-r)) )`
        - `N`: documentos na coleção
        - `n`: documentos contendo o termo i
        - `R`: documentos marcados como relevantes
        - `r`: documentos relevantes contendo o termo i
- Ordenação por maior similaridade e filtro de score negativo

## Exemplo de Execução

Após a computação dos documentos do corpus, o sistema permite a realização do download de quatro arquivos em `.json`:  [corpus-index.json](https://github.com/AlexandreNS/probabilistic-search-sri/blob/main/backend/src/resources/data/corpus-index/80fa9a7d-ee4d-4f38-b24a-f5a11465473c-CRPC-sub-corpus-oral-espontEneo.json?raw=true), [list-docs.json](https://github.com/AlexandreNS/probabilistic-search-sri/blob/main/backend/src/resources/data/corpus/80fa9a7d-ee4d-4f38-b24a-f5a11465473c-CRPC-sub-corpus-oral-espontEneo.json?raw=true), [corpus-index-vetorial.json](https://github.com/AlexandreNS/probabilistic-search-sri/blob/main/backend/src/resources/data/corpus-index-vetorial/80fa9a7d-ee4d-4f38-b24a-f5a11465473c-CRPC-sub-corpus-oral-espontEneo.json?raw=true) e se especificado os termos relevantes pode-se baixar [relevant-terms.json](https://github.com/AlexandreNS/probabilistic-search-sri/blob/main/backend/src/resources/data/corpus-list-relevant/80fa9a7d-ee4d-4f38-b24a-f5a11465473c-CRPC-sub-corpus-oral-espontEneo.json?raw=true).

Para o corpus [CRPC sub-corpus oral espontÉneo.zip](https://github.com/AlexandreNS/term-frequency-sri/blob/main/CRPC%20sub-corpus%20oral%20espont%C3%89neo.zip?raw=true) foi possível realizar a busca `restaurante de comida estrangeira em portimão ou lisboa com jardins` como exemplificação da busca probabilista 1° interação e obter o seguinte resultado:

![Exemplo1](https://github.com/AlexandreNS/probabilistic-search-sri/blob/main/exemplo1.png?raw=true)

Após a marcação dos documentos 20 e 4 como relevantes para a consulta, ao realizar a pesquisa novamente vemos que eles ja começam a ser priorizados e tem o seu score aumentado:

![Exemplo2](https://github.com/AlexandreNS/probabilistic-search-sri/blob/main/exemplo2.png?raw=true)

## Contributing
Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

Please make sure to update tests as appropriate.

## License
[MIT](https://github.com/AlexandreNS/probabilistic-search-sri/blob/main/LICENSE)
const multer = require("multer");
const path = require('path');
const fs = require('fs');
const _ = require('lodash')
const multerConfig = require("../config/multer");

const databasePath = path.resolve(__dirname, "..", "resources", "data");

module.exports = (req, res, next) => {
  try{
    if (!req.params.uuid) {
      throw new Error('ID do corpus é obrigatorio');
    }

    let listCorpus = fs.readFileSync(`${databasePath}/list.json`, "utf8");
    listCorpus = JSON.parse(listCorpus);

    const corpus = _.find(listCorpus, { uuid: req.params.uuid });

    if (!corpus) {
      throw new Error(`Corpus não encontrado para o id: ${req.params.uuid}`);
    }

    const upload = multer(multerConfig).single('file');

    upload(req, res, (err) => {
      if (err instanceof Error) {
        res.status(400).json({error: err.message});
        return
      } else if (err) {
        res.status(400).json({error: 'Unknown error occurred when uploading'});
        return
      }
      req.corpusData = corpus;
      next();
    });

  } catch (err) {
    if (err instanceof Error) {
      res.status(400).json({error: err.message});
    } else {
      res.status(400).json({error: 'Unknown error'});
    }
  }
}
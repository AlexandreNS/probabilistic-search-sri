import React, { useEffect, useState, useRef, useMemo } from 'react';
import api from '../../services/api';

import { makeStyles } from '@material-ui/core/styles';

import Button from '@material-ui/core/Button';
import Alert from '@material-ui/lab/Alert';
import Box from '@material-ui/core/Box';
import Grid from '@material-ui/core/Grid';
import FormControl from '@material-ui/core/FormControl';
import InputLabel from '@material-ui/core/InputLabel';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import LinearProgress from '@material-ui/core/LinearProgress';

import DocsTable from '../../components/DocsTable';
import TransferList from '../../components/TransferList';
import { useParams } from 'react-router-dom';
import { Divider } from '@material-ui/core';

const initialItemForm = {encode: 'latin1', mode: 'html', files: []};

const useStyles = makeStyles((theme) => ({
  formControl: {
    margin: theme.spacing(1),
    minWidth: 120,
  },
  input: {
    display: 'none'
  },
  progressBar: {
    height: 10,
    margin: theme.spacing(1)
  },
  dividerButton: {
    margin: theme.spacing(1)
  }
}));

export default function CorpusDetail() {
  const classes = useStyles();
  const { uuid } = useParams();
  const [corpusInfo, setCorpusInfo] = useState({});
  const [alertError, setAlertError] = useState(false);
  const [alertSuccess, setAlertSuccess] = useState(false);
  const [itemForm, setItemForm] = useState(initialItemForm);
  const [validated, setValidated] = useState(false);
  const [openForm, setOpenForm] = useState(false);
  const [openFormTerms, setOpenFormTerms] = useState(false);
  const [listTermsRelevant, setListTermsRelevant] = useState([]);
  const [infoRelevantTerms, setInfoRelevantTerms] = useState({ terms: [], relevantTerms: [] });
  const [progressAtributes, setProgressAtributes] = useState({ value: 0, disabled: true });
  const [disabledFields, setDisabledFields] = useState(false);
  const fileInput = useRef(null);

  useEffect(() => {
    fetchCorpusDetail();
  }, []);
  
  const fetchCorpusDetail = async () => {
    try {
      const response = await api.get(`/corpus/${uuid}`);
      setCorpusInfo({ ...response.data });
    } catch (err) {
      setAlertError(true)
    }
  }

  const submitDocCorpus = async (file) => {
    const data = new FormData();

    data.append("file", file);
    data.append("mode", itemForm.mode);
    data.append("encode", itemForm.encode);

    return new Promise((resolve, reject) => {
      api.post(`/corpus/${uuid}/docs`, data).then((res) => {
        resolve(res);
      })
      .catch((err) => {
        setAlertError(true);
        clearFields();
        reject(err);
      });
    }); 
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const form = event.currentTarget;

    if (form.checkValidity() === false) {
      event.stopPropagation();
      setValidated(true);
      return
    }

    const total = itemForm.files.length;
    let count = 0;

    setProgressAtributes({ 
      disabled: false,
      value: parseInt(Math.round((count * 100) / total)) 
    });

    try {
      for (const file of itemForm.files) {
        await submitDocCorpus(file);
        setProgressAtributes({
          value: parseInt(Math.round(( ++count * 100) / total)) 
        });
      }
    } catch (err) {
      setAlertError(true)
    }

    clearFields();
    fetchCorpusDetail();
  };

  const generateIndexVetorial = async () => {
    try {
      await api.post(`/corpus/${uuid}/vetorial-index`);
      setAlertSuccess(true);
    } catch (err) {
      setAlertError(true);
    }
    fetchCorpusDetail();
  }

  const handleChange = event => {
    const field = event.target.name;
    setItemForm({ ...itemForm, [field]: event.target.value });
  }

  const handleChangeFile = event => {
    const field = event.target.name;
    setItemForm({ ...itemForm, [field]: event.target.files });
  }

  const handleClickOpenForm = () => {
    setOpenForm(true);
  };

  const handleCloseForm = () => {
    clearFields();
    setOpenForm(false);
  };

  const handleCloseFormTerms = () => {
    setOpenFormTerms(false);
  };

  const getDownloadFile = async ({ filename, docName }) => {
    const response = await api.get(`/files/${uuid}/${filename}`, {
        responseType: 'blob'
    });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(response.data);
    link.download = docName;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  const getCorpusInfo = async (type) => {
    const response = await api.get(`/corpus/${uuid}/${type}`, {
        responseType: 'blob'
    });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(response.data);
    link.download = `${uuid}-${type}.json`;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  const updateTermsRelevant = (right) => {
    setListTermsRelevant( [ ...right ] );
  }

  const handleRelevantTerms = async (docId) => {
    try {
      const response = await api.get(`/corpus/${uuid}/info-relevant-terms/${docId}`);
      const infoTermsDoc = response.data;

      const notRelevantTerms = infoTermsDoc.terms.filter( 
        v => !infoTermsDoc.relevantTerms.includes(v)
      );

      setInfoRelevantTerms({ ...response.data, terms: [ ...notRelevantTerms ] });
      setOpenFormTerms(true);
    } catch (err) {
      setAlertError(true)
    }
  }

  const saveRelevantTerms = async () => {
    try {
      await api.post(`/corpus/${uuid}/relevant-terms`, {
        docId: infoRelevantTerms.docId,
        replace: true,
        noStemming: true,
        terms: listTermsRelevant
      });
      setOpenFormTerms(false);
      fetchCorpusDetail();
    } catch {
      setAlertError(true);
    }
  }

  const clearFields = () => {
    setItemForm(initialItemForm);
    setDisabledFields(false);
    setValidated(false);
    fileInput.current.value = '';
  }

  const DocsTableMemo = useMemo(
    () => 
    <DocsTable 
      rows={corpusInfo.docsList} 
      onDownloadFile={getDownloadFile} 
      onRelevantTerms={handleRelevantTerms} 
      corpus_uuid={uuid}
    />, 
  [corpusInfo]);

  const TransferListMemo = useMemo(
    () => 
    <TransferList 
      left={infoRelevantTerms.terms} 
      right={infoRelevantTerms.relevantTerms}
      onUpdateData={updateTermsRelevant}
    />, 
  [infoRelevantTerms]);

  return (
    <>
      { 
        alertError ? (
          <Alert severity="error" onClose={() => setAlertError(false)}>
            Parece que houve algum erro para se conectar ao servidor :C !!!
          </Alert>
        ) : ('') 
      }

      { 
        alertSuccess ? (
          <Alert severity="success" onClose={() => setAlertSuccess(false)}>
            Ação realizada com sucesso :) !!!
          </Alert>
        ) : ('') 
      }
      <Box alignItems="center"  display="flex" p={1}>
        <Box p={1} flexGrow={1}>
          <h2>{corpusInfo.name || 'Carregando'}</h2>
          <p>
            <b>Data e Hora: </b> {corpusInfo.timestamp} <br />
            <b>Radicalização: </b> {corpusInfo.stemming ? 'Sim' : 'Não'} <br /> <br />
            <b>Index Vetorial: </b> {corpusInfo.vetorialIndex ? 'Sim' : 'Não'} <br />
            { corpusInfo.vetorialIndex ? 
              <> <b>Data Index Vetorial: </b> {corpusInfo.timestampVetorialIndex} </> : '' 
            } 
            <br /> <br />
            <b>Index Documentos Relevantes: </b> {corpusInfo.relevantIndex ? 'Sim' : 'Não'} <br />
            { corpusInfo.relevantIndex ? 
              <> <b>Ultima Atualização: </b> {corpusInfo.timestampRelevantIndex} </> : '' 
            }
          </p>
        </Box>
        <Box p={1} boxShadow={5} style={{ textAlign: 'right' }}>
          <Button variant="contained" color="secondary" onClick={handleClickOpenForm}>
            Adicionar Documento(s)
          </Button>
          <Divider className={classes.dividerButton} />
          <Button variant="contained" color="secondary" onClick={() => generateIndexVetorial()}>
            Gerar Index Vetorial
          </Button>
          <Divider className={classes.dividerButton} />
          <Button variant="contained" color="primary" onClick={() => getCorpusInfo('index')}>
            Baixar JSON indice
          </Button>
          <Divider className={classes.dividerButton} />
          <Button disabled={!corpusInfo.vetorialIndex} 
            variant="contained" color="primary" onClick={() => getCorpusInfo('vetorial-index')}
          >
              Baixar indice vetorial
          </Button>
          <Divider className={classes.dividerButton} />
          <Button disabled={!corpusInfo.relevantIndex} 
            variant="contained" color="primary" onClick={() => getCorpusInfo('relevant-terms')}
          >
            indice Documentos relevantes
          </Button>
          <Divider className={classes.dividerButton} />
          <Button variant="contained" color="primary" onClick={() => getCorpusInfo('list-docs')}>
            Baixar JSON lista de documentos
          </Button>
        </Box>
      </Box>
      { DocsTableMemo }

      {/* Formulario de Cadastro */}
      <Dialog
        disableBackdropClick
        disableEscapeKeyDown
        fullWidth={true} 
        maxWidth='sm' 
        open={openForm} 
        onClose={handleCloseForm} 
        aria-labelledby="form-dialog-title"
      >
        <form noValidate autoComplete="off" validated={ validated ? 'validated' : undefined } onSubmit={handleSubmit}>
          <DialogTitle id="form-dialog-title">Adicionar Docs em {`${corpusInfo.name}`}</DialogTitle>
          <DialogContent>
            <Grid
              container
              direction="column"
              alignItems="stretch"
            >
              <FormControl className={classes.formControl}>
                <InputLabel id="simple-select-label1">Enconde dos arquivos</InputLabel>
                <Select
                  required
                  disabled={disabledFields}
                  labelId="simple-select-label1"
                  id="encode-corpus"
                  name="encode"
                  value={itemForm.encode}
                  onChange={handleChange}
                  fullWidth
                >
                  <MenuItem value='utf8'>utf-8</MenuItem>
                  <MenuItem value='latin1'>latin1</MenuItem>
                  <MenuItem value='ascii'>ascii</MenuItem>
                </Select>
              </FormControl>

              <FormControl className={classes.formControl}>
                <InputLabel id="simple-select-label2">Tipo dos Arquivos</InputLabel>
                <Select
                  required
                  disabled={disabledFields}
                  labelId="simple-select-label2"
                  id="mode-corpus"
                  name="mode"
                  value={itemForm.mode}
                  onChange={handleChange}
                  fullWidth
                >
                  <MenuItem value='html'>Html</MenuItem>
                  <MenuItem value='txt'>Text Plain</MenuItem>
                </Select>
              </FormControl>
              <FormControl className={classes.formControl}>
                <input
                  required
                  multiple
                  disabled={disabledFields}
                  id="contained-button-file"
                  className={classes.input}
                  type="file"
                  accept="text/html, text/plain"
                  name="files"
                  ref={fileInput}
                  onChange={handleChangeFile}
                />
                <label htmlFor="contained-button-file">
                  <Button disabled={disabledFields} variant="contained" color="primary" component="span">
                    Anexar Arquivos
                  </Button>
                  <p>
                    {itemForm.files ? itemForm.files.length : 0} arquivos selecionados
                  </p>
                </label>
              </FormControl>
              <LinearProgress className={classes.progressBar} variant="determinate" value={progressAtributes.value} />
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button type="submit" color="primary">
              Enviar
            </Button>
            <Button onClick={handleCloseForm} color="primary">
              Cancelar
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Formulario de Termos Relevantes */}
      <Dialog
        disableBackdropClick
        disableEscapeKeyDown
        fullWidth={true} 
        maxWidth='lg' 
        open={openFormTerms} 
        onClose={handleCloseFormTerms} 
        aria-labelledby="form-dialog-terms"
      >
        <DialogTitle id="form-dialog-title">Gerenciar Termos do Documento Id: {`${infoRelevantTerms.docId}`}</DialogTitle>
        <DialogContent>
          <Grid
            container
            direction="column"
            alignItems="stretch"
          >
            { TransferListMemo }
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => saveRelevantTerms()} color="primary">
            Salvar
          </Button>
          <Button onClick={handleCloseFormTerms} color="default">
            Cancelar
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
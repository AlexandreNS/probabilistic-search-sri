import React, { useEffect, useState, useMemo } from 'react';
import api from '../../services/api';

import { makeStyles } from '@material-ui/core/styles';

import Alert from '@material-ui/lab/Alert';
import Box from '@material-ui/core/Box';
import Grid from '@material-ui/core/Grid';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';

import DocsTable from '../../components/DocsTable';
import { useParams } from 'react-router-dom';

const useStyles = makeStyles((theme) => ({
  searchLabel: {
    margin: theme.spacing(1),
    width: '100%',
  },
  input: {
    display: 'none'
  },
  progressBar: {
    height: 10,
    margin: theme.spacing(1)
  },
  searchResult: {
    marginTop: theme.spacing(5)
  }
}));

export default function SearchDocsVetorial() {
  const classes = useStyles();
  const { uuid } = useParams();
  const [corpusInfo, setCorpusInfo] = useState({ vetorialIndex: true });
  const [docsList, setDocsList] = useState([]);
  const [alertError, setAlertError] = useState(false);
  const [alertInfo, setAlertInfo] = useState(false);
  const [alertSearch, setAlertSearch] = useState(false);
  const [queryString, setQueryString] = useState("");

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

  const handleSubmit = async () => {
    try {
      if (!!queryString.trim()) {
        const response = await api.post(`/corpus/${uuid}/vetorial-search`, {
          query: queryString.trim().toLowerCase()
        });
        setDocsList([ ...response.data.docsList ]);
        setAlertSearch(true);
      } else {
        setAlertInfo(true);
      }
    } catch {
      setAlertError(true);
    }
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

  const DocsTableMemo = useMemo(
    () => <DocsTable rows={docsList} onDownloadFile={getDownloadFile} score={true} corpus_uuid={uuid}/>, 
  [docsList]);

  return (
    <>
      { 
        alertError ? (
          <Alert severity="error" onClose={() => setAlertError(false)}>
            Parece que houve algum erro para se conectar ao servidor :C !!!
          </Alert>
        ) : !corpusInfo.vetorialIndex ? (
          <Alert severity="error">
            Você precisa gerar o index vetorial antes <b>:\</b>
          </Alert>
        ) : ('') 
      }
      { 
        alertInfo ? (
          <Alert severity="info" onClose={() => setAlertInfo(false)}>
            Algum valor no campo não preenchido corretamente :C !!!
          </Alert>
        ) : ('') 
      }
      <Box justifyContent="center" alignItems="center" display="flex" p={1}>
        <Box p={1}>
          <h1 style={{textAlign: 'center'}}>Pesquisar em {corpusInfo.name || 'Carregando'}</h1>
        </Box>
      </Box>

      <Grid container>
        <Grid item xs={12} key='search-field'>
          <Box mt={3} alignItems="center" display="flex">
            <Box className={classes.searchLabel} p={1}>
              <TextField 
                id="search-field-text"
                value={queryString}
                onChange={(event) => setQueryString(event.target.value)}
                label="Pesquisa"
                variant="outlined" 
                fullWidth 
              />
            </Box>
            <Box p={1}>
              <Button 
                onClick={() => handleSubmit()}
                disabled={ !corpusInfo.vetorialIndex }
                variant="contained"
              >
                Pesquisar
              </Button>
            </Box>
          </Box>
        </Grid>
        <Grid className={classes.searchResult} item xs={12} key='result-search'>
          { docsList.length > 0 ? DocsTableMemo 
            : 
              alertSearch ? 
                <Alert severity="warning" onClose={() => setAlertSearch(false)}>
                  Nenhum Documento Encontrado !!!
                </Alert> 
              : 
                <Alert severity="info">
                  Busque algum documento no formulario acima !!!
                </Alert> 
          }
        </Grid>
      </Grid>
    </>
  );
}
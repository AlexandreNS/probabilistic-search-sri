import React, { useEffect, useState, useMemo } from 'react';
import api from '../../services/api';

import { makeStyles } from '@material-ui/core/styles';

import Alert from '@material-ui/lab/Alert';
import Box from '@material-ui/core/Box';
import Grid from '@material-ui/core/Grid';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import RadioGroup from '@material-ui/core/RadioGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Radio from '@material-ui/core/Radio';

import DocsTable from '../../components/DocsTable';
import { useParams } from 'react-router-dom';

const defaultOperations = ['AND', 'OR', 'NOT', '(', ')'];

const initialKeyboardParams = {termo_add: '', termo1_near: '', termo2_near: '', distance_near: '0'};

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

export default function SearchDocsBool() {
  const classes = useStyles();
  const { uuid } = useParams();
  const [corpusInfo, setCorpusInfo] = useState({});
  const [docsList, setDocsList] = useState([]);
  const [alertError, setAlertError] = useState(false);
  const [alertInfo, setAlertInfo] = useState(false);
  const [alertSearch, setAlertSearch] = useState(false);
  const [showKeyboard, setShowKeyboard] = useState(true);
  const [advancedQuery, setAdvancedQuery] = useState('');
  const [keyboardQuery, setKeyboardQuery] = useState({ text: '', expression: [] });
  const [keyboardParams, setKeyboardParams] = useState(initialKeyboardParams);
  
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
      if ((showKeyboard && keyboardQuery.text) || (!showKeyboard && advancedQuery)) {
        const response = await api.post(`/corpus/${uuid}/boolean-search`, {
          query: showKeyboard ? keyboardQuery.expression : advancedQuery ,
          typeQuery: showKeyboard ? 'keyboard' : 'advanced'
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

  const changeTypeSearch = (event) => {
    if (event.target.value === 'keyboard') {
      setShowKeyboard(true);
    } else {
      setShowKeyboard(false);
    }
  }

  const changeKeyboardSearch = (operation) => {
    let addValue = '';
    const { termo1_near, termo2_near, distance_near, termo_add } = keyboardParams;

    if (defaultOperations.includes(operation)) {
      addValue = [operation];
    } else if (operation === 'ADD') {
      addValue = [termo_add.toLowerCase()];
    } else if (operation === 'NEAR') {
      addValue = [
        'NEAR', 
        '(', 
        `${termo1_near.toLowerCase()}`, 
        ',', 
        `${distance_near}`, 
        ',', 
        `${termo2_near.toLowerCase()}`,
        ')', 
      ];
    }

    const search = {
      expression: [ ...keyboardQuery.expression ]
    };

    if (operation === 'BACKSPACE') {
      search.expression.pop();
    } else {
      search.expression.push( ...addValue );
    }

    search.text = search.expression.join(' ');
    setKeyboardQuery({ ...search });
    setKeyboardParams(initialKeyboardParams);
  }

  const changeKeyboardParams = event => {
    const field = event.target.name;
    setKeyboardParams({ ...keyboardParams, [field]: event.target.value });
  }

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
    () => <DocsTable rows={docsList} onDownloadFile={getDownloadFile} corpus_uuid={uuid}/>, 
  [docsList]);

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
                InputProps={{
                  readOnly: showKeyboard,
                }}
                id="search-field-text"
                value={showKeyboard ? keyboardQuery.text : advancedQuery}
                onChange={(event) => !showKeyboard ? setAdvancedQuery(event.target.value) : undefined}
                label={ showKeyboard ? "Pesquisa será montada pelo teclado" : "Pesquisa" }
                variant="outlined" 
                fullWidth 
              />
            </Box>
            <Box p={1}>
              <Button onClick={() => handleSubmit()} variant="contained">Pesquisar</Button>
            </Box>
          </Box>
        </Grid>
        <Grid item xs={12} key='type-search'>
          <Box alignItems="center" justifyContent="center" display="flex">
            <RadioGroup row aria-label="type-search" name="type-search" value={showKeyboard ? 'keyboard' : 'advanced'} onChange={changeTypeSearch}>
              <FormControlLabel value="advanced" control={<Radio />} label="Avançada" />
              <FormControlLabel value="keyboard" control={<Radio />} label="Teclado" />
            </RadioGroup>
          </Box>
        </Grid>
        <Grid item xs={12} key='keyboard-search'>
          <Box alignItems="center" flexDirection='column' justifyContent="center" display={ showKeyboard ? 'flex' : 'none'}>
            <Box key='addTerm-keyboard'>
              <Box alignItems="center" justifyContent="center" display="flex">
                <Box key='add-field' className={classes.searchLabel} p={1}>
                  <TextField 
                    id="termoadd-keyboard"
                    name='termo_add'
                    value={keyboardParams.termo_add}
                    onChange={changeKeyboardParams}
                    label="Termo" 
                    fullWidth 
                  />{' '}
                </Box>
                <Box key='add-button' p={1}>
                  <Button 
                    onClick={() => changeKeyboardSearch('ADD')}
                    disabled={!(keyboardParams.termo_add)}
                    variant="contained"
                  >
                    Add
                  </Button> 
                </Box>
              </Box>
            </Box>
            <Box key='nearTerm-keyboard'>
              <Box alignItems="center" justifyContent="center" display="flex">
                <Box key='near-fields' className={classes.searchLabel} p={1}>
                  <TextField 
                    id="termo1-keyboard"
                    name='termo1_near'
                    value={keyboardParams.termo1_near}
                    onChange={changeKeyboardParams}
                    label="Termo 1"
                  />{' '}

                  <TextField 
                    id="distance-keyboard"
                    name='distance_near'
                    value={keyboardParams.distance_near}
                    onChange={changeKeyboardParams}
                    type="number" 
                    label="Distancia" 
                  />{' '}

                  <TextField 
                    id="termo2-keyboard"
                    name='termo2_near'
                    value={keyboardParams.termo2_near}
                    onChange={changeKeyboardParams}
                    label="Termo 2" 
                  />{' '}
                </Box>
                <Box key='near-button' p={1}>
                  <Button
                    onClick={() => changeKeyboardSearch('NEAR')}
                    disabled={!(keyboardParams.termo1_near && keyboardParams.termo2_near && keyboardParams.distance_near)}
                    variant="contained"
                  >
                    Near
                  </Button> 
                </Box>
              </Box>
            </Box>
            <Box key='operation-keyboard' p={1}>
              {
                defaultOperations.map((value, idx) => (<>
                  <Button key={`${idx}-operation`} onClick={() => changeKeyboardSearch(value)} variant="contained">{value}</Button> {' '}
                </>))
              }
              <Button key='backspace-button' onClick={() => changeKeyboardSearch('BACKSPACE')} variant="contained">BACKSPACE</Button> {' '}
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
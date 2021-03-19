import React, { useEffect, useState } from 'react';
import api from '../../services/api';

import { makeStyles } from '@material-ui/core/styles';

import Button from '@material-ui/core/Button';
import Alert from '@material-ui/lab/Alert';
import Box from '@material-ui/core/Box';
import Grid from '@material-ui/core/Grid';
import FormControl from '@material-ui/core/FormControl';
import TextField from '@material-ui/core/TextField';
import InputLabel from '@material-ui/core/InputLabel';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';

import CorpusTable from '../../components/CorpusTable';

const initialItemForm = {name: '', stemming: 0};

const useStyles = makeStyles((theme) => ({
  formControl: {
    margin: theme.spacing(1),
    minWidth: 120,
  },
}));

export default function CorpusList() {
  const classes = useStyles();
  const [dataTable, setDataTable] = useState([]);
  const [alertError, setAlertError] = useState(false);
  const [itemForm, setItemForm] = useState(initialItemForm);
  const [validated, setValidated] = useState(false);
  const [openForm, setOpenForm] = useState(false);

  useEffect(() => {
    fetchCorpusList();
  }, []);
  
  const fetchCorpusList = async () => {
    try {
      const response = await api.get('/corpus');
      const tableData = response.data;
      tableData.reverse();
      setDataTable([ ...tableData ]);
    } catch (err) {
      setAlertError(true)
    }
  }

  const handleSubmit = async (event) => {
    event.preventDefault();
    const form = event.currentTarget;

    if (form.checkValidity() === false) {
      event.stopPropagation();
      setValidated(true);
      return
    }

    try {
      await api.post('/corpus', {
        name: itemForm.name,
        stemming: !!itemForm.stemming
      });
    } catch (err) {
      setAlertError(true)
    }

    setItemForm(initialItemForm);
    setValidated(false);
    setOpenForm(false);
    fetchCorpusList();
  };

  const handleChange = event => {
    const field = event.target.name
    setItemForm({ ...itemForm, [field]: event.target.value })
  }

  const handleClickOpenForm = () => {
    setOpenForm(true);
  };

  const handleCloseForm = () => {
    setItemForm(initialItemForm);
    setOpenForm(false);
  };

  return (
    <>
      { 
        alertError ? (
          <Alert severity="error" onClose={() => setAlertError(false)}>
            Parece que houve algum erro para se conectar ao servidor :C !!!
          </Alert>
        ) : ('') 
      }
      <Box alignItems="center"  display="flex" p={1}>
        <Box p={1} flexGrow={1}>
          <h2>Lista dos Corpus</h2>
        </Box>
        <Box p={1}>
          <Button variant="contained" color="secondary" onClick={handleClickOpenForm}>
              Criar
          </Button>
        </Box>
      </Box>
      <CorpusTable rows={dataTable}/>

      {/* Formulario de Cadastro */}
      <Dialog fullWidth={true} maxWidth='sm' open={openForm} onClose={handleCloseForm} aria-labelledby="form-dialog-title">
        <form noValidate autoComplete="off" validated={ validated ? 'validated' : undefined } onSubmit={handleSubmit}>
          <DialogTitle id="form-dialog-title">Criar novo Corpus</DialogTitle>
          <DialogContent>
            <Grid
              container
              direction="column"
              alignItems="stretch"
            >
              <FormControl className={classes.formControl}>
                <TextField
                  required
                  autoFocus
                  margin="normal"
                  id="name-corpus"
                  name="name"
                  label="Nome do Corpus"
                  type="text"
                  value={itemForm.name}
                  onChange={handleChange}
                  fullWidth
                />
              </FormControl>

              <FormControl className={classes.formControl}>
                <InputLabel id="simple-select-label">Radicalização</InputLabel>
                <Select
                  required
                  labelId="simple-select-label"
                  id="stemming-corpus"
                  name="stemming"
                  value={itemForm.stemming}
                  onChange={handleChange}
                  fullWidth
                >
                  <MenuItem value={0}>Não</MenuItem>
                  <MenuItem value={1}>Sim</MenuItem>
                </Select>
              </FormControl>
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
    </>
  );
}
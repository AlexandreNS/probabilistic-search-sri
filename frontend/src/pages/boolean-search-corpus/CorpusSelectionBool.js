import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { Link } from 'react-router-dom';

import Alert from '@material-ui/lab/Alert';
import Avatar from '@material-ui/core/Avatar';
import Box from '@material-ui/core/Box';
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import IconButton from '@material-ui/core/IconButton';
import Divider from '@material-ui/core/Divider';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';

import FolderIcon from '@material-ui/icons/Folder';
import LaunchIcon from '@material-ui/icons/Launch';
import InfoIcon from '@material-ui/icons/Info';

export default function CorpusSelectionBool() {
  const [dataTable, setDataTable] = useState([]);
  const [alertError, setAlertError] = useState(false);

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
          <h2>Selecione um Corpus:</h2>
        </Box>
      </Box>
      <Grid container justify="center" spacing={2}>
        <Grid item xs={12} md={6}>
          <Paper elevation={2}>
            <List>
              {
                dataTable.length ? 
                  dataTable.map((value, idx) => (
                    <>
                    <ListItem key={idx}>
                      <ListItemAvatar>
                        <Avatar>
                          <FolderIcon />
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={value.name}
                        secondary={value.timestamp}
                      />
                      <ListItemSecondaryAction>
                        <IconButton 
                          edge="end" 
                          aria-label="open"
                          color="secondary"
                          component={Link} 
                          to={`/boolean-search/corpus/${value.uuid}`}
                        >
                          <LaunchIcon />
                        </IconButton>
                      </ListItemSecondaryAction>
                    </ListItem>
                    <Divider />
                    </>
                  )) : 
                  (
                    <ListItem>
                      <ListItemAvatar>
                        <Avatar>
                          <InfoIcon />
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary="Nenhum Corpus Cadastrado"
                      />
                    </ListItem>
                  )
              }
            </List>
          </Paper>
        </Grid>
      </Grid>
    </>
  );
}
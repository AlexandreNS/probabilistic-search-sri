import React from 'react';
import { Link } from 'react-router-dom';

import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';

import HomeIcon from '@material-ui/icons/Home';
import NoteAddIcon from '@material-ui/icons/NoteAdd';
import SearchIcon from '@material-ui/icons/Search';
import InfoIcon from '@material-ui/icons/Info';

export const linksList = (
  <>
    <ListItem button component={Link} to="/">
      <ListItemIcon>
        <HomeIcon />
      </ListItemIcon>
      <ListItemText primary="Pagina Inicial" />
    </ListItem>
    <ListItem button component={Link} to="/corpus">
      <ListItemIcon>
        <NoteAddIcon />
      </ListItemIcon>
      <ListItemText primary="Corpus" />
    </ListItem>
    <ListItem button component={Link} to="/boolean-search/corpus">
      <ListItemIcon>
        <SearchIcon />
      </ListItemIcon>
      <ListItemText primary="Pesquisa Booleana" />
    </ListItem>
    <ListItem button component={Link} to="/vetorial-search/corpus">
      <ListItemIcon>
        <SearchIcon />
      </ListItemIcon>
      <ListItemText primary="Pesquisa Vetorial" />
    </ListItem>
    <ListItem button component={Link} to="/probabilistic-search/corpus">
      <ListItemIcon>
        <SearchIcon />
      </ListItemIcon>
      <ListItemText primary="Pesquisa Probabilística" />
    </ListItem>
  </>
);

export const aboutLink = (
  <>
    <ListItem button component={Link} to="/sobre">
      <ListItemIcon>
        <InfoIcon />
      </ListItemIcon>
      <ListItemText primary="Sobre"/>
    </ListItem>
  </>
);
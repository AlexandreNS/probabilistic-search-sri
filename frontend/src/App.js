import React from 'react';
import { Switch, Route } from 'react-router-dom'

import AppBar from '@material-ui/core/AppBar';
import Drawer from '@material-ui/core/Drawer';
import Box from '@material-ui/core/Box';
import Typography from '@material-ui/core/Typography';
import Container from '@material-ui/core/Container';
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import Link from '@material-ui/core/Link';

import useStyles from './config/styles';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import About from './pages/About';
import CorpusList from './pages/corpus/CorpusList';
import CorpusDetail from './pages/corpus/CorpusDetail';
import CorpusSelectionBool from './pages/boolean-search-corpus/CorpusSelectionBool';
import SearchDocsBool from './pages/boolean-search-corpus/SearchDocsBool';
import CorpusSelectionVetorial from './pages/vetorial-search-corpus/CorpusSelectionVetorial';
import SearchDocsVetorial from './pages/vetorial-search-corpus/SearchDocsVetorial';
import CorpusSelectionProbabilistic from './pages/probabilistic-search-corpus/CorpusSelectionProbabilistic';
import SearchDocsProbabilistic from './pages/probabilistic-search-corpus/SearchDocsProbabilistic';

function Copyright() {
  return (
    <Typography variant="body2" color="textSecondary" align="center">
      {'Copyright © '}
      <Link color="inherit" href="https://github.com/AlexandreNS" target="_blanck">
        Veja Mais Projetos Aqui
      </Link>{' '}
      {new Date().getFullYear()}
      {'.'}
    </Typography>
  );
}

export default function App() {
  const classes = useStyles();

  return (
    <div className={classes.root}>
      <Navbar />
      <main className={classes.content}>
        <div className={classes.appBarSpacer} />
        <Container maxWidth="lg" className={classes.container}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Paper className={classes.paper}>
                <Switch>
                  <Route exact path="/" component={Home} />
                  <Route exact path="/corpus" component={CorpusList} />
                  <Route exact path="/corpus/:uuid" component={CorpusDetail} />
                  <Route exact path="/boolean-search/corpus" component={CorpusSelectionBool} />
                  <Route exact path="/boolean-search/corpus/:uuid" component={SearchDocsBool} />
                  <Route exact path="/vetorial-search/corpus" component={CorpusSelectionVetorial} />
                  <Route exact path="/vetorial-search/corpus/:uuid" component={SearchDocsVetorial} />
                  <Route exact path="/probabilistic-search/corpus" component={CorpusSelectionProbabilistic} />
                  <Route exact path="/probabilistic-search/corpus/:uuid" component={SearchDocsProbabilistic} />
                  <Route path="/sobre" component={About} />
                </Switch>
              </Paper>
            </Grid>
          </Grid>
          <Box pt={4}>
            <Copyright />
          </Box>
        </Container>
      </main>
    </div>
  );
}

import { Link } from 'react-router-dom';

import Table from '@material-ui/core/Table';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableBody from '@material-ui/core/TableBody';
import TableRow from '@material-ui/core/TableRow';
import TableCell from '@material-ui/core/TableCell';
import Button from '@material-ui/core/Button';


function Row(props) {
  const { row } = props;

  return (
    <>
      <TableRow>
        <TableCell>{row.id}</TableCell>
        <TableCell>{row.name}</TableCell>
        <TableCell>{row.timestamp}</TableCell>
        <TableCell align='right'>
          <Button 
            variant="contained" 
            color="primary"
            component={Link} 
            to={`/corpus/${row.uuid}`}
          >
            Editar
          </Button>
        </TableCell>
      </TableRow>
    </>
  );
}

export default function CorpusTable(props) {
  const { rows = [] } = props;

  return (
    <TableContainer>
    <Table>
      <TableHead>
        <TableRow>
          <TableCell>#</TableCell>
          <TableCell>Nome</TableCell>
          <TableCell>Data e Hora</TableCell>
          <TableCell align='right'>Ações</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {rows.map((row, idx) => (
          <Row key={idx} row={{ ...row, id: idx }} />
        ))}
      </TableBody>
    </Table>
    </TableContainer>
  );
}
import { base_url } from '../config/api_links';

import Table from '@material-ui/core/Table';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableBody from '@material-ui/core/TableBody';
import TableRow from '@material-ui/core/TableRow';
import TableCell from '@material-ui/core/TableCell';
import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';

import ThumbUpIcon from '@material-ui/icons/ThumbUp';
import ThumbDownIcon from '@material-ui/icons/ThumbDown';
import EditOutlinedIcon from '@material-ui/icons/EditOutlined';

function Row(props) {
  const { row, onDownloadFile, onRelevantVote, onRelevantTerms, score } = props;

  return (
    <>
      <TableRow>
        <TableCell>{row.id}</TableCell>
        <TableCell>{row.docName}</TableCell>
        { score ? <TableCell>{row.score}</TableCell> : '' }

        { onRelevantVote ? 
          <TableCell>
            <IconButton 
              onClick={() => onRelevantVote('add', row.id)} 
              aria-label="thumb-up" 
              color="primary"
            >
              <ThumbUpIcon />
            </IconButton>
            <IconButton 
              onClick={() => onRelevantVote('remove', row.id)} 
              aria-label="thumb-down" 
              color="secondary"
            >
              <ThumbDownIcon />
            </IconButton>
          </TableCell> : '' }

        { onRelevantTerms ? 
          <TableCell>
            <IconButton 
              onClick={() => onRelevantTerms(row.id)} 
              aria-label="edit-outlined" 
              color="primary"
            >
              <EditOutlinedIcon />
            </IconButton>
          </TableCell> : '' }

        <TableCell align='right'>
          <Button 
            variant="contained" 
            color="primary"
            onClick={() => onDownloadFile(row)}
          >
            Baixar
          </Button>
          {' '}
          <Button 
            variant="contained" 
            color="default"
            component='a'
            href={`${base_url}/files/${row.corpus_uuid}/${row.filename}`}
            target='_blanck'
          >
            Visualizar
          </Button>
        </TableCell>
      </TableRow>
    </>
  );
}

export default function DocsTable(props) {
  const { 
    rows = [], 
    onDownloadFile, 
    onRelevantVote = false,
    onRelevantTerms = false,
    corpus_uuid, 
    score = false 
  } = props;

  return (
    <TableContainer>
    <Table>
      <TableHead>
        <TableRow>
          <TableCell>Doc Id</TableCell>
          <TableCell>Nome do Documento</TableCell>
          { score ? <TableCell>Score</TableCell> : '' }
          { onRelevantVote ? <TableCell>Feedback</TableCell> : '' }
          { onRelevantTerms ? <TableCell>Relevancia</TableCell> : '' }
          <TableCell align='right'>Ações</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {rows.map((row) => (
          <Row 
            key={row.id} 
            row={{ ...row, corpus_uuid }} 
            score={score} 
            onDownloadFile={onDownloadFile}
            onRelevantVote={onRelevantVote}
            onRelevantTerms={onRelevantTerms}
          />
        ))}
      </TableBody>
    </Table>
    </TableContainer>
  );
}
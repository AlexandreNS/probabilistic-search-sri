import Alert from '@material-ui/lab/Alert';
import AlertTitle from '@material-ui/lab/AlertTitle';

export default function Home() {
  return (
    <>
      <h2>Sistema de Recuperação da Informação</h2>
      <Alert severity="info">
        <AlertTitle>Info</AlertTitle>
        Comece <strong>cadastrando</strong> uma coleção de documentos ou <strong>pesquise</strong> em uma já existente
      </Alert>
      <p>Desenvolvido por Alexandre Silva</p>
    </>
  );
}
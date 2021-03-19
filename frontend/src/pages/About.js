import Link from '@material-ui/core/Link';

export default function About() {
  return (
    <>
      <h2>Sobre</h2>
      <p>
        Desenvolvido por {' '}
        <Link color="inherit" href="https://github.com/AlexandreNS" target="_blanck">
          Alexandre Silva
        </Link> 
        <br /> 
        Disciplina de Organização e Recurperação da Informação
      </p>
    </>
  );
}
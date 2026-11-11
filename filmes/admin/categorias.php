<?php 
	include('conexao.php');
?>

<!DOCTYPE html>
<html lang="pt-br">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Categorias</title>
    <link rel="stylesheet" href="style.css">
  </head>
  <body>
    <ul>
        <li><a href="categorias.html">Categorias</li>
        <li><a href="filmes.html">Filmes</a></li>
    </ul>
    <main>
        <form>
            <h2>Categorias</h2>
            <input type="text" name="categoria">
            <button name="salvar">Salvar</button>
        </form>
    </main>
  </body>
</html>

<?php
  /*Inserir dados na tabela categorias*/
	if(isset($_GET['salvar'])){
		$nomeCategoria = $_GET['categoria'];

    $sql = "INSERT INTO categorias (nome) values ('$nomeCategoria')";

    if($conexao ->query($sql)){
      echo "Gravou com sucesso";
    }else {
      echo "Deu ruim da silva";
    } 
	}
  /*Buscar dados da tabela categorias*/
  $sql = "SELECT * FROM categorias";
  $resultado = $conexao -> query($sql);
 ?>

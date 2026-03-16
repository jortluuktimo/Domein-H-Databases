<?php
session_start();

    include("connection.php");
    include("functions.php");

?>


<!doctype html>
<html lang="nl">
    <head>
        <meta charset="utf8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <link rel="icon" href="data:,">
        <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.2.3/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-rbsA2VBKQhggwzxH7pPCaAqO46MgnOM80zW1RWuH61DGLwZJEdK2Kadq2F9CUG65" crossorigin="anonymous">
        <link rel="stylesheet" href="csspaginas/login.css">
        <title>Aanmelden  </title>
    </head>
    <body>
        <header class="navbar">
            <div class="logo">
                <img src="fotos/ChatGPT Image 18 feb 2026, 11_26_43.png" class="headerfoto">
                <div>LUCHTHEUVELS</div>
            </div>
            <div class="paginas">
                    <a href="index.php" class="pagina-link">Home</a>
            </div>
        </header>
        <div class="container">
            <form method="post">
                <h1>Aanmelden</h1>
                <p>Username</p>
                <input class="tekstvlak" type="text" name="user_name"><br><br>
                <p>Password</p>
                <input class="tekstvlak" type="password" name="password"><br><br>

                <input class="knop"type="submit" value="Aanmelden"><br><br>

                <a href="login.php">Heb je al een account? Log hier in!</a><br><br>
            </form>
            
        </div>
    </body>
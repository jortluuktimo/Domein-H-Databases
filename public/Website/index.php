<?php
session_start();
    $_SESSION;
?>

<!doctype html>
<html lang="nl">
    <head>
        <meta charset="utf8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <link rel="icon" href="data:,">
        <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.2.3/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-rbsA2VBKQhggwzxH7pPCaAqO46MgnOM80zW1RWuH61DGLwZJEdK2Kadq2F9CUG65" crossorigin="anonymous">
        <link rel="stylesheet" href="csspaginas/index.css">
        <title>Thuispagina</title>
    </head>
    <body>
        <header class="navbar">
            <div class="logo">
                <img src="fotos/ChatGPT Image 18 feb 2026, 11_26_43.png" class="headerfoto">
                <div>LUCHTHEUVELS</div>
            </div>
            <div class="paginas">
                    <a href="login.php" class="pagina-link">Log in</a>
                    <a href="signup.php" class="pagina-link">Sign up</a>
            </div>
        </header>
        <div class="container">
            <div>
                <h1 class="titel">Welkom</h1>
                <p class="beschrijving">Hier kun je al je favoriete casinospellen spelen, van blackjack tot roulette en nog veel meer. Doe mee aan spannende toernooien, win grote prijzen en geniet van een veilige en eerlijke speelomgeving. Waar wacht je nog op? Meld je vandaag nog aan en begin met spelen!</p>
            </div>
            <a href="login.php">
                <div class="knopslag">
                   Begin met spelen!
                </div>
            </a>
        </div>
    </body>
</html>
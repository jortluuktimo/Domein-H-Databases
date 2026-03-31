<?php
    session_start();
    include("connection.php");
    include("functions.php");

    $user_data = check_login($con);

    $wallet_query = "SELECT saldo FROM usermoney WHERE user_id = '" . $user_data['user_id'] . "'";
    $wallet_result = mysqli_query($con, $wallet_query);
    $wallet_data = mysqli_fetch_assoc($wallet_result);
    $saldo = $wallet_data['saldo'];
    $rijkmelding = "";

    if($_SERVER['REQUEST_METHOD'] == "POST") {
        $storting = $_POST['storting'];
        if(is_numeric($storting) && $storting > 0) {
            $update_query = "UPDATE usermoney SET saldo = saldo + '$storting' WHERE user_id = '" . $user_data['user_id'] . "'";

            mysqli_query($con, $update_query);

            header("Location: casinohome.php");
            die;
        }
    }
    
    if($saldo > 10000) {
        $rijkmelding = "Jij bent echt een rijke speler!";
    }



?>

<!doctype html>
<html lang="nl">
    <head>
        <meta charset="utf8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <link rel="icon" href="data:,">
        <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.2.3/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-rbsA2VBKQhggwzxH7pPCaAqO46MgnOM80zW1RWuH61DGLwZJEdK2Kadq2F9CUG65" crossorigin="anonymous">
        <link rel="stylesheet" href="../Website/csspaginas/index.css">
        <title>Casino pagina</title>
    </head>
    <body>
        <header class="navbar">
            <div class="logo">
                <img src="fotos/ChatGPT Image 18 feb 2026, 11_26_43.png" class="headerfoto">
                <div>LUCHTHEUVELS</div>
            </div>
            <div class="paginas">
                    <a href="login.php" class="pagina-link">Uitloggen</a>
            </div>
        </header>
        <div class="container">
            <div>
                <h1 class="titel">Welkom, <?php echo $user_data['user_name']; ?>!</h1>
                <p>Saldo: €<?php echo number_format($wallet_data['saldo'], 2, ',', '.'); ?></p>
                <p class="rijkmelding"><?php echo $rijkmelding; ?></p><br>

                <form method="post">
                    <div class="storting-container">
                        <span class="euro-teken">€</span>
                        <input type="number" name="storting" min="0" step="0.01" placeholder="0.00" class="storting-input">
                        <button type="submit" name="storten" class="storting-knop">Storten</button>
                    </div>
                </form>
        
            </div>

        </div>

        <div class="spellen-container">
            <div class="spel-kaart">
                <img src="fotos/blackjack.jpg" class="spel-foto" alt="Blackjack">
                <h2 class="spel-titel">Blackjack</h2>
                <p class="spel-uitleg">Probeer zo dicht mogelijk bij 21 te komen zonder over te gaan. Verslaat de dealer en win groot!</p>
                <a href="blackjack.php" class="spelen-knop">Spelen!</a>
            </div>

            <div class="spel-kaart">
                <img src="fotos/roulette.jpg" class="spel-foto" alt="Roulette">
                <h2 class="spel-titel">Roulette</h2>
                <p class="spel-uitleg">Zet in op een getal, kleur of rij en hoop dat het balletje jouw kant op rolt. Klassiek casinoplezier!</p>
                <a href="roulette.php" class="spelen-knop">Spelen!</a>
            </div>

            <div class="spel-kaart">
                <img src="fotos/slots.jpg" class="spel-foto" alt="Slots">
                <h2 class="spel-titel">Slots</h2>
                <p class="spel-uitleg">Draai de rollen en match de symbolen. Simpel, snel en met een beetje geluk win je de jackpot!</p>
                <a href="slots.php" class="spelen-knop">Spelen!</a>
            </div>
        </div>

    </body>
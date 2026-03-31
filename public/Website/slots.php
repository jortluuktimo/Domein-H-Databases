<?php
ini_set('display_errors', 0);
error_reporting(0);
    session_start();
    include("connection.php");
    include("functions.php");

    $user_data = check_login($con);

    $wallet_query = "SELECT saldo FROM usermoney WHERE user_id = '" . $user_data['user_id'] . "'";
    $wallet_result = mysqli_query($con, $wallet_query);
    $wallet_data = mysqli_fetch_assoc($wallet_result);
    $saldo = $wallet_data['saldo'];

    if($_SERVER['REQUEST_METHOD'] == "POST" && isset($_POST['actie'])) {
        header('Content-Type: application/json');
        $actie = $_POST['actie'];
        $user_id = $user_data['user_id'];
 
    if($actie === 'get_saldo') {
        $result = mysqli_query($con, "SELECT saldo FROM usermoney WHERE user_id = '$user_id'");
        $row = mysqli_fetch_assoc($result);
        echo json_encode(['saldo' => $row['saldo']]);
        die;
    }
 
    if($actie === 'inzet') {
        $inzet = floatval($_POST['inzet']);
        $result = mysqli_query($con, "SELECT saldo FROM usermoney WHERE user_id = '$user_id'");
        $row = mysqli_fetch_assoc($result);
        $huidig = floatval($row['saldo']);
 
        if($inzet <= 0 || $inzet > $huidig) {
            echo json_encode(['success' => false, 'bericht' => 'Ongeldig bedrag']);
            die;
        }
 
        // Trek inzet af
        mysqli_query($con, "UPDATE usermoney SET saldo = saldo - $inzet WHERE user_id = '$user_id'");
        echo json_encode(['success' => true]);
        die;
    }
 
    if($actie === 'winst') {
        $winst = floatval($_POST['winst']);
        if($winst > 0) {
            mysqli_query($con, "UPDATE usermoney SET saldo = saldo + $winst WHERE user_id = '$user_id'");
        }
        $result = mysqli_query($con, "SELECT saldo FROM usermoney WHERE user_id = '$user_id'");
        $row = mysqli_fetch_assoc($result);
        echo json_encode(['success' => true, 'saldo' => $row['saldo']]);
    die;
    }
}



?>



<!doctype html>
<html lang="nl">
    <head>
        <meta charset="utf8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <link rel="icon" href="data:,">
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=Lato:wght@300;400;700&display=swap" >
        <link rel="stylesheet" href="../Website/csspaginas/spellen.css">
        <title>Slots</title>
    </head>
    <body>
        <header class="navbar">
            <div class="logo">
                <img src="fotos/ChatGPT Image 18 feb 2026, 11_26_43.png" class="headerfoto">
                <div>LUCHTHEUVELS</div>
            </div>
            <div class="paginas">
                    <a href="casinohome.php" class="pagina-link">Terug naar home</a>
            </div>
        </header>

        <div class="container">
        <h1 class="roulette-titel">SLOTS</h1>
        <div class="saldo-balk">
            💰 Saldo: €<span id="saldo-display"><?php echo number_format($saldo, 2, ',', '.'); ?></span>
        </div>

        </div>

        <main class="slots-wrapper">

        <div class="slots-midden">
 
    <div class="machine" id="machine">
        <div class="rollen-container">
            <div class="rol" id="rol-0">
                <div class="symbool-strip" id="strip-0"></div>
            </div>
            <div class="rol" id="rol-1">
                <div class="symbool-strip" id="strip-1"></div>
            </div>
            <div class="rol" id="rol-2">
                <div class="symbool-strip" id="strip-2"></div>
            </div>
        </div>
        <div class="lijn"></div>
    </div>
 
    <div class="inzet-rij">
        <span class="euro-label">€</span>
        <input type="number" id="inzet-input" min="0.5" max="100" step="0.5" value="1" class="inzet-veld">
        <div class="snelle-knoppen">
            <button class="snel-knop" onclick="setInzet(1)">€1</button>
            <button class="snel-knop" onclick="setInzet(5)">€5</button>
            <button class="snel-knop" onclick="setInzet(10)">€10</button>
            <button class="snel-knop" onclick="setInzet(25)">€25</button>
        </div>
    </div>
 
    <button class="speel-knop" id="speel-knop" onclick="draaiSlots()">
        <span id="knop-tekst">DRAAIEN</span>
    </button>
 
    <div class="resultaat-balk" id="resultaat-balk"></div>

    </div>
 
    <div class="uitleg-tabel">
        <h3>Uitbetalingen</h3>
        <table>
            <tr><td>🍒🍒🍒</td><td>2× inzet</td></tr>
            <tr><td>🍋🍋🍋</td><td>3× inzet</td></tr>
            <tr><td>🍊🍊🍊</td><td>4× inzet</td></tr>
            <tr><td>⭐⭐⭐</td><td>6× inzet</td></tr>
            <tr><td>💎💎💎</td><td>10× inzet</td></tr>
            <tr><td>🎰🎰🎰</td><td>20× inzet</td></tr>
            <tr><td>2× hetzelfde</td><td>1.2× inzet</td></tr>
        </table>
    </div>
 
</main>
 
<script>
    // Geef het huidige saldo door aan JS
    window.huidigSaldo = <?php echo $saldo; ?>;
</script>
<script src="slots.js"></script>
    </body>
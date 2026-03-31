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
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <link rel="icon" href="data:,">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Barlow:wght@400;600;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="csspaginas/spellen.css">
    <title>Blackjack – Luchtheuvels</title>
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

<main class="bj-wrapper">

    <div class="bj-header">
        <h1 class="bj-titel">BLACKJACK</h1>
        <div class="saldo-balk">
            💰 Saldo: €<span id="saldo-display"><?php echo number_format($saldo, 2, ',', '.'); ?></span>
        </div>
    </div>

    <div class="bj-tafel">
        <div class="bj-dealer-zone">
            <p class="zone-label">DEALER <span id="dealer-score" class="score-badge"></span></p>
            <div class="kaarten-rij" id="dealer-kaarten"></div>
        </div>
        <div class="bj-speler-zone">
            <div class="hand-wrapper" id="hand-wrapper">
                <div class="hand-blok" id="hand-0">
                    <p class="zone-label">JIJ <span id="speler-score-0" class="score-badge"></span></p>
                    <div class="kaarten-rij" id="speler-kaarten-0"></div>
                </div>
                <div class="hand-blok" id="hand-1" style="display:none">
                    <p class="zone-label">HAND 2 <span id="speler-score-1" class="score-badge"></span></p>
                    <div class="kaarten-rij" id="speler-kaarten-1"></div>
                </div>
            </div>
        </div>
    </div>

    <div class="bj-controls">
        <div class="inzet-sectie" id="inzet-sectie">
            <div class="inzet-rij">
                <span class="euro-label">€</span>
                <input type="number" id="inzet-input" min="1" max="500" step="1" value="10" class="inzet-veld">
            </div>
            <div class="snelle-knoppen">
                <button class="snel-knop" onclick="setInzet(5)">€5</button>
                <button class="snel-knop" onclick="setInzet(10)">€10</button>
                <button class="snel-knop" onclick="setInzet(25)">€25</button>
                <button class="snel-knop" onclick="setInzet(50)">€50</button>
                <button class="snel-knop" onclick="setInzet(100)">€100</button>
            </div>
            <button class="speel-knop bj-deal-knop" onclick="dealKaarten()">DEAL</button>
        </div>

        <div class="actie-knoppen verborgen" id="actie-knoppen">
            <button class="actie-knop" id="knop-hit" onclick="hit()">HIT</button>
            <button class="actie-knop" id="knop-stand" onclick="stand()">STAND</button>
            <button class="actie-knop secundair" id="knop-double" onclick="dubbelen()">DOUBLE</button>
            <button class="actie-knop secundair" id="knop-split" onclick="splitsen()">SPLIT</button>
        </div>
    </div>

    <div class="resultaat-balk" id="resultaat-balk"></div>

</main>

<script>
    window.huidigSaldo = <?php echo $saldo; ?>;
</script>
<script src="blackjack.js"></script>
</body>
</html>
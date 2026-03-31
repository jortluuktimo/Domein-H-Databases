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
    <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=Lato:wght@300;400;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="csspaginas/spellen.css">
    <title>Roulette – Luchtheuvels</title>
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

<main class="roulette-wrapper">

    <div class="roulette-links">
        <h1 class="roulette-titel">ROULETTE</h1>
        <div class="saldo-balk">
            💰 Saldo: €<span id="saldo-display"><?php echo number_format($saldo, 2, ',', '.'); ?></span>
        </div>

        <div class="wiel-container">
            <canvas id="roulette-wiel" width="340" height="340"></canvas>
            <div class="wiel-naald">▼</div>
            <div class="wiel-midden"></div>
        </div>

        <div id="resultaat-balk" class="resultaat-balk"></div>
    </div>

    <div class="roulette-rechts">
        <div class="inzet-sectie">
            <label class="inzet-label">Inzet</label>
            <div class="inzet-rij">
                <span class="euro-label">€</span>
                <input type="number" id="inzet-input" min="0.5" max="500" step="0.5" value="5" class="inzet-veld">
            </div>
            <div class="snelle-knoppen">
                <button class="snel-knop" onclick="setInzet(1)">€1</button>
                <button class="snel-knop" onclick="setInzet(5)">€5</button>
                <button class="snel-knop" onclick="setInzet(10)">€10</button>
                <button class="snel-knop" onclick="setInzet(25)">€25</button>
                <button class="snel-knop" onclick="setInzet(50)">€50</button>
            </div>
        </div>

        <div class="keuze-sectie">
            <p class="keuze-label">Kies je inzet</p>

            <div class="keuze-groep">
                <p class="groep-titel">Kleur <span class="uitbetaling-badge">2×</span></p>
                <div class="keuze-rij">
                    <button class="keuze-knop rood" id="keuze-rood" onclick="selecteerKeuze('kleur', 'rood', this)">🔴 Rood</button>
                    <button class="keuze-knop zwart" id="keuze-zwart" onclick="selecteerKeuze('kleur', 'zwart', this)">⚫ Zwart</button>
                </div>
            </div>

            <div class="keuze-groep">
                <p class="groep-titel">Even / Oneven <span class="uitbetaling-badge">2×</span></p>
                <div class="keuze-rij">
                    <button class="keuze-knop" id="keuze-even" onclick="selecteerKeuze('pariteit', 'even', this)">Even</button>
                    <button class="keuze-knop" id="keuze-oneven" onclick="selecteerKeuze('pariteit', 'oneven', this)">Oneven</button>
                </div>
            </div>

            <div class="keuze-groep">
                <p class="groep-titel">Enkel getal <span class="uitbetaling-badge">36×</span></p>
                <div class="getallen-grid" id="getallen-grid"></div>
            </div>
        </div>

        <button class="speel-knop" id="speel-knop" onclick="draaiRoulette()">
            <span id="knop-tekst">DRAAIEN</span>
        </button>
    </div>

</main>

<script>
    window.huidigSaldo = <?php echo $saldo; ?>;
</script>
<script src="roulette.js"></script>
</body>
</html>
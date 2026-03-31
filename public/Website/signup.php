<?php
session_start();
    require("connection.php");
    include("functions.php");  

    $error = "";
    if($_SERVER['REQUEST_METHOD'] == "POST") {
        //something was posted
        $user_name = $_POST['user_name'];
        $password = $_POST['password'];
    

        if(!empty($user_name) && !empty($password) && !ctype_digit($user_name)) 
        {
            //save to database
            $user_id = random_num(20);
            $query = "insert into users (user_id,user_name,password) values ('$user_id','$user_name','$password')";

            mysqli_query($con, $query);

            $wallet_query = "INSERT INTO usermoney (user_id, saldo) VALUES ('$user_id', 0.00)";
            
            mysqli_query($con, $wallet_query);

            header("Location: login.php");
            die;

        }
        else {
            $error = "Vul alsjeblieft alle velden in!";
        }
    }

           
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

                <input class="knop"type="submit" value="Aanmelden">

                <p class="error"><?php echo $error; ?></p><br>

                <a href="login.php">Heb je al een account? Log hier in!</a><br><br>
            </form>
            
        </div>
    </body>
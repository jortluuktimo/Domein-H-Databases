<?php


    $dbhost = "localhost:80";
    $dbuser = "root";
    $dbpass = "";
    $dbname = "accounts";

    if(!$con = mysqli_connect($dbhost, $dbuser, $dbpass, $dbname))
    {
        die("failed to connect!");
    }

?>
<?php



ini_set('display_errors', 1);
error_reporting(E_ALL);

    $con = new mysqli("127.0.0.1", "user", "password", "accounts");
    if ($result = $con->query("SHOW databases")) {
        $databases = array();
        while ($row = $result->fetch_row()) {
            $dbName = $row[0];
            // Filter out internal databases
            if ($dbName != "information_schema" && $dbName != "performance_schema" && $dbName != "sys" && $dbName != "mysql") {
                $databases[] = $dbName;
            }
        }
        $result->free_result();
    }

?>
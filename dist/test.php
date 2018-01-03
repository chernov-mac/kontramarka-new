<?php
// Тестовый AJAX для проверки прелоадера
$action = $_REQUEST['action'];
if($action == 'getdata_for_preloader'){
    sleep(5);

    $bufer = json_encode(array(
        'success' => true,
        'responseText' => 'Vasya',
    ));

    @header('Content-type: application/json;'); die($bufer);
}

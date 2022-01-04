<?php
$token = $_SERVER['REDCAP_TEST_TOKEN']; // /etc/profile.d/bcwc.sh
$url = 'https://redcap.surgery.wisc.edu/redcap/api/';
$fields = ['demo_gender', 'demo_race', 'demo_ethnicity'];

$data = [
    'token' => $token,
    'content' => 'record',
    'action' => 'export',
    'format' => 'json',
    'type' => 'flat',
    'csvDelimiter' => '',
    'fields' => $fields,
    'rawOrLabel' => 'raw',
    'rawOrLabelHeaders' => 'raw',
    'exportCheckboxLabel' => 'false',
    'exportSurveyFields' => 'false',
    'exportDataAccessGroups' => 'false',
    'returnFormat' => 'json'
];
$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
curl_setopt($ch, CURLOPT_VERBOSE, 0);
curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
curl_setopt($ch, CURLOPT_AUTOREFERER, true);
curl_setopt($ch, CURLOPT_MAXREDIRS, 10);
curl_setopt($ch, CURLOPT_CUSTOMREQUEST, 'POST');
curl_setopt($ch, CURLOPT_FRESH_CONNECT, 1);
curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query($data, '', '&'));
$response = curl_exec($ch);
curl_close($ch);

header('Content-Type: application/json; charset=utf-8');
echo $response; # Redcap sends back json

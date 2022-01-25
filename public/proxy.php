<?php
$token = trim(file_get_contents("/home/bcwc/secret")); // Read in token from home directory
$url = 'https://redcap.surgery.wisc.edu/redcap/api/';
$fields = [
    'record_id',
    'rescreen_me', 'screen_site', 'screen_datetime', 'decision_final', 'screen_neph_exclude',
    'screen_approach_method', 'first_neph_seen', 'facit_t0_complete', 'pt_t1_qoc_complete', 'first_appt_date'
];
$events = ['screen_arm_1', 'first_study_visit_arm_1', 't0_arm_1', 't1_arm_1'];

$data = [
    'token' => $token,
    'content' => 'record',
    'format' => 'json',
    'type' => 'flat',
    'csvDelimiter' => '',
    'fields' => $fields,
    'events' => $events,
    'rawOrLabel' => 'raw',
    'rawOrLabelHeaders' => 'raw',
    'exportCheckboxLabel' => 'false',
    'exportSurveyFields' => 'false',
    'exportDataAccessGroups' => 'true',
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

$response = json_decode($response, true);
$formatted = [];
$idCache = [];
foreach ($response as $instance) {
    $record = $instance['record_id'];
    unset($instance['record_id']);
    unset($instance['redcap_event_name']);
    $idCache[$record] = $idCache[$record] ?? uniqid();
    $record = $idCache[$record];
    $formatted[$record] = array_merge(
        $formatted[$record] ?? [],
        array_filter($instance, fn ($value) => !is_null($value) && $value !== '')
    );
}

header('Content-Type: application/json; charset=utf-8');
echo json_encode($formatted);

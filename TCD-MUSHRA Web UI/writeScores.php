<?php
	if( !isset($_GET['trial_scores']) ) { $trial_scores = "trialScoresError"; }
	if( !isset($_GET['timestamp']) ) { $timestamp = "timestampError"; }
	$trial_scores = json_decode($_GET['trial_scores']);
	$timestamp = json_decode($_GET['timestamp']);
	
	//fast way with serialize
	file_put_contents("scores/".$timestamp.".txt", serialize($trial_scores), FILE_APPEND);
?>
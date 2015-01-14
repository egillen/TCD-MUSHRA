<?php
	$randomize = 0;
	if( isset($_GET['randomize_flag']) ) 
	{
		if ( $_GET['randomize_flag'] == "true")
		{
			$randomize = 1; 
		}
	}
	$test_info_file = "newSprites_info.spr";
	//currently working with windows-style line endings, check this in input file if receiving no output
	if (!($lines = file($test_info_file, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES))) 
	{
		die("Can't open test info file");
	}
	$randomindices = array();
	$clipnames = array();
	$full_trial_array = array();
	$starttimes = array();
	$endtimes = array();
	$i = 1;
	$j = 0;
	//grab the music sprite info which is in between lines with # on them
	while ($i<count($lines))
	{
		if (strcmp($lines[$i][0], '#') === 0)
		{
			$full_trial_array[$j] = array();
			$i++;
			$full_trial_array[$j][0] = $lines[$i];
			$i++;
			if (strcmp(substr($lines[$i], 0, 6), 'clips:') === 0)
			{
				$full_trial_array[$j][1] = explode(',', substr($lines[$i], 6));
			}
			else
			{
				die("error at line {$i} of sprite info file");
			}
			$i++;
			if (strcmp(substr($lines[$i], 0, 6), 'start:') === 0)
			{
				$full_trial_array[$j][2] = explode(',', substr($lines[$i], 6));
			}
			else
			{
				die("error at line {$i} of sprite info file");
			}
			$i++;
			if (strcmp(substr($lines[$i], 0, 4), 'end:') === 0)
			{
				$full_trial_array[$j][3] = explode(',', substr($lines[$i], 4));
			}
			else
			{
				die("error at line {$i} of sprite info file");
			}
			$j++;
		}
		$i++;
	}
	// n.b. this method only works if each trial in the MUSHRA test has the same number of clips
	for ($i=1; $i<count($full_trial_array[0][1]); $i++) //don't include 0, it's used for the visible reference
	{
		$randomindices[$i] = $i;
	}
	for ($i=0; $i<count($full_trial_array); $i++)
	{
		if ($randomize)
		{
			// create arrays of shuffled indices to use as mappings for test mode
			shuffle($randomindices);
		}
		$full_trial_array[$i][4] = $randomindices;
	} 
	if ($randomize)
	{
		// shuffle the order of the trials
		shuffle($full_trial_array);
	}
	echo json_encode($full_trial_array); 
?>
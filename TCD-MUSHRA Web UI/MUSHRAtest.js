
// IIFE - Immediately Invoked Function Expression
(function(mushratest) {

	// The global jQuery object is passed as a parameter
	mushratest(window.jQuery, window, document);

}(function($, window, document) {

	// The $ is now locally scoped 

	// Listen for the jQuery ready event on the document
	$(function() {
		$position_time_slider.on("mouseup", positionSliderMouseUp);
		$position_time_slider.on("mousedown", positionSliderMouseDown);
		$position_time_slider.data("user_grabbed_slider", "false");
		$("#next_button").on("click", nextTrial);
		$("#play_button").on("click", playAudio);
		$("#pause_button").on("click", pauseAudio);
		$loop_button.on("click", toggleLoop);
		$("#fullscreen_button").on("click", goFullScreen);
		$start_time_slider.on("input", startTimeUpdate);
		$end_time_slider.on("input", endTimeUpdate);
		$audio_selector_ref.on("click", changeAudio);
		$("#audio_selector_1").on("click", changeAudio);
		$score_slider.on("input", updateScore);
		// load the audio filenames for the trials etc
		$.ajax({
			url: "getSprites.php",
			type: "GET",
			data: { "randomize_flag": false },
			dataType: "json",
		}).done(function(response) {
			loadSpriteData(response);
			//console.log(response);
			//create score sliders
			createScoreButtons(SessionData.getClipsPerTrial());
			// save a timestamp for the scores
			sessionStorage.setItem("session_timestamp", Date.now());
			// set up the start button
			$("#sigmedia_logo").css( "display", "block");
			$start_button.css( "display", "block");
			$start_button.on('click', startTraining);
		});
		audioplayer.addEventListener('timeupdate', firstTimeUpdate, false);

	});

		// Global session data vars
		var SessionData = {
			"dps": [
						{ label: "A", y: 100, indexLabel: "100", color: "grey" }
					],
			"chart" : new CanvasJS.Chart("chartContainer", {
					title:{
						text: "MUSHRA Scores"
					},
					axisY:{
						title: "Score",
						minimum: 0,
						maximum: 100,
						interval: 20
					},
					toolTip:{
						enabled: false,
						animationEnabled: false,
						creditHref: '',
					},
					data: [//array of dataSeries
					{ //dataSeries object
						type: "column",
						indexLabelFontColor: "black",
						dataPoints: { label: "A", y: 100, indexLabel: "100" },
					}
					],
				}),
			"curr_selected_clip" : -1, // -1 indicates that the visible reference is active
			"clips_per_trial" : 0,
			"mode" : "train",
			"changing_audio_flag": false,
			"curr_trial_sprite": {
				clipinfo: [
					{name: 0, starttime: 0, endtime: 0}
				],
				filename: "",
			},
			"curr_trial_randindices": 0,
			"curr_trial_no": 0,
			updateChart: function(value) {
				if (this.curr_selected_clip >= 0)
				{
					var column_label = String.fromCharCode(65 + this.curr_selected_clip); //65 is ascii for 'A'
					this.dps[this.curr_selected_clip] = {label: column_label, y: value, indexLabel: value.toString(), color: "RoyalBlue" };
					this.renderChart();
				}
			},
			updateCurrSelectedClip: function (_button_id) {
				// set colour of old clip back to grey
				if (this.curr_selected_clip > -1)
				{
					this.dps[this.curr_selected_clip].color = "grey";
				}
				//change to new clip
				this.curr_selected_clip = _button_id;
				if (this.curr_selected_clip > -1)
				{
					this.dps[this.curr_selected_clip].color = "RoyalBlue";
				}
				this.renderChart();
			},
			renderChart: function() {
				this.chart.render();
			},
			pushChartData: function(_label, _new_data) {
				this.dps.push({label: _label, y: _new_data, indexLabel: "100", color: "grey"});
			},
			initChart: function() {
				this.chart.options.data[0].dataPoints = this.dps;
			},
			queryCurrScore: function() {
				return this.dps[this.curr_selected_clip].y;
			},
			querySpecificScore: function(_clip_index) {
				return this.dps[_clip_index].y;
			},
			resetChart: function() {
				this.curr_selected_clip = -1;
				for (var i = 0; i <this.dps.length; i++)
				{
					this.dps[i].y = 100;
					this.dps[i].indexLabel = "100";
					this.dps[i].color = "grey";
				}
				this.renderChart();
			},
			queryMode: function() {
				return this.mode;
			},
			setMode: function(_mode_text) {
				this.mode = _mode_text;
			},
			setClipsPerTrial: function(_clips_per_trial) {
				this.clips_per_trial = _clips_per_trial;
			},
			getClipsPerTrial: function() {
				return this.clips_per_trial;
			},
			setCurrTrialSprite: function(_curr_trial_array) {
				// clear array (except for 0th element)
				this.curr_trial_sprite.clipinfo.length = 1; 
				// push in new data
				for (var i = 0; i < _curr_trial_array[1].length; i++)
				{
					this.curr_trial_sprite.clipinfo.push({name: _curr_trial_array[1][i], starttime: _curr_trial_array[2][i], endtime: _curr_trial_array[3][i]});
				}
				//remove 0th element
				this.curr_trial_sprite.clipinfo.splice(0, 1);
				// grab sprite filename and randomized order array
				this.curr_trial_sprite.filename = _curr_trial_array[0];
				this.curr_trial_randindices = _curr_trial_array[4];
				// if we're in test mode, randomize the clips at each spot in the clipinfo[] array
				if (this.mode === "test")
				{
					// use the shuffled indices to randomize the order, but don't shuffle 0 because that's the visible reference
					for (var j = 1; j <= this.curr_trial_randindices.length; j++)
					{
						this.curr_trial_sprite.clipinfo[j].name = _curr_trial_array[1][this.curr_trial_randindices[j-1]]; 
						this.curr_trial_sprite.clipinfo[j].starttime = _curr_trial_array[2][this.curr_trial_randindices[j-1]]; 
						this.curr_trial_sprite.clipinfo[j].endtime = _curr_trial_array[3][this.curr_trial_randindices[j-1]]; 
					}
				}
			},
			getCurrSprite: function() {
				return this.curr_trial_sprite;
			},
			getClipInfo: function(clip_index) {
				return this.curr_trial_sprite.clipinfo[clip_index];
			},
			getCurrClipInfo: function() {
				// ref is set to -1, but it's at position 0 in the array (i.e. every index has to be shifted by 1)
				return this.curr_trial_sprite.clipinfo[this.curr_selected_clip + 1];
			},
			getCurrSpriteName: function() {
				return this.curr_trial_sprite.filename;
			},
			setCurrTrialNo: function(_curr_trial_no) {
				this.curr_trial_no = _curr_trial_no;
			},
			incrementCurrTrialNo: function() {
				this.curr_trial_no = this.curr_trial_no + 1;
			},
			getCurrTrialNo: function() {
				return this.curr_trial_no;
			},
			setChangingAudioFlag: function() {
				this.audio_changing_flag = true;
			},
			unsetChangingAudioFlag: function() {
				this.audio_changing_flag = false;
			},
			isChangingAudio: function() {
				return this.audio_changing_flag;
			},
		};
		
		// caching useful javascript and jquery objects
		
		var audioplayer = document.getElementById("myAudioPlayer");
		//var $audioplayer = $('#myAudioPlayer');
		var $position_time_slider = $('#position_time_slider');
		var $start_button = $("#start_button");
		var $loop_button = $('#loop_button');
		var $start_time_slider = $('#start_time_slider');
		var $starttime = $('#starttime');
		var $endtime = $('#endtime');
		var $currenttime = $('#currenttime');
		var $end_time_slider = $('#end_time_slider');
		var $audio_selector_ref = $('#audio_selector_ref');
		var $score_slider = $('#score_slider');
		var $score = $('#score');
		var $active_sample_text = $('#active_sample_text');
		var $trial_info = $('#trial_info');
		
		// replacement for javascript's "toFixed" function. Credit to Clarence Bowman (@exoboy on twitter)
		Number.prototype.trimNum = function(places,rounding){
			(rounding != 'floor' && rounding != 'ceil') ? rounding = 'round' : rounding = rounding;
			var result,multiplier = Math.pow( 10,places ),num=this;
			result = Math[rounding](num * multiplier) / multiplier;
			return Number( result );
		};
		//update the value of the score display with the user's slider input
		function updateScore() {
			$score.val(this.value);
			SessionData.updateChart(+this.value);
		}
		// update the slider and its associated score text when user changes active clip
		function updateScoreAndSlider(_button_id) {
			if (_button_id === -1)
			{
				$active_sample_text.html("Listening to: Reference");
			}
			else
			{
				var _score = SessionData.queryCurrScore();
				$score_slider.val(_score);
				$score.val(_score);
				$active_sample_text.html("Listening to: " + String.fromCharCode(65 + _button_id));
			}
		}
		//change the audio in the player to the user's selection, and update UI etc to reflect this
		function changeAudio() {
			// rebuff new calls while audio is being changed
			//console.log("hello from " + this.id);
			if (SessionData.isChangingAudio()) {
				return;
			}
			SessionData.setChangingAudioFlag();
			// check whether this button is already clicked (do nothing if true)
			if (!(this.style.borderStyle === "inset"))
			{
				// reset all buttons to look unclicked
				$(".selectorButtons").css("borderStyle", "");
				var button_id = this.id;
				if (button_id === "audio_selector_ref")
				{
					button_id = 0; // ref button's audio in the array is always 0
				}
				else
				{
				// other buttons are called button_1, button_2 etc, so grab the number
					button_id = button_id.replace( /^\D+/g, '');
					button_id = parseInt(button_id);
				}
				var curr_clip_info = SessionData.getCurrClipInfo();
				var currtime = audioplayer.currentTime - +curr_clip_info.starttime;
				// Update currently selected clip index
				SessionData.updateCurrSelectedClip(button_id - 1);
				curr_clip_info = SessionData.getCurrClipInfo();
				currtime = currtime + +curr_clip_info.starttime;
				audioplayer.currentTime = currtime;
				audioplayer.play();
				// set the button to look "clicked"
				this.style.borderStyle = "inset";
				//update active score
				updateScoreAndSlider(button_id - 1); // buttons are 1, 2, 3 but clips in array are 0, 1, 2 etc
			}
			SessionData.unsetChangingAudioFlag();
		}
		// set flag indicating user has grabbed the position slider
		function positionSliderMouseDown() {
			//console.log(this.dataset.user_grabbed_slider);
			$position_time_slider.data("user_grabbed_slider", "true");
		}
		// mouseup (or touchend, see range-touch.js) handler for position slider
		function positionSliderMouseUp() {
			$position_time_slider.data("user_grabbed_slider", "false");
			$position_time_slider.data("user_released_slider", "true");
			if (audioplayer.paused)
			{
				positionUserUpdate();
			}
		}
		//update the current position of the audio with the user's input
		function positionUserUpdate() {
			audioplayer.pause();	
			var curr_clip_info = SessionData.getCurrClipInfo();
			var clip_dur = curr_clip_info.endtime - curr_clip_info.starttime;
			var curr_pos = clip_dur * ($position_time_slider.val() / 100);
			curr_pos = +(curr_pos.toFixed(3)); // "+" is a string2double dynamic cast 
			if (curr_pos < +$starttime.val())
			{
				curr_pos = +$starttime.val();
			}
			else if (curr_pos > +$endtime.val())
			{
				curr_pos = +$endtime.val();
			}
			$position_time_slider.val((+curr_pos/clip_dur)*100);  // update the position slider
			audioplayer.currentTime = +curr_pos + +curr_clip_info.starttime;	//update the actual audio player's position
			// start playing the audio at the new position
			audioplayer.play();
			$currenttime.val(curr_pos); // update the time visible to the user
			$position_time_slider.data("user_released_slider", "false");
		}
		// update the start time of the audio with the user's slider input
		function startTimeUpdate() {
			var curr_clip_info = SessionData.getCurrClipInfo();
			var clip_dur = curr_clip_info.endtime - curr_clip_info.starttime;
			var new_start = clip_dur * (this.value / 100);
			if (new_start > +$endtime.val())
			{
				new_start = +$endtime.val();
				$start_time_slider.val((new_start/clip_dur)*100);
			}
			new_start = new_start.toFixed(3);
			$starttime.val(new_start);
		}
		// update the end time of the audio with the user's slider input
		function endTimeUpdate() {
			var curr_clip_info = SessionData.getCurrClipInfo();
			var clip_dur = curr_clip_info.endtime - curr_clip_info.starttime;
			var new_end = clip_dur * (this.value / 100);
			if (new_end < +$starttime.val())
			{
				new_end = +$starttime.val(); 
				$end_time_slider.val((new_end/clip_dur)*100);
			}
			new_end = new_end.toFixed(3);
			$endtime.val(new_end);
		}
		// handle audio player's behaviour on timeupdate event
		function updateAudioPos() {
			// if the user has moved the position slider, give that 1st priority
			if ($position_time_slider.data("user_released_slider") === "true") 
			{
				positionUserUpdate();
				return;
			}
			var curr_clip_info = SessionData.getCurrClipInfo();
			var user_end_time = $endtime.val();
			user_end_time = +user_end_time + +curr_clip_info.starttime;
			// check for whichever end time is lowest
			var end_time = Math.min(user_end_time, curr_clip_info.endtime);
			if (+this.currentTime >= +end_time) {
				if (this.dataset.customloop === "true") {
					// looping
					$currenttime.val(0);
					this.currentTime = +curr_clip_info.starttime + +$starttime.val();
					this.play();	//play the clip again
					return;
				}
				else if (+this.currentTime >= +end_time) {
					// if not looping, just pause and reset currentTime to the start of the clip
					this.pause();
					this.currentTime = +curr_clip_info.starttime + +$starttime.val();
					return;
				}
			}
			positionAutoUpdate();
		}
		// play the currently-selected audio clip
		function playAudio() {
			audioplayer.play();
			var curr_clip_info = SessionData.getCurrClipInfo();
			var user_start_time = $starttime.val();
			// check whether user-designated start time is > audioplayer's currentTime
			if ( (+curr_clip_info.starttime + +user_start_time) > audioplayer.currentTime) {
				audioplayer.currentTime = +curr_clip_info.starttime + +user_start_time;
			}
			audioplayer.play();	//play the clip 
		}
		// call php file to write user's scores from current trial
		function writeScores() {
			// get scores
			var score_array = [];
			var max_score_present_flag = false; // used to flag whether user has assigned at least 1 score of 100
			var current_trial_array = SessionData.getCurrSprite();
			for (var i=1; i<current_trial_array.clipinfo.length; i++)
			{
				score_array[i-1] = current_trial_array.clipinfo[i].name + "\t" + SessionData.querySpecificScore(i-1) + "\n";
				if (SessionData.querySpecificScore(i-1) === 100)
				{
					max_score_present_flag = true;
				}
			}
			if (!max_score_present_flag) // this is required by the ITU MUSHRA spec
			{
				alert("You have not yet assigned a score of 100 to any sample in this trial. This is required, since one of these samples is the hidden reference.");
				return 0;
			}
			var timestamp = JSON.parse(sessionStorage.getItem("session_timestamp"));
			// ajax out to php file to save the scores in a text file 
			var trial_scores = JSON.stringify(score_array);
			$.ajax({
				url: "writeScores.php",
				type: "GET",
				data: {trial_scores: trial_scores, timestamp: timestamp},
			}).done(function(response) {
				console.log(response);
			});
			return 1;
		}
		// change the trial data in the session vars
		function nextTrial() {
			// rebuff new calls while audio is being changed
			if (SessionData.isChangingAudio()) {
				return;
			}
			SessionData.setChangingAudioFlag();
			if (SessionData.queryMode() === "test")
			{
				if (!writeScores()) {
					SessionData.unsetChangingAudioFlag();
					return;	
				}
			}
			// get the sample arrays
			SessionData.incrementCurrTrialNo();
			var curr_trial = SessionData.getCurrTrialNo();
			var full_clip_array = JSON.parse(sessionStorage.getItem("full_clip_array"));
			// now update the current trial sample array
			if (curr_trial === full_clip_array.length) // if we've reached the last trial
			{
				if (SessionData.queryMode() === "train")
				{
					// done with training mode, go set up test mode
					SessionData.setMode("test"); 
					setupTestMode();
					return;
				}
				else if (SessionData.queryMode() === "test")
				{
					endTest();
					return;
				}
			}
			//update the trial info header on the page
			$trial_info.html("Trial " + (curr_trial + 1).toString() +" of " + full_clip_array.length.toString());
			SessionData.setCurrTrialSprite(full_clip_array[curr_trial]);
			//reset sliders and audio player and chart
			SessionData.resetChart();
			resetForNewTrial();
		}
		// reset the buttons, sliders and audioplayer for the new trial
		function resetForNewTrial() {
			var ref = SessionData.getCurrSpriteName();
			$score_slider.val(100);
			$score.val(100);
			$(".selectorButtons").css("borderStyle", "");
			$audio_selector_ref.css("borderStyle", "inset"); //set the button to look "clicked"
			$active_sample_text.html("Listening to: Reference");
			resetTimeSliders();
			audioplayer.removeEventListener('timeupdate', updateAudioPos, false);
			audioplayer.pause();
			$("#wav_src").attr("src", "");
			audioplayer.currentSrc = "";
			//$("#wav_src").remove();
			//$("#myAudioPlayer").append("<source id=\"wav_src\" src=" + ref + " type=\"audio/wav\">");
			//document.querySelector("#wav_src").removeAttribute("src");
			//audioplayer.load();
			$("#wav_src").attr("src", ref);
			audioplayer.load();
			// gotta wait til audio plays a bit to modify currentTime
			audioplayer.addEventListener('timeupdate', firstTimeUpdate, false);
			audioplayer.play();
		}
		// reset the time sliders (position, start, end)
		function resetTimeSliders() {
			$start_time_slider.val(0);
			$end_time_slider.val(100);
			$starttime.val(0.000);
			$currenttime.val(0.000);
			$position_time_slider.val(0);
			setAudioEndTime();
		}
		//toggle loop button pressed/unpressed and loop = true/false in audioplayer
		function toggleLoop() {
			if (audioplayer.dataset.customloop === "true")
			{
				audioplayer.dataset.customloop = "false";
				$loop_button.css("borderStyle", "");
			}
			else
			{
				audioplayer.dataset.customloop = "true";
				$loop_button.css("borderStyle", "inset");
			}
		}
		//pause audioplayer
		function pauseAudio() {
			audioplayer.pause();
		}
		//initialize the stop slider to the right value when a new trial starts
		function setAudioEndTime() {
			var curr_clip_info = SessionData.getCurrClipInfo();
			var clip_dur = curr_clip_info.endtime - curr_clip_info.starttime;
			$endtime.val(clip_dur.trimNum(3, 'floor'));
		}
		//create buttons to select clips in the first trial
		function createScoreButtons(no_of_samples) {
			var my_button_div = document.getElementById("sample_1_controls");
			var frag = document.createDocumentFragment();
			// start at 2 since we already have an "A" button
			for(var i=2; i<no_of_samples; i++) 
			{
				var istr = i.toString();
				var button_div_clone = my_button_div.cloneNode(true);
				button_div_clone.id = "sample_" + istr + "_controls";
				var button_id = String.fromCharCode(65+i-1);
				button_div_clone.querySelector('#audio_selector_1').innerHTML = button_id; //65 is ascii for A
				button_div_clone.querySelector('#audio_selector_1').onclick = changeAudio;
				button_div_clone.querySelector("#audio_selector_1").id = "audio_selector_" + istr;
				frag.appendChild(button_div_clone); 
				// update chart
				SessionData.pushChartData(button_id, 100);
			}
			var buttons_parent = document.getElementById("sample_buttons");
			buttons_parent.appendChild(frag); 
			//create chart
			SessionData.initChart(); 
			SessionData.renderChart();
			// change selector button widths here depending on how many there are
			// for some strange reason this has to be calculated with a linear function!
			$(".selectorButtonsDiv").css( {"margin-right" : ((12.6 - no_of_samples)/0.8).toString() + "%"} ); 
			//reference button should be selected by default at start of test
			$audio_selector_ref.css("borderStyle", "inset"); 
		}
		// load sprite data
		function loadSpriteData(clip_array) {
			//set the current clip to the 1st clip in the array
			SessionData.setCurrTrialSprite(clip_array[0]);
			SessionData.setClipsPerTrial(clip_array[0][1].length);
			SessionData.setCurrTrialNo(0);
			var numtrials = clip_array.length;
			//update the trial info header on the page
			$trial_info.html("Trial 1 of " + numtrials.toString());
			//store the clip array in sessionStorage
			sessionStorage.setItem("numtrials", JSON.stringify(numtrials));
			sessionStorage.setItem("full_clip_array", JSON.stringify(clip_array));
		}
		// show test intro screen and start button
		function showTestModeIntro() {
			$("#intro_text").html("Training Finished!"); 
			$start_button.before("<p>You are now entering the test phase. The order of the clips has been randomized, however you will still have access to the reference clip for comparison. Compare the clips and assign each one a quality score using the score slider below the chart. Note: you must assign a score of 100 to AT LEAST one clip in each trial.</p>");
			$start_button.html("Start Test");
			$("#intro_div").css('display', 'block');
			$("#user_interface").css('display', 'none');
			$trial_info.css('display', 'none');
			$("#training_mode_instructions").css('display', 'none');
		}
		// set up test mode
		function setupTestMode() {
			audioplayer.pause();
			showTestModeIntro();
			$.ajax({
				url: "getSprites.php",
				type: "GET",
				data: { randomize_flag: true },
				dataType: "json",
			}).done(function(response) {
				loadSpriteData(response);
				console.log("hello from test mode ajax return");
				$start_button.on('click', startTest);
			});
		}
		// allow a button to call the launchFullscreen method
		function goFullScreen() {
			launchFullscreen(document.documentElement);
		}
		// Find the right method, call on correct element. Taken from: davidwalsh.name/fullscreen
		function launchFullscreen(element) {
			if(element.requestFullscreen) {
				element.requestFullscreen();
			} else if(element.mozRequestFullScreen) {
				element.mozRequestFullScreen();
			} else if(element.webkitRequestFullscreen) {
				element.webkitRequestFullscreen();
			} else if(element.msRequestFullscreen) {
				element.msRequestFullscreen();
			}
		}
		// show the training UI, reset sliders, load audio
		function startTraining() {
			launchFullscreen(document.documentElement);
			$("#intro_div").css('display', 'none');
			$("#user_interface").css('visibility', 'visible');
			$trial_info.css('display', 'block');
			$("#training_mode_instructions").css('display', 'block');
			$start_button.off('click', startTest);
			// reset sliders, audio etc
			resetForNewTrial(); 
		}
		// show the test UI, reset sliders, load audio
		function startTest() {
			
			$("#training_mode_instructions").css('display', 'none');
			
			launchFullscreen(document.documentElement);
			$("#intro_div").css('display', 'none');
			$("#user_interface").css('display', 'block');
			$trial_info.css('display', 'block');
			$start_button.off('click', startTest);
			$("#mode_info").html("Test Mode");
			$("#score_control_div").css('display', 'block');
			$("#score_text").css('display', 'block');
			// crappy positioning hack (display: none wouldn't allow using dimensions as reference)
			document.getElementById("chartContainer").style.visibility = 'visible';
			SessionData.initChart(); 
			SessionData.resetChart();
			// set sliders audio etc
			resetForNewTrial(); 
		}
		// hide everything and show the test finished message
		function endTest() {
			audioplayer.pause();
			document.getElementById("user_interface").style.display = 'none';
			$trial_info.css("display", "none");
			$("#test_finished_text").css("display", "block");
		}
		// update the position slider based on what point the audio player has reached
		function positionAutoUpdate() {
			var curr_clip_info = SessionData.getCurrClipInfo();
			var curr_time = audioplayer.currentTime - curr_clip_info.starttime;
			if ($position_time_slider.data("user_grabbed_slider") === "false")
			{
				$position_time_slider.val((curr_time / (curr_clip_info.endtime - curr_clip_info.starttime)) * 100);
			}
			$currenttime.val(curr_time.toFixed(3));
		}
		// used to catch 1st timeupdate from audioplayer when playing new audio
		function firstTimeUpdate() {
			this.removeEventListener('timeupdate', firstTimeUpdate, false);
			this.addEventListener('timeupdate', secondTimeUpdate, false);
			this.play();
		}
		// used to catch 2nd timeupdate from audioplayer when playing new audio
		function secondTimeUpdate() {
			this.currentTime = SessionData.getCurrClipInfo().starttime;
			this.removeEventListener('timeupdate', secondTimeUpdate, false);
			// re-enable changing the audio (since we're fairly confident it's now playing)
			SessionData.unsetChangingAudioFlag();	
			this.addEventListener('timeupdate', updateAudioPos, false);
		}

}));
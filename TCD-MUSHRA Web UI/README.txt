Instructions for use:
1. Copy this directory (including all subdirectories) onto the Nexus 7. I created a directory called "BitWebServerProjects" at /sdcard/ but you can use whatever you want. 
2. Download the app "BitWebServer" from the Play Store onto the Nexus 7. 
3. Let it run for the first time and then go into Settings->Config Lighttpd->Web Root and choose the directory to which you've saved this project. (i.e. in my case it was "/sdcard/BitWebServerProjects")
4. Start the Lighttpd server.
5. Open Android Chrome and navigate to "localhost:8080/MUSHRAtest.html"

You should now be ready to start the test. It is easiest to use the test page with the Nexus 7 rotated 90degrees. 
Allow the page to use fullscreen mode if/when it requests it.

6. After completing a test, the score file can be found in the "scores" subdirectory. Its name will be a Unix-style timestamp (with milliseconds) which was taken at the beginning of the test. 

N.B. There was a bug (April 2014) which occurred occasionally after progressing to the 6th or 7th trial, and then again every 6th trial afterwards. Upon changing to the next trial, the audio would fail to play. The bug was only present in Chrome for Android, and was due to the old audio not being garbage collected, which caused a memory shortage. The workaround was to rotate the Nexus 7 90degrees and then rotate it back, which triggered garbage collection and allowed the new audio to be loaded and played as intended.  
As of September 2014, this bug appears to have been fixed in Chrome for Android.



Instructions for Modification:
This application uses "audio sprites" as a workaround for several limitations of the HTML5 audio implementation in Chrome for Android. A good explanation of audio sprites and their necessity can be read at: 
http://pupunzi.open-lab.com/2013/03/13/making-html5-audio-actually-work-on-mobile/
There are Matlab scripts bundled with this distribution to help create the audio sprites and info (.spr) file for use with this application. 
A sample sprite ("audiosprites/boz.wav") and info file ("newSprites_info.spr") have also been included to demonstrate the application. 
The clips ("audio sprites") loaded by the application are specified in the .spr file "newSprites_info.spr". The first line in this file is a header line ("MUSHRA_audio_sprites"). Then, for each sprite, the following five lines have to be filled out as follows:
1. A line in the format "# Music file n" where n is a number specifying the sprite's trial number.
2. The filename (including subfolder(s)) of the sprite
3. The name of each clip in the sprite (in the format "clips:a.wav,b.wav,c.wav, etc")
4. The start times of each clip in the sprite (in the format "start:xxx,yyy,zzz, etc")
5. The end times of each clip in the sprite (in the format "end:xxx,yyy,zzz, etc")

There is no limit to the number of trials (i.e. sprites) which may be specified. 

N.B. The clip names and their start and end times should be specified in the same order as that is how they are associated. 

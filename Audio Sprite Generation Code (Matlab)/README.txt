--- Guide for using the createSprites.m script to create audio sprites for MUSHRA tests

1. Ensure that the following program(s) are installed and have been added to the PATH environment variable:
	ffmpeg

2. Ensure that the scripts "createSprites.m", "clipinfo.m" and "findClipDuration.m" are in the same folder

3. Edit "clipinfo.m" to contain the current location of the audio clips for the sprites, their names,
and the extensions that should be added to refer to the different "treated" versions of the clips. 

4. Run createSprites.m

5. The sprites will be output to the directory specified in "clipinfo.m", and the corresponding info file 
("newSprites_info.spr") which is needed by the MUSHRA web UI's "getSprites.php" file will also be generated in the
same directory as createSprites.m. You should then add this file to the MUSHRA UI folder, and add the sprites 
to the "sprites" folder.
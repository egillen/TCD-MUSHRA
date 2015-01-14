% makes sprites out of the MUSHRA clips
% also makes the info file that the getSprites.php file needs to read in

%
% Guide for using the createSprites.m script to create audio sprites for MUSHRA tests
% 
%   1.  Ensure that the following program(s) are installed and have been added to the PATH environment variable:
%           ffmpeg
% 
%   2.  Ensure that the scripts "createSprites.m", "clipinfo.m" and "findClipDuration.m" are in the same folder
% 
%   3.  Edit "clipinfo.m" to contain the current location of the audio clips for the sprites, their names,
%       and the extensions that should be added to refer to the different "treated" versions of the clips. 
% 
%   4.  Run createSprites.m
% 
% 5.    The sprites will be output to the directory specified in "clipinfo.m", and the corresponding info file 
%       ("newSprites_info.spr") which is needed by the MUSHRA web UI's "getSprites.php" file will also be generated in the
%       same directory as createSprites.m
% 

% first get base filenames and treatments
% edit this file (clipinfo) for different files/treatments/ etc and their
% locations
clipinfo;

% used to pass treatment names to ffmpeg's "concat" function
cliplist_filename = 'cliplist.txt';

no_of_clips = size(clipname, 2);
no_of_treatments = size(treatment, 2);
silence_at_start = 10;  % how much (seconds) silence to have at the start of the sprite
distance_between_treatments = 20; % how much space (including end silence) should each treatment take up in the sprite
precision = 10; % how many digits precision for start and end times
curr_offset = silence_at_start;
% set up 10s silence file for start of sprites
sf = 48000;
s_left = zeros(int32(silence_at_start*sf), 1);
s_right = zeros(int32(silence_at_start*sf), 1);
silence_filename = [silencedir '0.wav'];

% create sprites info file 
delete('newSprites_info.spr');
fid = fopen('newSprites_info.spr', 'w');
% write file header line
fprintf(fid, '%s\n', 'MUSHRA_audio_sprites');

for i = 1:no_of_clips
    clear spriteinfo clipline startline endline 
    clipline = 'clips:';
    startline = 'start:';
    endline = 'end:';
    curr_offset = silence_at_start;
    delete([silencedir '*.wav']);
    delete(cliplist_filename);
    % write the start silence file
    silence_filename = [silencedir '0.wav'];
    s_left = zeros(int32(silence_at_start*sf), 1);
    s_right = zeros(int32(silence_at_start*sf), 1);
    wavwrite([s_left s_right], sf, silence_filename);
    % create text file with list of clips to go into sprite
    fid2 = fopen(cliplist_filename, 'w');
    fprintf(fid2, '%s\n', ['file ''' silence_filename '''']);
    for j = 1:no_of_treatments
        spriteinfo(j).name = [basedir clipname(i).name treatment(j).name];
        clipline = [clipline clipname(i).name treatment(j).name ','];
        fprintf(fid2, '%s\n', ['file ''' spriteinfo(j).name '''']);
        duration = findClipDuration(spriteinfo(j).name);
        spriteinfo(j).start = curr_offset;
        startline = [startline num2str(spriteinfo(j).start, precision) ','];
        spriteinfo(j).end = curr_offset + duration;
        endline = [endline num2str(spriteinfo(j).end, precision) ','];
        spriteinfo(j).silence_at_end = distance_between_treatments - duration;
        curr_offset = curr_offset + distance_between_treatments;
        % create wav with silence for the desired duration 
        s_left = zeros(int32(spriteinfo(j).silence_at_end*sf), 1);
        s_right = zeros(int32(spriteinfo(j).silence_at_end*sf), 1);
        silence_filename = [silencedir int2str(j) '.wav'];
        wavwrite([s_left s_right], sf, silence_filename);
        % could avoid adding last silence file here if necessary
        fprintf(fid2, '%s\n', ['file ''' silence_filename '''']);
    end
    
    % write new sprite info to info file
    fprintf(fid, '%s\n', ['# Music file ' int2str(i)]);
    spriteref = strtok(clipname(i).name, '48');
    fprintf(fid, '%s\n', ['audiosprites/' spriteref '.wav']);
    fprintf(fid, '%s\n', clipline(1:end-1)); % end-1 to get rid of final ','
    fprintf(fid, '%s\n', startline(1:end-1));
    fprintf(fid, '%s\n', endline(1:end-1));
        
    % create sprite
    spritename = [spritesdir spriteref '.wav'];
    % concatenate all the treatments and silence wavs with ffmpeg
    % command format is ffmpeg -f concat -i mylist.txt -c copy output
    cmd = ['ffmpeg -f concat -i ' cliplist_filename ' -c copy ' spritename]
    sym = dos(cmd);
    fclose(fid2);
    clc; % for some reason ffmpeg prints out a load of "invalid PTS" messages when concatenating wavs
        % the resulting sprites seem to be fine though...
end
fclose(fid);



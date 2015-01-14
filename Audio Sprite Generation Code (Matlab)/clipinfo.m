% declare MUSHRA audio files and treatment filename extensions here

% directories
% where all the clips currently are
basedir = 'C:\Users\eoin\Documents\MATLAB\SpeechQuality\generateSprites\new_samples\';
% where to put the silence wavs
silencedir = 'C:\Users\eoin\Documents\MATLAB\SpeechQuality\generateSprites\silencewavs\'; 
mkdir(silencedir);
% where to put the sprites
spritesdir = 'C:\Users\eoin\Documents\MATLAB\SpeechQuality\generateSprites\sprites\';    
mkdir(spritesdir);

% clips
clipname(1).name = 'boz48_stereo';
% clipname(2).name = 'castanets48_stereo';
% clipname(3).name = 'contrabassoon48_stereo';
% clipname(4).name = 'glock48_stereo';
% clipname(5).name = 'guitar48_stereo';
% clipname(6).name = 'harpsichord48_stereo';
% clipname(7).name = 'moonlight48_stereo';
% clipname(8).name = 'ravel48_stereo';
% clipname(9).name = 'sopr48_stereo';
% clipname(10).name = 'steely48_stereo';
% clipname(11).name = 'strauss48_stereo';
% clipname(12).name = 'vega48_stereo';

% treatments
treatment(1).name = '.wav'; % visible ref
treatment(2).name = '.wav'; % hidden ref
treatment(3).name = '_128kbps_aac.wav';
treatment(4).name = '_128kbps_opus.wav';
treatment(5).name = '_256kbps_aac.wav';
treatment(6).name = '_48kbps_aac.wav';
treatment(7).name = '_64kbps_aac.wav';
treatment(8).name = '_96kbps_mp3.wav';
treatment(9).name = '_lp35.wav';
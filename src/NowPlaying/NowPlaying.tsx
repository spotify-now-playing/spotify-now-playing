import React, { useEffect, useState } from 'react';
import querystring from 'querystring';
import { Buffer } from 'buffer';
// import { AiOutlinePauseCircle } from 'react-icons/ai';
// import { BiErrorCircle } from 'react-icons/bi';
// import { HiOutlineStatusOffline } from 'react-icons/hi';
import './NowPlaying.css';

//Setting up the Spotify API and Endpoints
const TOKEN_ENDPOINT = 'https://accounts.spotify.com/api/token';
const NOW_PLAYING_ENDPOINT = 'https://api.spotify.com/v1/me/player/currently-playing';
// const client_id = 'ab3999a80379407a9a62642df4a7b7c7';
// const client_secret = '3eb1afcbaebe4605bbd8a7a990d17607';
// const refresh_token =
//     'AQCI1ykgJJ76OTJr9PLmIHjoEx0If7_0lULLwDmiINHnHCa6rEYM9lZRKQXi4lK59HQEBqyLz_9IlK-fH7ZP6d8h3ngbFNbHrsKsTk1fE92xkjrpGHtViojewENeSf1dFew';

const DEFAULT_ALBUM_IMAGE_URL = './images/albumCover.png';

//Function to generate an access token using the refresh token everytime the website is opened or refreshed
export const getAccessToken = async (client_id: string, client_secret: string, refresh_token: string) => {
    //Creates a base64 code of client_id:client_secret as required by the API
    const basic = Buffer.from(`${client_id}:${client_secret}`).toString('base64');

    //The response will contain the access token
    const response = await fetch(TOKEN_ENDPOINT, {
        method: 'POST',
        headers: {
            Authorization: `Basic ${basic}`,
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: querystring.stringify({
            grant_type: 'refresh_token',
            refresh_token,
        }),
    });

    return response.json();
};

interface I_NowPlaying {
    albumImageUrl: string;
    artist: string;
    isPlaying: boolean;
    songUrl: string;
    title: string;
    timePlayed: number;
    timeTotal: number;
    artistUrl: string;
}

//Uses the access token to fetch the currently playing song
export const getNowPlaying = async (
    client_id: string,
    client_secret: string,
    refresh_token: string
): Promise<string | I_NowPlaying> => {
    try {
        //Generating an access token
        const { access_token } = await getAccessToken(client_id, client_secret, refresh_token);

        //Fetching the response
        const response = await fetch(NOW_PLAYING_ENDPOINT, {
            headers: {
                Authorization: `Bearer ${access_token}`,
            },
        });

        //If response status > 400 means there was some error while fetching the required information
        if (response.status > 400) {
            throw new Error('Unable to Fetch Song');
        } else if (response.status === 204) {
            //The response was fetched but there was no content
            throw new Error('Currently Not Playing');
        }

        //Extracting the required data from the response into seperate variables
        const song = await response.json();
        const albumImageUrl = song.item.album.images[0].url;
        const artist = song.item.artists.map((artist: { name: string }) => artist.name).join(', ');
        const isPlaying = song.is_playing;
        const songUrl = song.item.external_urls.spotify;
        const title = song.item.name;
        const timePlayed = song.progress_ms;
        const timeTotal = song.item.duration_ms;
        const artistUrl = song.item.album.artists[0].external_urls.spotify;

        //Returning the song details
        return {
            albumImageUrl,
            artist,
            isPlaying,
            songUrl,
            title,
            timePlayed,
            timeTotal,
            artistUrl,
        };
    } catch (error) {
        console.error('Error fetching currently playing song: ', error);
        return (error as Error).message.toString();
    }
};

export interface I_NowPlayingProps {
    client_id: string;
    client_secret: string;
    refresh_token: string;
}

//Main function to process the data and render the widget
const NowPlaying = ({ client_id, client_secret, refresh_token }: I_NowPlayingProps) => {
    //Hold information about the currently playing song
    const [nowPlaying, setNowPlaying] = useState<I_NowPlaying | string>('');

    // console.log('Now Playing', client_id, client_secret, refresh_token);

    useEffect(() => {
        const fetchNowPlaying = async () => {
            const data = await getNowPlaying(client_id, client_secret, refresh_token);
            setNowPlaying(data);
        };

        //The spotify API does not support web sockets, so inorder to keep updating the currently playing song and time elapsed - we call the API every second
        // setTimeout(() => {
        setInterval(() => {
            fetchNowPlaying();
        }, 1000);
    }, []);

    //Setting default values for the listener's current state and the duration of the song played
    let playerState = '';
    let secondsPlayed = 0,
        minutesPlayed = 0,
        secondsTotal = 0,
        minutesTotal = 0;
    let albumImageUrl = DEFAULT_ALBUM_IMAGE_URL;
    let title = '';
    let artist = '';

    if (nowPlaying != null && (nowPlaying as I_NowPlaying).title) {
        const np: I_NowPlaying = nowPlaying as I_NowPlaying;
        //Used while displaing a sounbar/pause icon on the widget
        np.isPlaying ? (playerState = 'PLAY') : (playerState = 'PAUSE');

        //Converting the playback duration from seconds to minutes and seconds
        secondsPlayed = Math.floor(np.timePlayed / 1000);
        minutesPlayed = Math.floor(secondsPlayed / 60);
        secondsPlayed = secondsPlayed % 60;

        //Converting the song duration from seconds to minutes and seconds
        secondsTotal = Math.floor(np.timeTotal / 1000);
        minutesTotal = Math.floor(secondsTotal / 60);
        secondsTotal = secondsTotal % 60;

        albumImageUrl = np.albumImageUrl;
        title = np.title;
        artist = np.artist;
    } else if (nowPlaying === 'Currently Not Playing') {
        //If the response returns this error message then we print the following text in the widget
        playerState = 'OFFLINE';
        title = 'User is';
        artist = 'currently Offline';
    } else {
        //If the response wasn't able to fetch anything then we display this
        title = 'Failed to';
        artist = 'fetch song';
    }

    return (
        //Depending on the value of playerState, the href, album image and icons are updated
        // <div><div/>
        <div className="nowPlayingCard">
            <div className="nowPlayingImage">
                {playerState === 'PLAY' || playerState === 'PAUSE' ? (
                    <img src={albumImageUrl} alt="Album" />
                ) : (
                    <img src={DEFAULT_ALBUM_IMAGE_URL} alt="Album" />
                )}
            </div>
            <div id="nowPlayingDetails">
                {/* Song Title displayed based on playerState */}
                <div className={`nowPlayingTitle ${title.length > 15 ? 'marquee-content' : ' '}`}>{title}</div>
                {/* Artist displayed based on playerState */}
                <div className="nowPlayingArtist">{artist}</div>
                {/* Song Timer displayed based on playerState */}
                <div className="nowPlayingTime">
                    {minutesPlayed.toString().padStart(2, '0')}:{secondsPlayed.toString().padStart(2, '0')}:
                    {secondsTotal.toString().padStart(2, '0')}
                </div>
            </div>
        </div>
    );
};

export default NowPlaying;

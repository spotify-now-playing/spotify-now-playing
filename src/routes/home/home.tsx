import React from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import logo from './logo.svg';
import './home.css';
import NowPlaying from '../../NowPlaying/NowPlaying';

function Home() {
    const [searchParams, setSearchParams] = useSearchParams();

    const spotifyClientId = searchParams.get('spotify_client_id') || process.env.SPOTIFY_CLIENT_ID || '';
    const spotifySecret = searchParams.get('spotify_client_secret') || process.env.SPOTIFY_CLIENT_SECRET || '';
    const spotifyRefreshToken = searchParams.get('spotify_refresh_token') || process.env.SPOTIFY_REFRESH_TOKEN || '';

    return (
        <div className="App">
            {/* <header className="App-header">
                <img src={logo} className="App-logo" alt="logo" />
                <p>
                    Edit <code>src/App.tsx</code> and save to reload.
                </p>
                <a className="App-link" href="https://reactjs.org" target="_blank" rel="noopener noreferrer">
                    Learn React
                </a>
            </header> */}
            <NowPlaying
                client_id={spotifyClientId}
                client_secret={spotifySecret}
                refresh_token={spotifyRefreshToken}
            ></NowPlaying>
        </div>
    );
}

export default Home;

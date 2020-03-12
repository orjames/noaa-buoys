import React from 'react';
import './App.css';
import { useState } from "react";
import noah from './noah';

const BASE_API_URL1 =
  "https://www.ndbc.noaa.gov/data/realtime2/";
const BASE_API_URL2 =
  "https://cors-anywhere.herokuapp.com/https://www.ndbc.noaa.gov/data/realtime2/";

export default function App() {
  const [sid, setSid] = useState<number>(46026);
  const [numberWaves, setNumberWaves] = useState<number>(0);
  const [wavesArr, setWavesArr] = useState<number[]>([]);
  const [message, setMessage] = useState<string>('');

  //  n highest waves given a station ID sid and a number of waves n
  // n highest waves in the dataset for the given sid

  const formSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetch(`${BASE_API_URL2}${sid}.txt`, {
      mode: 'cors' // 'cors' by default
    })
      .then(response => {
        console.log(response)
        if (response.status < 200 || response.status > 300) {
          setMessage('no buoy info')
        }
        // not json so don't .json()
        return response.text();
      })
      .then(data => {
        parseData(data);
      })
      .catch(err => {
        console.log(err);
      });
  };

  const filterEmptyStrings = (arr: string[]) => {
    return arr.filter((el) => {
      return el !== "";
    });
  }

  const parseData = (data: string) => {
    // split on new line    
    const dataArr: string[] = data.split("\n");
    // get the title array to find index of the WVHT
    const titleArr = filterEmptyStrings(dataArr[0].split(' '));
    const indexOfWave = titleArr.indexOf("WVHT");
    // remove the top two title rows
    const dataArrS = dataArr.slice(2);

    // initialize the waveArr to hold recorded wave heights
    const waveArr: number[] = [];

    // go through each row of data
    dataArrS.forEach(row => {
      // filter the row to get rid of spaces
      let cleanRow = filterEmptyStrings(row.split(' '))
      // add the data to the waveArr if it is viable data
      if (cleanRow[indexOfWave] !== "MM" && !isNaN(Number(cleanRow[indexOfWave]))) {
        waveArr.push(Number(cleanRow[indexOfWave]))
      }
    })
    waveArr.sort();
    setWavesArr(waveArr.slice((waveArr.length) - numberWaves))
  }

  const mapData = (data: number[]) => {
    return data.map(wave => {
      return (
        <li>{wave}</li>
      )
    })
  }

  return (
    <div className="App">
      <h1>N highest waves</h1>
      <form action="" onSubmit={(e) => formSubmit(e)}>
        <label htmlFor="sid">buoy id</label>
        <input
          type="number"
          name="sid"
          placeholder="buoy id..."
          onChange={e => setSid(parseInt(e.target.value, 10))}
          required
        />
        <label htmlFor="numberWaves">number of waves</label>
        <input
          type="number"
          name="numberWaves"
          placeholder="number of waves..."
          onChange={e => setNumberWaves(parseInt(e.target.value, 10))}
          required
        />
        <button type="submit">search!</button>
      </form>
      {mapData(wavesArr)}
      {message ? message : null}
    </div>
  );
};
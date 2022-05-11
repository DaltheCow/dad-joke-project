import { Button, TextField } from "@mui/material";
import axios from "axios";
import React from "react";
import useSound from "use-sound";
const buzzer = require("./Buzzer.mp3");
const bell = require("./Bell.mp3");
const victory = require("./Victory.mp3");
const loser = require("./Loser.mp3");
const dictionary = require("./dictionary.txt");

const ScoreBox = ({
  score,
  teamName,
  winningTeam,
}: {
  score: number;
  teamName: string;
  winningTeam: string;
}) => {
  const isWinner = teamName === winningTeam;
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <div>{teamName}</div>
      <div
        style={{
          border: `1px solid ${isWinner ? "gold" : "black"}`,
          padding: "10px",
          display: "flex",
          justifyContent: "flex-end",
          width: "60px",
          marginTop: "8px",
        }}
      >
        {score}
      </div>
    </div>
  );
};

const JokesList = ({ jokes, hasNoJokeResults }: { jokes: string[]; hasNoJokeResults: boolean }) => {
  return (
    <div style={{ width: "50%" }}>
      {jokes.length > 0 && <h3>Joke Results</h3>}
      <ul>
        {jokes.map((joke, i) => (
          <li key={i}>{joke}</li>
        ))}
      </ul>
      {hasNoJokeResults &&
        "Sorry, your search wasn't good enough, we're deducting a point from your score"}
    </div>
  );
};

function App() {
  const [search, setSearch] = React.useState("");
  const [playerJokes, setPlayerJokes] = React.useState<string[]>([]);
  const [dictionaryJokes, setDictionaryJokes] = React.useState<string[]>([]);
  const [playerHasNoResults, setPlayerHasNoResults] = React.useState(false);
  const [dictionaryHasNoResults, setDictionaryHasNoResults] = React.useState(false);
  const [playerScore, setPlayerScore] = React.useState(0);
  const [dictionaryScore, setDictionaryScore] = React.useState(0);
  const [playBuzzer] = useSound(buzzer);
  const [playBell] = useSound(bell);
  const [playVictory] = useSound(victory);
  const [playLoser] = useSound(loser);
  const [wordBank, setWordBank] = React.useState<string[]>([]);
  const [playerTurn, setPlayerTurn] = React.useState("human");
  const [loadingGuess, setLoadingGuess] = React.useState(false);
  const [dictionaryGuess, setDictionaryGuess] = React.useState("");
  const [winner, setWinner] = React.useState("");

  function readTextFile(file: any) {
    var rawFile = new XMLHttpRequest();
    rawFile.open("GET", file, false);
    rawFile.onreadystatechange = function () {
      if (rawFile.readyState === 4) {
        if (rawFile.status === 200 || rawFile.status == 0) {
          var allText = rawFile.responseText;
          setWordBank(allText.split("\n"));
        }
      }
    };
    rawFile.send(null);
  }

  React.useEffect(() => {
    readTextFile(dictionary);
  }, []);

  const getDictionaryGuess = () => {
    const randomIndex = Math.floor(wordBank.length * Math.random());
    return wordBank[randomIndex];
  };

  React.useEffect(() => {
    if (playerTurn === "dictionary" && !winner) {
      setTimeout(() => {
        setLoadingGuess(true);
        const guess = getDictionaryGuess();
        setDictionaryGuess(guess);
        setTimeout(() => {
          makeDictionaryGuess(guess);
          setLoadingGuess(false);
        }, 3000);
      }, 2000);
    }
  }, [playerTurn]);

  React.useEffect(() => {
    if ((!winner && playerScore >= 50) || dictionaryScore >= 50) {
      const winningPlayer = playerScore >= 50 ? "Home" : "Away";
      setWinner(winningPlayer);
      if (winningPlayer === "Home") {
        playVictory();
      } else {
        playLoser();
      }
    }
  }, [playerScore, dictionaryScore]);

  const makeSearch = async (
    searchTerm: string,
    setPlayersScore: React.Dispatch<React.SetStateAction<number>>,
    setPlayersJokes: React.Dispatch<React.SetStateAction<string[]>>,
    setHasNoResults: React.Dispatch<React.SetStateAction<boolean>>
  ) => {
    const response = await axios.get(`https://icanhazdadjoke.com/search?term=${searchTerm}`, {
      headers: {
        accept: "application/json",
      },
    });
    const results = response.data.results;
    setHasNoResults(results.length === 0);
    if (results.length === 0) {
      playBuzzer();
      setPlayersScore((prev) => prev - 1);
    } else {
      playBell();
      setPlayersScore((prev) => prev + results.length);
    }
    setPlayersJokes(results.map((result: { id: string; joke: string }) => result.joke));
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const searchTerm = search.split(" ").join("+");
    makeSearch(searchTerm, setPlayerScore, setPlayerJokes, setPlayerHasNoResults);
    setPlayerTurn("dictionary");
  };

  const makeDictionaryGuess = (dictionaryGuess: string) => {
    makeSearch(dictionaryGuess, setDictionaryScore, setDictionaryJokes, setDictionaryHasNoResults);
    setPlayerTurn("human");
  };

  return (
    <div
      style={{
        margin: "20px",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "column",
      }}
    >
      <h1>Dad Joke Search Extravaganza</h1>
      <div style={{ display: "flex", width: "240px", justifyContent: "space-between" }}>
        <ScoreBox score={playerScore} teamName="Home" winningTeam={winner} />
        <ScoreBox score={dictionaryScore} teamName="Away" winningTeam={winner} />
      </div>
      <div style={{ display: "flex" }}>
        <form onSubmit={handleSubmit}>
          <div style={{ display: "flex", marginTop: "20px" }}>
            <TextField
              style={{ marginRight: "20px" }}
              id="outlined-basic"
              label="Search"
              variant="standard"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <Button
              disabled={playerTurn === "dictionary"}
              style={{ alignSelf: "flex-end" }}
              type="submit"
              variant="outlined"
            >
              Find Jokes
            </Button>
          </div>
        </form>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "flex-end",
            margin: "0 8px",
          }}
        >
          {dictionaryGuess && `My Guess is: ${dictionaryGuess}`}
        </div>
        {loadingGuess && (
          <img
            width="80px"
            src="https://media2.giphy.com/media/XIqCQx02E1U9W/giphy.gif?cid=790b7611332c3acaed9f2d8abb4d5ed6a2e710d36276c646&rid=giphy.gif&ct=g"
          />
        )}
      </div>

      <div style={{ display: "flex" }}>
        <JokesList jokes={playerJokes} hasNoJokeResults={playerHasNoResults} />
        <JokesList jokes={dictionaryJokes} hasNoJokeResults={dictionaryHasNoResults} />
      </div>
    </div>
  );
}

export default App;

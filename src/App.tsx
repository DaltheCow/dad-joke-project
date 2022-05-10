import { Button, TextField } from "@mui/material";
import axios from "axios";
import React from "react";
import useSound from "use-sound";
const buzzer = require("./Buzzer.mp3");
const bell = require("./Bell.mp3");

function App() {
  const [search, setSearch] = React.useState("");
  const [jokes, setJokes] = React.useState([]);
  const [hasNoResults, setHasNoResults] = React.useState(false);
  const [score, setScore] = React.useState(0);
  const [playBuzzer] = useSound(buzzer);
  const [playBell] = useSound(bell);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const searchTerm = search.split(" ").join("+");
    const response = await axios.get(`https://icanhazdadjoke.com/search?term=${searchTerm}`, {
      headers: {
        accept: "application/json",
      },
    });
    const results = response.data.results;
    console.log(results);
    setHasNoResults(results.length === 0);
    if (results.length === 0) {
      playBuzzer();
      setScore((prev) => prev - 1);
    } else {
      playBell();
      setScore((prev) => prev + results.length);
    }
    setJokes(results.map((result: { id: string; joke: string }) => result.joke));
  };

  return (
    <div
      style={{
        margin: "20px 0",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "column",
      }}
    >
      <h1>Dad Joke Search Extravaganza</h1>
      <form onSubmit={handleSubmit}>
        <div style={{ display: "flex" }}>
          <TextField
            style={{ marginRight: "20px" }}
            id="outlined-basic"
            label="Search"
            variant="standard"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <Button style={{ alignSelf: "flex-end" }} type="submit" variant="outlined">
            Find Jokes
          </Button>
        </div>
      </form>
      Score: {score}
      {jokes.length > 0 && <h5>Jokes Results</h5>}
      <ul>
        {jokes.map((joke, i) => (
          <li key={i}>{joke}</li>
        ))}
      </ul>
      {hasNoResults &&
        "Sorry, your search wasn't good enough, we're deducting a point from your score"}
    </div>
  );
}

export default App;

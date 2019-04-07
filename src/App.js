import React from "react";
import ReactDOM from "react-dom";

import "./App.css";

class Pokemon extends React.Component {
  state = {
    pokemonImg: ""
  };

  componentDidMount() {
    fetch(this.props.url)
      .then(response => response.json())
      .then(result => {
        this.setState({
          pokemonImg: result.sprites.front_default
        });
      });
  }

  handleOnClick = () => {
    this.props.onClick(this.props.id);
  };

  render() {
    return (
      <div className="Pokemon" onClick={this.handleOnClick}>
        {this.props.name} {this.props.id}
        <img src={this.state.pokemonImg} alt={this.props.name} />
      </div>
    );
  }
}

class App extends React.Component {
  state = {
    pokemon: [],
    pokemons: {},
    isLoading: false,
    value: "",
    userPokemon: "",
    userPosition: {
      top: 0,
      left: 0
    }
  };

  componentDidMount() {
    fetch("https://pokeapi.co/api/v2/pokemon/")
      .then(response => response.json())
      .then(result => {
        this.setState({
          pokemon: result.results
        });
      });
    window.addEventListener("keydown", e => {
      const userPosition = {
        ...this.state.userPosition
      };
      if (e.code === "ArrowRight") {
        userPosition.left += 10;
      }
      if (e.code === "ArrowDown") {
        userPosition.top += 10;
      }
      if (e.code === "ArrowLeft") {
        userPosition.left -= 10;
      }
      if (e.code === "ArrowUp") {
        userPosition.top -= 10;
      }
      if (
        this.state.userPosition.top !== userPosition.top ||
        this.state.userPosition.left !== userPosition.left
      ) {
        console.log(this.state.userPokemon);
        fetch(
          `https://jfdzs3.firebaseio.com/pokemons/${
            this.state.userPokemon
          }.json`,
          {
            method: "PUT",
            body: JSON.stringify(userPosition)
          }
        );
      }
      this.setState({
        userPosition
      });
    });
    setInterval(this.fetchData, 500);
  }

  fetchData = () => {
    fetch("https://jfdzs3.firebaseio.com/pokemons.json")
      .then(response => response.json())
      .then(pokemons => {
        this.setState({
          pokemons: pokemons || {}
        });
      })
      .catch(() => {});
  };

  handleInputChange = e => {
    this.setState({
      value: e.target.value
    });
  };

  render() {
    const filteredData = this.state.pokemon.filter(pokemon =>
      pokemon.name.includes(this.state.value)
    );
    return (
      <div className="App">
        {this.state.userPokemon ? (
          <div className="game">
            {Object.entries(this.state.pokemons).map(entry => {
              const id = entry[0];
              const position = entry[1];
              return (
                <img
                  key={id}
                  className="player"
                  src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`}
                  style={{
                    top: `${position.top}px`,
                    left: `${position.left}px`
                  }}
                />
              );
            })}
          </div>
        ) : (
          <React.Fragment>
            <div>
              <input onChange={this.handleInputChange} />{" "}
            </div>
            {filteredData.map(pokemon => (
              <Pokemon
                id={
                  +pokemon.url
                    .replace("https://pokeapi.co/api/v2/pokemon/", "")
                    .replace("/", "")
                }
                {...pokemon}
                onClick={userPokemon => {
                  this.setState({
                    userPokemon
                  });
                }}
              />
            ))}
          </React.Fragment>
        )}
      </div>
    );
  }
}

const rootElement = document.getElementById("root");
ReactDOM.render(<App />, rootElement);


export default App;

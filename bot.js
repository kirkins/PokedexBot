const fs = require("fs");
const pokemonList = fs.readFileSync("pokemon.json");
const pokemon = JSON.parse(pokemonList);
const rp = require('minimal-request-promise');
const botBuilder = require('claudia-bot-builder');
const fbTemplate = botBuilder.fbTemplate;

var title = 'Pokemon:';

const api = botBuilder((request, originalApiRequest) => {
  originalApiRequest.lambdaContext.callbackWaitsForEmptyEventLoop = false;

    return rp.get(`https://graph.facebook.com/v2.6/${request.sender}?fields=first_name,last_name,profile_pic,locale,timezone,gender&access_token=${originalApiRequest.env.facebookAccessToken}`)
    .then(response => {

        const user = JSON.parse(response.body);
        var generic = new fbTemplate.generic();

        var rawMsg = JSON.stringify(request.text);
        var msgArray = rawMsg.split(' ');
        var pokeQuery = request.text;
        var pokeCommand;
        var returnText;

        if(msgArray.length>1){
          pokeQuery = msgArray[0].replace(/['"]+/g, '');
          pokeCommand = msgArray[1].replace(/['"]+/g, '');
        }

        pokeQuery = pokeQuery.toLowerCase();
        pokeQuery = capitalizeFirstLetter(pokeQuery);

        if(!pokeCommand && pokeSearch(pokeQuery)) {
          pokemon.slice(pokeSearch(pokeQuery).Nat-1, pokeSearch(pokeQuery).Nat+9).forEach(poke => {
            generic.addBubble(poke.Pokemon, poke.Pokemon)
                .addButton(poke.Pokemon + ' Stats', poke.Pokemon + ' stats')
                .addImage("https://img.pokemondb.net/artwork/" + poke.Pokemon.toLowerCase() + ".jpg");
          });
          return [generic.get()];
        } else if(!pokeSearch(pokeQuery)) {
          var randomNumber = Math.floor(1 + (Math.random() * 639));
          console.log("RAND IS " + randomNumber);
          pokemon.slice(randomNumber, randomNumber+9).forEach(poke => {
            generic.addBubble(poke.Pokemon, poke.Pokemon)
                .addButton(poke.Pokemon + ' Stats', poke.Pokemon + ' stats')
                .addImage("https://img.pokemondb.net/artwork/" + poke.Pokemon.toLowerCase() + ".jpg");
          });
          return [generic.get(),"Enter the name of a pokemon and I'll get more information (see above for a random example)."];
        } else {
          var currentPokemon = pokeSearch(pokeQuery);
          returnText = currentPokemon.Pokemon + "\n";
          returnText += "HP: " + currentPokemon.HP + "\n";
          returnText += "Attack: " + currentPokemon.Atk + "\n";
          returnText += "SpA: " + currentPokemon.SpA + "\n";
          returnText += "SpD: " + currentPokemon.SpD + "\n";
          returnText += "Spe: " + currentPokemon.Spe + "\n";
          returnText += "Total: " + currentPokemon.Total + "\n";

          returnText += "Type I: " + currentPokemon["Type I"] + "\n";
          if(currentPokemon["Type II"]){returnText += "Type II: " + currentPokemon["Type II"] + "\n";}
          returnText += "Hidden Ability: " + currentPokemon["Hidden Ability"] + "\n";
          returnText += "EV Worth: " + currentPokemon["EV Worth"] + "\n";
          if(currentPokemon["Hatch"]!="NONE" && currentPokemon["Hatch"]!="null"){returnText += "Hatch: " + currentPokemon["Hatch"] + "\n"}
          if(currentPokemon["Evolve"]!= "N" &&  currentPokemon["Evolve"]){returnText += "Evolve: " + currentPokemon["Evolve"] + "\n";}

          generic.addBubble("this", "returnText")
          .addButton('more info', 'stats');
          const message = new fbTemplate.text(returnText)
          .addQuickReply('random pokemon', 'random');

          return message.get();
        }

      })

});

function pokeSearch(query) {
  for(var i = 0; i < pokemon.length; i++)
  {
    if(pokemon[i].Pokemon == query)
    {
      return pokemon[i];
    }
  }
}

function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

module.exports = api;

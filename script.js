"use strict";
// window.addEventListener("load", start);

let liste = [];

async function start(params) {
  //   const dataFromAPI = await getJSON("https://api.wc3stats.com/profiles/Clickz");
  const dataFromAPI = await getJSONFromWC3Stats("https://api.wc3stats.com/leaderboard&map=Legion%20TD&ladder=LIHL&season=Season%2013&limit=150");
  //   console.log(dataFromAPI);
  filterByGamesPlayed(dataFromAPI);
}

async function getJSONFromWC3Stats(dataToFetch) {
  const dataThings = await fetch(dataToFetch);
  const JSONtoJS = await dataThings.json();
  console.log(JSONtoJS);
  const listOfPlayers = JSONtoJS.body;
  console.log(listOfPlayers);
  return listOfPlayers;
  //   liste = JSONtoJS;
  //   const result = prepareJSON(JSONtoJS);
  //   return result;
}

// function prepareJSON(object) {
//   console.log(object);
//   const array = [];
//   for (const key of object) {
//     const post = object[key];
//     post.id = key;
//     array.push(post);
//   }
//   console.log(array);
// }

function filterByGamesPlayed(listOfPlayers) {
  // let
  // for (const player of listOfPlayers) {

  // }
  console.log(listOfPlayers);
  const inactivePlayers = listOfPlayers.filter((player) => player.wins !== 0 && player.losses !== 0 && player.played < 20);
  console.log(inactivePlayers);
  //   console.log(inactivePlayers);
}

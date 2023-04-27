"use strict";

window.addEventListener("load", start);

let list = [];
let activity;

async function start(params) {
  console.log("vi er i start");
  //   const dataFromAPI = await getJSON("https://api.wc3stats.com/profiles/Clickz");
  // const dataFromAPI = await getJSONFromWC3Stats("https://api.wc3stats.com/leaderboard&map=Legion%20TD&ladder=LIHL&season=Season%2013&limit=150");
  //   console.log(dataFromAPI);
  document.querySelector("#filterForm").addEventListener("submit", submitFilter);
  document.querySelector("#leagueSelect").addEventListener("input", adaptSeasonsToLeagueSelection);
  // filterByGamesPlayed(dataFromAPI);
}

function adaptSeasonsToLeagueSelection(event) {
  console.log(event.originalTarget.value);
  if (event.originalTarget.value === "LIHL") {
    const html = `
        <option id="seasonOption1" value="9">9</option>
        <option id="seasonOption2"value="10">10</option>
        <option id="seasonOption3"value="11">11</option>
        <option id="seasonOption4"value="12">12</option>
        <option id="seasonOption5"value="13">13</option>
        <option id="seasonOption6"value="14">14</option>
        <option id="seasonOption7"value="15">15</option>`;
    document.querySelector("#seasonSelect").innerHTML = html;
  } else if (event.originalTarget.value === "FBG%20LTD") {
    const html = `
        <option id="seasonOption3"value="3">3</option>
        <option id="seasonOption4"value="4">4</option>
        <option id="seasonOption5"value="5">5</option>
        <option id="seasonOption6"value="6">6</option>
        `;
    document.querySelector("#seasonSelect").innerHTML = html;
  }
}

async function submitFilter(event) {
  console.log(event);
  event.preventDefault();
  const elements = document.querySelector("#filterForm").elements;
  const league = elements.namedItem("leagueSelect").value;
  const season = elements.namedItem("seasonSelect").value;
  activity = elements.namedItem("activitySelect").value;

  console.log("league", league);
  console.log("season", season);
  console.log("activity");

  // const listOfPlayersThatSeason = await getJSONFromWC3Stats(`https://api.wc3stats.com/leaderboard&map=Legion%20TD&ladder=${league}&season=Season%20${season}&limit=500`);
  const listOfPlayersThatSeason = await getJSONFromWC3Stats(`https://api.wc3stats.com/leaderboard&map=Legion%20TD&ladder=${league}&season=Season%20${season}&limit=100`);
  filterByGamesPlayed(listOfPlayersThatSeason);
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

function filterByGamesPlayed(listOfPlayers) {
  console.log(listOfPlayers);
  const inactivePlayers = listOfPlayers.filter((player) => player.wins !== 0 && player.losses !== 0 && player.played < `${activity}`);
  console.log(inactivePlayers);

  inactivePlayers.sort(sortByGamesPlayed);
  for (const player of inactivePlayers) {
    displayInactivePlayers(player);
  }
}

function sortByGamesPlayed(player1, player2) {
  return player1.played - player2.played;
}

function displayInactivePlayers(player) {
  console.log(player);
  const colorClass = changeColorClassByGamesPlayed(player.played);
  const html = `
  <li>Player: ${player.name} with <span class="${colorClass}">${player.played} games played</span> </li>
  `;
  document.querySelector("#listOfPlayers").insertAdjacentHTML("beforeend", html);
}

function changeColorClassByGamesPlayed(amountOfGames) {
  if (activity / amountOfGames > 2) {
    return "red";
  } else if (activity / amountOfGames > 1.5) {
    return "yellow";
  } else {
    return "green";
  }
}

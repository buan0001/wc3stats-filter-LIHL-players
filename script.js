"use strict";

window.addEventListener("load", start);

let list = [];
let filterBy;

async function start(params) {
  console.log("vi er i start");
  //   const dataFromAPI = await getJSON("https://api.wc3stats.com/profiles/Clickz");
  // const dataFromAPI = await getJSONFromWC3Stats("https://api.wc3stats.com/leaderboard&map=Legion%20TD&ladder=LIHL&season=Season%2013&limit=150");
  //   console.log(dataFromAPI);
  document.querySelector("#filterForm").addEventListener("submit", submitFilter);
  document.querySelector("#leagueSelect").addEventListener("input", adaptSeasonsToLeagueSelection);
  // document.querySelector("#filterByCategory").addEventListener("input", changeFormBasedOnFilter);
  // filterByGamesPlayed(dataFromAPI);
}

// function changeFormBasedOnFilter(event) {
//   console.log(event.originalTarget.value);
//   if (event.originalTarget.value === "Winrate") {
//     const html = `
//     <option value="Descending" selected>Descending</option>
//           <option value="Ascending">Ascending</option>
//         `;
//     document.querySelector("#activitySelect").innerHTML = html;
//     document.querySelector("#filterBy").innerHTML = "Sort by:";
//   }
//   if (event.originalTarget.value === "Activity") {
//     const html = `
//               <option value="10">10</option>
//           <option value="20" selected>20</option>
//           <option value="30">30</option>
//           <option value="40">40</option>
//           <option value="50">50</option>
//           <option value="100">100</option>`;
//     document.querySelector("#activitySelect").innerHTML = html;
//     document.querySelector("#filterBy").innerHTML = "Less than this amount of games per season";
//   }
// }

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
  const amount = elements.namedItem("selectAmountToShow").value;
  filterBy = elements.namedItem("activitySelect").value;

  console.log("league", league);
  console.log("season", season);
  console.log(amount);
  console.log("activity");

  const listOfPlayersThatSeason = await getJSONFromWC3Stats(`https://api.wc3stats.com/leaderboard&map=Legion%20TD&ladder=${league}&season=Season%20${season}&limit=${amount}`);
  filterList(listOfPlayersThatSeason);
}

function filterList(listOfPlayers) {
  if (filterBy === "Descending" || filterBy === "Ascending") filterByWinRate(listOfPlayers);
  else filterByGamesPlayed(listOfPlayers);
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

function filterByWinRate(listOfPlayers) {
  let newList = listOfPlayers;
  console.log(filterBy);
  console.log("filterByWinRate in action");
  for (let i = 0; i < listOfPlayers.length; i++) {
    const winrate = (listOfPlayers[i].wins / listOfPlayers[i].played) * 100;
    listOfPlayers[i].winrate = winrate;
  }
  newList.sort(sortByWinRate);
  if (filterBy === "Ascending") {
    console.log("lIST OF PLAYERS:", newList);
    const reveresedListOfPlayers = listOfPlayers.slice().reverse();
    newList = reveresedListOfPlayers;
    console.log("reversed list of players:", newList);
  }

  document.querySelector("#listOfPlayers").innerHTML = "";
  for (const player of newList) {
    displayPlayersByWinRate(player);
  }
}

function test(params) {
  const array = [{ hej: 1 }, { hallo: 2 }, { hvadså: 2 }, { halløjsa: 3 }, { goddag: 4 }];
  console.log(array);
  const reversedArray = array.slice().reverse();

  console.log(reversedArray);
}

function sortByWinRate(player1, player2) {
  return player2.winrate - player1.winrate;
}

function displayPlayersByWinRate(player) {
  console.log(player);
  const colorClass = changeColorClassByWinRate(player.winrate);
  const html = `
  <li>Player: ${player.name} with a <span class="${colorClass}">${player.winrate.toFixed(2)}% win rate</span> </li>
  `;
  document.querySelector("#listOfPlayers").insertAdjacentHTML("beforeend", html);
}

function filterByGamesPlayed(listOfPlayers) {
  const inactivePlayers = listOfPlayers.filter((player) => player.wins + player.losses !== 0 && player.played < `${filterBy}`);

  inactivePlayers.sort(sortByGamesPlayed);
  document.querySelector("#listOfPlayers").innerHTML = "";
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

function changeColorClassByWinRate(winrate) {
  if (winrate >= 55) return "superGreen";
  else if (winrate >= 50) return "green";
  else if (winrate >= 45) return "orange";
  else return "red";
}

function changeColorClassByGamesPlayed(amountOfGames) {
  if (filterBy / amountOfGames > 2) {
    return "red";
  } else if (filterBy / amountOfGames > 1.5) {
    return "yellow";
  } else {
    return "green";
  }
}

// test(0, 0, 1, 10);
// function test(wins, losses, played, activity) {
//   console.log(wins + losses !== 0);
// }

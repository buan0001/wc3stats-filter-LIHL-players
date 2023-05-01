"use strict";

window.addEventListener("load", start);

let sortByCategory;
let gameAmount;
let displayOrder;
let displayAboveOrBelow;
let league;
let season;
let playerAmount;
let listOfPlayersThatSeason = [];
let sortedList = []
// let sortedList = [
//   { life: "aaaaaa", name: "1111" },
//   { life: "bbbbb", name: "2222" },
// ];

async function start(params) {
  console.log("vi er i start");
  document.querySelector("#filterForm").addEventListener("submit", submitFilter);
  document.querySelector("#leagueSelect").addEventListener("change", adaptSeasonsToLeagueSelection);
  document.querySelector("#search").addEventListener("keyup",searchChanged)
  document.querySelector("#search").addEventListener("search", searchChanged)
}

function searchChanged(event) {
  document.querySelector("#listOfPlayers").innerHTML = ""
  console.log(event.target.value);
  const stringToLookFor = event.target.value.toLowerCase()
  const searchedList = sortedList.filter(currentValue => currentValue.name.toLowerCase().includes(stringToLookFor))
  console.log(searchedList)
  if (sortByCategory === "Activity"){for (let i = 0; i < playerAmount && i < searchedList.length; i++) {
    displayByActivity(searchedList[i]);
  }}
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
  document.querySelector("#submit").disabled = true;
  console.log(event);
  event.preventDefault();
  const elements = document.querySelector("#filterForm").elements;

  playerAmount = elements.namedItem("selectPlayersToShow").value;

  sortByCategory = elements.namedItem("sortByCategory").value;
  gameAmount = elements.namedItem("amountOfGames").value;
  displayOrder = elements.namedItem("descendingOrAscending").value;
  displayAboveOrBelow = elements.namedItem("moreOrLess").value;

  console.log("playerAmount", playerAmount);
  console.log("gameAmount", gameAmount);
  console.log("displayOrder", displayOrder);
  console.log("displayAboveOrBelow", displayAboveOrBelow);
  console.log("sortByCategory", sortByCategory);

  // If league and elements are unchanged, no need to fetch a new list

  if (league === elements.namedItem("leagueSelect").value && season === elements.namedItem("seasonSelect").value) {
    applyFilters(listOfPlayersThatSeason);
  }

  // Otherwise set new values for league and season and fetch. This will happen on first filter and every time league or season changes
  else {
    league = elements.namedItem("leagueSelect").value;
    season = elements.namedItem("seasonSelect").value;
    console.log("league", league);
    console.log("season", season);
    listOfPlayersThatSeason = await getJSONFromWC3Stats(`https://api.wc3stats.com/leaderboard&map=Legion%20TD&ladder=${league}&season=Season%20${season}&limit=500`);
    // listOfPlayersThatSeason = await getJSONFromWC3Stats(`https://api.wc3stats.com/leaderboard&map=Legion%20TD&ladder=${league}&season=Season%20${season}&limit=`);
    addWinRateToAllPlayers(listOfPlayersThatSeason);
  }
}

async function getJSONFromWC3Stats(dataToFetch) {
  const dataThings = await fetch(dataToFetch);
  const JSONtoJS = await dataThings.json();
  const listOfPlayers = JSONtoJS.body;
  console.log(listOfPlayers);
  return listOfPlayers;
}

function addWinRateToAllPlayers(listOfPlayers) {
  // Add a winrate property to each player object

  for (let i = 0; i < listOfPlayers.length; i++) {
    const winrate = (listOfPlayers[i].wins / listOfPlayers[i].played) * 100;
    listOfPlayers[i].winrate = winrate;
  }

  console.log("listOfPLayers", listOfPlayers);
  applyFilters(listOfPlayers);
}

function applyFilters(listOfPlayers) {
  document.querySelector("#submit").disabled = false;
  document.querySelector("#listOfPlayers").innerHTML = "";
  console.log(listOfPlayers);

  // NU VIL VI GERNE HAVE DEN TIL AT VISE EFTER: PLAYERAMOUNT(1) (hvor mange der skal vises på siden), GAMEAMOUNT(2) (hvor mange de hver især har spillet) -
  // DISPLAY ABOVE OR BELOW(3)(om den skal vise spillere med flere eller færre games end GAMEAMOUNT), DISPLAYORDER(4) (om det skal være aftagende eller tiltagende) -
  // OG SELVFØLGELIG OM VI SORTERER EFTER WINRATE(5) ELLER (IN)AKTIVITET(6)... hvilken rækkefølge?
  // Ide: Playeramount(1) ændrer vi først på til allersidst med et for-loop, der kører display-funktionerne PLAYERAMOUNT antal gange
  // GAMEAMOUNT(2) og DISPLAY ABOVE OR BELOW(3) kan ordnes sammen: ABOVE OR BELOW først. Den skal blot specificere, hvilket GAMEAMOUNT filter, der skal bruges. Lav et nyt array i gameamount som sendes videre
  // Så nu har vi en liste der kun viser spillere med den relevante mængde games.
  // Vi kan ikke rigtig bruge displayorder før vi allerede har sorteret efter winrate/aktivitet - så vi burde gøre dette bagefter med et if-statement.

  // Gameamount(2) TJEK, displayaboveorbelow(3) TJEK,
  let newListOfPlayers = filterByAmountOfGamesThisSeason(listOfPlayers);
  console.log(newListOfPlayers);

  if (sortByCategory === "Winrate") sortByWinRate(newListOfPlayers);
  else if (sortByCategory === "Activity") sortByGamesPlayed(newListOfPlayers);
  else if (sortByCategory === "Rating") sortByRating(newListOfPlayers);
}

function filterByAmountOfGamesThisSeason(listOfPlayers) {
  // Make a new array without the "invalid" players (0 wins, 0 losses. These only exists due to wrong uploads)
  const actualPlayers = listOfPlayers.filter((player) => player.wins + player.losses > 0);
  let anotherList;

  // Filters actualplayers based on the criteria, saves the filtered list in anotherList and returns it
  if (displayAboveOrBelow === "below") {
    anotherList = actualPlayers.filter((player) => player.played < gameAmount);
  } else if (displayAboveOrBelow === "above") {
    anotherList = actualPlayers.filter((player) => player.played > gameAmount);
  }

  return anotherList;
}

function sortByRating(listOfPlayers) {

  if (displayOrder === "Ascending") {
    sortedList = listOfPlayers.sort((player1, player2) => player1.rating - player2.rating);
  } else {
    sortedList = listOfPlayers.sort((player1, player2) => player2.rating - player1.rating);
  }
  for (let i = 0; i < playerAmount && i < sortedList.length; i++) {
    displayPlayersByWinRate(sortedList[i]);
  }
}

function sortByWinRate(listOfPlayers) {
  // Tilpas listOfPlayers' rækkefølge baseret på displayorder og gem det i sortedlist. Vis nu spillerne med variablen

  if (displayOrder === "Ascending") {
    sortedList = listOfPlayers.sort((player1, player2) => player1.winrate - player2.winrate);
  } else {
    sortedList = listOfPlayers.sort((player1, player2) => player2.winrate - player1.winrate);
    console.log("sortedList: ", sortedList);
  }
  for (let i = 0; i < playerAmount && i < sortedList.length; i++) {
    displayPlayersByWinRate(sortedList[i]);
  }
}

function displayPlayersByWinRate(player) {
  console.log("player: ", player);
  console.log("player.winrate: ", player.winrate);
  const colorClass = changeColorClassByWinRate(player.winrate);
  const html = `
  <li>${player.name} played <span class="orange">${player.played}</span> games with a rating of <span class="orange">${
    player.rating
  }</span> and a a <span class="${colorClass}">${player.winrate.toFixed(2)}% win rate</span> </li>
  `;
  document.querySelector("#listOfPlayers").insertAdjacentHTML("beforeend", html);
}

function sortByGamesPlayed(listOfPlayers) {

  if (displayOrder === "Ascending") {
    sortedList = listOfPlayers.sort((player1, player2) => player1.played - player2.played);
    console.log("ascendinglist: ", sortedList);
  } else {
    sortedList = listOfPlayers.sort((player1, player2) => player2.played - player1.played);
    console.log("sortedList: ", sortedList);
  }
  for (let i = 0; i < playerAmount && i < sortedList.length; i++) {
    displayByActivity(listOfPlayers[i]);
  }
}

function displayByActivity(player) {
  console.log(player);
  let colorClass;
  if (displayAboveOrBelow === "above") {
    colorClass = "orange";
  } else {
    colorClass = changeColorClassByGamesPlayed(player.played);
  }

  const html = `
  <li>${player.name} with <span class="${colorClass}">${player.played} games played</span>, a rating of <span class="orange">${
    player.rating}</span> and a <span class="orange">${player.winrate.toFixed(2)}%</span> winrate</li>
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
  if (gameAmount / amountOfGames > 2) {
    return "red";
  } else if (gameAmount / amountOfGames > 1.5) {
    return "yellow";
  } else {
    return "green";
  }
}

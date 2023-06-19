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
let sortedList = [];

async function start(params) {
  document.querySelector("#filterForm").addEventListener("submit", submitFilter);
  document.querySelector("#leagueSelect").addEventListener("change", adaptSeasonsToLeagueSelection);
  document.querySelector("#search").addEventListener("keyup", searchChanged);
  document.querySelector("#search").addEventListener("search", searchChanged);
  document.querySelector("#gamesPerDay").addEventListener("submit", fetchReplaysFromLeague);
  // document.querySelector("#gamesPerDay").addEventListener("submit", fetchLeagueSeasonsAndIds);
}

async function fetchReplaysFromLeague(event) {
  event.preventDefault();
  document.querySelector("#loadingElement").classList.add("loading");
  const form = event.target;
  console.log(form.leagueSelect.value);
  const leagueToCheck = form.leagueSelect.value;
  if (leagueToCheck === "all") {
    const leagues = ["LIHL", "FBG%20LTD", "JUB"];
    // const leagues = ["FBG%20LTD", "JUB"];
    const gamesPlayedPerDayAllLeagues = [];
    for (let i = 0; i < leagues.length; i++) {
      console.log(leagues[i]);
      const response = await fetch(`https://api.wc3stats.com/replays&search=Legion%20TD&ladder=${leagues[i]}&limit=5000&sort=playedOn&order=desc`);
      const listOfReplays = await response.json();
      gamesPlayedPerDayAllLeagues.push(getDatesOfReplays(listOfReplays.body, leagues[i]));
    }
    const replayStatsConvertedToCSV = convertArrayToCSV(gamesPlayedPerDayAllLeagues);
    // createDownloadBlob(replayStatsConvertedToCSV);
  } else {
    const response = await fetch(`https://api.wc3stats.com/replays&search=Legion%20TD&ladder=${leagueToCheck}&limit=10000&sort=playedOn&order=desc`);
    const listOfReplays = await response.json();
    const replayArray = getDatesOfReplays(listOfReplays.body, leagueToCheck);
    const replayStatsConvertedToCSV = convertArrayToCSV(replayArray);
    // createDownloadBlob(replayStatsConvertedToCSV);
  }
  document.querySelector("#loadingElement").classList.remove("loading");
}

function createDownloadBlob(CSVStructure) {
  const file = new Blob([CSVStructure], { type: "text/csv;charset=utf-8" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(file);
  if (link.download !== undefined) {
    link.href = url;
    link.setAttribute("download", "Stats.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } else {
    console.log("else+???");
  }
}

function convertArrayToCSV(arrayOfReplayStats) {
  // Opret en tom streng til at gemme CSV-dataene
  let csvString = "";
  if (arrayOfReplayStats[0].Date == undefined) {
    const headers = Object.keys(arrayOfReplayStats[0][0]);
    csvString += headers.join(",") + "\n";

    arrayOfReplayStats.forEach(leagueStats => (csvString += generateCSVString(leagueStats)));
    console.log("csv test:", csvString);
    return csvString;
  } else if (arrayOfReplayStats[0].Date !== undefined) {
    const headers = Object.keys(arrayOfReplayStats[0]);
    csvString += headers.join(",") + "\n";
    csvString += generateCSVString(arrayOfReplayStats);
    return csvString;
  }
}

function generateCSVString(array) {
  let csvString = "";

  // Generer CSV-data for hver række i arrayet
  array.forEach(item => {
    const values = Object.values(item);

    // Håndter specialtegn i værdierne ved at omslutte dem med citationstegn
    const escapedValues = values.map(value => {
      if (typeof value === "string" && value.includes(",")) {
        return `"${value}"`;
      }
      return value;
    });

    csvString += escapedValues.join(",") + "\n";
  });

  return csvString;
}

function getDatesOfReplays(listOfReplays, nameOfLeague) {
  let gamesPlayed = [];
  if (nameOfLeague === "FBG%20LTD") {
    nameOfLeague = `FBG LTD`;
  }
  for (const replay of listOfReplays) {
    const replayDate = replay.playedOn;
    const dateToArray = new Date(replayDate * 1000).toISOString().slice(0, 10);
    const existingDate = gamesPlayed.find(obj => obj.Date === dateToArray);

    if (existingDate) {
      existingDate["Amount of Games"] += 1;
    } else {
      const newObject = {
        Date: dateToArray,
        "Amount of Games": 1,
        League: nameOfLeague,
      };
      gamesPlayed.push(newObject);
    }
  }
  console.log(gamesPlayed);
  return gamesPlayed;
}

async function fetchLeagueSeasonsAndIds(event) {
  event.preventDefault();
  const form = event.target;

  const response = await fetch(`https://api.wc3stats.com/maps/Legion%20TD`);
  const converted = await response.json();
  const arrayOfLTDVariants = converted.body.variants;
  let correctVariant;
  for (const variant of arrayOfLTDVariants) {
    if (variant.name === "Legion TD") correctVariant = variant;
  }
  console.log("correct variant:", correctVariant);
  const seasons = {
    jubSeasons: [],
    lihlSeasons: [],
    fbgltdSeasons: [],
    fbgltdsoloSeasons: [],
  };

  for (const object of correctVariant.stats) {
    const ladder = object.key.ladder;
    if (ladder === "LIHL" || ladder === "FBG LTD" || ladder === "JUB" || ladder === "FBG LTD Solo") {
      const reg = new RegExp(/\s+/g);
      const dynamicSeason = `${ladder.replace(reg, "").toLowerCase()}Seasons`;
      const newSeason = { season: object.key.season, id: object.id };
      seasons[dynamicSeason].push(newSeason);
      // seasons[dynamicSeason].push(`${season}. id: ${object.id}`);
    }
  }
  console.log(seasons);
  console.log("lihl seasons:", seasons.lihlSeasons);
  console.log("jub seasons:", seasons.jubSeasons);
  console.log("fbg seasons:", seasons.fbgltdSeasons);

  getGamesPlayedPerDay(seasons);
}

async function getGamesPlayedPerDay(allLeagues) {
  // const response = await fetch ("https://api.wc3stats.com/stats/52849")
  // console.log("entries:", Object.entries(arrayOfLeagueSeasons));
  // console.log("keys:", Object.keys(arrayOfLeagueSeasons));
  // console.log("values:", Object.values(arrayOfLeagueSeasons));
  for (const league in allLeagues) {
    // console.log(arrayOfLeague);
    // console.log(arrayOfLeagueSeasons[arrayOfLeague]);
    for (const season of league) {
      console.log(season);
    }
  }
}

function searchChanged(event) {
  document.querySelector("#listOfPlayers").innerHTML = "";
  console.log(event.target.value);
  const stringToLookFor = event.target.value.toLowerCase();
  const searchedList = sortedList.filter(currentValue => currentValue.name.toLowerCase().includes(stringToLookFor));
  console.log(searchedList);
  if (sortByCategory === "Activity") {
    for (let i = 0; i < playerAmount && i < searchedList.length; i++) {
      displayByActivity(searchedList[i]);
    }
  } else {
    for (let i = 0; i < playerAmount && i < searchedList.length; i++) {
      displayPlayersByWinRate(searchedList[i]);
    }
  }
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
        <option id="seasonOption7"value="15">15</option>
        <option id="seasonOption8"value="16">16</option>
        `;
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
  const actualPlayers = listOfPlayers.filter(player => player.wins + player.losses > 0);
  let anotherList;

  // Filters actualplayers based on the criteria, saves the filtered list in anotherList and returns it
  if (displayAboveOrBelow === "below") {
    anotherList = actualPlayers.filter(player => player.played < gameAmount);
  } else if (displayAboveOrBelow === "above") {
    anotherList = actualPlayers.filter(player => player.played > gameAmount);
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
  <li>${player.name} played <span class="orange">${player.played}</span> games with a rating of <span class="orange">${player.rating}</span> and a a <span class="${colorClass}">${player.winrate.toFixed(2)}% win rate</span> </li>
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
  <li>${player.name} with <span class="${colorClass}">${player.played} games played</span>, a rating of <span class="orange">${player.rating}</span> and a <span class="orange">${player.winrate.toFixed(2)}%</span> winrate</li>
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

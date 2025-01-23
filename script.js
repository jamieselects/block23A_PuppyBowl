// Use the API_URL variable to make fetch requests to the API.
// Replace the placeholder with your cohort name (ex: 2109-UNF-HY-WEB-PT)
const cohortName = "2410-ftb-et-web-am";
const API_URL = `https://fsa-puppy-bowl.herokuapp.com/api/${cohortName}`;

/**
 * Fetches all players from the API.
 * @returns {Object[]} the array of player objects
 */
const fetchAllPlayers = async () => {
  try {
    const response = await fetch(`${API_URL}/players`);

    if (!response.ok) {
      throw new Error (`Failed to fetch players: ${response.status}`);
    }
    
    const data = await response.json();
    console.log("response is >", data.data.players);
    return data.data.players;
    
  } catch (err) {
    console.log("Uh oh, trouble fetching players!", err);
    return []; //return empty array if error
  }
};



/**
 * Fetches a single player from the API.
 * @param {number} playerId
 * @returns {Object} the player object
 */
const fetchSinglePlayer = async (playerId) => {
  try {
    const response = await fetch(`${API_URL}/players/${playerId}`)
    console.log("player ID is >", playerId);
    const data = await response.json();
    console.log("player is >", data);
    return data.data.player;

  } catch (err) {
    console.error(`Oh no, trouble fetching player #${playerId}!`, err);
    return null;
  }
};

/**
 * Adds a new player to the roster via the API.
 * @param {Object} playerObj the player to add
 * @returns {Object} the player returned by the API
 */
const addNewPlayer = async (playerObj) => {
  console.log("newPlayer is =>", playerObj);
  try {
    const response = await fetch(`${API_URL}/players`, {
      method: 'POST',
      headers: {
        'Content-type': 'application/json',
      },
      body: JSON.stringify(playerObj),
    });

    if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const result = await response.json();
    console.log('data is', data);
    return result.data.newPlayer;
  } catch (err) {
    console.error("Oops, something went wrong with adding that player!", err);
    return null;
  }
};

/**
 * Removes a player from the roster via the API.
 * @param {number} playerId the ID of the player to remove
 */
const removePlayer = async (playerId) => {
  try {
    const response = await fetch(`${API_URL}/players/${playerId}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    console.log(`Player #${playerId} has been removed successfully.`);
    return true;
  } catch (err) {
    console.error(
      `Whoops, trouble removing player #${playerId} from the roster!`,
      err
    );
    return false;
  }
};

/**
 * Updates `<main>` to display a list of all players.
 *
 * If there are no players, a corresponding message is displayed instead.
 *
 * Each player is displayed in a card with the following information:
 * - name
 * - id
 * - image (with alt text of the player's name)
 *
 * Additionally, each card has two buttons:
 * - "See details" button that, when clicked, calls `renderSinglePlayer` to
 *    display more information about the player
 * - "Remove from roster" button that, when clicked, will call `removePlayer` to
 *    remove that specific player and then re-render all players
 *
 * Note: this function should replace the current contents of `<main>`, not append to it.
 * @param {Object[]} playerList - an array of player objects
 */
const renderAllPlayers = (playerList) => {
  const main = document.querySelector('main');
  main.innerHTML = "";

  const playerCards = playerList.map((player) => {
    const playerCard = document.createElement('div');
    playerCard.classList.add('player-card');

    playerCard.innerHTML = `
      <h1>${player.name}</h1>
      <p>ID: ${player.id}</p>
      <img src="${player.imageUrl}" alt="${player.name}"/>
      <p>Status: ${player.status}</p>
      <button class="see-details" data-id="${player.id}">See Details</button>
      <button class="remove-player" data-id="${player.id}">Remove from Roster</button>
    `;

    // Attach Event Listeners
    const seeDetailsButton = playerCard.querySelector('.see-details');
    seeDetailsButton.addEventListener('click', () => {
      renderSinglePlayer(player);
    });

    const removePlayerButton = playerCard.querySelector('.remove-player');
    removePlayerButton.addEventListener('click', async () => {
      const success = await removePlayer(player.id);
      if (success) {
        // Re-fetch and re-render players
        const players = await fetchAllPlayers();
        renderAllPlayers(players);
      }
    });

    return playerCard;
  });
  
  main.replaceChildren(...playerCards);
};

/**
 * Updates `<main>` to display a single player.
 * The player is displayed in a card with the following information:
 * - name
 * - id
 * - breed
 * - image (with alt text of the player's name)
 * - team name, if the player has one, or "Unassigned"
 *
 * The card also contains a "Back to all players" button that, when clicked,
 * will call `renderAllPlayers` to re-render the full list of players.
 * @param {Object} player an object representing a single player
 */
const renderSinglePlayer = (player) => {
  const main = document.querySelector('main');
  main.innerHTML = ''; // Clear existing content

  const playerCard = document.createElement('div');
  playerCard.classList.add('player-card');

  playerCard.innerHTML = `
    <h1>${player.name}</h1>
    <p>ID: ${player.id}</p>
    <p>Breed: ${player.breed || 'Unknown'}</p>
    <img src="${player.imageUrl}" alt="${player.name}"/>
    <p>Team: ${player.team ? player.team.name : 'Unassigned'}</p>
    <button id="back-button">Back to All Players</button>
  `;

  main.appendChild(playerCard);

  // Attach Event Listener to Back Button
  const backButton = document.getElementById('back-button');
  backButton.addEventListener('click', async () => {
    const players = await fetchAllPlayers();
    renderAllPlayers(players);
  });
};

/**
 * Fills in `<form id="new-player-form">` with the appropriate inputs and a submit button.
 * When the form is submitted, it should call `addNewPlayer`, fetch all players,
 * and then render all players to the DOM.
 */
const renderNewPlayerForm = () => {
  const form = document.getElementById('new-player-form');

  // Clear any existing content in the form
  form.innerHTML = '';
  form.innerHTML = `
  <h3>Add new players here</h3>
  `

  // Create form elements
  const nameLabel = document.createElement('label');
  nameLabel.setAttribute('for', 'player-name');
  nameLabel.textContent = 'Player Name: ';
  
  const nameInput = document.createElement('input');
  nameInput.type = 'text';
  nameInput.id = 'player-name';
  nameInput.name = 'name';
  nameInput.placeholder = 'Enter player name';
  nameInput.required = true;

  const imageLabel = document.createElement('label');
  imageLabel.setAttribute('for', 'player-image');
  imageLabel.textContent = 'Image URL: ';

  const imageInput = document.createElement('input');
  imageInput.type = 'url';
  imageInput.id = 'player-image';
  imageInput.name = 'imageUrl';
  imageInput.placeholder = 'Enter image URL';
  imageInput.required = true;

  const breedLabel = document.createElement('label');
  breedLabel.setAttribute('for', 'player-breed');
  breedLabel.textContent = 'Breed: ';

  const breedInput = document.createElement('input');
  breedInput.type = 'text';
  breedInput.id = 'player-breed';
  breedInput.name = 'breed';
  breedInput.placeholder = 'Enter breed';

  const statusLabel = document.createElement('label');
  statusLabel.setAttribute('for', 'player-status');
  statusLabel.textContent = 'Status: ';

  const statusSelect = document.createElement('select');
  statusSelect.id = 'player-status';
  statusSelect.name = 'status';
  
  const activeOption = document.createElement('option');
  activeOption.value = 'field';
  activeOption.textContent = 'Field';

  const inactiveOption = document.createElement('option');
  inactiveOption.value = 'bench';
  inactiveOption.textContent = 'Bench';

  statusSelect.appendChild(activeOption);
  statusSelect.appendChild(inactiveOption);

  const submitButton = document.createElement('button');
  submitButton.type = 'submit';
  submitButton.textContent = 'Add Player';

  // Append elements to the form
  form.appendChild(nameLabel);
  form.appendChild(nameInput);
  form.appendChild(document.createElement('br')); // Line break for better layout

  form.appendChild(imageLabel);
  form.appendChild(imageInput);
  form.appendChild(document.createElement('br'));

  form.appendChild(breedLabel);
  form.appendChild(breedInput);
  form.appendChild(document.createElement('br'));

  form.appendChild(statusLabel);
  form.appendChild(statusSelect);
  form.appendChild(document.createElement('br'));

  form.appendChild(submitButton);

  // Attach event listener for form submission
  form.addEventListener('submit', async (event) => {
    event.preventDefault(); // Prevent default form submission behavior

    // Gather form data
    const name = document.getElementById('player-name').value.trim();
    const imageUrl = document.getElementById('player-image').value.trim();
    const breed = document.getElementById('player-breed').value.trim();
    const status = document.getElementById('player-status').value;

    // Basic validation (optional, as 'required' attributes are already set)
    if (!name || !imageUrl) {
      alert('Please fill in all required fields.');
      return;
    }

    // Create new player object
    const newPlayer = {
      name,
      imageUrl,
      breed: breed || 'Unknown', // Default value if breed is not provided
      status,
    };

    //test image https://hips.hearstapps.com/hmg-prod/images/dog-puppy-on-garden-royalty-free-image-1586966191.jpg?crop=0.752xw:1.00xh;0.175xw,0&resize=1200:*

    // Add the new player via the API
    const addedPlayer = await addNewPlayer(newPlayer);
    console.log('addedPlayer is', addedPlayer);

    if (addedPlayer) {
      // Refresh the player list
      const players = await fetchAllPlayers();
      renderAllPlayers(players);

      // Reset the form
      form.reset();
      alert(`Player "${addedPlayer.name}" added successfully!`);
    } else {
      alert('Failed to add new player. Please try again.');
    }
  });
};


/**
 * Initializes the app by fetching all players and rendering them to the DOM.
 */
const init = async () => {
  const players = await fetchAllPlayers();
  renderAllPlayers(players);
  renderNewPlayerForm();
};

// This script will be run using Node when testing, so here we're doing a quick
// check to see if we're in Node or the browser, and exporting the functions
// we want to test if we're in Node.
if (typeof window === "undefined") {
  module.exports = {
    fetchAllPlayers,
    fetchSinglePlayer,
    addNewPlayer,
    removePlayer,
    renderAllPlayers,
    renderSinglePlayer,
    renderNewPlayerForm,
  };
} else {
  init();
}

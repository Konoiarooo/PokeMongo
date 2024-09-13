const getPokemonUrl = id => `https://pokeapi.co/api/v2/pokemon/${id}`;
const pokemonTester = (index) => {
    return {
        name: "Poke Teste",
        id: index +1,
        types: [
            {
                type:{ name:"electric" }
            }
        ],
        sprites: {
            front_default: "./inosuke bugado.jpg",
            versions: {
                'generation-v' : {
                    'black-white':{
                        animated: {
                            front_default: "./Natsu.jpg"
                        }
                    }
                }
            }
        }
    }
}

let userName = null;

const listPokemonsInBoard = Array(150);
const pokemonsChoseds = Array();

const pokeSelectModal = {
    modalOpen: false,
    comfirm: false
};

function login(){
    const main = document.getElementsByTagName('main')[0];
    const loginForm = '<div id="loginForm"><div><input id="userName" placeholder="nickname" type="text"/><button onclick="insertName()">Play</div></div>';
    insertHtml(loginForm, main);
};

function insertName(){
    userName = document.getElementById('userName').value;
    if(userName !== "" && userName !== null){
        const loginFomrm = document.getElementById('loginForm');
        loginFomrm.remove();
        gameStart();
    }
};

const generatePokemonPromises = () => Array(150).fill().map((_, index) => 
    fetch(getPokemonUrl(index + 1))
    .then((response) => {
        const pokemon = response.json();
        pokemon.then((x) => {
            listPokemonsInBoard.push(x)
        })
        return pokemon;
    })
    .catch(error => {
        console.log(error)
        const pokemon = pokemonTester(index);

        listPokemonsInBoard.push(pokemon)

        return pokemon;
    })
);

const generateHtml = pokemons => pokemons?.reduce((accumulator, { name, id, types, sprites }) => {
    const elementType = types?.map(typeInfo => typeInfo?.type?.name);

    accumulator += `
    <div class="poke-card ${elementType[0]}">
        <img id="poke-card-img-${id}" alt="${name}" src="${sprites?.front_default}" />
        <div class="poke-card-description">
            <span>${id} - ${name}</span>
            <span class="poke-card-desc-type">${elementType?.join(' | ')}</span>
        </div>
    </div>
    `

    return accumulator;
}, '')

const insertPokemonsIntoPage = pokemons => {
    const mainContainer = document.getElementById('main-container');
    const selection = mainContainer.getElementsByClassName('poke-select')[0];
    insertHtml(pokemons, selection);

    const pokeCard = selection.getElementsByClassName('poke-card');
    for (let index = 0; index < pokeCard.length; index++) {
        pokeCard[index].addEventListener('click', () => chosePokemon(index, pokeCard[index]))
    }
}

function chosePokemon(index, pokeCard){
    if(!pokeSelectModal.modalOpen){
        const pokemonSelected = listPokemonsInBoard.filter(x => x?.id === index +1);
        const isSelected = pokemonsChoseds.find(x => x?.id === pokemonSelected[0].id);
    
        const pokeImgSelected = document.getElementById(`poke-card-img-${index +1}`);
    
        if(isSelected === undefined){
            pokemonsChoseds.push(pokemonSelected[0]);
            pokeImgSelected.insertAdjacentHTML('beforebegin', '<span class="selected"> SELECTED </span>')
        }
        else{
            const pokeIndex = pokemonsChoseds.findIndex(x => x.id === index +1);
            pokemonsChoseds.splice(pokeIndex,[1])
            pokeCard.removeChild(pokeCard.getElementsByClassName("selected")[0])
        }
        
        if(pokemonsChoseds?.length === 5){
            const body = document.getElementsByTagName('body')[0];
            body.insertAdjacentHTML('beforebegin', modalPokeBagHtml());
            
            const pokeBagSelection = document.getElementById('pokeBag-selection');
            pokeBagSelection.innerHTML = pokeInBagCardHtml().join(' ');
            pokeSelectModal.modalOpen = true;
        }
    }
}

const pokeInBagCardHtml = () => pokemonsChoseds?.map(({ name, id, sprites }) => {
    const cards = `
        <div style="width:130px; height:180px; margin: 0.4rem; padding: 0.3rem; display:inline-flex; justify-content:center; flex-direction: column;">
            <img id="poke-card-img-${id}" alt="${name}" src="${sprites['versions']['generation-v']['black-white']['animated']['front_default']}"/>
        </div>
    `;

    return cards;
});

const modalPokeBagHtml = () => {
    
    return `
    <div id="pokeBag-removeModal" style="background-color: #6c84933a; width: 100vw; height: 100vh; position: absolute; display: flex; justify-content: center; align-items: center;">
        <div style="box-shadow: var(--box-shadow); border-radius: 0.2rem; background-color: #fff; padding: 0.6rem; margin: 0.6rem; z-index: 10;">
            <div id="pokeBag-selection" style="display:inline-flex; justify-content: space-evenly; flex-wrap: wrap;">
            </div>
            <div style="display: flex; justify-content: space-evenly;">
                <button onclick="modalEvent('confirm')" style="background-color:#2980D6; color:#F2F7FD;">CONFIRMAR</button>
                <button onclick="modalEvent('cancel')" style="background-color:#2980D6; color:#F2F7FD;">CANCELAR</button>
            </div>
        </div>
    </div>
    `;
}

const modalEvent = (event) => {
    const mainContainer = document.getElementById('main-container');
    const selection = mainContainer.getElementsByClassName('poke-select')[0];
    const removeModal = document.getElementById('pokeBag-removeModal');
        
    if(event === 'confirm'){
        pokeSelectModal.comfirm = true;
        pokeSelectModal.modalOpen = false;
        selection.remove();
        login();
    }
    else if(event === 'cancel'){
        pokeSelectModal.comfirm = false;
        pokeSelectModal.modalOpen = false;
        
        pokemonsChoseds.splice(0,[5])
    }

    removeModal.remove();

    const pokeCard = selection.getElementsByClassName('poke-card');

    for (let index = 0; index < pokeCard.length; index++) {
        const pokeCardSelected = pokeCard[index].getElementsByClassName("selected")[0]
        if(pokeCardSelected !== undefined)
            pokeCardSelected.remove()
    }
}

const pokemonsPromise = generatePokemonPromises();

Promise.all(pokemonsPromise)
.then(generateHtml)
.then(insertPokemonsIntoPage);

//*******************************************Game start*************************************************
const socket = io.connect();

function gameStart(){

    if(pokemonsChoseds.length === 5){
        const mainContainer = document.getElementById('main-container');
        const loadingHtml = '<div style="width:100%;height:100%;display:flex;justify-content:center;align-items:center;"><div class="loading">SEACHING PLAYERS</div></div>';
        
        insertHtml(loadingHtml, mainContainer);
        awaitOponent();
    }
    else{
        window.location.reload();
    }
}

function awaitOponent(){
    const user = { 
        name: userName,
        room: null, 
        pokemons: [pokemonsChoseds[0]]
    };

    socket.emit('seach_game', user);
    socket.emit('start_game');
    insertGameCanvas();
}

const gameCanvasHtml = (enemyFrontDefault, enemyPoke) => {
    
    const pokeChosedPlayer = pokemonsChoseds[0];
    const playerBackDefault = pokeChosedPlayer['sprites']['versions']['generation-v']['black-white']['animated']['back_default'];
   
    return `
        <div id="game-canvas">
            <div class="enemy-canvas">
            <div class="enemy-canvas-pokemon">
                    <img src="${enemyFrontDefault}" />
            </div>
            <div class="canvas-status">
                    <span>${enemyPoke.name.toLocaleUpperCase()}</span>
                    <div class="canvas-hp"><div></div></div>
            </div>
            </div>
            <div class="player-canvas">
            <div class="player-canvas-pokemon">
                    <img src="${playerBackDefault}" />
            </div>
            <div class="canvas-status">
                    <span>${pokeChosedPlayer.name.toLocaleUpperCase()}</span>
                    <div class="canvas-hp"><div></div></div>
                    <span> 10/10 </span>
            </div>
            </div>
        </div>
        `;
}
    
function insertGameCanvas(){
    socket.on('start_game', (users) => {
        const enemyUser = users.find((user) => user.name !== userName);
        const me = users.find((user) => user.name === userName);

        const enemyFrontDefault = enemyUser['pokemons'][0]['sprites']['versions']['generation-v']['black-white']['animated']['front_default'];
        const mainContainer = document.getElementById('main-container');
        mainContainer.innerHTML =  gameCanvasHtml(enemyFrontDefault, enemyUser.pokemons[0]);

        const listPokeBattle = [];
        listPokeBattle.push(me.pokemons[0]);
        listPokeBattle.push(enemyUser.pokemons[0]);

        const firstPokeTurn = listPokeBattle.reduce((prev, current) => {
            return prev.stats[5]['base_stat'] > current.stats[5]['base_stat'] ? prev : current;
        })

        turnEvent(firstPokeTurn, users);
        insertGameCanvasDialogHtml();
    });
}
        
const gameCanvasDialogOptionsHtml = (options) => {
    if(options)
        return `
            <button class="btn-in-game" onclick="attackEvent()">ATTACK</button>
            <button class="btn-in-game" onclick="passaEvent()">PASS</button>
        `;
    
    return "";
}

const insertGameCanvasDialogHtml = () =>{
    const gameCanvas = document.getElementById('game-canvas');
    gameCanvas.innerHTML += gameCanvasDialogHtml("Let's Goooooo boys!!!");
    
    const canvasDialog = document.getElementById('canvas-dialog-options');
    insertDialogOptions(gameCanvasDialogOptionsHtml(), canvasDialog);
}

const gameCanvasDialogHtml = (text) => {
    
    return `
            <div style="height:105px;position: relative;bottom:80px;background-color:var(--dialog-bg);border-radius:0.2rem;border:2px #4E4E44 solid; display:flex; width:500px;">
                <span style="width:100%;font-family:'Inconsolata', monospace; padding: 0.5rem;">${text}</span>
                <div id="canvas-dialog-options" style="border: 2px #4E4E44 solid;"></div>
            </div>
    `;
}
        
function insertDialogOptions(html, documentt){
    documentt.innerHTML += html;
}

// const mainContainer = document.getElementById('main-container');
// const selection = mainContainer.getElementsByClassName('poke-select')[0];
// selection.remove();
// gameStart(mainContainer);

function insertHtml(html, document){
    document.innerHTML += html;
}

//************************************************COMBAT ************************************************//
function attackEvent(){
    //buscar o dano de attack do pokemon que está em jogo
    //buscar a vida do pokemon inimigo
    //calcular o dano sofrido
    //buscar a barra de vida do inimigo na dom
    //reduzir a vida do inimigo
    //mexer a barra de vida
    //passar a vez
}

function passTurnEvent(){
    return false;
}

function turnEvent(firstPokemon, users){
    const userTurn = users.filter((x) => x.pokemons[0].id === firstPokemon.id);
    const mainContainer = document.getElementById('main-container');
    mainContainer.innerHTML += `<div style="top:15%;left:40%;position:absolute;display:flex;flex-direction:column;justify-content:center;align-items:center;"><span id="user-turn-name" style="font-size:2rem;font-family:'Inconsolata', monospace;">Turno: ${userTurn[0].name}</span></div>`;
    switchTurnEvent(users, userTurn[0].name);
}

function switchTurnEvent(users, userTurn){
    let actualTurn = userTurn;
    changeTurn(users, actualTurn);
}

function changeTurn(users, actualTurn){
    const interval = setInterval(( ) => {
        const spanUserName = document.getElementById('user-turn-name');
        const { name } = users.find((x) => x.name !== actualTurn);
        spanUserName.innerText = `Turno: ${name}`;
        actualTurn = name;
    }, 10000)
    
    if(passTurnEvent())
        clearInterval(interval);
        //analisar
}


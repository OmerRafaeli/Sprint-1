'use strict'

console.log('Sprint One - Omer Rafaeli')

const MINE = 'mine'
const CLEARCELL = 'empty'
const MARKED = 'marked'
const btnMain = '😊'
const btnDone = '😎'
const btnMiss = '🤩' // not in use 
const btnLifeLeft = '😅'
const btnHit = '😫'
const btnDead = '💥'

var gElRstBtn = document.querySelector('.reset')
var gElLives = document.querySelector('.lives')
var gCellCount = 0
var gStartTime = 0
var gHintCounter = 3
var gSetMineCounter = 0
var gSafeClicks = 3
var gGameInterval
var gTimeoutid
var gBoard = []
var gCellNum = 1
var gLevel = [{ size: 4, mines: 2 }, { size: 8, mines: 12 }, { size: 12, mines: 30 }]

var gIsGameOn
var gIs7Boom = false
var gIsSetMines = false
var gSizeSelected = null
var gPreGame = true
var gIsHintMode
var gLifeCounter = 3
var gMarkedMinesCounter = 0
var gBoardSizeIdx = 0

function init() {
    gIsGameOn = true
    gIsHintMode = false
    gLifeCounter = 3
    gSafeClicks = 3
    gSetMineCounter = 0
    gMarkedMinesCounter = gLevel[gBoardSizeIdx].mines
    gBoard = createBoard(gLevel[gBoardSizeIdx].size)
    gCellCount = (gLevel[gBoardSizeIdx].size ** 2)
    console.log('gCellCount', gCellCount);
    renderBoard(gBoard)
    gPreGame = true

    pauseTimer()
    var elTimer = document.querySelector('.timer')
    elTimer.innerText = 'Time: 0'

    var elminesLeft = document.querySelector('.mines-left')
    elminesLeft.innerText = gMarkedMinesCounter
    
    
    var elSafeClickBtn = document.querySelector('.safe-click')
    elSafeClickBtn.innerText = (`Safe Click: ${gSafeClicks}`)


    gElLives.innerText = `💗💗💗`
    gElRstBtn.innerText = btnMain
}

// function hint(elHintBtn) {
//     console.log(hintCounter);
//     if (!gIsHintMode) {
//         gIsHintMode = true
//         elHintBtn.classList.add('hint-shown')
//     } else {
//         elHintBtn.classList.remove('hint-shown')
//         gIsHintMode = false
//     }

//     //elBtn.classList.add('glow') 
//     console.log(gIsHintMode);
// }

function createBoard(boardSize) {
    var board = []
    for (var i = 0; i < boardSize; i++) {
        board[i] = []
        for (var j = 0; j < boardSize; j++) {
            var cell = {
                negs: [],
                minesAroundCount: 0,
                emptyAroundCount: 0,
                type: CLEARCELL,
                isShown: false,
                isMine: false,
                isMarked: false,
                cellNum: gCellNum + ''

            }
            gCellNum++


            board[i][j] = cell
        }
    }
    gCellNum = 1
    console.table(board);
    //gLevel = reziseBoard(size, num)
    return board
}

function renderBoard(board) {
    var strHTML = ""
    for (var i = 0; i < board.length; i++) {
        strHTML += `<tr class="game-row">\n`
        for (var j = 0; j < board[0].length; j++) {
            const cell = board[i][j]

            var cellTitle = `Cell: ${i}, ${j}`
            var className = (cell.isMarked) ? ' marked' : ''
            className += (cell.isShown) ? ' shown' : ''

            var tdId = `cell-${i}-${j}`
            strHTML += `<td  id="${tdId}" class="cell ${className}" title="${cellTitle}" 
            onclick="cellClicked(this, ${i}, ${j})" oncontextmenu="cellRightClicked(this, ${i}, ${j})" contextmenu=""></td>`
        }
        strHTML += `</tr>\n`
    }
    strHTML += `<tr class="footer">\n<th colspan="${board.length}"> Made By Omer Rafaeli </th></tr>`
    var elCell = document.querySelector('.game-container')
    elCell.innerHTML = strHTML
}

function reziseBoard(elBtn, idx) {
    gBoardSizeIdx = idx
    console.log(idx);
    if (gSizeSelected) {
        gSizeSelected.classList.remove('selected')
    }

    gSizeSelected = (gSizeSelected !== idx) ? elBtn : null

    if (gSizeSelected) {
        gSizeSelected.classList.add('selected')
        init()
    }


}

function sevenBoomInit(elBtn) {
    if (gIs7Boom) {
        elBtn.classList.remove('selected')
        gIs7Boom = false
    } else {
        elBtn.classList.add('selected')
        gIs7Boom = true

        const setMineBtn = document.querySelector('.lay-mines')
        setMineBtn.classList.remove('selected')
        gIsSetMines = false
    }
}

function layMinesInit(elBtn) {
    if (gIsSetMines) {
        elBtn.classList.remove('selected')
        gIsSetMines = false
    } else {
        elBtn.classList.add('selected')
        gIsSetMines = true

        const setMineBtn = document.querySelector('.sevenBoom')
        setMineBtn.classList.remove('selected')
        gIs7Boom = false
    }
}

function cellRightClicked(elBtn, i, j) {
    const cell = gBoard[i][j]
    if (gIsGameOn === false || cell.isShown === true) return
    if (elBtn.type !== MARKED && gMarkedMinesCounter > 0) {
        elBtn.type = MARKED
        elBtn.classList.toggle('marked')
        gMarkedMinesCounter--
        var elminesLeft = document.querySelector('.mines-left')
        elminesLeft.innerText = gMarkedMinesCounter

    } else if (elBtn.type === MARKED) {
        elBtn.type = CLEARCELL
        elBtn.classList.toggle('marked')
        gMarkedMinesCounter++
        var elminesLeft = document.querySelector('.mines-left')
        elminesLeft.innerText = gMarkedMinesCounter
    }

    if (gCellCount === gLevel[gBoardSizeIdx].mines && gMarkedMinesCounter === 0) {
        endGame('win', i, j)
        return
    }

}

function cellClicked(elBtn, cellI, cellJ) {
    const cell = gBoard[cellI][cellJ]
    if (gIsGameOn === false || cell.isShown) return         //whenever an open cell is clicked or game is over do nothing  
    if (gPreGame && gIsSetMines) {
        layMines(cellI, cellJ)
        return
    } else if (gPreGame && gIs7Boom) {
        setSevenBoomBoard()
        gPreGame = false
        return
    } else if (gPreGame) {                                     // if first move is made - lay down the mines randomly
        setMines(gLevel[gBoardSizeIdx].mines, cellI, cellJ)
    }

    if (gStartTime === 0) startTimer()

    if (cell.isMine && !gIsSetMines) {                                      // the next action will happen when hitting a mine
        gLifeCounter--

        gMarkedMinesCounter--
        var elminesLeft = document.querySelector('.mines-left')
        elminesLeft.innerText = gMarkedMinesCounter

        switch (gLifeCounter) {
            case 2:
                gElLives.innerText = `💗💗🖤`
                break;
            case 1:
                gElLives.innerText = `💗🖤🖤`
                break;
            case 0:
                gElLives.innerText = `🖤🖤🖤`
                break;
        }

        //console.log('lifeCounter:', lifeCounter)
        if (gLifeCounter === 0) {
            endGame('lost', cellI, cellJ)
            return
        }
        //MODEL
        cell.isShown = true
        //DOM
        elBtn.classList.add('mine')
        gElRstBtn.innerText = btnHit
        gTimeoutid = setTimeout(() => { gElRstBtn.innerText = btnMain }, 500)
        return
    }


    var res = setMinesNegsCount(cellI, cellJ)
    if (res.minesAroundCount !== 0) elBtn.innerText = res.minesAroundCount

    //MODEL
    cell.isShown = true
    gCellCount--
    console.log('gCellCounter' + gCellCount)
    openNegs(res, cellI, cellJ)


    if (gCellCount === gLevel[gBoardSizeIdx].mines && gMarkedMinesCounter === 0) {
        endGame('win', cellI, cellJ)
        return
    }
    //DOM
    elBtn.classList.add('shown')
    gElRstBtn.innerText = btnMiss
    gTimeoutid = setTimeout(() => { gElRstBtn.innerText = btnMain }, 500)
}

function setMinesNegsCount(cellI, cellJ) {
    var minesAroundCount = 0
    var emptyAroundCount = 0
    var currNegs = []
    for (var i = cellI - 1; i <= cellI + 1; i++) {
        if (i < 0 || i >= gBoard.length) continue
        for (var j = cellJ - 1; j <= cellJ + 1; j++) {
            if (j < 0 || j >= gBoard[i].length) continue
            if (i === cellI && j === cellJ) continue
            if (gBoard[i][j].type === MINE) minesAroundCount++
            if (gBoard[i][j].type === CLEARCELL) {
                emptyAroundCount++

                //createCell(i, j)
            }
            if (gBoard[i][j].isShown === false) {
                currNegs.push({ i, j })
            }

        }
    }

    //console.log('currNegs ', currNegs);
    return { minesAroundCount, emptyAroundCount, currNegs }
}

//opens all neighbors of clicked 
function openNegs(neighbor, negI, negJ) {

    const clickedCell = gBoard[negI][negJ]
    const neighbors = neighbor.currNegs

    if (!gIsGameOn || clickedCell.minesAroundCount !== 0 || neighbor.minesAroundCount > 0) return
    for (var n = 0; n < neighbors.length; n++) {
        var i = neighbors[n].i
        var j = neighbors[n].j
        var cell = gBoard[i][j]

        if (cell.type === CLEARCELL && cell.isShown === false) {
            var res = setMinesNegsCount(i, j)

            var elCell = document.querySelector(`#cell-${i}-${j}`)

            //Model
            cell.isShown = true
            gCellCount--
            //Dom
            elCell.classList.add('shown')

            if (res.minesAroundCount !== 0) {
                elCell.innerText = res.minesAroundCount
            } else {
                var secondNeighbor = setMinesNegsCount(i, j)
                openNegs(secondNeighbor, i, j)
            }

        }

    }
}

function safeClick(elBtn) {    
    var safeTimeoutIntervalId
    var isSafe = false
    if(gSafeClicks === 0 || gCellCount === gLevel[gBoardSizeIdx].mines) return

    while (isSafe === false) {

        const i = getRandomInt(0, gBoard.length)
        const j = getRandomInt(0, gBoard.length)

        console.log('i, j:', i, j)
        
        if (gBoard[i][j].type !== MINE && gBoard[i][j].isShown === false) {
            isSafe = true
            gSafeClicks--
            elBtn.innerText = (`Safe Click: ${gSafeClicks}`)
            var elSafeCell = document.querySelector(`#cell-${i}-${j}`)
            elSafeCell.classList.add('shown')
            elSafeCell.innerText = ('✔') 
        
            safeTimeoutIntervalId = setTimeout(() => {
                var elSafeCell = document.querySelector(`#cell-${i}-${j}`)
                elSafeCell.classList.remove('shown')
                elSafeCell.innerText = ('')
                clearInterval(safeTimeoutIntervalId)
            }, 2500)
        }
        
    }

}

//manually lay mines on the field for other friends to play
function layMines(cellI, cellJ) {


    var cell = gBoard[cellI][cellJ]
    if (cell.type !== MINE) {
        //Model
        cell.type = MINE
        cell.isMine = true
        cell.isShown = true

        //DOM
        var elMine = document.querySelector(`#cell-${cellI}-${cellJ}`)
        elMine.classList.add('mine')


        setTimeout(() => { elMine.classList.remove('mine'), cell.isShown = false }, 1000)
        gSetMineCounter++
    }
    if (gSetMineCounter === gLevel[gBoardSizeIdx].mines) {
        gPreGame = false

        const setMineBtn = document.querySelector('.lay-mines')
        setMineBtn.classList.remove('selected')
        gIsSetMines = false

    }

}

function setSevenBoomBoard() {
    gMarkedMinesCounter = 0
    console.log('gbCellNum ', gBoard[1][0].cellNum);
    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard[0].length; j++) {
            if (+gBoard[i][j].cellNum % 7 === 0 || gBoard[i][j].cellNum.includes('7')) {
                gBoard[i][j].isMine = true
                gBoard[i][j].isShown = false
                gBoard[i][j].type = MINE
                gMarkedMinesCounter++

            }
        }

    }
    const elSevenBoomBtn = document.querySelector('.sevenBoom')
    elSevenBoomBtn.classList.remove('selected')
    gIs7Boom = false
    startTimer()
}

function setMines(minesNumber, cellI, cellJ) {


    startTimer()
    console.log('isFirstClick ' + gPreGame);
    //console.log('cellI, cellJ', cellI, cellJ); pressed btn
    var cellCounter = 0
    while (cellCounter < minesNumber) {

        var i = getRandomInt(1, gBoard.length)
        var j = getRandomInt(1, gBoard.length)

        if (i === cellI && j === cellJ) continue
        if (gBoard[i][j].type === MINE) continue

        //console.log(i, j)
        //modal
        gBoard[i][j].isMine = true
        gBoard[i][j].isShown = false
        gBoard[i][j].type = MINE


        //DOM
        //var elMine = document.querySelector(`#cell-${i}-${j}`)
        //elMine.classList.add('mine')
        cellCounter++
    }

    gPreGame = false
}

function endGame(state, cellI, cellJ) {
    if (state === 'lost') {
        gElRstBtn.innerText = btnDead
        for (var i = 0; i < gBoard.length; i++) {
            for (var j = 0; j < gBoard.length; j++) {
                if (gBoard[i][j].type === MINE) {

                    //Model
                    gBoard[i][j].isShown = true
                    //Dom
                    var elCell = document.querySelector(`#cell-${i}-${j}`)
                    cellRightClicked(elCell, i, j)
                    elCell.classList.add('shown')
                    elCell.classList.add('mine')
                }
            }

        }
        clearTimeout(gTimeoutid)
        pauseTimer()
        console.log('Game Over!');
        gIsGameOn = false

    } else if (state === 'win') {
        console.log('Game Won!');
        var cell = gBoard[cellI][cellJ]
        pauseTimer()
        //Model
        cell.isShown = true

        //Dom
        gElRstBtn.innerText = btnDone
        var elCell = document.querySelector(`#cell-${cellI}-${cellJ}`)
        if (cell.minesAroundCount !== 0) elCell.innerText = cell.minesAroundCount
        elCell.classList.add('shown')
    }
}

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min) + min)
}

function setTimer() {
    var diffTime = (Date.now() - gStartTime) / 1000
    var displayTime = diffTime.toFixed(0)
    document.querySelector('.timer').innerText = 'Time: ' + displayTime;
}

function startTimer() {
    gStartTime = Date.now()
    gGameInterval = setInterval(setTimer, 1000)


}

function pauseTimer() {

    clearInterval(gGameInterval);
    gGameInterval = null; //clean myInterval




}



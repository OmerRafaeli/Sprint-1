'use strict'

console.log('Sprint One - Omer Rafaeli')

const MINE = 'mine'
const EMPTY = 'empty'
const MARKED = 'marked'
const btnMain = '😊'
const btnDone = '😎'
const btnMiss = '🤩'
const btnLifeLeft = '😅'
const btnHit = '😫'
const btnDead = '💥'

var gElRstBtn = document.querySelector('.reset')
var gElLives = document.querySelector('.lives')
var gCellCount = 0
var gStartTime = 0
var hintCounter = 3
var gGameInterval
var gTimeoutid
var gBoard = []
//var gCells = []
var gLevel = [{ size: 4, mines: 2 }, { size: 8, mines: 12 }, { size: 12, mines: 30 }]

var gIsGameOn
var gIsHintMode
var gSizeSelected = null
var isFirstClick = true
var lifeCounter = 3
var markedMinesCounter = 0
var boardSizeIdx = 0

function init() {
    gIsGameOn = true
    gIsHintMode = false
    lifeCounter = 3
    markedMinesCounter = gLevel[boardSizeIdx].mines
    gBoard = createBoard(gLevel[boardSizeIdx].size)
    gCellCount = gLevel[boardSizeIdx].size ** 2
    console.log('gCellCount', gCellCount);
    renderBoard(gBoard)
    isFirstClick = true

    pauseTimer()
    var elTimer = document.querySelector('.timer')
    elTimer.innerText = 'Time: 0'

    var elminesLeft = document.querySelector('.mines-left')
    elminesLeft.innerText = markedMinesCounter


    gElLives.innerText = `💗💗💗`
    gElRstBtn.innerText = btnMain
}

function hint(elHintBtn) {
    console.log(hintCounter);
    if (!gIsHintMode) {
        gIsHintMode = true
        var elTable = document.querySelector('table .cell')
        elTable.classList.add('glow')
    } else {
        var elTable = document.querySelector('table .cell')
        elTable.classList.remove('glow')
    }

    //elBtn.classList.add('glow') 
    console.log(gIsHintMode);
}

function createBoard(boardSize) {
    var board = []
    for (var i = 0; i < boardSize; i++) {
        board[i] = []
        for (var j = 0; j < boardSize; j++) {
            var cell = {
                negs: [],
                minesAroundCount: 0,
                emptyAroundCount: 0,
                type: EMPTY,
                isShown: false,
                isMine: false,
                isMarked: false

            }



            board[i][j] = cell
        }
    }
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
            onclick="cellClicked(this, ${i}, ${j})" oncontextmenu="cellRightClicked(this)" contextmenu=""></td>`
        }
        strHTML += `</tr>\n`
    }
    strHTML += `<tr class="footer">\n<th colspan="${board.length}"> Made By Omer Rafaeli </th></tr>`
    var elCell = document.querySelector('.game-container')
    elCell.innerHTML = strHTML
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

function cellClicked(elBtn, cellI, cellJ) {
    const cell = gBoard[cellI][cellJ]
    gCellCount--
    if (gIsGameOn === false) return
    isWinner(gCellCount, gLevel[boardSizeIdx].mines, cellI, cellJ)
    setMines(gLevel[boardSizeIdx].mines, cellI, cellJ)
    if (cell.minesAroundCount !== 0) elBtn.innerText = gBoard[cellI][cellJ].minesAroundCount
    elBtn.classList.add('shown')


    if (cell.isMine) { 
        lifeCounter--       
        if (lifeCounter === 0) {
            clearTimeout(gTimeoutid)
            pauseTimer()
            gElRstBtn.innerText = btnDead
            console.log('Game Over!');
            gIsGameOn = false
            endGame()
        } else {
            gElRstBtn.innerText = btnHit
            gTimeoutid = setTimeout(() => { gElRstBtn.innerText = btnMain }, 500)
        }

        switch (lifeCounter) {
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
        //Model
        cell.isShown = true
        //Dom
        elBtn.classList.add('shown')
        elBtn.classList.add('mine')
        console.log('lifeCounter' + lifeCounter)


    }
    openNegs(cellI, cellJ)
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
            if (gBoard[i][j].type === EMPTY) emptyAroundCount++


            currNegs.push({ i, j })
        }
    }
    //console.log('currNegs ', currNegs);
    return { minesAroundCount, emptyAroundCount, currNegs }
}

function reziseBoard(elBtn, idx) {
    boardSizeIdx = idx
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

function isWinner(cellNum, mines, cellI, cellJ) {
    console.log('cellNum ', cellNum)
    console.log('mines:', mines)
    
    if (cellNum - mines === 0) {
        pauseTimer()
        gElRstBtn.innerText = btnDone
        gIsGameOn = false
        endGame(cellI, cellJ)
    } else return
}

function cellRightClicked(elBtn) {
    if (gIsGameOn === false) return
    if (elBtn.type !== MARKED && markedMinesCounter > 0) {
        elBtn.type = MARKED
        elBtn.classList.toggle('marked')
        markedMinesCounter--
        var elminesLeft = document.querySelector('.mines-left')
        elminesLeft.innerText = markedMinesCounter
    } else if (elBtn.type === MARKED) {
        elBtn.type = EMPTY
        elBtn.classList.toggle('marked')
        markedMinesCounter++
        var elminesLeft = document.querySelector('.mines-left')
        elminesLeft.innerText = markedMinesCounter
    }
}

function setMines(minesNumber, cellI, cellJ) {
    if (isFirstClick === false) return
    startTimer()
    console.log('isFirstClick ' + isFirstClick);
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
        console.log('gBoard ', i, j);
    }
    createCell()
    isFirstClick = false
}

function getCellCoord(strCellId) {
    var parts = strCellId.split('-')
    var coord = { i: +parts[1], j: +parts[2] }
    return coord;
}

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min) + min)
}

function endGame(cellI, cellJ) {
    console.log('Game Over')
    if (lifeCounter === 0) {
        for (var i = 0; i < gBoard.length; i++) {
            for (var j = 0; j < gBoard.length; j++) {
                if (gBoard[i][j].type === MINE) {
                    console.log('gBoard ', gBoard[i][j].type)

                    //Model
                    gBoard[i][j].isShown = true
                    //Dom
                    var elCell = document.querySelector(`#cell-${i}-${j}`)
                    elCell.classList.add('shown')
                    elCell.classList.add('mine')
                }
            }

        }
    } else if ((gCellCount) - gLevel[boardSizeIdx].mines >= 0) {
        var cell = gBoard[cellI][cellJ]
        console.log('cellI, cellJ:', cellI, cellJ);
        //Model
        cell.isShown = true

        //Dom
        var elCell = document.querySelector(`#cell-${cellI}-${cellJ}`)
        //console.log(elCell);
        if (cell.minesAroundCount !== 0) elCell.innerText = cell.minesAroundCount
        elCell.classList.add('shown')
    }
}

function createCell() {
    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard[0].length; j++) {
            var res = setMinesNegsCount(i, j)
            gBoard[i][j].minesAroundCount = res.minesAroundCount
            gBoard[i][j].emptyAroundCount = res.emptyAroundCount
            gBoard[i][j].currNegs = res.currNegs
            console.log(gBoard[i][j].currNegs);
        }
    }

    //console.table(gBoard);
}

//opens all neighbors of clicked 
function openNegs(negI, negJ) {
    const neighbors = gBoard[negI][negJ].currNegs
    if (gBoard[negI][negJ].minesAroundCount !== 0 || gIsGameOn === false) return
    for (var n = 0; n < neighbors.length; n++) {
        var i = neighbors[n].i
        var j = neighbors[n].j
        if (gBoard[i][j].type === EMPTY && gBoard[i][j].isShown === false) {
            var cell = gBoard[i][j]
            //Model
            cell.isShown = true
            //Dom
            var elCell = document.querySelector(`#cell-${i}-${j}`)
            if (cell.minesAroundCount !== 0) elCell.innerText = cell.minesAroundCount
            elCell.classList.add('shown')

            console.log(gCellCount);
            isWinner(gCellCount, gLevel[boardSizeIdx].mines)
            gCellCount--
        }
        
    }
}
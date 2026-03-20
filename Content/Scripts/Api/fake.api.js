
const winExampleArray = [
    // No-wild wins — symbol 1 is swapped by replaceOnes() for pay variety (one payline each).
    [4, 1, 6, 7, 1, 4, 5, 1, 7, 8, 1, 5, 6, 1, 8],
    [1, 5, 6, 1, 8, 4, 1, 6, 7, 1, 4, 5, 1, 7, 8],
    [4, 5, 1, 7, 8, 1, 5, 6, 1, 8, 4, 1, 6, 7, 1],
    [1, 5, 6, 7, 1, 4, 5, 6, 1, 8, 1, 5, 1, 7, 8],
    [4, 5, 1, 7, 1, 4, 1, 6, 7, 8, 1, 5, 6, 7, 1],
    [1, 5, 6, 1, 8, 4, 5, 1, 7, 1, 4, 5, 1, 7, 8],
    [4, 5, 1, 7, 8, 1, 5, 1, 7, 8, 4, 1, 6, 7, 1],
    [4, 1, 6, 1, 8, 4, 1, 6, 7, 1, 4, 5, 6, 1, 8],
    [4, 1, 6, 7, 8, 1, 5, 6, 1, 8, 4, 1, 6, 1, 8],
    [1, 5, 6, 7, 1, 4, 5, 1, 7, 8, 1, 5, 1, 7, 8],
    // Wild wins — 0 stays wild; pay symbols are not 1 so replaceOnes does not rewrite them.
    [4, 2, 6, 7, 2, 4, 5, 0, 7, 8, 2, 5, 6, 2, 8],
    [3, 5, 6, 0, 8, 4, 3, 6, 7, 0, 4, 5, 3, 7, 8],
    [0, 5, 6, 7, 2, 4, 5, 2, 7, 8, 2, 5, 2, 7, 8],
];

/** Losing spins — no line reaches minMatch with wild 0. */
const defaultExampleArray = [
    [3, 4, 5, 6, 7, 8, 3, 4, 5, 6, 7, 8, 3, 4, 5],
    [7, 8, 3, 4, 5, 6, 7, 8, 3, 4, 5, 6, 7, 8, 3],
    [5, 6, 7, 8, 3, 4, 5, 6, 7, 8, 3, 4, 5, 6, 7],
    [8, 3, 4, 5, 6, 7, 8, 3, 4, 5, 6, 7, 8, 3, 4],
    [6, 7, 8, 3, 4, 5, 6, 7, 8, 3, 4, 5, 6, 7, 8],
    [4, 5, 6, 7, 8, 3, 4, 5, 6, 7, 8, 3, 4, 5, 6],
];

const variants = [1, 2, 3, 4, 5, 6, 7, 8];

function replaceOnes(lines, newValue) {
  return lines.map(arr => arr.map(x => x === 1 ? newValue : x));
}
const allWinLinesVariants = variants.map(v => replaceOnes(winExampleArray, v));


let winCombinationCouter = 0;

const MachineInfo = {
    Balance: 1000,
    Baraban: [1, 6, 1, 2, 4, 6, 8, 8, 2, 4, 2, 4, 5, 2, 4],
    UserWin: 0,
    Multiplier: 1,
    ErrorMessage: null
}

async function GetBoard(bet) {
    if(!bet) {
        await new Promise(resolve => setTimeout(resolve, 100));
        return MachineInfo;
    }
    const betAmount = parseFloat(bet);

    if(MachineInfo.Balance < betAmount || betAmount <= 0) {
        MachineInfo.ErrorMessage = "Something went wrong";
        await new Promise(resolve => setTimeout(resolve, 100));
        return MachineInfo;
    }

    // get random numbers from 1 to 5
    MachineInfo.Multiplier = Math.floor(Math.random() * 5) + 1;

    MachineInfo.UserWin = 0;
    MachineInfo.Balance -= betAmount;
    
    let array = defaultExampleArray;
    winCombinationCouter++;

    const rollWin = Math.random() < 0.5;
    if(rollWin) {
        MachineInfo.UserWin += betAmount * MachineInfo.Multiplier;
        array = allWinLinesVariants[Math.floor(Math.random() * allWinLinesVariants.length)];
    }

    const randomIndex = Math.floor(Math.random() * array.length);

    MachineInfo.Balance += MachineInfo.UserWin;
    MachineInfo.ErrorMessage = null;

    if(winCombinationCouter > 64) winCombinationCouter = 0;
    
    await new Promise(resolve => setTimeout(resolve, 100 * Math.max(1, randomIndex)));
    
    MachineInfo.Baraban = array[randomIndex];

    return MachineInfo;
}

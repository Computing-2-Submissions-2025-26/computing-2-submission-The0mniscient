import R from "./ramda.js";

// 0: Out of bounds, 1: Peg, 2: Empty hole
const getInitialBoard = () => [
    [0, 0, 1, 1, 1, 0, 0],
    [0, 0, 1, 1, 1, 0, 0],
    [1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 2, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1],
    [0, 0, 1, 1, 1, 0, 0],
    [0, 0, 1, 1, 1, 0, 0]
];

const getHole = (board, r, c) => R.pathOr(0, [r, c], board);

const isValidMove = R.curry((board, r1, c1, r2, c2) => {
    if (getHole(board, r1, c1) !== 1 || getHole(board, r2, c2) !== 2) return false;
    
    const dr = Math.abs(r2 - r1);
    const dc = Math.abs(c2 - c1);
    
    if ((dr === 2 && dc === 0) || (dr === 0 && dc === 2)) {
        const midR = r1 + (r2 - r1) / 2;
        const midC = c1 + (c2 - c1) / 2;
        return getHole(board, midR, midC) === 1;
    }
    return false;
});

const getValidMovesForPeg = R.curry((board, r, c) => {
    const possibleDests = [[r-2, c], [r+2, c], [r, c-2], [r, c+2]];
    return R.filter(([r2, c2]) => isValidMove(board, r, c, r2, c2), possibleDests);
});

const applyMove = R.curry((board, r1, c1, r2, c2) => {
    if (!isValidMove(board, r1, c1, r2, c2)) return board;
    
    const midR = r1 + (r2 - r1) / 2;
    const midC = c1 + (c2 - c1) / 2;
    
    // Pure functional state transition using Ramda
    return R.pipe(
        R.adjust(r1, R.update(c1, 2)),      // Remove peg from start
        R.adjust(midR, R.update(midC, 2)),  // Remove jumped peg
        R.adjust(r2, R.update(c2, 1))       // Place peg at destination
    )(board);
});

const hasAnyValidMoves = (board) => {
    const coords = R.xprod(R.range(0, 7), R.range(0, 7));
    return R.any(([r, c]) => 
        getHole(board, r, c) === 1 && getValidMovesForPeg(board, r, c).length > 0, 
        coords
    );
};

const countPegs = R.pipe(
    R.flatten,
    R.filter(R.equals(1)),
    R.length
);

const PegGameLogic = { 
    getInitialBoard, 
    isValidMove, 
    getValidMovesForPeg, 
    applyMove, 
    hasAnyValidMoves, 
    countPegs 
};

export default Object.freeze(PegGameLogic);
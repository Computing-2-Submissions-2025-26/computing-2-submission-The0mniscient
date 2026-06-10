import R from "./ramda.js";
import PegGameLogic from "./logic.js";

const initUI = () => {
    const root = document.getElementById('board-root');
    const statusRoot = document.getElementById('status-root');
    const resetBtn = document.getElementById('reset-btn');

    // Application State
    let state = {
        board: PegGameLogic.getInitialBoard(),
        selected: null
    };

    // Pure Reducer for State Management
    const reducer = (state, action) => {
        switch (action.type) {
            case 'SELECT':
                return R.assoc('selected', action.payload, state);
            case 'DESELECT':
                return R.assoc('selected', null, state);
            case 'MOVE':
                const newBoard = PegGameLogic.applyMove(
                    state.board,
                    state.selected.r, state.selected.c,
                    action.payload.r, action.payload.c
                );
                return R.pipe(
                    R.assoc('board', newBoard),
                    R.assoc('selected', null)
                )(state);
            case 'RESET':
                return { board: PegGameLogic.getInitialBoard(), selected: null };
            default:
                return state;
        }
    };

    // Action Dispatcher
    const dispatch = (action) => {
        state = reducer(state, action);
        render();
    };

    // Event Handlers
    const handleCellClick = (r, c) => {
        const cellVal = state.board[r][c];
        
        if (!state.selected) {
            if (cellVal === 1 && PegGameLogic.getValidMovesForPeg(state.board, r, c).length > 0) {
                dispatch({ type: 'SELECT', payload: { r, c } });
            }
        } else {
            if (r === state.selected.r && c === state.selected.c) {
                dispatch({ type: 'DESELECT' });
            } else if (cellVal === 1 && PegGameLogic.getValidMovesForPeg(state.board, r, c).length > 0) {
                dispatch({ type: 'SELECT', payload: { r, c } });
            } else if (cellVal === 2 && PegGameLogic.isValidMove(state.board, state.selected.r, state.selected.c, r, c)) {
                dispatch({ type: 'MOVE', payload: { r, c } });
            } else {
                dispatch({ type: 'DESELECT' });
            }
        }
    };

    // Dynamic Table Automation & Render
    const render = () => {
        // Render Board
        root.innerHTML = '';
        const table = document.createElement('table');
        table.className = 'peg-table';

        state.board.forEach((row, r) => {
            const tr = document.createElement('tr');
            row.forEach((cellVal, c) => {
                const td = document.createElement('td');
                td.className = 'peg-cell';
                
                if (cellVal === 0) {
                    td.classList.add('is-out-of-bounds');
                } else {
                    const btn = document.createElement('button');
                    btn.className = 'peg-btn';
                    
                    const isSelected = state.selected && state.selected.r === r && state.selected.c === c;
                    const isValidDest = state.selected && cellVal === 2 && PegGameLogic.isValidMove(state.board, state.selected.r, state.selected.c, r, c);
                    
                    if (cellVal === 1) {
                        btn.classList.add(isSelected ? 'is-selected' : 'is-peg');
                    } else if (cellVal === 2) {
                        btn.classList.add(isValidDest ? 'is-valid-dest' : 'is-empty');
                    }
                    
                    btn.onclick = () => handleCellClick(r, c);
                    td.appendChild(btn);
                }
                tr.appendChild(td);
            });
            table.appendChild(tr);
        });
        root.appendChild(table);

        // Render Status
        const pegsLeft = PegGameLogic.countPegs(state.board);
        const hasMoves = PegGameLogic.hasAnyValidMoves(state.board);
        
        statusRoot.className = 'text-lg font-medium h-8';
        
        if (pegsLeft === 1) {
            statusRoot.textContent = '🎉 You won! Perfect score!';
            statusRoot.classList.add('text-green-600', 'text-xl', 'font-bold');
        } else if (!hasMoves) {
            statusRoot.textContent = `Game Over. ${pegsLeft} pegs left.`;
            statusRoot.classList.add('text-red-600', 'text-xl', 'font-bold');
        } else {
            statusRoot.textContent = `Pegs remaining: ${pegsLeft}`;
            statusRoot.classList.add('text-gray-600');
        }
    };

    // Bind global reset button
    resetBtn.onclick = () => dispatch({ type: 'RESET' });

    // Initial Render
    render();
};

// Boot up the application
document.addEventListener('DOMContentLoaded', initUI);

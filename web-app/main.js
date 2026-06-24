import R from "./ramda.js";
import Chordle from "./Chordle.js";

const GAME_ROWS = 6;
const GAME_COLS = 4;
const KEYS = [
    "A", "Bb", "B", "C", "Cs", "D", "Eb", "E", "F", "Fs", "G", "Gs"
];
const ROMAN = ["", "I", "ii", "iii", "IV", "V", "vi", "vii°"];

const game_board = document.getElementById("game_board");
const result_dialog = document.getElementById("result_dialog");

let current_state;
let current_audio;
let playback_id = 0;

const play_audio = function (filename, id) {
    return new Promise(function (resolve) {
        if (id !== playback_id) {
            return resolve();
        }

        if (current_audio) {
            current_audio.pause();
        }

        const audio = new window.Audio(`./assets/chords/${filename}`);
        current_audio = audio;

        audio.onended = resolve;
        audio.onerror = function () {
            console.warn(`Audio missing or error: ${filename}`);
            resolve();
        };
        audio.play().catch(function (error) {
            console.warn(`Play failed: ${error}`);
            resolve();
        });
    });
};

const play_sequence = function (filenames) {
    playback_id += 1;
    const this_id = playback_id;

    R.reduce(
        function (promise_chain, file) {
            return promise_chain.then(function () {
                return play_audio(file, this_id);
            });
        },
        Promise.resolve(),
        filenames
    );
};

const cell_nodes = R.range(0, GAME_ROWS).map(function (row_index) {
    const row_div = document.createElement("div");
    row_div.className = "row";
    row_div.setAttribute("role", "row");
    game_board.append(row_div);

    return R.range(0, GAME_COLS).map(function (col_index) {
        const cell_div = document.createElement("div");
        const row_num = row_index + 1;
        const col_num = col_index + 1;

        cell_div.className = "cell empty";
        cell_div.setAttribute("role", "gridcell");
        cell_div.setAttribute(
            "aria-label",
            `Row ${row_num} Col ${col_num} empty`
        );
        row_div.append(cell_div);
        return cell_div;
    });
});

const redraw_board = function () {
    cell_nodes.forEach(function (row, row_index) {
        row.forEach(function (cell, col_index) {
            const past_guess = current_state.past_guesses[row_index];
            const row_num = row_index + 1;
            const col_num = col_index + 1;

            if (past_guess) {
                const eval_obj = past_guess[col_index];
                const roman_val = ROMAN[eval_obj.chord];
                cell.textContent = roman_val;
                cell.className = `cell ${eval_obj.status}`;
                cell.setAttribute(
                    "aria-label",
                    `Row ${row_num} Col ${col_num} ` +
                    `is ${roman_val}, ${eval_obj.status}`
                );
                return;
            }

            if (row_index === current_state.past_guesses.length) {
                const current_chord = current_state.current_guess[col_index];
                const current_roman = (
                    current_chord
                    ? ROMAN[current_chord]
                    : ""
                );

                cell.textContent = current_roman;
                cell.className = "cell";
                cell.setAttribute(
                    "aria-label",
                    `Row ${row_num} Col ${col_num} ` +
                    `is ${current_roman || "empty"}`
                );
                return;
            }

            cell.textContent = "";
            cell.className = "cell";
            cell.setAttribute(
                "aria-label",
                `Row ${row_num} Col ${col_num} empty`
            );
        });
    });
};

const handle_game_end = function () {
    if (!Chordle.is_ended(current_state)) {
        return;
    }

    const title = document.getElementById("result_title");
    const message = document.getElementById("result_message");
    const formatted_target = current_state.target.map((c) => ROMAN[c]);

    if (Chordle.is_won(current_state)) {
        title.textContent = "You Win!";
    } else {
        title.textContent = "Game Over";
    }

    message.textContent = "The sequence was: " + R.join(
        " - ",
        formatted_target
    );
    result_dialog.showModal();
};

const handle_input = function (action_type, value) {
    if (Chordle.is_ended(current_state)) {
        return;
    }

    if (action_type === "ADD") {
        current_state = Chordle.add_chord(value, current_state);
    } else if (action_type === "REMOVE") {
        current_state = Chordle.remove_chord(current_state);
    } else if (action_type === "SUBMIT") {
        current_state = Chordle.submit_guess(current_state);
        handle_game_end();
    }

    redraw_board();
};

document.querySelectorAll(".key").forEach(function (button) {
    button.onclick = function () {
        const key_val = button.getAttribute("data-key");
        if (key_val === "ENTER") {
            handle_input("SUBMIT");
        } else if (key_val === "BACKSPACE") {
            handle_input("REMOVE");
        } else {
            handle_input("ADD", parseInt(key_val, 10));
        }
    };
});

document.onkeydown = function (event) {
    if (event.key >= "1" && event.key <= "7") {
        handle_input("ADD", parseInt(event.key, 10));
    } else if (event.key === "Backspace") {
        handle_input("REMOVE");
    } else if (event.key === "Enter") {
        handle_input("SUBMIT");
    }
};

document.getElementById("play_root").onclick = function () {
    playback_id += 1;
    const filename = Chordle.get_chord_filename(current_state.key, 1);
    play_audio(filename, playback_id);
};

document.getElementById("play_sequence").onclick = function () {
    const filenames = Chordle.get_sequence_filenames(
        current_state.key,
        current_state.target
    );
    play_sequence(filenames);
};

document.getElementById("play_again").onclick = function () {
    result_dialog.close();
    start_new_game();
};

const start_new_game = function () {
    const random_index = Math.floor(Math.random() * KEYS.length);
    const random_key = KEYS[random_index];

    const target_generator = () => Math.floor(Math.random() * 7) + 1;
    const random_target = R.range(0, GAME_COLS).map(target_generator);

    current_state = Chordle.empty_state(random_key, random_target, GAME_ROWS);

    document.getElementById("current_key").textContent = (
        random_key.replace("s", "#")
    );

    redraw_board();
};

start_new_game();
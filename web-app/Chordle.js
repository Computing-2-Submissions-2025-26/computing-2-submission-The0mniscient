import R from "./ramda.js";

/**
 * Chordle.js is a pure functional module to model the logic, state,
 * and music theory translation for a chord interval training game.
 * @namespace Chordle
 * @author Gautham Ravisankar
 * @version 2025/26
 */
const Chordle = Object.create(null);

const GUESS_LENGTH = 4;
const OCTAVES = 12;

/**
 * System constants for music theory translations.
 * These are private to the module to encapsulate the domain knowledge.
 */
const KEYS = ["A", "Bb", "B", "C", "Cs", "D", "Eb", "E", "F", "Fs", "G", "Gs"];
const CHORD_QUALITIES = ["maj", "min", "min", "maj", "maj", "min", "dim"];
const INTERVALS_MAJOR_SCALE = [0, 2, 4, 5, 7, 9, 11];

/**
 * An Evaluation Object represents the accuracy of a single guessed chord.
 * @memberof Chordle
 * @typedef {Object} Evaluation
 * @property {number} chord The chord numeral (1-7) that was guessed.
 * @property {("green" | "yellow" | "gray")} status
 * The Wordle-style accuracy status.
 */

/**
 * The State represents an immutable snapshot of a game in progress.
 * @memberof Chordle
 * @typedef {Object} State
 * @property {string} key The root musical key (e.g., "Eb").
 * @property {number[]} target The sequence of 4 chords the player must guess.
 * @property {number[]} current_guess
 * The chords currently inputted by player.
 * @property {Chordle.Evaluation[][]} past_guesses
 * An array of evaluated past guesses.
 * @property {number} max_guesses The maximum number of attempts allowed.
 */

/**
 * Creates a new, empty game state.
 * @memberof Chordle
 * @function
 * @param {string} key The root key for the game.
 * @param {number[]} target The 4-chord target sequence.
 * @param {number} [max_guesses = 6] The maximum number of guesses allowed.
 * @returns {Chordle.State} A clean initial state.
 */
Chordle.empty_state = function (key, target, max_guesses = 6) {
    return {
        "current_guess": [],
        "key": key,
        "max_guesses": max_guesses,
        "past_guesses": [],
        "target": target
    };
};

/**
 * Pure evaluation function implementing Wordle logic.
 * Assigns 'green' for exact matches, 'yellow' for wrong position,
 * and 'gray' for incorrect.
 * Evaluates duplicate chords without double-counting.
 * @memberof Chordle
 * @function
 * @param {number[]} target The target sequence of chords.
 * @param {number[]} guess The sequence of chords guessed by the player.
 * @returns {Chordle.Evaluation[]} An array of evaluated chord objects.
 */
Chordle.evaluate_guess = function (target, guess) {
    const is_green = (guessed_chord, chord_index) => (
        guessed_chord === target[chord_index]
    );
    const greens_flags = guess.map(is_green);

    // Create a pool of unmatched target chords to calculate 'yellow' statuses
    const initial_pool = target.filter(
        (ignore, chord_index) => !greens_flags[chord_index]
    );

    const evaluation_reducer = function (accumulator, guess_chord, index) {
        if (greens_flags[index]) {
            return {
                "evaluated": R.append(
                    {"chord": guess_chord, "status": "green"},
                    accumulator.evaluated
                ),
                "pool": accumulator.pool
            };
        }
        const pool_index = R.indexOf(guess_chord, accumulator.pool);
        if (pool_index !== -1) {
            return {
                "evaluated": R.append(
                    {"chord": guess_chord, "status": "yellow"},
                    accumulator.evaluated
                ),
                "pool": R.remove(pool_index, 1, accumulator.pool)
            };
        }
        return {
            "evaluated": R.append(
                {"chord": guess_chord, "status": "gray"},
                accumulator.evaluated
            ),
            "pool": accumulator.pool
        };
    };

    return R.addIndex(R.reduce)(
        evaluation_reducer,
        {"evaluated": [], "pool": initial_pool},
        guess
    ).evaluated;
};

/**
 * Returns whether the game has been won based on the current state.
 * @memberof Chordle
 * @function
 * @param {Chordle.State} state The game state to check.
 * @returns {boolean} True if the latest guess is entirely correct.
 */
Chordle.is_won = function (state) {
    if (state.past_guesses.length === 0) {
        return false;
    }
    const last_guess = R.last(state.past_guesses);
    return R.all((evaluation) => evaluation.status === "green", last_guess);
};

/**
 * Returns whether the game has ended in a loss.
 * @memberof Chordle
 * @function
 * @param {Chordle.State} state The game state to check.
 * @returns {boolean} True if max guesses reached without a win.
 */
Chordle.is_lost = function (state) {
    return (
        state.past_guesses.length >= state.max_guesses &&
        !Chordle.is_won(state)
    );
};

/**
 * Returns whether the game has ended (win or loss).
 * @memberof Chordle
 * @function
 * @param {Chordle.State} state The game state to check.
 * @returns {boolean} Whether the game is over.
 */
Chordle.is_ended = function (state) {
    return Chordle.is_won(state) || Chordle.is_lost(state);
};

/**
 * Appends a chord to the current guess array, returning a new state.
 * Data-last implementation. Exceptional cases return the state unchanged.
 * @memberof Chordle
 * @function
 * @param {number} chord The chord numeral (1-7) to append.
 * @param {Chordle.State} state The game state.
 * @returns {Chordle.State} The updated state.
 */
Chordle.add_chord = function (chord, state) {
    if (state.current_guess.length >= GUESS_LENGTH) {
        return state;
    }
    if (Chordle.is_ended(state)) {
        return state;
    }
    return R.assoc(
        "current_guess",
        R.append(chord, state.current_guess),
        state
    );
};

/**
 * Removes the last chord from the current guess array (backspace behavior).
 * @memberof Chordle
 * @function
 * @param {Chordle.State} state The game state.
 * @returns {Chordle.State} The updated state.
 */
Chordle.remove_chord = function (state) {
    if (state.current_guess.length === 0) {
        return state;
    }
    if (Chordle.is_ended(state)) {
        return state;
    }
    return R.assoc(
        "current_guess",
        R.dropLast(1, state.current_guess),
        state
    );
};

/**
 * Evaluates the current guess, moves it to past_guesses,
 * and clears the current guess.
 * Exceptional cases (invalid length) return the state unchanged.
 * @memberof Chordle
 * @function
 * @param {Chordle.State} state The game state.
 * @returns {Chordle.State} The updated state.
 */
Chordle.submit_guess = function (state) {
    if (state.current_guess.length !== GUESS_LENGTH) {
        return state;
    }
    if (Chordle.is_ended(state)) {
        return state;
    }
    const evaluation = Chordle.evaluate_guess(
        state.target,
        state.current_guess
    );
    return R.pipe(
        R.assoc("current_guess", []),
        R.assoc("past_guesses", R.append(evaluation, state.past_guesses))
    )(state);
};

/**
 * Translates a given key and chord numeral into the correct audio filename.
 * Implements music theory relative intervals mathematically.
 * @memberof Chordle
 * @function
 * @param {string} key The root musical key (e.g., "A").
 * @param {number} chord_numeral The chord numeral (1-7).
 * @returns {string} The filename representing the chord (e.g., "A_maj_4.mp3").
 */
Chordle.get_chord_filename = function (key, chord_numeral) {
    const key_index = R.indexOf(key, KEYS);
    const chord_index = chord_numeral - 1;
    const interval = INTERVALS_MAJOR_SCALE[chord_index];

    // Modulo math ensures we loop back to 'A' if the interval passes 'Gs'
    const root_note_index = (key_index + interval) % OCTAVES;

    const root_note = KEYS[root_note_index];
    const quality = CHORD_QUALITIES[chord_index];

    return `${root_note}_${quality}_4.mp3`;
};

/**
 * Translates an array of chord numerals into an array of filenames.
 * @memberof Chordle
 * @function
 * @param {string} key The root musical key.
 * @param {number[]} sequence The sequence of chord numerals.
 * @returns {string[]} An array of fully formatted audio filenames.
 */
Chordle.get_sequence_filenames = function (key, sequence) {
    return R.map(
        (chord) => Chordle.get_chord_filename(key, chord),
        sequence
    );
};

export default Object.freeze(Chordle);
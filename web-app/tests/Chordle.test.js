/*jslint node */
import assert from "assert";
import Chordle from "../Chordle.js";

describe("Chordle Module", function () {

    describe("Suite A: The Evaluation Algorithm (Wordle Logic)", function () {
        
        it("should return all 'green' statuses when the guess perfectly matches the target", function () {
            const target = [1, 4, 5, 1];
            const guess = [1, 4, 5, 1];
            const expected = [
                {"chord": 1, "status": "green"},
                {"chord": 4, "status": "green"},
                {"chord": 5, "status": "green"},
                {"chord": 1, "status": "green"}
            ];
            assert.deepStrictEqual(Chordle.evaluate_guess(target, guess), expected);
        });

        it("should return all 'gray' statuses when no chords in the guess exist in the target", function () {
            const target = [1, 4, 5, 1];
            const guess = [2, 3, 6, 2];
            const expected = [
                {"chord": 2, "status": "gray"},
                {"chord": 3, "status": "gray"},
                {"chord": 6, "status": "gray"},
                {"chord": 2, "status": "gray"}
            ];
            assert.deepStrictEqual(Chordle.evaluate_guess(target, guess), expected);
        });

        it("should assign 'yellow' to correct chords placed in the wrong position", function () {
            const target = [1, 4, 5, 6];
            const guess = [4, 1, 6, 5];
            const expected = [
                {"chord": 4, "status": "yellow"},
                {"chord": 1, "status": "yellow"},
                {"chord": 6, "status": "yellow"},
                {"chord": 5, "status": "yellow"}
            ];
            assert.deepStrictEqual(Chordle.evaluate_guess(target, guess), expected);
        });

        it("should prioritize exact 'green' matches over 'yellow' matches for duplicate chords", function () {
            const target = [1, 2, 3, 4];
            const guess = [1, 1, 5, 6];
            const expected = [
                {"chord": 1, "status": "green"}, // First '1' is perfect
                {"chord": 1, "status": "gray"},  // Second '1' is redundant
                {"chord": 5, "status": "gray"},
                {"chord": 6, "status": "gray"}
            ];
            assert.deepStrictEqual(Chordle.evaluate_guess(target, guess), expected);
        });

        it("should correctly handle multiple 'yellow' matches of the same chord without over-counting", function () {
            const target = [1, 1, 2, 3];
            const guess = [4, 1, 1, 1];
            const expected = [
                {"chord": 4, "status": "gray"},
                {"chord": 1, "status": "green"},  // Matches the second '1' exactly
                {"chord": 1, "status": "yellow"}, // Matches the first '1' in the target
                {"chord": 1, "status": "gray"}    // Over-counted, no more '1's left in target
            ];
            assert.deepStrictEqual(Chordle.evaluate_guess(target, guess), expected);
        });
    });

    describe("Suite B: Game State & Turn Management", function () {
        
        it("should add a chord numeral to the current guess array when space is available", function () {
            const initial_state = Chordle.empty_state("C", [1, 4, 5, 1], 6);
            const expected_state = Chordle.empty_state("C", [1, 4, 5, 1], 6);
            expected_state.current_guess = [5];
            
            assert.deepStrictEqual(Chordle.add_chord(5, initial_state), expected_state);
        });

        it("should ignore additions and return the identical state if the current guess already contains four chords", function () {
            const initial_state = Chordle.empty_state("C", [1, 4, 5, 1], 6);
            initial_state.current_guess = [1, 2, 3, 4];
            
            assert.deepStrictEqual(Chordle.add_chord(5, initial_state), initial_state);
        });

        it("should reject a guess submission if the current guess array has fewer than four chords", function () {
            const initial_state = Chordle.empty_state("C", [1, 4, 5, 1], 6);
            initial_state.current_guess = [1, 4]; // Only two chords
            
            assert.deepStrictEqual(Chordle.submit_guess(initial_state), initial_state);
        });

        it("should clear the current guess and push the evaluation to past_guesses upon valid submission", function () {
            const initial_state = Chordle.empty_state("C", [1, 4, 5, 1], 6);
            initial_state.current_guess = [1, 2, 2, 2];
            
            const new_state = Chordle.submit_guess(initial_state);
            
            assert.strictEqual(new_state.current_guess.length, 0);
            assert.strictEqual(new_state.past_guesses.length, 1);
            assert.strictEqual(new_state.past_guesses[0][0].status, "green"); // The first '1' is correct
        });
    });

    describe("Suite C: Music Theory & Asset Resolution", function () {
        
        it("should generate the correct major, minor, and diminished filenames for a standard key sequence", function () {
            const key = "C";
            const sequence = [1, 6, 7];
            const expected = ["C_maj_4.mp3", "A_min_4.mp3", "B_dim_4.mp3"];
            
            assert.deepStrictEqual(Chordle.get_sequence_filenames(key, sequence), expected);
        });

        it("should correctly calculate relative intervals across the octave boundary using modulo arithmetic", function () {
            const key = "A";
            const sequence = [4]; // The 4th chord in A major is D major.
            const expected = ["D_maj_4.mp3"];
            
            assert.deepStrictEqual(Chordle.get_sequence_filenames(key, sequence), expected);
        });
    });

});
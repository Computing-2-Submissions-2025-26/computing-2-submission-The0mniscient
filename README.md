[![Review Assignment Due Date](https://classroom.github.com/assets/deadline-readme-button-22041afd0340ce965d47ae6ef1cefeee28c7c493a6346c4f15d667ab976d596c.svg)](https://classroom.github.com/a/H6lPFq0J)
# Computing 2 Coursework Submission.
**CID**: 02561585

## Game Summary: 🎵 Chordle: A Musical Ear-Training Puzzle
Chordle is an interactive, turn-based web game that combines the deductive puzzle mechanics of Wordle with functional ear-training.

At the start of each game, players are given a random musical key and must deduce a hidden sequence of four chords. By listening to the sequence and entering guesses using standard Roman numeral notation (I through vii°), players receive color-coded feedback to guide them to the correct answer.

### How to Play:

Listen: Play the root chord to establish the key, then listen to the target sequence.

Guess: Enter a four-chord sequence using the on-screen buttons or your keyboard (keys 1-7).

Evaluate:

🟩 Green: The correct chord in the correct position.

🟨 Yellow: The correct chord, but in the wrong position.

⬛ Gray: The chord is not in the sequence.

Solve: Use the feedback to deduce the exact sequence within 6 attempts!

## Checklist
### Install dependencies locally
This template relies on a a few packages from the Node Package Manager, npm.
To install them run the following commands in the terminal.
```properties
npm install
```
These won't be uploaded to your repository because of the `.gitignore`.
I'll run the same commands when I download your repos.

### Game Module – API
*You will produce an API specification, i.e. a list of function names and their signatures, for a Javascript module that represents the state of your game and the operations you can perform on it that advances the game or provides information.*

- [1] Include a `.js ` module file in `/web-app` containing the API using `jsdoc`.
- [1] Update `/jsdoc.json` to point to this module in `.source.include` (line 7)
- [1] Compile jsdoc using the run configuration `Generate Docs`
- [1] Check the generated docs have compiled correctly.

### Game Module – Implementation
*You will implement, in Javascript, the module you specified above. Such that your game can be simulated in code, e.g. in the debug console.*

- [1] The file above should be fully implemented - Chordle.js

### Unit Tests – Specification
*For the Game module API you have produced, write a set of unit tests descriptions that specify the expected behaviour of one aspect of your API, e.g. you might pick the win condition, or how the state changes when a move is made.*

- [1] Write unit test definitions in `/web-app/tests`.
- [1] Check the headings appear in the Testing sidebar.

### Unit Tests – Implementation
*Implement in code the unit tests specified above.*

- [1] Implement the tests above.

### Web Application
*Produce a web application that allows a user to interface with your game module.*

- Implement in `/web-app`
  - [1] `index.html`
  - [1] `default.css`
  - [1] `main.js`
  - [1] Any other files you need to include - sound files for chords.

### Finally
- [1] Push to GitHub.
- [1] Sync the changes.
- [1] Check submission on GitHub website.

## Generative AI Disclosure

In accordance with the Dyson School of Design Engineering guidelines, I declare that Google Gemini was used as an AI assistant during the development of this coursework. It provided support for syntax formatting and debugging, while the core architecture, game logic, and testing remain entirely my own original work.
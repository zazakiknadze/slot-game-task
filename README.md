# Assignment: 🎰 Slot

## 📖 Description

The task involves creating a small game based on the provided Photoshop file and the resources available in the repository. You can find the download link for the Photoshop file in the 🔗 Resources section. When you clone the project, you will receive all the remaining required materials.

### The Photoshop file includes:

- 10-line board
- Spin button
- Balance, 🟩 Win, and Bet sections

## 🎮 Game Mechanics
- By default, a bet is already selected.
- Symbols pay from left to right on the 10-line board.
- The game has a multiplier wheel (1x, 2x, 3x, 4x, 5x):
  - Starts spinning when the spin begins
  - Stops before the first reel stops
  - When the spin begins, all reels start spinning without waiting for the API response.

### Winning Logic

- If the spin is winning:
  - Show multiplier wheel animation (the winning amount appears in the center of the wheel) and corresponding symbol animations.

## 🌀 Special Symbols

- **Wild**
  - When it appears in a win, it expands and fills the entire reel, other symbols disappear.
  - In the returned response (`Baraban: []`), the Wild index is marked with 🟦 0.
  - The sequence of other symbols by index does not matter.
  - Every symbol has its own win animation.

## 🔌 API

The project includes a file `fake.api.js` with a function `GetBoard`:

- Returns an object containing:
  - Balance
  - Win
  - Reel information
  - Multiplier value
- `GetBoard` receives the selected bet amount.
- If no parameter is provided, it returns the current information.

## 🔗 Resources
https://we.tl/t-hQZCd2ljr1

Ready-to-use JavaScript libraries and spin animations are already included in the repository as a template; you can extract the images from the Photoshop file.


🟥 Please make all changes in your personal repository and do not modify the original template.

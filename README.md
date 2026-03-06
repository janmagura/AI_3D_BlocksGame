# 🧊 BLOCK OUT 🧊

### A Retro 3D Block Stacking Game

<div align="center">

![Status](https://img.shields.io/badge/status-complete-success)
![Version](https://img.shields.io/badge/version-1.0.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)
![Three.js](https://img.shields.io/badge/Three.js-r128-black?logo=three.js)

**_Can you clear the layers in the third dimension?_**

[Play Now](#how-to-play) • [Controls](#controls) • [Features](#features)

</div>

---

## 🕹️ About The Game

**Block Out** is a modern web-based reimagining of the classic 3D Tetris concept. Built with **HTML5**, **CSS3**, and **Three.js**, it brings a nostalgic arcade aesthetic to your browser with smooth 3D graphics and challenging gameplay.

Navigate polycubes through a **7×7×12 wireframe pit**, rotate them in full 3D space, and clear complete layers to rack up points before the stack reaches the top!

---

## ✨ Features

### 🎮 Core Gameplay
- **True 3D Mechanics**: Move and rotate blocks along X, Y, and Z axes.
- **Dynamic Camera**: Perspective view looking deep into the 3D tunnel.
- **Ghost Piece**: See exactly where your block will land.
- **Layer Clearing**: Complete a full 7×7 horizontal plane to clear lines and score big.
- **Progressive Difficulty**: Speed increases as you level up.

### 🎨 Visual Style
- **Retro Arcade Aesthetic**: Neon green grids on deep black backgrounds.
- **Wireframe Graphics**: Crisp white blocks and green grid lines.
- **UI Panels**: Classic blue sidebars with pixel-perfect typography.
- **Font**: "Press Start 2P" for that authentic 8-bit feel.

### 🛠️ Technical Highlights
- **Zero Dependencies**: Runs directly in the browser; only requires Three.js (loaded via CDN).
- **Local Storage**: High scores are saved automatically.
- **Responsive Design**: Adapts to different screen sizes.
- **State Management**: Robust handling of Pause, Game Over, and Restart states.

---

## 🎹 Controls

Master the 3D space with these controls:

| Action | Key(s) | Description |
| :--- | :---: | :--- |
| **Move Left/Right** | `←` `→` | Shift along the X-axis |
| **Move Forward/Back** | `↑` `↓` | Shift along the Z-axis (Depth) |
| **Vertical Move** | `W` `S` | Move block Up/Down manually |
| **Rotate X-Axis** | `A` `D` | Tilt forward/backward |
| **Rotate Y-Axis** | `Q` `E` | Spin left/right (Yaw) |
| **Rotate Z-Axis** | `Z` `C` | Roll clockwise/counter-clockwise |
| **Hard Drop** | `SPACE` | Instantly drop the piece |
| **Pause/Resume** | `P` | Toggle game pause state |

> 💡 **Pro Tip**: Use the **Ghost Piece** (transparent outline at the bottom) to plan your landing strategy!

---

## 🚀 How to Play

### Option 1: Local File (Recommended)
1.  Download or clone this repository.
2.  Locate the `index.html` file.
3.  Open `index.html` in any modern web browser (Chrome, Firefox, Edge, Safari).
4.  No server setup required!

### Option 2: Live Server (VS Code)
If you have the "Live Server" extension in VS Code:
1.  Right-click `index.html`.
2.  Select **"Open with Live Server"**.

---

## 📂 Project Structure

```text
block-out/
├── index.html        # Main HTML structure & CSS styles
├── game.js           # Game logic, Three.js scene, and mechanics
└── README.md         # This file
```

---

## 🧱 The Block Set (BASIC)

The game features a custom "BASIC" set of 3D polycubes, including:
- **Unit**: Single cube
- **Bar**: Straight line of cubes
- **Square**: 2×2 flat block
- **L-Shape**: Classic corner piece extended to 3D
- **T-Shape**: T-junction in 3D space
- **Corner**: 3D corner connector
- *...and more complex variations!*

---

## 🏆 Scoring System

| Action | Points |
| :--- | :--- |
| **Place Block** | 10 pts |
| **Soft Drop** | 1 pt per cell |
| **Hard Drop** | 2 pts per cell |
| **Clear 1 Layer** | 100 pts × Level |
| **Clear 2 Layers** | 300 pts × Level |
| **Clear 3+ Layers** | 500 pts × Level |

*High Scores are persisted in your browser's `localStorage`.*

---

## 🛠️ Tech Stack

*   **Rendering**: [Three.js](https://threejs.org/) (WebGL abstraction)
*   **Language**: Vanilla JavaScript (ES6+)
*   **Styling**: CSS3 (Flexbox, Grid, Neon Effects)
*   **Font**: Google Fonts (Press Start 2P)

---

## 📝 License

This project is open source and available under the [MIT License](LICENSE).

---

<div align="center">

### Ready to stack?
**Open `index.html` and start playing!**

👾 **GAME OVER** 👾

</div>
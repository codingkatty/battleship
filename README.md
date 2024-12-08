# Pirate Identicon Generator 🏴‍☠️

Generate unique pirate-themed profile pictures inspired by GitHub's identicon system! Each identicon is a 7x7 grid with a symmetric 5x5 pattern at its center.

[🔴 Live Demo](https://codingkatty.github.io/profilepic/) | [📝 Report Bug](https://github.com/codingkatty/profilepic/issues/new?assignees=&labels=bug&projects=&template=bug_report.yml&title=%5BBUG%5D%3A+) | [✨ Request Feature](https://github.com/codingkatty/profilepic/issues/new?assignees=&labels=enhancement&projects=&template=feature_request.yml&title=%5BFEATURE%5D%3A+)

## ✨ Features

- **Symmetric Patterns**: Generates perfectly mirrored 5x5 designs
- **Custom Colors**: Choose your favorite colors for:
  - Pattern ink color
  - Background parchment color
- **One-Click Download**: Save your creation as PNG
- **Mobile Friendly**: Fully responsive design
- **Pirate Theme**: Styled with a fun pirate aesthetic 🏴‍☠️

## Updates

Here I write all updates made for this repository.

### Update 1 (6/12/2024)
A function update, where I added a new page called 'Gallery'. It's connected to my Supabase bucket and whenever a user clicks on 'Share to Gallery', the image is uploaded and shown in the page for the world to see!

### Update 2 (8/12/2024)
An 'edit' page, with more sizes and a choice to download file as .piratemark, which is a json file and it can be loaded again to edit in the editor. It can be shared to library too.

## 💖 Examples
There are over one million patterns that could be generated. Cool ones include: faces, skull, symbol, etc.

<img src="https://i.imgur.com/HmUqbrG.png" width="180px" height="180px">  <img src="https://i.imgur.com/9tOKb55.png" width="180px" height="180px">  <img src="https://i.imgur.com/hNraLje.png" width="180px" height="180px">

## 🚀 Quick Start

1. Clone the repo:
```bash
git clone https://github.com/codingkatty/profilepic.git 
```

2. Open `index.html` in your browser
3. Start generating identicons!

## 💻 Tech Stack
![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![Canvas](https://img.shields.io/badge/Canvas-FF6384?style=for-the-badge&logo=html5&logoColor=white)
![Responsive Design](https://img.shields.io/badge/Responsive%20Design-3ECF8E?style=for-the-badge&logo=css3&logoColor=white)

## 🎨 How It Works
1. Pattern Generation:
```
// Generates a 5x5 symmetric pattern
const pattern = [];
for (let i = 0; i < 5; i++) {
    pattern[i] = [];
    for (let j = 0; j <= 2; j++) {
        pattern[i][j] = Math.random() > 0.5;
        pattern[i][4-j] = pattern[i][j];
    }
}
```
2. Rendering: Uses HTML5 Canvas for crisp graphics
3. Symmetry: Mirrors pattern horizontally
4. Border: Adds 1-cell padding around pattern

## 🙏 Acknowledgments
Inspired by GitHub's Identicon System

import { createCanvas, registerFont } from "canvas";
import path from "path";
import fs from "fs";

// Chemin vers ton fichier TTF
const fontPath = path.join(process.cwd(), "ressources", "fonts", "norwester.ttf");

// On enregistre la police avec un nom fixe
registerFont(fontPath, { family: "Roboto" });

// Créer un canvas
const canvas = createCanvas(500, 200);
const ctx = canvas.getContext("2d");

// Fond blanc
ctx.fillStyle = "white";
ctx.fillRect(0, 0, canvas.width, canvas.height);

// Texte test
ctx.fillStyle = "black";
ctx.font = "40px Roboto"; // Utilise le nom défini lors du registerFont
ctx.textAlign = "center";
ctx.textBaseline = "middle";
ctx.fillText("Test Roboto", canvas.width / 2, canvas.height / 2);

// Sauvegarder un PNG pour ce test
const outputPath = path.join(process.cwd(), `test-roboto.png`);
fs.writeFileSync(outputPath, canvas.toBuffer("image/png"));

console.log(`✅ Image générée: ${outputPath}`);

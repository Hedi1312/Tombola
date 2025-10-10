import { createCanvas, loadImage, registerFont } from "canvas";
import path from "path";


// Enregistrer la police
registerFont(path.join(process.cwd(), "ressources/fonts/norwester.ttf"), {
    family: "Norwester",
});


export async function generateTicketImage(ticketNumber: string): Promise<Buffer> {
    const imagePath = path.join(process.cwd(), "ressources/img/ticket_number.png");
    const baseImage = await loadImage(imagePath);

    const canvas = createCanvas(baseImage.width, baseImage.height);
    const ctx = canvas.getContext("2d");

    // Dessiner le ticket
    ctx.drawImage(baseImage, 0, 0);

    // Paramètres du texte
    const fontSize = Math.floor(baseImage.height * 0.11); // ~11% de la hauteur du ticket
    ctx.font = `${fontSize}px Norwester`;
    ctx.fillStyle = "#363636";
    ctx.textAlign = "center";
    ctx.textBaseline = "alphabetic";


    // Position verticale (un peu au-dessus du bas)
    const marginBottom = baseImage.height * 0.3;
    const y = baseImage.height - marginBottom;

    // Dessiner le numéro centré
    ctx.fillText(ticketNumber, baseImage.width / 2, y);


    // Générer le buffer
    const buffer = canvas.toBuffer("image/png");

    return buffer;
}

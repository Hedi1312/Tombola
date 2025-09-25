export type Prize = {
    id: number;
    title: string;
    description: string;
    img?: string;
    quantity?: number;
};

export const PRIZES: Prize[] = [
    {
        id: 1,
        title: "Smartphone dernier cri",
        description: "Un smartphone avec écran OLED et 128Go de stockage.",
        img: "/img/lots/ticket.png",
        quantity: 1,
    },
    {
        id: 2,
        title: "Tablette graphique",
        description: "Tablette pour dessiner, idéale pour les créatifs.",
        img: "/img/lots/ticket.png",
        quantity: 2,
    },
    {
        id: 3,
        title: "Panier gourmand",
        description: "Sélection de produits locaux et chocolats.",
        img: "/img/lots/ticket.png",
        quantity: 5,
    },
    {
        id: 4,
        title: "Bon d'achat 100€",
        description: "Bon valable dans notre boutique partenaire.",
        img: "/img/lots/ticket.png",
        quantity: 3,
    },
    {
        id: 5,
        title: "Vélo électrique",
        description: "Vélo pliant à assistance électrique, parfait pour la ville.",
        img: "/img/lots/ticket.png",
        quantity: 1,
    },
];

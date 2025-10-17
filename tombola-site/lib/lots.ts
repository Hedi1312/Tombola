export type PrizeItem = {
    name: string;
    quantity: number;
};

export type Prize = {
    id: number;
    title: string;
    description: string;
    img?: string;
    items: PrizeItem[];
};

export const PRIZES: Prize[] = [

    {
        id: 1,
        title: "Lot n°1",
        description: "Carte cadeau",
        img: "/img/lots/lot1.png",
        items: [{ name: "Carte cadeau 20€", quantity: 1 }],
    },

    {
        id: 2,
        title: "Lot n°2",
        description: "Blender avec livre de recettes",
        img: "/img/lots/lot2.png",
        items: [
            { name: "Blender", quantity: 1 },
            { name: "Livre de smoothies", quantity: 1 },

        ],
    },

    {
        id: 3,
        title: "Lot n°3",
        description: "Rubik's Cube et projecteur",
        img: "/img/lots/lot3.png",
        items: [
            { name: "Rubik's Cube", quantity: 1 },
            { name: "Projecteur lumière", quantity: 1 },
        ],
    },

    {
        id: 4,
        title: "Lot n°4",
        description: "Agenda et détente",
        img: "/img/lots/lot4.png",
        items: [
            { name: "Agenda spécial EJE (@Jade et ses Bisounours)", quantity: 1 },
            { name: "Balle anti-stress", quantity: 1 },
        ],
    },

    {
        id: 5,
        title: "Lot n°5",
        description: "Livre et jeu de cartes",
        img: "/img/lots/lot5.png",
        items: [
            { name: "Livre d'Adrien Blanc (Mon doudou. L'objet transitionnel qui fait grandir)", quantity: 1 },
            { name: "Jeu de cartes", quantity: 1 },
            { name: "Marque-page", quantity: 1 },
        ],
    },
    {
        id: 6,
        title: "Lot n°6",
        description: "Livre et jeu de cartes",
        img: "/img/lots/lot6.png",
        items: [
            { name: "Livre d'Adrien Blanc (Jouons ! À la découverte du monde, des autres et de soi)", quantity: 1 },
            { name: "Jeu de cartes", quantity: 1 },
            { name: "Marque-page", quantity: 1 },
        ],
    },
    {
        id: 7,
        title: "Lot n°7",
        description: "Matériel pour travail social",
        img: "/img/lots/lot7.png",
        items: [
            { name: "Carnet de stage travailleur social", quantity: 1 },
            { name: "Paquet de fiches Bristol", quantity: 1 },
            { name: "Post-it", quantity: 1 },
        ],
    },
    {
        id: 8,
        title: "Lot n°8",
        description: "Fournitures de bureau",
        img: "/img/lots/lot8.png",
        items: [
            { name: "Carnet", quantity: 1 },
            { name: "Stylo 4 couleurs", quantity: 1 },
            { name: "Paquet de trombones, punaises, pinces papier", quantity: 1 },
            { name: "Gourde", quantity: 1 },
            { name: "Fiches Bristol", quantity: 1 },
        ],
    },
    {
        id: 9,
        title: "Lot n°9",
        description: "Produits de soin Yves Rocher",
        img: "/img/lots/lot9.png",
        items: [
            { name: "Gommage", quantity: 1 },
            { name: "Gua sha", quantity: 1 },
            { name: "Lait de corps", quantity: 1 },
            { name: "Gel douche", quantity: 1 },
        ],
    },
    {
        id: 10,
        title: "Lot n°10",
        description: "Produits pour cheveux et mains",
        img: "/img/lots/lot10.png",
        items: [
            { name: "Masque cheveux (Sephora)", quantity: 1 },
            { name: "Crème pour les mains (Yves Rocher)", quantity: 1 },
            { name: "Pince à cheveux", quantity: 1 },
            { name: "Gel douche (Yves Rocher)", quantity: 2 },
        ],
    },

];

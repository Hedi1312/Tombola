import Image from "next/image";

interface TicketCardProps {
    ticketNumber: string;
}

export default function TicketCard({ ticketNumber }: TicketCardProps) {
    return (
        <div data-ticket className="relative w-72 h-40 mr-4">
            {/* Image du ticket */}
            <Image
                src="/img/ticket/ticket_number.png"
                alt="Ticket personnalisé"
                fill
                className="object-contain"
            />

            {/* Numéro centré en bas, un peu plus haut */}
            <span
                className="absolute bottom-8.5 left-1/2 transform -translate-x-1/2"
                style={{ fontFamily: 'Norwester', fontWeight: "normal", color: "#363636", fontSize: "1.1rem" }}
            >
        {ticketNumber}
      </span>
        </div>
    );
}

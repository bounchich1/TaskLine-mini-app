export type TicketRef = { id: string; number: string };

export type TicketNavigation = {
    returnTo: TicketRef | null;
    openSource: (sourceId: string, from: TicketRef) => void;
    goBack: () => void;
};

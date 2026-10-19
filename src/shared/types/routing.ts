export type Presence = 'online' | 'break' | 'offline';

type TeamMember = { employee_id: string; skills: string[] };

export type TeamStrategy = 'round_robin' | 'least_loaded' | 'skills';

export type Team = {
    id: string;
    name: string;
    supervisor_id: string | null;
    auto_assign: boolean;
    strategy: TeamStrategy;
    capacity: number;
    offer_timeout_seconds: number;
    allow_self_take: boolean;
    members: TeamMember[];
    queue: number;
    online: number;
    version: number;
};

export type MacroActions = {
    tag?: string;
    urgency?: string;
    complexity?: string;
    wait?: boolean;
    close?: boolean;
};

export type Macro = {
    id: string;
    owner_id: string | null;
    shared: boolean;
    title: string;
    body: string;
    actions: MacroActions;
    uses: number;
    version: number;
};

export type Viewer = { id: string; name: string; typing: boolean };

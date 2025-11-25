export type JobStatus = 'RUNNING' | 'COMPLETED' | 'FAILED';

export interface BatchRecord {
    ID: string;
    JobName: string;
    StartTime: string; // ISO string
    EndTime?: string; // ISO string
    Status: JobStatus;
    ErrorLog?: string;
}

export interface WorkflowDefinition {
    ID: string;
    Name: string;
    TriggerEvent: string;
}

export interface WorkflowStep {
    ID: string;
    DefinitionID: string;
    Sequence: number;
    RoleRequired: string;
    LogicRule: string; // JSON string
}

export interface WorkflowInstance {
    ID: string;
    DefinitionID: string;
    CurrentStepID?: string;
    Status: string;
    Payload: string; // JSON string
    CreatedAt: string; // ISO string
    RoleRequired?: string; // Enriched from join
}

export interface LogicRule {
    variable: string;
    operator: string;
    value: any;
}

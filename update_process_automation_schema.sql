-- Batch Engine Tables
CREATE TABLE IF NOT EXISTS batches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_name VARCHAR(100) NOT NULL,
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE,
    status VARCHAR(20) NOT NULL, -- RUNNING, COMPLETED, FAILED
    error_log TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Workflow Engine Tables
CREATE TABLE IF NOT EXISTS workflow_definitions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL UNIQUE,
    trigger_event VARCHAR(100) NOT NULL, -- e.g., PAYMENT_INITIATED
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS workflow_steps (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    definition_id UUID NOT NULL REFERENCES workflow_definitions(id) ON DELETE CASCADE,
    sequence_order INT NOT NULL,
    role_required VARCHAR(50) NOT NULL, -- e.g., MANAGER, COMPLIANCE
    logic_rule JSONB NOT NULL, -- e.g., {"variable": "amount", "operator": ">", "value": 10000}
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS workflow_instances (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    definition_id UUID NOT NULL REFERENCES workflow_definitions(id),
    current_step_id UUID REFERENCES workflow_steps(id),
    status VARCHAR(20) NOT NULL, -- PENDING, APPROVED, REJECTED
    payload JSONB NOT NULL, -- The original transaction data
    requester_id UUID, -- User who initiated the transaction
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS workflow_approvals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    instance_id UUID NOT NULL REFERENCES workflow_instances(id) ON DELETE CASCADE,
    step_id UUID NOT NULL REFERENCES workflow_steps(id),
    approver_id UUID NOT NULL, -- User who approved
    status VARCHAR(20) NOT NULL, -- APPROVED, REJECTED
    comments TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Seed some default workflows
INSERT INTO workflow_definitions (name, trigger_event, description)
VALUES ('High Value Transfer', 'PAYMENT_INITIATED', 'Requires approval for transfers over 10,000');

-- We need to get the ID of the inserted definition to seed steps. 
-- In a real migration script we'd use a DO block or separate calls. 
-- For this prototype, we will handle seeding in the Go code or manually.

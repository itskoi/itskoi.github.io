# tree-growth Specification

## Purpose

Defines how the user chooses a tree, how Work sessions turn into trees, how a tree grows while the session runs, and what decides whether it matures.

## Requirements

### Requirement: Choosing a tree before Work
The system SHALL let the user choose one of six trees before starting a Work session: Phượng, Mai, Đào, Đa, Tre, and Dừa. It SHALL preselect the tree chosen last, or Phượng if none has been chosen, so starting needs only one click.

#### Scenario: First Work session
- **GIVEN** the user has never started a Work session
- **WHEN** the selected session is Work
- **THEN** all six trees are offered with Phượng preselected

#### Scenario: Choice is remembered
- **GIVEN** the user started their last Work session with Mai
- **WHEN** the selected session is Work, including after a reload
- **THEN** Mai is preselected

#### Scenario: Choice offered only before Work
- **WHEN** the selected session is a Break or Long break, or any session is running
- **THEN** no tree choice is offered

### Requirement: A tree keeps its species
The system SHALL grow the chosen tree and show that species at every growth stage, in both the Work session and the garden. The species SHALL NOT change after the session starts.

#### Scenario: Species survives a reload
- **GIVEN** a Work session is running with Tre
- **WHEN** the page is reloaded
- **THEN** the growing tree is still Tre

#### Scenario: Species reaches the garden
- **WHEN** a Work session with Đào ends, whether completed or abandoned
- **THEN** the tree in the garden is Đào

### Requirement: Only Work sessions grow trees
The system SHALL produce exactly one tree for each Work session that ends, and SHALL NOT produce trees from Break or Long break sessions.

#### Scenario: Break produces no tree
- **WHEN** a Break or Long break ends
- **THEN** the number of trees in the garden is unchanged

#### Scenario: Work session produces one tree
- **WHEN** a Work session ends, whether completed or abandoned
- **THEN** the garden has exactly one more tree

### Requirement: Visible growth during a Work session
The system SHALL show the session's tree during a Work session and SHALL advance it through immature growth stages as time elapses, without ever showing a stage earlier than one already reached.

#### Scenario: Time passes
- **GIVEN** a Work session has just started
- **WHEN** enough of the session has elapsed
- **THEN** the tree is shown at a later growth stage than at the start

#### Scenario: Reload keeps the stage
- **WHEN** the page is reloaded during a Work session
- **THEN** the tree is shown at the stage matching the time elapsed

### Requirement: Maturity requires completing the session
The system SHALL make a tree mature only when its Work session runs to its end time. Nothing else SHALL make a tree mature.

#### Scenario: Completed session
- **WHEN** a Work session reaches its end time
- **THEN** its tree enters the garden mature

#### Scenario: Session completed while the app was closed
- **WHEN** the app is opened after a running Work session's end time has passed
- **THEN** its tree enters the garden mature

### Requirement: Abandoned sessions leave an immature tree
The system SHALL keep the tree of an abandoned Work session in the garden, permanently at the growth stage it had reached.

#### Scenario: Abandoned partway
- **GIVEN** a Work session is running and its tree has reached an immature growth stage
- **WHEN** the user abandons the session
- **THEN** the tree enters the garden at that same stage and is not mature

#### Scenario: Abandoned immediately
- **WHEN** the user abandons a Work session seconds after starting it
- **THEN** a tree at the earliest growth stage enters the garden

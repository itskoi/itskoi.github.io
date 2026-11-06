# session-cycle Specification

## Purpose

Defines the kinds of pomodoro session, the fixed order they run in, and how the user starts and ends them.

## Requirements

### Requirement: Session durations
The system SHALL run each session for the time set for its kind, which by default is 25 minutes for Work, 5 minutes for Break, and 15 minutes for Long break.

#### Scenario: Durations by kind
- **GIVEN** the times have not been changed
- **WHEN** a session of each kind is started
- **THEN** the countdown begins at 25:00 for Work, 05:00 for Break, and 15:00 for Long break

### Requirement: Session order
The system SHALL select the next session kind automatically, following the repeating order Work, Break, Work, Break, Work, Break, Work, Long break. While no session is running, it SHALL let the user choose Work, Break, or Long break instead, and the order SHALL carry on from the session the user chose.

#### Scenario: Next session selected by default
- **WHEN** no session is running
- **THEN** the next session in the order is selected, and its time is shown before starting

#### Scenario: Choosing another kind
- **GIVEN** the next session in the order is Work
- **WHEN** the user chooses Break and starts it
- **THEN** a Break runs, and when it ends the next session selected is Work

#### Scenario: Long break chosen early
- **WHEN** the user chooses Long break before the fourth Work session and it ends
- **THEN** the next session selected is Work and the order starts again

#### Scenario: First session
- **WHEN** the app is opened for the first time
- **THEN** the next session is Work

#### Scenario: Fourth Work session is followed by a Long break
- **GIVEN** three Breaks have been taken in the current cycle
- **WHEN** the next Work session completes
- **THEN** the next session is Long break

#### Scenario: Cycle repeats
- **WHEN** a Long break ends
- **THEN** the next session is Work and the order starts again

### Requirement: Sessions start only on click
The system SHALL start a session only when the user activates the start control, and SHALL show which session kind is selected while waiting.

#### Scenario: Session ends
- **WHEN** a session ends
- **THEN** no new session starts until the user activates the start control

#### Scenario: One session at a time
- **WHEN** a session is running
- **THEN** the start control and the session kind buttons are not available

### Requirement: Screen layout
The system SHALL show every view as a sidebar holding the title and controls beside a main area that fills the rest of the screen. The timer SHALL float at the top centre of the main area. On a narrow screen, the main area SHALL sit above the sidebar.

#### Scenario: Timer stays in place
- **WHEN** the user moves between waiting, Work, and break views
- **THEN** the timer stays at the top centre of the main area

#### Scenario: Timer over the garden
- **GIVEN** the garden reaches behind the timer
- **WHEN** the user selects a tree under the timer
- **THEN** the tree is watered

### Requirement: Accurate countdown
The system SHALL show the time left in the running session, based on the real time elapsed rather than on how often the app was able to update.

#### Scenario: Background tab
- **GIVEN** a session is running
- **WHEN** the tab spends time in the background and the user returns
- **THEN** the countdown shows the real time left

### Requirement: Timer in the browser tab
The system SHALL show the time left and the session kind in the browser tab's title while a session runs, and SHALL show only the app's name otherwise.

#### Scenario: Session running
- **GIVEN** a Work session has 18 minutes left
- **WHEN** the user looks at the browser tab, including while it is in the background
- **THEN** the tab title reads `18:00 Work · Koidoro`

#### Scenario: No session running
- **WHEN** no session is running
- **THEN** the tab title reads `Koidoro`

### Requirement: Abandoning a Work session
The system SHALL let the user abandon a running Work session after confirming, and an abandoned session SHALL NOT advance the cycle.

#### Scenario: Confirmed abandon
- **WHEN** the user abandons a Work session and confirms
- **THEN** the session ends and the next session is Work again

#### Scenario: Declined abandon
- **WHEN** the user starts to abandon a Work session but does not confirm
- **THEN** the session keeps running unchanged

### Requirement: Ending a break early
The system SHALL let the user end a running Break or Long break early, and SHALL treat it as a finished break for the cycle.

#### Scenario: Break ended early
- **WHEN** the user ends a Break early
- **THEN** the next session is Work and that Break counts toward the three Breaks before a Long break

### Requirement: Resume after reload
The system SHALL keep the cycle position and any running session across page reloads and browser restarts on the same device.

#### Scenario: Reload during a session
- **GIVEN** a session is running
- **WHEN** the page is reloaded before the session's end time
- **THEN** the same session continues with the correct time left

#### Scenario: Session ended while the app was closed
- **GIVEN** a session was running when the app was closed
- **WHEN** the app is opened after that session's end time
- **THEN** the session counts as completed and the next session in the order is shown

### Requirement: Multiple tabs stay in step
The system SHALL keep all open tabs of the app showing the same session state, so that one tab cannot overwrite what another has saved.

#### Scenario: Session started in another tab
- **GIVEN** the app is open in two tabs
- **WHEN** a session is started in one tab
- **THEN** the other tab shows that session running without a reload

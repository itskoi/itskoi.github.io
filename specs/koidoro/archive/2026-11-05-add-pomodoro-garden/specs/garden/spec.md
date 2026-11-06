# Spec Delta

## Purpose

Keeps every tree the user has grown on their device, places each one on its own plot, and gives the user a place to view and water those trees during breaks.

## ADDED Requirements

### Requirement: Garden is shown during breaks
The system SHALL show the garden with all its trees during Break and Long break sessions, and SHALL NOT show it during Work sessions or while waiting for a session to be started.

#### Scenario: During a Break
- **WHEN** a Break or Long break is running
- **THEN** every tree is visible, with mature and immature trees distinguishable by their growth stage

#### Scenario: During a Work session
- **WHEN** a Work session is running
- **THEN** only the tree currently growing is shown

#### Scenario: Empty garden
- **GIVEN** no tree has been grown yet
- **WHEN** a Break is running
- **THEN** the garden says it is empty instead of showing a blank area

### Requirement: Trees keep their plots
The system SHALL give each tree its own plot, taking the next free plot in a square spiral out from the centre, and SHALL surround the garden with empty grass plots. A planted tree SHALL NOT move.

#### Scenario: Adding a tree
- **GIVEN** the garden has trees
- **WHEN** a new tree joins the garden
- **THEN** it takes the next free plot and every existing tree keeps its plot

#### Scenario: Reload keeps plots
- **WHEN** the page is reloaded
- **THEN** every tree is on the same plot as before

### Requirement: Garden fits the screen
The system SHALL shrink the garden to fit the main area of the screen until a plot would be narrower than 28 pixels, and SHALL then let the garden scroll within its own area. The page itself SHALL NOT scroll sideways.

#### Scenario: Small garden
- **WHEN** the garden fits the available width
- **THEN** the whole garden is visible without scrolling

#### Scenario: Very large garden
- **WHEN** fitting the garden would make a plot narrower than 28 pixels
- **THEN** plots stay 28 pixels wide and the garden area scrolls sideways

### Requirement: Watering trees
The system SHALL let the user water any tree during a Break or Long break, showing a visible watering response and playing a short water sound each time. Watering SHALL NOT change the tree or anything that is saved.

#### Scenario: Water a mature tree
- **WHEN** the user waters a mature tree
- **THEN** a watering response plays on that tree and its growth stage is unchanged

#### Scenario: Water an immature tree
- **WHEN** the user waters an immature tree
- **THEN** a watering response plays on that tree and it does not become mature

#### Scenario: Reload after watering
- **WHEN** the page is reloaded after watering
- **THEN** the saved garden is the same as before watering

### Requirement: Garden is accessible
The system SHALL let trees be watered using only a keyboard, with the whole garden as one Tab stop and arrow keys moving between trees. It SHALL describe each tree's species and growth stage to assistive technology. The watering response SHALL respect the user's reduced-motion preference.

#### Scenario: Keyboard watering
- **WHEN** the user moves focus to a tree and presses Enter or Space
- **THEN** that tree is watered

#### Scenario: Moving between trees
- **GIVEN** focus is on a tree
- **WHEN** the user presses an arrow key
- **THEN** focus moves to the previous or next tree in planting order

#### Scenario: One Tab stop
- **GIVEN** focus is on a tree
- **WHEN** the user presses Tab
- **THEN** focus leaves the garden instead of moving to another tree

#### Scenario: Reduced motion
- **GIVEN** the user's system asks for reduced motion
- **WHEN** a tree is watered
- **THEN** the response appears without movement

### Requirement: Garden is kept on the device
The system SHALL save trees in the browser so that they survive reloads and browser restarts, without sending them anywhere.

#### Scenario: Browser restart
- **WHEN** the browser is closed and the app is opened again
- **THEN** all trees are still in the garden at the same growth stages

### Requirement: Unreadable saved data is not lost
The system SHALL start with an empty garden if the saved data cannot be read, and SHALL first keep a copy of that data so that it is not destroyed.

#### Scenario: Corrupted data
- **GIVEN** the saved data is malformed
- **WHEN** the app is opened
- **THEN** the app works with an empty garden, the unreadable data is preserved separately, and the page says the garden could not be read

### Requirement: Failed saves are reported
The system SHALL keep running if saving fails, and SHALL tell the user that progress may not be kept.

#### Scenario: Storage unavailable
- **GIVEN** the browser refuses to save data
- **WHEN** a session ends
- **THEN** the app keeps working and the page warns that progress may not be saved

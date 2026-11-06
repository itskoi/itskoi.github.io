# garden-decorations Specification

## Purpose

Brings the garden to life as it grows, with decorations and animals that arrive by themselves and never need looking after.

## Requirements

### Requirement: Decorations arrive by themselves
The system SHALL add ponds, rocks, and meadows at fixed places along the plot spiral as the number of trees grows, with no action from the user. Completed and abandoned trees SHALL both count.

#### Scenario: First decorations
- **WHEN** the garden reaches 7, 16, and 18 trees
- **THEN** the first meadow, pond, and rocks appear, respectively

#### Scenario: Abandoned trees count
- **GIVEN** the garden has 6 trees
- **WHEN** an abandoned Work session adds a seventh
- **THEN** the first meadow appears

### Requirement: Decorations keep their plots
The system SHALL keep each decoration on its plot, and trees SHALL skip those plots when taking the next free plot.

#### Scenario: Garden keeps growing
- **GIVEN** a pond is in the garden
- **WHEN** more trees join the garden
- **THEN** the pond stays on its plot and no tree is planted there

### Requirement: Animals arrive by themselves
The system SHALL bring butterflies with the first meadow, birds at 10 trees, koi and an egret with the first pond, and a buffalo at 17 trees.

#### Scenario: Before they arrive
- **GIVEN** the garden has 9 trees
- **WHEN** a Break is running
- **THEN** no birds are in the sky

#### Scenario: Birds arrive
- **WHEN** the garden reaches 10 trees
- **THEN** birds fly across the sky during breaks

#### Scenario: Buffalo and egret stay still
- **WHEN** a Break is running and the buffalo or egret has arrived
- **THEN** it stays in place without moving

### Requirement: Dogs and cats arrive by themselves
The system SHALL bring each pet once as the garden grows: Corgi at 3 trees, White cat at 5, Shiba at 8, Yellow cat at 11, Black cat at 14, and Golden retriever at 17.

#### Scenario: A pet arrives
- **GIVEN** the garden has 2 trees
- **WHEN** a third tree joins the garden
- **THEN** the Corgi is in the garden during the next break

#### Scenario: Pets persist
- **GIVEN** the Corgi has arrived
- **WHEN** the page is reloaded
- **THEN** the Corgi is still in the garden

### Requirement: Pets stay visible
The system SHALL seat each pet on an empty plot at the front of the garden, so that no tree stands in front of it. As the garden grows, pets SHALL settle further out to stay at the front.

#### Scenario: Garden grows around a pet
- **WHEN** new trees take the plots near a pet
- **THEN** the pet sits on an empty plot with no tree in front of it at the next break

### Requirement: Pets animate in place
The system SHALL animate pets in place while the garden is shown: tails move, eyes blink, and bodies breathe. Pets SHALL NOT walk. Each dog and cat SHALL have its own movement, and pets SHALL NOT move in unison.

#### Scenario: Pets during a break
- **WHEN** a Break or Long break is running
- **THEN** pets move in place and stay on their plots

#### Scenario: Golden retriever
- **WHEN** the Golden retriever is in the garden
- **THEN** it pants with its tongue moving and wags its tail slowly

### Requirement: Animals respect reduced motion
The system SHALL keep animals still when the user's system asks for reduced motion. Watering SHALL still work.

#### Scenario: Reduced motion
- **GIVEN** the user's system asks for reduced motion
- **WHEN** a Break is running
- **THEN** animals are shown without movement

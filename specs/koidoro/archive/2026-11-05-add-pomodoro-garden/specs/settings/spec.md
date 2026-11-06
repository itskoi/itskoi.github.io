# Spec Delta

## Purpose

Lets the user set each session kind's time, the sound when a session ends, and the background behind the garden.

## ADDED Requirements

### Requirement: Settings panel is collapsible
The system SHALL offer a settings panel that is collapsed until the user opens it, and SHALL make it available on every screen.

#### Scenario: Opening settings
- **WHEN** the user activates the settings control
- **THEN** the panel opens, and activating it again collapses it

### Requirement: Session times can be changed
The system SHALL let the user set a time for each session kind, in whole minutes from 1 to 180, and SHALL ignore any other value. A change SHALL apply from the next session and SHALL NOT affect a running session.

#### Scenario: New time
- **GIVEN** the user sets Work to 50 minutes
- **WHEN** the user starts a Work session
- **THEN** the countdown begins at 50:00

#### Scenario: Value out of range
- **WHEN** the user types a time outside the allowed range
- **THEN** the field shows it is invalid, the last valid time stays in use, and leaving the field restores that time

#### Scenario: Session running
- **GIVEN** a session is running
- **WHEN** the user changes that kind's time
- **THEN** the running session keeps its end time

### Requirement: End-of-session sound can be chosen
The system SHALL let the user choose the end-of-session sound from Chime, Bell, Marimba, Digital, Birdsong, and No sound, and SHALL play a preview when one is chosen. Chime SHALL be the default.

#### Scenario: Choosing a sound
- **WHEN** the user chooses Marimba
- **THEN** it plays once as a preview, and it plays when later sessions end

#### Scenario: No sound
- **GIVEN** the user has chosen No sound
- **WHEN** a session reaches its end time
- **THEN** no sound plays and the notification is still shown

### Requirement: Background scheme can be chosen
The system SHALL let the user choose a gradient background from Clear sky, Dawn, Sunset, Lagoon, Blossom, and Night, and SHALL keep the timer readable on each. Clear sky SHALL be the default.

#### Scenario: Choosing a background
- **WHEN** the user chooses Sunset
- **THEN** the page shows the Sunset gradient straight away

### Requirement: Settings are kept
The system SHALL keep settings across reloads and browser restarts, and SHALL keep open tabs in step. Unreadable settings SHALL fall back to their defaults without affecting the garden.

#### Scenario: Reload
- **WHEN** the page is reloaded
- **THEN** the chosen times, sound, and background are still in use

#### Scenario: Unreadable settings
- **GIVEN** a saved setting is invalid
- **WHEN** the app is opened
- **THEN** that setting uses its default, and the other settings and the garden are unaffected

#### Scenario: Garden saved before settings existed
- **GIVEN** a garden was saved before settings existed
- **WHEN** the app is opened
- **THEN** the garden opens with default settings and no warning
